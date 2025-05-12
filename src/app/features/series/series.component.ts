import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { FormsModule }                      from '@angular/forms';
import { RouterModule, Router }             from '@angular/router';
import { Observable }                       from 'rxjs';

import { ContentService }    from '../../core/services/content.service';
import { RatingsService }    from '../../core/services/ratings.service';
import { AuthService }       from '../../core/services/auth.service';
import { WatchlistService }  from '../../core/services/watchlist.service';
import { Content }           from '../../interfaces/content.interface';

@Component({
  selector: 'app-series',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './series.component.html',
  styleUrls: ['./series.component.scss'],
})
export class SeriesComponent implements OnInit {
  series: Content[]                = [];
  selectedContentId: string | null = null;
  ratingScore: string              = '';
  isRatingSubmitted: boolean       = false;
  isLoggedIn$: Observable<boolean>;

  currentPage = 1;
  isLoading = false;
  hasMore = true;

  constructor(
    private contentService: ContentService,
    private ratingsService: RatingsService,
    private authService: AuthService,
    private watchlistService: WatchlistService,
    private router: Router
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn();
  }

  ngOnInit(): void {
      this.loadPage();
  }

  startRating(tmdbId: string): void {
    this.isLoggedIn$.subscribe((loggedIn: boolean) => {
      if (!loggedIn) {
        this.router.navigate(['/auth/login']);
        return;
      }
      this.selectedContentId = tmdbId;
      this.ratingScore       = '';
      this.isRatingSubmitted = false;
    });
  }

  stopRating(): void {
    this.selectedContentId = null;
    this.ratingScore       = '';
    this.isRatingSubmitted = false;
  }

  submitRating(tmdbId: string): void {
    const score = parseFloat(this.ratingScore);
    if (isNaN(score) || score < 0 || score > 10) {
      alert('Score must be between 0.0 and 10.0');
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
        error: err => console.error('Failed to set rating', err),
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
        next: () => {
          // Hier kannst Du optional UI-Updates vornehmen, z.B. lokale Watchlist-IDs neu laden
        },
        error: err => console.error('Watchlist toggle failed', err),
      });
    });
  }

  getRating(tmdbId: string): number | null {
    return this.ratingsService.getRating(tmdbId);
  }

  goToDetail(tmdbId: string) {
    this.router.navigate(['/series', tmdbId]);
  }

  loadPage(): void {
    if (this.isLoading || !this.hasMore) return;
  this.isLoading = true;

  this.contentService.getAllSeriesCached(this.currentPage).subscribe({
    next: data => {
      if (!data.length) {
        this.hasMore = false;
      } else {
        this.series.push(...data);
        this.currentPage++;
      }
      this.isLoading = false;
    },
    error: () => {
      console.error('Failed to load page', this.currentPage);
      this.isLoading = false;
    }
  });
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
    const threshold = 300; // px vor Ende
    const pos = window.innerHeight + window.scrollY;
    const height = document.body.offsetHeight;
    if (height - pos < threshold) this.loadPage();
  }
}