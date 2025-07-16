import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { WatchlistService } from '../core/services/watchlist.service';
import { RatingsService } from '../core/services/ratings.service';
import { AuthService } from '../core/services/auth.service';
import { ContentService } from '../core/services/content.service';

class WatchlistServiceMock {
  addToWatchlist = jasmine.createSpy('add').and.returnValue(of(null));
  removeFromWatchlist = jasmine.createSpy('remove').and.returnValue(of(null));
  getWatchlist = jasmine.createSpy('list').and.returnValue(of([]));
  isInWatchlist() { return false; }
}

class RatingsServiceMock {
  rateContent = jasmine.createSpy('rate').and.returnValue(of(null));
  fetchUserRatings = jasmine.createSpy('fetch').and.returnValue(of([]));
  getRating() { return null; }
}

class AuthServiceMock { isLoggedIn = () => of(true); }
class ContentServiceMock {
  getTrending = jasmine.createSpy('trending').and.returnValue(of([]));
  getTopRated = jasmine.createSpy('top').and.returnValue(of([]));
  getNewReleases = jasmine.createSpy('new').and.returnValue(of([]));
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        HttpClientTestingModule,  // ✅ Für Services mit HttpClient
        RouterTestingModule       // ✅ Für Router-Funktionen wie navigate()
        ],
      providers: [
        { provide: WatchlistService, useClass: WatchlistServiceMock },
        { provide: RatingsService, useClass: RatingsServiceMock },
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: ContentService, useClass: ContentServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle watchlist', () => {
    const wl = TestBed.inject(WatchlistService) as any;
    wl.isInWatchlist = jasmine.createSpy().and.returnValue(false);
    component.toggleWatchlist('1');
    expect(wl.addToWatchlist).toHaveBeenCalledWith('1');

    wl.isInWatchlist.and.returnValue(true);
    component.toggleWatchlist('1');
    expect(wl.removeFromWatchlist).toHaveBeenCalledWith('1');
  });

  it('should submit rating', () => {
    const rs = TestBed.inject(RatingsService) as any;
    component.ratingScore = '4';
    component.submitRating('1');
    expect(rs.rateContent).toHaveBeenCalledWith('1', 4);
  });
});
