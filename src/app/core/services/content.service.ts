import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of} from 'rxjs';
import { map } from 'rxjs/operators';
import { Content } from '../../interfaces/content.interface';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private apiUrl = 'http://localhost:3000';
  private tmdbApiUrl = 'https://api.themoviedb.org/3';
  private apiKey = '1b3d7c196e53b4ebab10bf60054ef369';

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

  getAllMovies(pages: number = 5): Observable<Content[]> {
    const requests: Observable<{ results: any[] }>[] = [];
    for (let page = 1; page <= pages; page++) {
      requests.push(
        this.http.get<{ results: any[] }>(
          `${this.tmdbApiUrl}/discover/movie`,
          { params: { api_key: this.apiKey, page: page.toString() } }
        )
      );
    }
    return forkJoin(requests).pipe(
      map(responses =>
        responses.flatMap(resp => resp.results.map(item => this.mapToContent(item)))
      )
    );
  }

  getAllMoviesCached(page: number = 1): Observable<Content[]> {
    return this.http.get<Content[]>(
      `${this.apiUrl}/content/movies-page`,
      { params: { page: page.toString() } }
    );
    }

  getAllSeriesCached(page: number = 1): Observable<Content[]> {
      return this.http.get<Content[]>(
        `${this.apiUrl}/content/series-page`,
        { params: { page: page.toString() } }
      );
      }

  getMoviesPage(page: number): Observable<Content[]> {
    return this.http.get<{ results: any[] }>(
      `${this.tmdbApiUrl}/discover/movie`,
      { params: { api_key: this.apiKey, page: page.toString() } }
    ).pipe(
      map(resp => resp.results.map(item => this.mapToContent(item)))
    );
  }

  searchTmdb(query: string): Observable<Content[]> {
    if (!query.trim()) {
      return of([]); // importiere dazu am File-Anfang: `import { of } from 'rxjs';`
    }
    // Gib direkt das Array von Content-Objekten zurück,
    // Dein Backend hat sie ja schon im richtigen Shape.
    return this.http.post<Content[]>(`${this.apiUrl}/content/search`, { query });
  }
  
  private mapToContent(item: any): Content {

    const releaseYear = item.release_date
    ? parseInt(item.release_date.slice(0, 4), 10)
    : 0;

    return {
      id: item.id,
      tmdbId: item.id.toString(),
      title: item.title,
      releaseYear,
      poster: item.poster_path
        ? 'https://image.tmdb.org/t/p/w500' + item.poster_path
        : 'https://placehold.co/200x300',
      type: 'movie',
      imdbRating: item.vote_average,
      rtRating: undefined,
      rating: undefined,
    };
  }

  getMovieDetails(tmdbId: string): Observable<Content> {
    return this.http.post<Content>(
      `${this.apiUrl}/content/add-tmdb`,
      { tmdbId, type: 'movie' }
    );
  }
}