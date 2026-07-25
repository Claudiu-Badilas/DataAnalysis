import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import * as fromAppStore from 'src/app/store/app-state.reducer';

@Component({
  selector: 'p-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss',
  imports: [CommonModule],
})
export class TopBarComponent implements OnInit {
  @Input() hasModuleNavContent: boolean = false;
  @Input() hasFiltersContent: boolean = false;

  modules = [
    { label: 'Loan', icon: 'wallet', url: '/loan' },
    { label: 'Transactions', icon: 'trending', url: '/transactions' },
    { label: 'Receipts', icon: 'receipt', url: '/receipts' },
    { label: 'Invoices', icon: 'file', url: '/invoices' },
    { label: 'Settings', icon: 'settings', url: '/settings' },
  ];

  isMenuOpen = false;
  isFilterPanelOpen = false;
  isAnimating = false;
  currentUrl: string = '';

  constructor(
    private store: Store<fromAppStore.AppState>,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.currentUrl = this.router.url;

    this.router.events.subscribe(() => {
      this.currentUrl = this.router.url;
    });
  }

  isActiveRoute(url: string): boolean {
    if (url === '/') {
      return this.currentUrl === '/';
    }
    return this.currentUrl.startsWith(url);
  }

  toggleMenu() {
    // If filter panel is open, close it and don't toggle the menu
    if (this.isFilterPanelOpen) {
      this.closeFilterPanel();
      return;
    }

    // Only toggle menu if filter panel is closed
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  toggleFilterPanel() {
    if (this.isAnimating) return;

    this.isFilterPanelOpen = !this.isFilterPanelOpen;

    // Close menu when opening filter
    if (this.isFilterPanelOpen && this.isMenuOpen) {
      this.closeMenu();
    }

    // Trigger animation state
    if (this.isFilterPanelOpen) {
      this.isAnimating = true;
      // Use requestAnimationFrame for smoother animation
      requestAnimationFrame(() => {
        this.isAnimating = false;
        this.cdr.detectChanges();
      });
    }

    this.cdr.detectChanges();
  }

  openFilterPanel() {
    if (this.isAnimating) return;
    this.isFilterPanelOpen = true;
    this.cdr.detectChanges();
  }

  closeFilterPanel() {
    if (this.isAnimating) return;
    this.isFilterPanelOpen = false;
    this.cdr.detectChanges();
  }

  onNavigateTo(url: any) {
    this.store.dispatch(NavigationAction.navigateTo({ route: url }));
  }
}
