import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ContentService } from './content.service';
import { environment } from '../../../environments/environment';

describe('ContentService', () => {
  let service: ContentService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ContentService]
    });
    service = TestBed.inject(ContentService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should get trending', () => {
    service.getTrending().subscribe();
    const req = http.expectOne(`${environment.apiUrl}/content/trending`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});