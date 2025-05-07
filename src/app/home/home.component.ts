// src/app/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ContentService } from '../core/services/content.service';
import { WatchlistService } from '../core/services/watchlist.service';
import { AuthService } from '../core/services/auth.service';
import { Content } from '../interfaces/content.interface';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  categories = [
    { id: 'trending', title: 'Trending Now', items: [] as Content[] },
    { id: 'top-rated', title: 'Top Rated', items: [] as Content[] },
    { id: 'new-releases', title: 'New Releases', items: [] as Content[] },
    { id: 'watchlist', title: 'My Watchlist', items: [] as Content[] },
  ];

  isLoggedIn$: Observable<boolean>;
  selectedContentId: string | null = null;
  ratingScore: string = '';
  isRatingSubmitted: boolean = false;

  constructor(
    private contentService: ContentService,
    private watchlistService: WatchlistService,
    private authService: AuthService,
    public router: Router
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn();
  }

  ngOnInit(): void {
    this.isLoggedIn$.subscribe((loggedIn) => {
      if (loggedIn) {
        this.loadCategories();
      } else {
        this.loadPublicCategories();
      }
    });
  }

  loadCategories() {
    this.contentService.getTrending().subscribe({
      next: (data) => (this.categories[0].items = data),
      error: (err) => console.error('Failed to load trending', err),
    });
    this.contentService.getTopRated().subscribe({
      next: (data) => (this.categories[1].items = data),
      error: (err) => console.error('Failed to load top rated', err),
    });
    this.contentService.getNewReleases().subscribe({
      next: (data) => (this.categories[2].items = data),
      error: (err) => console.error('Failed to load new releases', err),
    });
    this.watchlistService.getWatchlist().subscribe({
      next: (data) => (this.categories[3].items = data),
      error: (err) => {
        console.error('Failed to load watchlist', err);
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        }
      },
    });
  }

  loadPublicCategories() {
    this.contentService.getTrending().subscribe({
      next: (data) => (this.categories[0].items = data),
      error: (err) => console.error('Failed to load trending', err),
    });
    this.contentService.getTopRated().subscribe({
      next: (data) => (this.categories[1].items = data),
      error: (err) => console.error('Failed to load top rated', err),
    });
    this.contentService.getNewReleases().subscribe({
      next: (data) => (this.categories[2].items = data),
      error: (err) => console.error('Failed to load new releases', err),
    });
  }

  getRating(contentId: string): number | null {
    return this.watchlistService.getRating(contentId);
  }

  isInWatchlist(contentId: string): boolean {
    return this.watchlistService.isInWatchlist(contentId);
  }

  toggleWatchlist(contentId: string): void {
    this.isLoggedIn$.subscribe((loggedIn) => {
      if (!loggedIn) {
        this.router.navigate(['/auth/login']);
        return;
      }
      if (this.isInWatchlist(contentId)) {
        this.watchlistService.removeFromWatchlist(contentId).subscribe({
          next: () => this.loadCategories(),
          error: (err) => console.error('Failed to remove from watchlist', err),
        });
      } else {
        this.watchlistService.addToWatchlist(contentId).subscribe({
          next: () => this.loadCategories(),
          error: (err) => console.error('Failed to add to watchlist', err),
        });
      }
    });
  }

  startRating(contentId: string): void {
    this.isLoggedIn$.subscribe((loggedIn) => {
      if (!loggedIn) {
        this.router.navigate(['/auth/login']);
        return;
      }
      this.selectedContentId = contentId;
      this.ratingScore = '';
      this.isRatingSubmitted = false;
    });
  }

  stopRating(): void {
    this.selectedContentId = null;
    this.ratingScore = '';
    this.isRatingSubmitted = false;
  }

  submitRating(contentId: string): void {
    const rating = parseFloat(this.ratingScore);
    if (isNaN(rating) || rating < 0 || rating > 10) {
      console.error('Invalid rating: must be between 0.0 and 10.0');
      return;
    }
    this.isLoggedIn$.subscribe((loggedIn) => {
      if (!loggedIn) {
        this.router.navigate(['/auth/login']);
        return;
      }
      this.watchlistService.setRating(contentId, rating).subscribe({
        next: () => {
          this.isRatingSubmitted = true;
          this.loadCategories();
          setTimeout(() => this.stopRating(), 500);
        },
        error: (err) => console.error('Failed to set rating', err),
      });
    });
  }

  /** Scrollt den Content-Container horizontal */
  scrollLeft(categoryId: string): void {
    const container = document.getElementById(categoryId);
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  }

  scrollRight(categoryId: string): void {
    const container = document.getElementById(categoryId);
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  }
}
