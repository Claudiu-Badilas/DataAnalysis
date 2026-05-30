import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import * as fromAppStore from 'src/app/store/app-state.reducer';

@Component({
  selector: 'p-top-bar',
  template: `<header class="topbar">
      <div class="topbar__inner">
        <div class="brand">
          <img src="assets/icons/logo.svg" alt="no-image" />
          <span class="brand__name">Predict</span>
        </div>

        <div class="module-nav">
          <ng-content select="[module-navigation]"></ng-content>
        </div>

        <!-- Filter Button - Desktop -->
        @if (hasFiltersContent) {
          <button
            type="button"
            class="actions__link"
            (click)="openFilterPanel()"
          >
            <img src="assets/icons/filter.svg" alt="filter" />
          </button>
        }

        <div class="actions actions--desktop">
          @for (option of modules; track option) {
            <button
              type="button"
              class="actions__link"
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
              (click)="onNavigateTo(option.url)"
            >
              <img [src]="'assets/icons/' + option.icon + '.svg'" />
            </button>
          }

          <!-- Filter Button - Mobile (only shown when there are filters AND no burger menu) -->
          @if (hasFiltersContent) {
            <button
              type="button"
              class="actions__link filter-btn"
              (click)="openFilterPanel()"
            >
              <img src="assets/icons/filter.svg" alt="filter" />
            </button>
          }
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
    </header>

    <!-- Dropdown Menu - Moved OUTSIDE topbar -->
    <div class="dropdown-menu" *ngIf="hasModuleNavContent && isMenuOpen">
      <div class="dropdown-header">
        <span class="dropdown-title">Menu</span>
        <button class="close-btn" (click)="closeMenu()">✕</button>
      </div>
      <div class="dropdown-items">
        @for (option of modules; track option) {
          <button
            class="dropdown-item"
            (click)="onNavigateTo(option.url); closeMenu()"
          >
            <img [src]="'assets/icons/' + option.icon + '.svg'" />
            <span>{{ option.label }}</span>
          </button>
        }
        <!-- Filter option inside burger menu dropdown - only shown when there are filters -->
        @if (hasFiltersContent) {
          <button
            class="dropdown-item"
            (click)="openFilterPanel(); closeMenu()"
          >
            <img src="assets/icons/filter.svg" alt="filter" />
            <span>Filter</span>
          </button>
        }
      </div>
    </div>

    <!-- Filter Panel - Moved OUTSIDE topbar -->
    @if (hasFiltersContent) {
      <div class="filter-panel" [class.open]="isFilterPanelOpen">
        <div class="filter-panel__header">
          <span class="filter-panel__title">Filters</span>
          <button class="filter-panel__close" (click)="closeFilterPanel()">
            ✕
          </button>
        </div>
        <div class="filter-panel__content">
          <ng-content select="[filter-content]"></ng-content>
        </div>
      </div>
    }

    <!-- Overlays - Moved OUTSIDE topbar -->
    <div class="menu-overlay" *ngIf="isMenuOpen" (click)="closeMenu()"></div>
    @if (hasFiltersContent) {
      <div
        class="filter-overlay"
        *ngIf="isFilterPanelOpen"
        (click)="closeFilterPanel()"
      ></div>
    }`,
  styles: `
    :host {
      display: block;
      width: 100%;
      position: sticky;
      top: 0;
      z-index: 1000;
      overflow-x: hidden;
    }

    .topbar {
      position: relative;
      backdrop-filter: blur(14px);
      background: color-mix(in oklab, white 95%, transparent);
      border-bottom: 1px solid #e5e7eb;
      width: 100%;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      overflow-x: hidden;
      position: relative;
      z-index: 1000;
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

    /* Burger Menu - Hidden by default */
    .mobile-menu {
      display: none;
    }

    .actions__link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
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

    .filter-btn {
      margin-left: 4px;
      border-left: 1px solid #e5e7eb;
      border-radius: 8px;
    }

    /* Burger Button Styles */
    .burger-btn {
      background: transparent;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 8px;
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

    /* Dropdown Menu - Root level */
    .dropdown-menu {
      position: fixed;
      top: 0;
      right: 0;
      width: 280px;
      height: 100vh;
      background: white;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      animation: slideIn 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }

    .dropdown-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
      background: white;
    }

    .dropdown-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #0f172a;
    }

    .close-btn {
      background: transparent;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #64748b;
      padding: 4px 8px;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .dropdown-items {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 12px 16px;
      background: transparent;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #64748b;
      font-size: 0.9375rem;
      font-weight: 500;
      text-align: left;
    }

    .dropdown-item:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    /* Filter Panel - Root level with very high z-index */
    .filter-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      height: 100vh;
      background: white;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
      z-index: 10001;
      transition: transform 0.3s ease-in-out;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      visibility: visible;
    }

    .filter-panel.open {
      transform: translateX(0);
    }

    .filter-panel__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
      background: white;
    }

    .filter-panel__title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #0f172a;
    }

    .filter-panel__close {
      background: transparent;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #64748b;
      padding: 4px 8px;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .filter-panel__close:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .filter-panel__content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    /* Menu Overlay - Root level */
    .menu-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      animation: fadeIn 0.3s ease;
    }

    /* Filter Overlay - Root level */
    .filter-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
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

      /* Filter panel full width on mobile */
      .filter-panel {
        width: 100%;
        transform: translateX(100%);
      }

      .filter-panel.open {
        transform: translateX(0);
      }

      /* Dropdown menu full width on mobile */
      .dropdown-menu {
        width: 100%;
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
    }

    /* Small mobile devices */
    @media (max-width: 480px) {
      .topbar__inner {
        height: 56px;
        padding: 0 12px;
        gap: 8px;
      }

      .actions--mobile {
        gap: 4px;
      }

      .actions--mobile .actions__link {
        padding: 6px;
      }
    }
  `,
  imports: [CommonModule],
})
export class TopBarComponent {
  @Input() hasModuleNavContent: boolean = false;
  @Input() hasFiltersContent: boolean = false;

  modules = [
    { label: 'Mortgage', icon: 'wallet', url: '/mortgage-loan' },
    { label: 'Transactions', icon: 'trending', url: '/transactions' },
    { label: 'Invoices', icon: 'file', url: '/invoices' },
    { label: 'Receipts', icon: 'receipt', url: '/receipts' },
    { label: 'Settings', icon: 'settings', url: '/settings' },
  ];

  isMenuOpen = false;
  isFilterPanelOpen = false;

  constructor(private store: Store<fromAppStore.AppState>) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMenu() {
    this.isMenuOpen = false;
    document.body.style.overflow = '';
  }

  openFilterPanel() {
    this.isFilterPanelOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeFilterPanel() {
    this.isFilterPanelOpen = false;
    document.body.style.overflow = '';
  }

  onNavigateTo(url: any) {
    this.store.dispatch(NavigationAction.navigateTo({ route: url }));
  }
}
