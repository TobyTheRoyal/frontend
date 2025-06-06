import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  take
} from 'rxjs/operators';

import { ContentService } from '../../core/services/content.service';
import { RatingsService } from '../../core/services/ratings.service';
import { AuthService } from '../../core/services/auth.service';
import { WatchlistService } from '../../core/services/watchlist.service';
import { FilterService, FilterOptions } from '../../core/services/filter.service';
import { Content } from '../../interfaces/content.interface';
import { debugError, debugLog } from '../../core/utils/logger';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss']
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
  private filterSub?: Subscription;
  private filterServiceSub?: Subscription;


  genre: string = '';
  releaseYearMin: number = 1900;
  releaseYearMax: number = this.currentYear;
  imdbRatingMin: number = 0;
  rtRatingMin: number = 0;

  @ViewChild('rangeSlider', { static: false })
  rangeSlider!: ElementRef<HTMLDivElement>;

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
    this.filterSub = this.filterSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        switchMap((filters) => this.contentService.getFilteredMovies(filters, this.currentPage))
      )
      .subscribe({
        next: (data) => {
          this.movies = data;
          debugLog(
            'Movies loaded:',
            data.slice(0, 3).map((m) => ({
              title: m.title,
              imdbRating: m.imdbRating,
              rtRating: m.rtRating
            }))
          );
          this.isLoading = false;
          this.hasMore = data.length > 0;
        },
        error: () => {
          debugError('Failed to load filtered movies');
          this.isLoading = false;
        }
      });

    this.filterServiceSub = this.filterService.currentFilters.subscribe(filters => {
      this.genre = filters.genre;
      this.releaseYearMin = filters.releaseYearMin;
      this.releaseYearMax = filters.releaseYearMax;
      this.imdbRatingMin = filters.imdbRatingMin;
      this.rtRatingMin = filters.rtRatingMin;
      this.updateRangeSlider();
      this.pulseFilter();
      this.filterSubject.next(filters);
    });
  }

  ngOnDestroy(): void {
    this.filterSub?.unsubscribe();
    this.filterServiceSub?.unsubscribe();
  }


  loadGenres(): void {
    this.contentService.getGenres().subscribe({
      next: (genres) => {
        this.genres = genres;
      },
      error: () => debugError('Failed to load genres')
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
    debugLog('Toggling dropdown:', dropdown, 'Current active:', this.activeDropdown);
    if (this.activeDropdown === dropdown) {
      this.activeDropdown = null;
    } else {
      this.activeDropdown = dropdown;
      if (dropdown === 'year') {
        setTimeout(() => this.updateRangeSlider(), 0);
      }
    }
  }

  triggerRipple(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const ripple = target.querySelector('.ripple') as HTMLElement;
    if (!ripple) return;

    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

    ripple.classList.add('animate');
    setTimeout(() => ripple.classList.remove('animate'), 600);
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

  pulseFilter(): void {
    const controls = document.querySelectorAll<HTMLElement>('.filter-control');
    controls.forEach((control) => {
      control.classList.add('pulse');
      setTimeout(() => control.classList.remove('pulse'), 500);
    });
  }

  updateRangeSlider(): void {
    if (this.rangeSlider && this.rangeSlider.nativeElement) {
      this.rangeSlider.nativeElement.style.setProperty(
        '--min-value',
        this.releaseYearMin.toString()
      );
      this.rangeSlider.nativeElement.style.setProperty(
        '--max-value',
        this.releaseYearMax.toString()
      );
      this.rangeSlider.nativeElement.style.setProperty(
        '--current-year',
        this.currentYear.toString()
      );
    }
  }

  loadPage(): void {
    if (this.isLoading || !this.hasMore) return;
    this.isLoading = true;
    this.contentService.getFilteredMovies(this.filterService.getFilters(), this.currentPage).subscribe({
      next: (data) => {
        if (!data.length) {
          this.hasMore = false;
        } else {
          this.movies.push(...data);
          this.currentPage++;
        }
        this.isLoading = false;
      },
      error: () => {
        debugError('Failed to load page', this.currentPage);
        this.isLoading = false;
      }
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
    this.isLoggedIn$.pipe(take(1)).subscribe((loggedIn: boolean) => {
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
        error: (err) => debugError('Bewertung fehlgeschlagen', err)
      });
    });
  }

  isInWatchlist(contentId: string): boolean {
    return this.watchlistService.isInWatchlist(contentId);
  }

  toggleWatchlist(contentId: string): void {
    this.isLoggedIn$.pipe(take(1)).subscribe((loggedIn: boolean) => {
      if (!loggedIn) {
        this.router.navigate(['/auth/login']);
        return;
      }
      const call = this.isInWatchlist(contentId)
        ? this.watchlistService.removeFromWatchlist(contentId)
        : this.watchlistService.addToWatchlist(contentId);

      call.subscribe({
        next: () => {},
        error: (err) => debugError('Watchlist-Aktion fehlgeschlagen', err)
      });
    });
  }

  getRating(tmdbId: string): number | null {
    return this.ratingsService.getRating(tmdbId);
  }

  trackByMovie(index: number, movie: Content): string {
    return movie.tmdbId;
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
      debugLog('Click outside, closing dropdown');
      this.activeDropdown = null;
    }
  }
}
