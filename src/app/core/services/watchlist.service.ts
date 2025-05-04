import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Content } from '../../interfaces/content.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private apiUrl = 'http://localhost:3000/watchlist';
  private cachedWatchlist: Content[] = [];

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getWatchlist(): Observable<Content[]> {
    const token = this.authService.getToken();
    if (!token) throw new Error('No user logged in');
    return this.http.get<{ content: Content }[]>(`${this.apiUrl}/user`, { headers: this.getHeaders() }).pipe(
      map(data => data.map(item => item.content)),
      map(contents => {
        this.cachedWatchlist = contents;
        return contents;
      })
    );
  }

  addToWatchlist(contentId: string): Observable<any> {
    const token = this.authService.getToken();
    if (!token) throw new Error('No user logged in');
    return this.http.post(`${this.apiUrl}/user`, { contentId }, { headers: this.getHeaders() });
  }

  removeFromWatchlist(contentId: string): Observable<any> {
    const token = this.authService.getToken();
    if (!token) throw new Error('No user logged in');
    return this.http.delete(`${this.apiUrl}/user/${contentId}`, { headers: this.getHeaders() });
  }

  getRating(contentId: string): number | null {
    return 8.0; // Mock: Ersetze durch echte Bewertung
  }

  isInWatchlist(contentId: string): boolean {
    return this.cachedWatchlist.some(content => content.id === contentId);
  }
}