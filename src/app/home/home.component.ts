import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ContentService } from '../core/services/content.service';
import { WatchlistService } from '../core/services/watchlist.service';
import { AuthService } from '../core/services/auth.service';
import { Content } from '../interfaces/content.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
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

  isLoggedIn = false;

  constructor(
    private contentService: ContentService,
    private watchlistService: WatchlistService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        this.loadCategories();
      } else {
        this.loadPublicCategories(); // Nur öffentliche Kategorien laden
        this.router.navigate(['/auth/login']);
      }
    });
  }

  loadCategories() {
    this.contentService.getTrending().subscribe({
      next: (data) => {
        console.log('Trending:', data);
        this.categories[0].items = data;
      },
      error: (err) => console.error('Failed to load trending', err),
    });
    this.contentService.getTopRated().subscribe({
      next: (data) => {
        console.log('Top Rated:', data);
        this.categories[1].items = data;
      },
      error: (err) => console.error('Failed to load top rated', err),
    });
    this.contentService.getNewReleases().subscribe({
      next: (data) => {
        console.log('New Releases:', data);
        this.categories[2].items = data;
      },
      error: (err) => console.error('Failed to load new releases', err),
    });
    this.watchlistService.getWatchlist().subscribe({
      next: (data) => {
        console.log('Watchlist:', data);
        this.categories[3].items = data;
      },
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

  addToWatchlist(contentId: string): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }
    if (!this.isInWatchlist(contentId)) {
      this.watchlistService.addToWatchlist(contentId).subscribe(() => {
        this.loadCategories();
      });
    }
  }

  removeFromWatchlist(contentId: string): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.watchlistService.removeFromWatchlist(contentId).subscribe(() => {
      this.loadCategories();
    });
  }

  scrollLeft(categoryId: string) {
    const container = document.getElementById(categoryId);
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  }

  scrollRight(categoryId: string) {
    const container = document.getElementById(categoryId);
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  }
}