import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WatchlistComponent } from './watchlist.component';
import { WatchlistService } from '../../core/services/watchlist.service';
import { RatingsService } from '../../core/services/ratings.service';
import { AuthService } from '../../core/services/auth.service';
import { FilterService } from '../../core/services/filter.service';

class WatchlistServiceMock {
  getWatchlist = jasmine.createSpy('getWatchlist').and.returnValue(of([]));
  removeFromWatchlist = jasmine.createSpy('remove').and.returnValue(of(null));
}
class RatingsServiceMock {
  fetchUserRatings = jasmine.createSpy('fetchUserRatings').and.returnValue(of([]));
  getRating() { return null; }
}
class AuthServiceMock { isLoggedIn = () => of(true); }
class RouterMock { navigate = jasmine.createSpy('navigate'); }

describe('WatchlistComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatchlistComponent, HttpClientTestingModule],
      providers: [
        { provide: WatchlistService, useClass: WatchlistServiceMock },
        { provide: RatingsService, useClass: RatingsServiceMock },
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: Router, useClass: RouterMock },
        FilterService
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(WatchlistComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});