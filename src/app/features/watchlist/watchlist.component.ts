// src/app/features/watchlist/watchlist.component.ts

import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WatchlistService } from '../../core/services/watchlist.service';
import { Content } from '../../interfaces/content.interface';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss'],
})
export class WatchlistComponent implements OnInit {
  allContents: Content[] = [];
  selectedContentId: string | null = null;
  ratingScore = '';
  isRatingSubmitted = false;

  constructor(private watchlistService: WatchlistService) {}

  ngOnInit() {
    this.loadWatchlist();
  }

  private loadWatchlist() {
    this.watchlistService.getWatchlist().subscribe({
      next: (data) => (this.allContents = data),
      error: (err) => console.error('Failed to load watchlist', err),
    });
  }

  addToWatchlist(contentId: string) {
    this.watchlistService.addToWatchlist(contentId).subscribe({
      next: () => this.loadWatchlist(),
      error: (err) => console.error('Failed to add to watchlist', err),
    });
  }

  removeFromWatchlist(contentId: string) {
    this.watchlistService.removeFromWatchlist(contentId).subscribe({
      next: () => this.loadWatchlist(),
      error: (err) => console.error('Failed to remove from watchlist', err),
    });
  }

  isInWatchlist(contentId: string): boolean {
    return this.watchlistService.isInWatchlist(contentId);
  }

  startRating(contentId: string) {
    this.selectedContentId = contentId;
    this.ratingScore = '';
    this.isRatingSubmitted = false;
    setTimeout(() => {
      const input = document.querySelector('.rating-input') as HTMLElement;
      if (input) input.focus();
    }, 0);
  }

  stopRating() {
    this.selectedContentId = null;
    this.isRatingSubmitted = false;
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
      if (parseFloat(this.ratingScore) > 10) this.ratingScore = '10';
    } else if (event.key === '.') {
      if (!this.ratingScore.includes('.') && this.ratingScore !== '') {
        this.ratingScore += '.';
      }
    } else if (event.key === 'Enter') {
      this.submitRating();
    }
  }

  submitRating() {
    const scoreNum = parseFloat(this.ratingScore);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 10) {
      alert('Score must be between 0.0 and 10.0');
      return;
    }
    this.watchlistService.setRating(this.selectedContentId!, scoreNum).subscribe({
      next: () => {
        this.isRatingSubmitted = true;
        this.stopRating();
        this.loadWatchlist();
      },
      error: (err) => console.error('Failed to submit rating', err),
    });
  }

  getRating(contentId: string): number | null {
    return this.watchlistService.getRating(contentId);
  }
}
