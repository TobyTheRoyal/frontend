import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private tokenKey = 'auth_token';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  private loggedInStatus = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}

  register(credentials: { username: string; email: string; password: string }): Observable<{ access_token: string }> {
    return this.http.post<{ access_token: string }>(`${this.apiUrl}/register`, credentials).pipe(
      tap((response) => {
        console.log('Registration successful, response:', response);
        if (response.access_token) {
          localStorage.setItem(this.tokenKey, response.access_token);
          this.isLoggedInSubject.next(true);
          console.log('Stored token:', response.access_token);
        } else {
          console.warn('No token received:', response);
        }
      }),
    );
  }

  login(credentials: { email: string; password: string }): Observable<{ access_token: string }> {
    return this.http.post<{ access_token: string }>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem(this.tokenKey, response.access_token);
        this.isLoggedInSubject.next(true);
        console.log('Login successful, token saved:', response.access_token);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isLoggedInSubject.next(false);
    console.log('Logged out, token removed');
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    console.log('Retrieved token:', token);
    return token;
  }

  isLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  getLoggedInStatus(): Observable<boolean> {
    return this.loggedInStatus.asObservable();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}