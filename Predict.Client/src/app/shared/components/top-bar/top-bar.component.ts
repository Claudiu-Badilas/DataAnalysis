import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import * as fromAppStore from 'src/app/store/app-state.reducer';

@Component({
  selector: 'p-top-bar',
  template: `<header class="topbar" #topbarRef>
    <div class="topbar__inner">
      <div class="brand">
        <img src="assets/icons/logo.svg" alt="no-image" />
        <span class="brand__name">Predict</span>
      </div>

      <div class="module-nav">
        <ng-content select="[module-navigation]"></ng-content>
      </div>

      <!-- Filter Button - Desktop only -->
      @if (hasFiltersContent) {
        <button
          type="button"
          class="actions__link filter-btn filter-btn--desktop"
          style="border: none"
          [class.active]="isFilterPanelOpen"
          (click)="toggleFilterPanel()"
        >
          <img src="assets/icons/filter.svg" alt="filter" />
        </button>
      }

      <div class="actions actions--desktop">
        @for (option of modules; track option) {
          <button
            type="button"
            class="actions__link"
            [class.active]="isActiveRoute(option.url)"
            (click)="onNavigateTo(option.url)"
          >
            <img [src]="'assets/icons/' + option.icon + '.svg'" />
            <span class="action-label">{{ option.label }}</span>
          </button>
        }
      </div>

      <!-- Mobile Actions (Icons only) - Only shown when NO module navigation content -->
      <div class="actions actions--mobile" *ngIf="!hasModuleNavContent">
        @for (option of modules; track option) {
          <button
            type="button"
            class="actions__link"
            [class.active]="isActiveRoute(option.url)"
            (click)="onNavigateTo(option.url)"
          >
            <img [src]="'assets/icons/' + option.icon + '.svg'" />
          </button>
        }
      </div>

      <!-- Mobile Filter Button - Only shown when module-nav has content AND filters exist -->
      <div
        class="mobile-filter"
        *ngIf="hasModuleNavContent && hasFiltersContent"
      >
        <button
          type="button"
          class="filter-btn filter-btn--mobile"
          [class.active]="isFilterPanelOpen"
          (click)="toggleFilterPanel()"
        >
          <img src="assets/icons/filter.svg" alt="filter" />
        </button>
      </div>

      <!-- Burger Menu - Only shown when module-nav has content AND on mobile -->
      <div class="mobile-menu" *ngIf="hasModuleNavContent">
        <button
          class="burger-btn"
          [class.active]="isMenuOpen"
          (click)="toggleMenu()"
        >
          ☰
        </button>
      </div>
    </div>

    <!-- Extended Menu - Single row with icons below top bar -->
    <div
      class="mobile-extended-menu"
      *ngIf="hasModuleNavContent && isMenuOpen"
      #mobileMenuRef
    >
      <div class="mobile-extended-menu__items">
        @for (option of modules; track option) {
          <button
            class="mobile-extended-menu__item"
            [class.active]="isActiveRoute(option.url)"
            (click)="onNavigateTo(option.url); closeMenu()"
          >
            <img [src]="'assets/icons/' + option.icon + '.svg'" />
            <span class="mobile-extended-menu__label">{{ option.label }}</span>
          </button>
        }
        <!-- Filter option inside extended menu - only shown when there are filters -->
        @if (hasFiltersContent) {
          <button
            class="mobile-extended-menu__item"
            (click)="toggleFilterPanel(); closeMenu()"
          >
            <img src="assets/icons/filter.svg" alt="filter" />
            <span class="mobile-extended-menu__label">Filter</span>
          </button>
        }
      </div>
    </div>

    <!-- Filter Panel - Extends from top bar -->
    @if (hasFiltersContent) {
      <div
        class="filter-panel"
        [class.open]="isFilterPanelOpen"
        [class.animating]="isAnimating"
        #filterPanelRef
      >
        <div class="filter-panel__content">
          <ng-content select="[filter-content]"></ng-content>
        </div>
        <!-- Double arrow to close filter panel -->
        <div class="filter-panel__close-btn" (click)="closeFilterPanel()">
          <img src="assets/icons/double-arrows.svg" alt="" />
        </div>
      </div>
    }
  </header>`,
  styles: `
    :host {
      display: block;
      width: 100%;
      position: sticky;
      top: 0;
      z-index: 1000;
      overflow-x: visible !important;
      overflow-y: visible !important;
    }

    .topbar {
      position: relative;
      backdrop-filter: blur(14px);
      background: color-mix(in oklab, white 95%, transparent);
      border-bottom: 1px solid #e5e7eb;
      width: 100%;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      overflow: visible !important;
      position: relative;
      z-index: 1000;
    }

    .dropdown-container {
      overflow: visible !important;
    }

    .topbar__inner {
      width: 100%;
      height: 50px;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      position: relative;
      overflow-x: hidden;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .brand__name {
      font-weight: 700;
      font-size: 1.125rem;
      letter-spacing: -0.01em;
      white-space: nowrap;
    }

    .module-nav {
      flex: 1;
      display: flex;
      justify-content: center;
      min-width: 0;
    }

    /* Desktop Actions */
    .actions--desktop {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    /* Mobile Actions (Icons only) */
    .actions--mobile {
      display: none;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    /* Mobile Filter Button */
    .mobile-filter {
      display: none;
      align-items: center;
      flex-shrink: 0;
    }

    /* Burger Menu - Hidden by default */
    .mobile-menu {
      display: none;
    }

    .actions__link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px;
      font-size: 0.875rem;
      font-weight: 500;
      border: 0;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #64748b;
      white-space: nowrap;
    }

    .actions__link:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .actions__link:active {
      transform: scale(0.98);
    }

    /* Active state styles */
    .actions__link.active {
      background: #e0f2fe;
      color: #0284c7;
    }

    .actions__link.active img {
      filter: brightness(0) saturate(100%) invert(32%) sepia(91%)
        saturate(1884%) hue-rotate(186deg) brightness(97%) contrast(101%);
    }

    .filter-btn {
      margin-left: 4px;
      border-left: 1px solid #e5e7eb;
      border-radius: 8px;
    }

    .filter-btn.active {
      background: #e0f2fe;
      color: #0284c7;
    }

    .filter-btn.active img {
      filter: brightness(0) saturate(100%) invert(32%) sepia(91%)
        saturate(1884%) hue-rotate(186deg) brightness(97%) contrast(101%);
    }

    /* Hide filter button on mobile */
    .filter-btn--desktop {
      display: flex;
    }

    .filter-btn--mobile {
      display: none;
      padding: 8px;
      margin: 0;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .filter-btn--mobile:hover {
      background: #f1f5f9;
    }

    .filter-btn--mobile img {
      width: 20px;
      height: 20px;
      display: block;
    }

    /* Burger Button Styles */
    .burger-btn {
      background: transparent;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 5px;
      border-radius: 8px;
      transition: all 0.2s ease;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .burger-btn:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .burger-btn.active {
      background: #f1f5f9;
      color: #0f172a;
    }

    /* Mobile Extended Menu - Single row with icons */
    .mobile-extended-menu {
      background: linear-gradient(to bottom, #f8f9fa, #ffffff);
      backdrop-filter: blur(14px);
      border-bottom: 1px solid #e5e7eb;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      animation: slideDown 0.25s ease;
      overflow: hidden;
    }

    @keyframes slideDown {
      from {
        max-height: 0;
        opacity: 0;
        transform: translateY(-5px);
      }
      to {
        max-height: 80px;
        opacity: 1;
        transform: translateY(0);
      }
    }

    .mobile-extended-menu__items {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-around;
      padding: 8px 16px;
      gap: 4px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .mobile-extended-menu__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 6px 12px;
      background: transparent;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
      color: #64748b;
      font-size: 0.625rem;
      font-weight: 500;
      text-align: center;
      min-width: 50px;
      flex: 0 0 auto;
    }

    .mobile-extended-menu__item:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .mobile-extended-menu__item:active {
      transform: scale(0.95);
    }

    /* Active state for extended menu items */
    .mobile-extended-menu__item.active {
      background: #e0f2fe;
      color: #0284c7;
    }

    .mobile-extended-menu__item.active img {
      filter: brightness(0) saturate(100%) invert(32%) sepia(91%)
        saturate(1884%) hue-rotate(186deg) brightness(97%) contrast(101%);
    }

    .mobile-extended-menu__item img {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .mobile-extended-menu__label {
      font-size: 0.625rem;
      line-height: 1;
      white-space: nowrap;
    }

    /* Filter Panel - Extends from top bar with hardware acceleration */
    .filter-panel {
      background: linear-gradient(to bottom, #f8f9fa, #ffffff);
      backdrop-filter: blur(14px);
      border-bottom: 1px solid #e5e7eb;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      max-height: 0;
      opacity: 0;
      transform: translateY(-5px);
      will-change: transform, opacity, max-height;
      transition:
        max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1),
        opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      display: block;
      visibility: hidden;
      position: relative;
    }

    .filter-panel.open {
      max-height: 500px;
      opacity: 1;
      transform: translateY(0);
      visibility: visible;
    }

    /* Prevent layout shift during animation */
    .filter-panel.animating {
      pointer-events: none;
    }

    .filter-panel.open.animating {
      pointer-events: auto;
    }

    .filter-panel__content {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px;
      max-height: 400px;
      will-change: transform;
    }

    /* Double Arrow Close Button - No border line */
    .filter-panel__close-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 12px 0 16px 0;
      cursor: pointer;
      transition: all 0.2s ease;
      gap: 2px;
      background: #ffffff;
    }

    .filter-panel__close-btn:hover {
      background: linear-gradient(to bottom, #f8f9fa, #ffffff);
    }

    .filter-panel__close-btn:active {
      transform: scale(0.95);
    }

    /* Hide close button on desktop if needed */
    @media (min-width: 769px) {
      .filter-panel__close-btn {
        display: none;
      }
    }

    /* Responsive Styles */
    @media (max-width: 768px) {
      .topbar__inner {
        padding: 0 16px;
        gap: 12px;
      }

      /* Hide desktop actions with labels */
      .actions--desktop {
        display: none;
      }

      /* Show mobile actions (icons only) */
      .actions--mobile {
        display: flex;
      }

      /* Hide brand name on mobile */
      .brand__name {
        display: none;
      }

      /* Show burger menu on mobile */
      .mobile-menu {
        display: block;
        margin: 0 !important;
      }

      /* Show mobile filter button */
      .mobile-filter {
        display: flex !important;
      }

      /* Hide desktop filter button on mobile */
      .filter-btn--desktop {
        display: none !important;
      }

      /* Show mobile filter button */
      .filter-btn--mobile {
        display: flex !important;
      }

      .filter-panel.open {
        max-height: 400px;
      }

      .filter-panel__content {
        padding: 16px;
        max-height: 300px;
      }

      .filter-panel__close-btn {
        display: flex !important;
        padding: 10px 0 14px 0;
      }

      .mobile-extended-menu__items {
        padding: 6px 12px;
        gap: 2px;
        justify-content: space-between;
      }

      .mobile-extended-menu__item {
        padding: 4px 8px;
        min-width: 40px;
      }

      .mobile-extended-menu__item img {
        width: 20px;
        height: 20px;
      }
    }

    /* Tablet Responsive */
    @media (min-width: 769px) and (max-width: 1024px) {
      .topbar__inner {
        padding: 0 20px;
      }

      .actions__link {
        padding: 8px 10px;
      }

      .filter-panel__content {
        padding: 16px 20px;
      }
    }

    /* Small mobile devices */
    @media (max-width: 480px) {
      .topbar__inner {
        height: 56px;
        padding: 0 8px;
        gap: 0px;
      }

      .actions--mobile {
        gap: 4px;
      }

      .actions--mobile .actions__link {
        padding: 6px;
      }

      .mobile-filter .filter-btn--mobile {
        padding: 6px;
      }

      .mobile-filter .filter-btn--mobile img {
        width: 18px;
        height: 18px;
      }

      .mobile-extended-menu__items {
        padding: 4px 8px;
        gap: 0px;
      }

      .mobile-extended-menu__item {
        padding: 4px 6px;
        min-width: 32px;
      }

      .mobile-extended-menu__item img {
        width: 18px;
        height: 18px;
      }

      .mobile-extended-menu__label {
        font-size: 0.5rem;
      }

      .filter-panel.open {
        max-height: 350px;
      }

      .filter-panel__content {
        padding: 12px;
        max-height: 250px;
      }

      .filter-panel__close-btn {
        padding: 0;
      }
    }
  `,
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

  /**
   * Toggle the mobile navigation menu
   * When burger menu is clicked:
   * 1. If filter panel is open, close it first
   * 2. Open the navigation menu
   */
  toggleMenu() {
    // If filter panel is open, close it first
    if (this.isFilterPanelOpen) {
      this.closeFilterPanel();
    }

    // Open the navigation menu (always opens when burger is clicked)
    // This ensures the user can always access navigation
    this.isMenuOpen = true;
  }

  /**
   * Close the mobile navigation menu
   */
  closeMenu() {
    this.isMenuOpen = false;
  }

  /**
   * Toggle the filter panel
   * When filter button is clicked:
   * 1. If menu is open, close it
   * 2. Toggle filter panel
   */
  toggleFilterPanel() {
    if (this.isAnimating) return;

    // Close menu when opening filter
    if (this.isMenuOpen) {
      this.closeMenu();
    }

    this.isFilterPanelOpen = !this.isFilterPanelOpen;

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

  /**
   * Open the filter panel
   */
  openFilterPanel() {
    if (this.isAnimating) return;

    // Close menu if open
    if (this.isMenuOpen) {
      this.closeMenu();
    }

    this.isFilterPanelOpen = true;
    this.cdr.detectChanges();
  }

  /**
   * Close the filter panel
   */
  closeFilterPanel() {
    if (this.isAnimating) return;
    this.isFilterPanelOpen = false;
    this.cdr.detectChanges();
  }

  onNavigateTo(url: any) {
    this.store.dispatch(NavigationAction.navigateTo({ route: url }));
  }
}
