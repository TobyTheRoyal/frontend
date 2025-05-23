import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss'],
})
export class RatingComponent implements OnInit {
  ratings: any[] = [];
  selectedContentId: number | null = null;
  ratingScore: number = 0;
  selectedContentTitle: string = ''; // Neues Feld für den Titel
  apiUrl = 'http://localhost:3000/ratings';
  tmdbApiKey = '1b3d7c196e53b4ebab10bf60054ef369'; // Ersetze mit deinem TMDb API-Key

  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit() {
    this.loadRatings();
  }

  loadRatings() {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any[]>(this.apiUrl, { headers }).subscribe({
      next: (data) => {
        this.ratings = data;
        this.enrichWithTmdbData();
      },
      error: (err) => console.error('Failed to load ratings', err),
    });
  }

  enrichWithTmdbData() {
    this.ratings.forEach((rating) => {
      const tmdbUrl = `https://api.themoviedb.org/3/${rating.content.type}/${rating.content.tmdbId}?api_key=${this.tmdbApiKey}`;
      this.http.get<any>(tmdbUrl).subscribe({
        next: (tmdbData) => {
          rating.title = tmdbData.title || tmdbData.name;
          rating.poster = `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`;
        },
        error: (err) => console.error('Failed to load TMDb data', err),
      });
    });
  }

  openRatingModal(contentId: number) {
    this.selectedContentId = contentId;
    const selectedRating = this.ratings.find(r => r.content.id === contentId);
    this.selectedContentTitle = selectedRating ? selectedRating.title : 'Unknown';
    this.ratingScore = selectedRating ? selectedRating.score : 0; // Bestehende Bewertung laden
  }

  closeRatingModal() {
    this.selectedContentId = null;
    this.selectedContentTitle = '';
  }

  submitRating() {
    if (this.ratingScore < 0 || this.ratingScore > 10) {
      alert('Score must be between 0.0 and 10.0');
      return;
    }
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http
      .post(this.apiUrl, { contentId: this.selectedContentId, score: this.ratingScore }, { headers })
      .subscribe({
        next: () => {
          this.closeRatingModal();
          this.loadRatings();
        },
        error: (err) => console.error('Failed to submit rating', err),
      });
  }
}