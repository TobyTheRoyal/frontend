// src/app/features/watchlist/watchlist.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule }                 from '@angular/common';
import { FormsModule }                  from '@angular/forms';
import { RouterModule, Router }         from '@angular/router';
import { Observable }                   from 'rxjs';

import { WatchlistService } from '../../core/services/watchlist.service';
import { RatingsService }   from '../../core/services/ratings.service';
import { AuthService }      from '../../core/services/auth.service';
import { Content }          from '../../interfaces/content.interface';
import { debugError } from '../../core/utils/logger';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss'],
})
export class WatchlistComponent implements OnInit {
  allContents: Content[]           = [];
  selectedContentId: string | null = null;
  ratingScore                     = '';
  isRatingSubmitted               = false;
  isLoggedIn$: Observable<boolean>;

  constructor(
    private watchlistService: WatchlistService,
    private ratingsService:   RatingsService,
    private authService:      AuthService,
    private router:           Router,
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn();
  }

  ngOnInit(): void {
    // 1) Lade alle bisherigen User-Ratings
    this.ratingsService.fetchUserRatings().subscribe({
      error: err => debugError('Failed to fetch user ratings', err),
      complete: () => {
        // 2) Dann erst Watchlist laden
        this.loadWatchlist();
      }
    });
  }

  private loadWatchlist(): void {
    this.watchlistService.getWatchlist().subscribe({
      next: data => this.allContents = data,
      error: err => debugError('Failed to load watchlist', err),
    });
  }

  removeFromWatchlist(tmdbId: string): void {
    this.watchlistService.removeFromWatchlist(tmdbId).subscribe({
      next: () => {
        this.loadWatchlist();
        this.ratingsService.fetchUserRatings().subscribe();
      },
      error: err => debugError('Failed to remove from watchlist', err),
    });
  }

  startRating(tmdbId: string): void {
    this.isLoggedIn$.subscribe(loggedIn => {
      if (!loggedIn) {
        this.router.navigate(['/auth/login']);
        return;
      }
      this.selectedContentId = tmdbId;
      this.ratingScore       = '';
      this.isRatingSubmitted = false;
    });
  }

  goToDetail(tmdbId: string) {
    this.router.navigate(['/movies', tmdbId]);
  }

  onCardClick(tmdbId: string) {
    // Wenn gerade ein Rating-Dialog offen ist, nichts tun:
    if (this.selectedContentId) {
      return;
    }
    this.goToDetail(tmdbId);
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
    this.isLoggedIn$.subscribe(loggedIn => {
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
        error: err => debugError('Failed to set rating', err),
      });
    });
  }

  getRating(tmdbId: string): number | null {
    return this.ratingsService.getRating(tmdbId);
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
}
