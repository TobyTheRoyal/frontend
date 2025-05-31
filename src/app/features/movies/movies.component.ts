import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { ContentService } from '../../core/services/content.service';
import { RatingsService } from '../../core/services/ratings.service';
import { AuthService } from '../../core/services/auth.service';
import { WatchlistService } from '../../core/services/watchlist.service';
import { FilterService, FilterOptions } from '../../core/services/filter.service';
import { Content } from '../../interfaces/content.interface';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss'],
})
export class MoviesComponent implements OnInit {
  movies: Content[] = [];
  selectedContentId: string | null = null;
  ratingScore: string = '';
  isRatingSubmitted: boolean = false;
  isLoggedIn$: Observable<boolean>;

  currentPage = 1;
  isLoading = false;
  hasMore = true;
  currentYear = new Date().getFullYear();
  activeDropdown: string | null = null;

  genres: string[] = [];
  private filterSubject = new Subject<FilterOptions>();

  genre: string = '';
  releaseYearMin: number = 1900;
  releaseYearMax: number = this.currentYear;
  imdbRatingMin: number = 0;
  rtRatingMin: number = 0;

  @ViewChild('rangeSlider', { static: false }) rangeSlider!: ElementRef<HTMLDivElement>;

  constructor(
    private contentService: ContentService,
    private ratingsService: RatingsService,
    private authService: AuthService,
    private watchlistService: WatchlistService,
    public filterService: FilterService,
    private router: Router
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn();
  }

  ngOnInit(): void {
    this.loadGenres();
    this.loadPage();
    this.filterSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        switchMap(filters => this.contentService.getFilteredMovies(filters, this.currentPage))
      )
      .subscribe({
        next: data => {
          this.movies = data;
          console.log('Movies loaded:', data.slice(0, 3).map(m => ({
            title: m.title,
            imdbRating: m.imdbRating,
            rtRating: m.rtRating,
          })));
          this.isLoading = false;
          this.hasMore = data.length > 0;
        },
        error: () => {
          console.error('Failed to load filtered movies');
          this.isLoading = false;
        },
      });

