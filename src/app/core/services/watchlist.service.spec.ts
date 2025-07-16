import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WatchlistService } from './watchlist.service';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

class AuthServiceMock { getToken = () => 'token'; }

describe('WatchlistService', () => {
  let service: WatchlistService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WatchlistService, { provide: AuthService, useClass: AuthServiceMock }]
    });
    service = TestBed.inject(WatchlistService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should get watchlist', () => {
    service.getWatchlist().subscribe();
    const req = http.expectOne(`${environment.apiUrl}/watchlist/user`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should add to watchlist', () => {
    service.addToWatchlist('1').subscribe();
    const req = http.expectOne(`${environment.apiUrl}/watchlist/add`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});