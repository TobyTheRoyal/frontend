import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';

class AuthServiceMock {
  login = jasmine.createSpy('login').and.returnValue(of({}));
}

class RouterMock {
  navigate = jasmine.createSpy('navigate');
}

describe('LoginComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: Router, useClass: RouterMock }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should submit login form', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    const auth = TestBed.inject(AuthService) as any;
    fixture.detectChanges();
    component.loginForm.setValue({ email: 't@t.com', password: 'pw' });
    component.onSubmit();
    expect(auth.login).toHaveBeenCalled();
  });
});