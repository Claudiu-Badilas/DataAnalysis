import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
      >
        <div class="mobile-extended-menu__items">
          @for (option of modules; track option) {
            <button
              class="mobile-extended-menu__item"
              [class.active]="isActiveRoute(option.url)"
              (click)="onNavigateTo(option.url); closeMenu()"
            >
              <img [src]="'assets/icons/' + option.icon + '.svg'" />
              <span class="mobile-extended-menu__label">{{
                option.label
              }}</span>
            </button>
          }
          <!-- Filter option inside extended menu - only shown when there are filters -->
          @if (hasFiltersContent) {
            <button
              class="mobile-extended-menu__item"
              (click)="openFilterPanel(); closeMenu()"
            >
              <img src="assets/icons/filter.svg" alt="filter" />
              <span class="mobile-extended-menu__label">Filter</span>
            </button>
          }
        </div>
      </div>
    </header>

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

    <!-- Filter Overlay -->
    @if (hasFiltersContent) {
      <div
        class="filter-overlay"
        *ngIf="isFilterPanelOpen"
        (click)="closeFilterPanel()"
      ></div>
    } `,
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
      background: white;
      border-bottom: 1px solid #e5e7eb;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      animation: slideDown 0.3s ease;
      overflow: hidden;
    }

    @keyframes slideDown {
      from {
        max-height: 0;
        opacity: 0;
        transform: translateY(-10px);
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
      transition: all 0.2s ease;
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
  currentUrl: string = '';

  constructor(
    private store: Store<fromAppStore.AppState>,
    private router: Router,
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
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
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
