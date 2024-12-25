import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated: boolean = false;
  showMasterMenu: boolean = false;
  showTransactionMenu: boolean = false;
  private authSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authSubscription = this.authService.authState$.subscribe(
      (isAuthenticated) => {
        this.isAuthenticated = isAuthenticated;
      }
    );
  }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.showMasterMenu = false;
      this.showTransactionMenu = false;
    }
  }

  toggleMasterMenu(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showMasterMenu = !this.showMasterMenu;
    this.showTransactionMenu = false;
  }

  toggleTransactionMenu(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showTransactionMenu = !this.showTransactionMenu;
    this.showMasterMenu = false;
  }

  isMasterActive(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.includes('/category') || currentUrl.includes('/product');
  }

  isTransactionActive(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.includes('/purchase') || 
           currentUrl.includes('/sale') || 
           currentUrl.includes('/profit');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }
}