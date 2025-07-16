import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { SeriesDetailComponent } from './series-detail.component';
import { ContentService } from '../../core/services/content.service';
import { WatchlistService } from '../../core/services/watchlist.service';
import { RatingsService } from '../../core/services/ratings.service';
import { AuthService } from '../../core/services/auth.service';

class ContentServiceMock {
  getSeriesDetails = jasmine.createSpy('getSeriesDetails').and.returnValue(of({ tmdbId: '1' }));
}
class WatchlistServiceMock {
  getWatchlist = jasmine.createSpy('getWatchlist').and.returnValue(of([]));
}
class RatingsServiceMock {
  fetchUserRatings = jasmine.createSpy('fetchUserRatings').and.returnValue(of([]));
  getRating() { return null; }
}
class AuthServiceMock { isLoggedIn = () => of(true); }
class ActivatedRouteMock { snapshot = { paramMap: new Map([['id','1']]) }; }
class RouterMock { navigate = jasmine.createSpy('navigate'); }

describe('SeriesDetailComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeriesDetailComponent],
      providers: [
        { provide: ContentService, useClass: ContentServiceMock },
        { provide: WatchlistService, useClass: WatchlistServiceMock },
        { provide: RatingsService, useClass: RatingsServiceMock },
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: ActivatedRoute, useClass: ActivatedRouteMock },
        { provide: Router, useClass: RouterMock }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SeriesDetailComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});