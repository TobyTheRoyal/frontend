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
    { id: 'trending', title: 'Trending Now', items: Array(10).fill(0) },
    { id: 'top-rated', title: 'Top Rated', items: Array(10).fill(0) },
    { id: 'new-releases', title: 'New Releases', items: Array(10).fill(0) },
    { id: 'watchlist', title: 'My Watchlist', items: Array(10).fill(0) },
  ];

  isLoggedIn = false;

  constructor(
    private contentService: ContentService,
    private watchlistService: WatchlistService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.getToken()) {
      this.isLoggedIn = true;
      this.loadCategories();
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  loadCategories() {
    this.contentService.getTrending().subscribe({
      next: (data) => {
        console.log('Trending:', data);
        this.categories[0].items = data;
      },
      error: (err) => {
        console.error('Failed to load trending', err);
      },
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
      error: (err) => console.error('Failed to load watchlist', err),
    });
  }

  getRating(contentId: string): number | null {
    return this.watchlistService.getRating(contentId);
  }

  isInWatchlist(contentId: string): boolean {
    return this.watchlistService.isInWatchlist(contentId);
  }

  addToWatchlist(contentId: string): void {
    if (!this.isInWatchlist(contentId)) {
      this.watchlistService.addToWatchlist(contentId).subscribe(() => {
        this.loadCategories();
      });
    }
  }

  removeFromWatchlist(contentId: string): void {
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