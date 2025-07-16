import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MoviesComponent } from './movies.component';
import { ContentService } from '../../core/services/content.service';
import { RatingsService } from '../../core/services/ratings.service';
import { AuthService } from '../../core/services/auth.service';
import { WatchlistService } from '../../core/services/watchlist.service';
import { FilterService } from '../../core/services/filter.service';

class ContentServiceMock {
  getFilteredMovies = jasmine.createSpy('getFilteredMovies').and.returnValue(of([]));
}
class RatingsServiceMock {
  rateContent = jasmine.createSpy('rateContent').and.returnValue(of({}));
  fetchUserRatings = jasmine.createSpy('fetchUserRatings').and.returnValue(of([]));
  getRating() { return null; }
}
class AuthServiceMock { isLoggedIn = () => of(true); }
class WatchlistServiceMock {
  addToWatchlist = jasmine.createSpy('add').and.returnValue(of(null));
  removeFromWatchlist = jasmine.createSpy('remove').and.returnValue(of(null));
  isInWatchlist() { return false; }
}
class RouterMock { navigate = jasmine.createSpy('navigate'); }

describe('MoviesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoviesComponent, HttpClientTestingModule],
      providers: [
        { provide: ContentService, useClass: ContentServiceMock },
        { provide: RatingsService, useClass: RatingsServiceMock },
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: WatchlistService, useClass: WatchlistServiceMock },
        FilterService,
        { provide: Router, useClass: RouterMock }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MoviesComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load a page of movies', () => {
    const fixture = TestBed.createComponent(MoviesComponent);
    const comp = fixture.componentInstance;
    comp.loadPage();
    const service = TestBed.inject(ContentService) as any;
    expect(service.getFilteredMovies).toHaveBeenCalled();
  });

  it('should submit rating', () => {
    const fixture = TestBed.createComponent(MoviesComponent);
    const comp = fixture.componentInstance;
    comp.ratingScore = '5';
    comp.submitRating('1');
    const ratingSvc = TestBed.inject(RatingsService) as any;
    expect(ratingSvc.rateContent).toHaveBeenCalledWith('1', 5);
  });

  it('should toggle watchlist', () => {
    const fixture = TestBed.createComponent(MoviesComponent);
    const comp = fixture.componentInstance;
    const wl = TestBed.inject(WatchlistService) as any;
    wl.isInWatchlist = jasmine.createSpy().and.returnValue(false);
    comp.toggleWatchlist('1');
    expect(wl.addToWatchlist).toHaveBeenCalledWith('1');

    wl.isInWatchlist.and.returnValue(true);
    comp.toggleWatchlist('1');
    expect(wl.removeFromWatchlist).toHaveBeenCalledWith('1');
  });
});