// src/app/features/history/history.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { Router, RouterModule }   from '@angular/router';
import { FormsModule }    from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService }    from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { debugError } from '../../core/utils/logger';

interface RatedContent {
  content: {
    tmdbId: string;
    title?: string;
    poster?: string;
    releaseYear?: number;
    imdbRating?: number;   // <-- neu
    rtRating?: number;     // <-- neu
  };
  score: number;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
  history: RatedContent[] = [];
  selectedContentId: string | null = null;
  ratingScore = '';
  isRatingSubmitted = false;
  private ratingsApi = `${environment.apiUrl}/ratings`;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadHistory();
  }

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadHistory() {
    this.http
      .get<RatedContent[]>(this.ratingsApi, { headers: this.getHeaders() })
      .subscribe({
        next: data => this.history = data,
        error: err => debugError('Failed to load history', err),
      });
  }

  startRating(tmdbId: string) {
    this.selectedContentId = tmdbId;
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

  @HostListener('document:keydown', ['$event'])
  handleKey(event: KeyboardEvent) {
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
      this.submitRating(this.selectedContentId);
    }
  }

  submitRating(tmdbId: string) {
    const score = parseFloat(this.ratingScore);
    if (isNaN(score) || score < 0 || score > 10) {
      alert('Score must be 0.0–10.0');
      return;
    }
    this.http
      .post(this.ratingsApi, { tmdbId, score }, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.isRatingSubmitted = true;
          this.loadHistory();   // neu laden, damit externes Rating & Badge updaten
          setTimeout(() => this.stopRating(), 500);
        },
        error: err => debugError('Failed to rate', err),
      });
  }
}
