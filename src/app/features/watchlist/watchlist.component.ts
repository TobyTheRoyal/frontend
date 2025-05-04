import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss'],
})
export class WatchlistComponent implements OnInit {
  watchlist: any[] = [];
  allContents: any[] = [];
  ratings: any[] = [];
  apiUrl = 'http://localhost:3000/watchlist';
  contentApiUrl = 'http://localhost:3000/content';
  ratingApiUrl = 'http://localhost:3000/ratings';
  tmdbApiKey = '1b3d7c196e53b4ebab10bf60054ef369';
  omdbApiKey = '41518ee9'; // Dein OMDB-API-Key
  selectedContentId: number | null = null;
  ratingScore: string = '';
  isRatingSubmitted: boolean = false;

  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit() {
    this.loadWatchlist();
    this.loadAllContents();
    this.loadRatings();
  }

  loadWatchlist() {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any[]>(this.apiUrl, { headers }).subscribe({
      next: (data) => {
        this.watchlist = data;
        console.log('Watchlist loaded:', this.watchlist);
        this.enrichWithTmdbData(this.watchlist);
      },
      error: (err) => console.error('Failed to load watchlist', err),
    });
  }

  loadAllContents() {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any[]>(this.contentApiUrl, { headers }).subscribe({
      next: (data) => {
        this.allContents = data;
        console.log('All contents loaded:', this.allContents);
        this.enrichWithTmdbData(this.allContents);
      },
      error: (err) => console.error('Failed to load contents', err),
    });
  }

  loadRatings() {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any[]>(this.ratingApiUrl, { headers }).subscribe({
      next: (data) => {
        this.ratings = data;
        console.log('Ratings loaded:', this.ratings);
      },
      error: (err) => console.error('Failed to load ratings', err),
    });
  }

  enrichWithTmdbData(items: any[]) {
    items.forEach((item) => {
      const tmdbUrl = `https://api.themoviedb.org/3/${item.content?.type || item.type}/${item.content?.tmdbId || item.tmdbId}?api_key=${this.tmdbApiKey}`;
      this.http.get<any>(tmdbUrl).subscribe({
        next: (tmdbData) => {
          item.title = tmdbData.title || tmdbData.name;
          item.poster = `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`;
          item.releaseYear = new Date(tmdbData.release_date || tmdbData.first_air_date).getFullYear();
          item.imdbId = tmdbData.imdb_id;
          if (item.imdbId) {
            const omdbUrl = `http://www.omdbapi.com/?i=${item.imdbId}&apikey=${this.omdbApiKey}`;
            this.http.get<any>(omdbUrl).subscribe({
              next: (omdbData) => {
                item.imdbRating = omdbData.imdbRating || 'N/A';
                const rtRating = omdbData.Ratings?.find((r: { Source: string; Value: string }) => r.Source === 'Rotten Tomatoes');
                item.rtRating = rtRating ? rtRating.Value : 'N/A';
                console.log(`OMDB data for ${item.title}:`, { imdbRating: item.imdbRating, rtRating: item.rtRating });
              },
              error: (err) => console.error('Failed to load OMDB data', err),
            });
          }
        },
        error: (err) => console.error('Failed to load TMDb data', err),
      });
    });
  }

  addToWatchlist(contentId: number) {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http
      .post(this.apiUrl + '/add', { contentId }, { headers })
      .subscribe({
        next: () => this.loadWatchlist(),
        error: (err) => console.error('Failed to add to watchlist', err),
      });
  }

  isInWatchlist(contentId: number): boolean {
    return this.watchlist.some(item => item.content.id === contentId);
  }

  startRating(contentId: number) {
    this.selectedContentId = contentId;
    this.ratingScore = '';
    this.isRatingSubmitted = false;
    setTimeout(() => {
      const input = document.querySelector('.rating-input') as HTMLElement;
      if (input) {
        input.focus();
      }
    }, 0);
  }

  stopRating() {
    this.selectedContentId = null;
    this.isRatingSubmitted = false;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.selectedContentId !== null) {
      if (event.key === 'Backspace') {
        return;
      }
      if (event.repeat) {
        return;
      }
      event.preventDefault();

      if (event.key >= '0' && event.key <= '9') {
        if (this.ratingScore === '' || this.ratingScore.endsWith('.')) {
          this.ratingScore += event.key;
        } else {
          this.ratingScore = event.key;
        }
        const scoreNum = parseFloat(this.ratingScore);
        if (scoreNum > 10) {
          this.ratingScore = '10';
        }
      } else if (event.key === '.') {
        if (!this.ratingScore.includes('.') && this.ratingScore !== '') {
          this.ratingScore += '.';
        }
      } else if (event.key === 'Enter') {
        this.submitRating();
      } else if (event.key === 'Escape') {
        this.stopRating();
      }
    }
  }

  submitRating() {
    const scoreNum = parseFloat(this.ratingScore);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 10) {
      alert('Score must be between 0.0 and 10.0');
      return;
    }
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http
      .post(this.ratingApiUrl, { contentId: this.selectedContentId, score: scoreNum }, { headers })
      .subscribe({
        next: () => {
          console.log('Rating submitted for contentId:', this.selectedContentId, 'Score:', scoreNum);
          this.isRatingSubmitted = true;
          this.stopRating();
          this.loadRatings();
        },
        error: (err) => console.error('Failed to submit rating', err),
      });
  }

  getRating(contentId: number): number | null {
    const rating = this.ratings.find(rating => rating.content.id === contentId);
    console.log(`getRating for contentId ${contentId}:`, rating);
    return rating ? rating.score : null;
  }
}