import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { HistoryComponent } from './history.component';
import { AuthService } from '../../core/services/auth.service';
import { FilterService } from '../../core/services/filter.service';

class AuthServiceMock {
  getToken() { return 'token'; }
}
class RouterMock {
  navigate = jasmine.createSpy('navigate');
}

describe('HistoryComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: Router, useClass: RouterMock },
        FilterService
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HistoryComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should toggle filters', () => {
    const fixture = TestBed.createComponent(HistoryComponent);
    const comp = fixture.componentInstance;
    comp.showFilters = false;
    comp.toggleFilters();
    expect(comp.showFilters).toBeTrue();
  });
});