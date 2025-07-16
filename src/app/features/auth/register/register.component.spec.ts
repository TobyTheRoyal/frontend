import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';

class AuthServiceMock {
  register = jasmine.createSpy('register').and.returnValue(of({}));
}

class RouterMock {
  navigate = jasmine.createSpy('navigate');
}

describe('RegisterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: Router, useClass: RouterMock }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should submit register form', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;
    const auth = TestBed.inject(AuthService) as any;
    fixture.detectChanges();
    component.registerForm.setValue({ username: 'u', email: 'e@e.com', password: 'pw' });
    component.onSubmit();
    expect(auth.register).toHaveBeenCalled();
  });
});