    this.filterService.currentFilters.subscribe(filters => {
      this.genre = filters.genre;
      this.releaseYearMin = filters.releaseYearMin;
      this.releaseYearMax = filters.releaseYearMax;
      this.imdbRatingMin = filters.imdbRatingMin;
      this.rtRatingMin = filters.rtRatingMin;
      this.updateRangeSlider();
      this.filterSubject.next(filters);
    });
  }

  loadGenres(): void {
    this.contentService.getGenres().subscribe({
      next: genres => {
        this.genres = genres;
      },
      error: () => console.error('Failed to load genres'),
    });
  }

  updateFilters(newFilters: Partial<FilterOptions>): void {
    this.currentPage = 1;
    this.movies = [];
    this.hasMore = true;
    this.isLoading = true;
    this.filterService.updateFilters(newFilters);
  }

  resetFilters(): void {
    this.currentPage = 1;
    this.movies = [];
    this.hasMore = true;
    this.isLoading = true;
    this.activeDropdown = null;
    this.filterService.resetFilters();
  }

  toggleDropdown(dropdown: string | null): void {
    if (this.activeDropdown === dropdown) {
      this.activeDropdown = null;
    } else {
      this.activeDropdown = dropdown;
      if (dropdown === 'year') {
        setTimeout(() => this.updateRangeSlider(), 0); // Ensure slider updates after dropdown opens
      }
    }
  }

  hasActiveFilters(): boolean {
    return (
      this.genre !== '' ||
      this.releaseYearMin !== 1900 ||
      this.releaseYearMax !== this.currentYear ||
      this.imdbRatingMin > 0 ||
      this.rtRatingMin > 0
    );
  }

  updateRangeSlider(): void {
    if (this.rangeSlider && this.rangeSlider.nativeElement) {
      this.rangeSlider.nativeElement.style.setProperty('--min-value', this.releaseYearMin.toString());
      this.rangeSlider.nativeElement.style.setProperty('--max-value', this.releaseYearMax.toString());
      this.rangeSlider.nativeElement.style.setProperty('--current-year', this.currentYear.toString());
    }
  }

  loadPage(): void {
    if (this.isLoading || !this.hasMore) return;
    this.isLoading = true;
    this.contentService.getFilteredMovies(this.filterService.getFilters(), this.currentPage).subscribe({
      next: data => {
        if (!data.length) {
          this.hasMore = false;
        } else {
          this.movies.push(...data);
          this.currentPage++;
        }
        this.isLoading = false;
      },
      error: () => {
        console.error('Failed to load page', this.currentPage);
        this.isLoading = false;
      },
    });
  }

  startRating(tmdbId: string): void {
    this.isLoggedIn$.subscribe((loggedIn: boolean) => {
      if (!loggedIn) {
        this.router.navigate(['/auth/login']);
        return;
      }
      this.selectedContentId = tmdbId;
      this.ratingScore = '';
      this.isRatingSubmitted = false;
    });
  }

  stopRating(): void {
    this.selectedContentId = null;
    this.ratingScore = '';
    this.isRatingSubmitted = false;
  }

  submitRating(tmdbId: string): void {
    const score = parseFloat(this.ratingScore);
    if (isNaN(score) || score < 0 || score > 10) {
      alert('Bewertung muss zwischen 0.0 und 10.0 liegen');
      return;
    }
    this.isLoggedIn$.subscribe((loggedIn: boolean) => {
      if (!loggedIn) {
        this.router.navigate(['/auth/login']);
        return;
      }
      this.ratingsService.rateContent(tmdbId, score).subscribe({
        next: () => {
          this.isRatingSubmitted = true;
          this.ratingsService.fetchUserRatings().subscribe();
          setTimeout(() => this.stopRating(), 500);
        },
        error: err => console.error('Bewertung fehlgeschlagen', err),
      });
    });
  }

  isInWatchlist(contentId: string): boolean {
    return this.watchlistService.isInWatchlist(contentId);
  }

  toggleWatchlist(contentId: string): void {
    this.isLoggedIn$.subscribe((loggedIn: boolean) => {
      if (!loggedIn) {
        this.router.navigate(['/auth/login']);
        return;
      }
      const call = this.isInWatchlist(contentId)
        ? this.watchlistService.removeFromWatchlist(contentId)
        : this.watchlistService.addToWatchlist(contentId);

      call.subscribe({
        next: () => {},
        error: err => console.error('Watchlist-Aktion fehlgeschlagen', err),
      });
    });
  }

  getRating(tmdbId: string): number | null {
    return this.ratingsService.getRating(tmdbId);
  }

  goToDetail(tmdbId: string) {
    this.router.navigate(['/movies', tmdbId]);
  }

  onCardClick(tmdbId: string) {
    if (this.selectedContentId) {
      return;
    }
    this.goToDetail(tmdbId);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.selectedContentId) return;
    if (event.key === 'Escape') return this.stopRating();
    if (event.repeat || event.key === 'Backspace') return;
    event.preventDefault();

    if (/[0-9]/.test(event.key)) {
      if (this.ratingScore === '' || this.ratingScore.endsWith('.')) {
        this.ratingScore += event.key;
      } else {
        this.ratingScore = event.key;
      }
      if (parseFloat(this.ratingScore) > 10) {
        this.ratingScore = '10';
      }
    } else if (event.key === '.') {
      if (!this.ratingScore.includes('.') && this.ratingScore !== '') {
        this.ratingScore += '.';
      }
    } else if (event.key === 'Enter') {
      this.submitRating(this.selectedContentId!);
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const threshold = 300;
    const pos = window.innerHeight + window.scrollY;
    const height = document.body.offsetHeight;
    if (height - pos < threshold) this.loadPage();
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.filter-control')) {
      this.activeDropdown = null;
    }
  }
}