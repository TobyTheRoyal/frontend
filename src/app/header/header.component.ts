import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  isScrolled = false;
  isDropdownOpen: boolean = false;
  private loginSubscription: Subscription;

  constructor(private authService: AuthService, private router: Router) {
    this.loginSubscription = this.authService.getLoggedInStatus().subscribe((status: boolean) => {
      this.isLoggedIn = status;
    });
    window.addEventListener('scroll', () => {
      this.isScrolled = window.scrollY > 50;
    });
  }

  ngOnInit() {
    // Initialer Status wird bereits über die Subscription in constructor gesetzt
  }

  ngOnDestroy() {
    this.loginSubscription.unsubscribe();
    window.removeEventListener('scroll', () => {});
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-dropdown')) {
      this.closeDropdown();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
    this.closeDropdown();
  }
}