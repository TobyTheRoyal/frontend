import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SeriesComponent } from './series.component';
import { ContentService } from '../../core/services/content.service';
import { RatingsService } from '../../core/services/ratings.service';
import { AuthService } from '../../core/services/auth.service';
import { WatchlistService } from '../../core/services/watchlist.service';
import { FilterService } from '../../core/services/filter.service';

class ContentServiceMock {
  getFilteredSeries = jasmine.createSpy('getFilteredSeries').and.returnValue(of([]));
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

describe('SeriesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeriesComponent, HttpClientTestingModule],
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
    const fixture = TestBed.createComponent(SeriesComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});