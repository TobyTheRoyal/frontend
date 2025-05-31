import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface FilterOptions {
  genre: string;
  releaseYearMin: number;
  releaseYearMax: number;
  imdbRatingMin: number;
  rtRatingMin: number;
}

@Injectable({ providedIn: 'root' })
export class FilterService {
  private filters = new BehaviorSubject<FilterOptions>({
    genre: '',
    releaseYearMin: 1900,
    releaseYearMax: new Date().getFullYear(),
    imdbRatingMin: 0,
    rtRatingMin: 0,
  });
  currentFilters = this.filters.asObservable();

  updateFilters(newFilters: Partial<FilterOptions>) {
    this.filters.next({ ...this.filters.value, ...newFilters });
  }

  resetFilters() {
    this.filters.next({
      genre: '',
      releaseYearMin: 1900,
      releaseYearMax: new Date().getFullYear(),
      imdbRatingMin: 0,
      rtRatingMin: 0,
    });
  }

  getFilters(): FilterOptions {
    return this.filters.value;
  }
}