// movies.component.ts
import {
  Component,
  OnInit,
  HostListener,
  OnDestroy
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
import { FilterControlsComponent } from '../filter-controls/filter-controls.component';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FilterControlsComponent],
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss']
})
export class MoviesComponent implements OnInit, OnDestroy {
  movies: Content[] = [];
  selectedContentId: string | null = null;
  ratingScore: string = '';
  isRatingSubmitted: boolean = false;
  isLoggedIn$: Observable<boolean>;

  currentPage = 1;
  isLoading = false;
  hasMore = true;
  currentYear = new Date().getFullYear();
  private filterSubject = new Subject<FilterOptions>();
  private filterSub?: Subscription;
  private filterServiceSub?: Subscription;

  genre: string = '';
  releaseYearMin: number = 1900;
  releaseYearMax: number = this.currentYear;
  imdbRatingMin: number = 0;
  rtRatingMin: number = 0;

  showFilters = false;

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
    this.loadPage();
    this.filterSub = this.filterSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        switchMap((filters) => this.contentService.getFilteredMovies(filters, this.currentPage))
      )
      .subscribe({
        next: (data) => {
          const filtered = data.filter(m => typeof m.imdbRating === 'number');
          this.movies = filtered;
          debugLog('Movies loaded:', data.slice(0, 3).map((m) => ({
            title: m.title,
            imdbRating: m.imdbRating,
            rtRating: m.rtRating
          })));
          this.isLoading = false;
          this.hasMore = filtered.length > 0;
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
      this.filterSubject.next(filters);
    });
  }

  ngOnDestroy(): void {
    this.filterSub?.unsubscribe();
    this.filterServiceSub?.unsubscribe();
  }

  updateFilters(newFilters: Partial<FilterOptions>): void {
    const updatedFilters = { ...this.filterService.getFilters(), ...newFilters } as FilterOptions;
    if (newFilters.imdbRatingMin !== undefined) {
      updatedFilters.imdbRatingMin = Number(newFilters.imdbRatingMin);
    }
    if (newFilters.rtRatingMin !== undefined) {
      updatedFilters.rtRatingMin = Number(newFilters.rtRatingMin);
    }
    if (newFilters.releaseYearMin && updatedFilters.releaseYearMax < updatedFilters.releaseYearMin) {
      updatedFilters.releaseYearMax = updatedFilters.releaseYearMin;
    }
    if (newFilters.releaseYearMax && updatedFilters.releaseYearMin > updatedFilters.releaseYearMax) {
      updatedFilters.releaseYearMin = updatedFilters.releaseYearMax;
    }
    this.currentPage = 1;
    this.movies = [];
    this.hasMore = true;
    this.isLoading = true;
    this.filterService.updateFilters(updatedFilters);
  }

  resetFilters(): void {
    this.currentPage = 1;
    this.movies = [];
    this.hasMore = true;
    this.isLoading = true;
    this.filterService.resetFilters();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  hasActiveFilters(): boolean {
    const f = this.filterService.getFilters();
    return (
      f.genre !== '' ||
      f.releaseYearMin !== 1900 ||
      f.releaseYearMax !== this.currentYear ||
      f.imdbRatingMin > 0 ||
      f.rtRatingMin > 0
    );
  }

  loadPage(): void {
    if (this.isLoading || !this.hasMore) return;
    this.isLoading = true;
    this.contentService.getFilteredMovies(this.filterService.getFilters(), this.currentPage).subscribe({
      next: (data) => {
        const filtered = data.filter(m => typeof m.imdbRating === 'number');
        if (!filtered.length) {
          this.hasMore = false;
        } else {
           this.movies.push(...filtered);
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
}
