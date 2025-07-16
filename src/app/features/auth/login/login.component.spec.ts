import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';

describe('LoginComponent', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
    authServiceMock.login.and.returnValue(of({ access_token: 'token123' }));

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        RouterTestingModule // <-- wichtig für routerLink etc.
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: FormBuilder, useValue: new FormBuilder() },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } } // ← nötig wegen Standalone-Komponente mit Router
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
    fixture.detectChanges();

    component.loginForm.setValue({
      email: 't@t.com',
      password: 'pw'
    });

    component.onSubmit();

    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: 't@t.com',
      password: 'pw'
    });
  });
});
