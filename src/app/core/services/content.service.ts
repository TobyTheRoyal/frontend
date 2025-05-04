import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Content } from '../../interfaces/content.interface';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getTrending(): Observable<Content[]> {
    return this.http.get<Content[]>(`${this.apiUrl}/content/trending`);
  }

  getTopRated(): Observable<Content[]> {
    return this.http.get<Content[]>(`${this.apiUrl}/content/top-rated`);
  }

  getNewReleases(): Observable<Content[]> {
    return this.http.get<Content[]>(`${this.apiUrl}/content/new-releases`);
  }
}