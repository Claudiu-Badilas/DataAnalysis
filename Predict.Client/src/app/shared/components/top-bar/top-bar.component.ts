import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
} from '@angular/core';
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
export class TopBarComponent implements OnInit, AfterViewInit {
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
  private animationTimeout: any;
  private isClickOutsideEnabled = true;

  constructor(
    private store: Store<fromAppStore.AppState>,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngOnInit() {
    this.currentUrl = this.router.url;

    this.router.events.subscribe(() => {
      this.currentUrl = this.router.url;
    });
  }

  ngAfterViewInit() {
    // Add click outside listener
    this.renderer.listen('document', 'click', (event: Event) => {
      this.handleClickOutside(event);
    });
  }

  isActiveRoute(url: string): boolean {
    if (url === '/') {
      return this.currentUrl === '/';
    }
    return this.currentUrl.startsWith(url);
  }

  toggleMenu() {
    // If filter panel is open, just close it and don't toggle the menu
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

  private handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;

    // Get references to the elements
    const topbarElement =
      this.elementRef.nativeElement.querySelector('.topbar');
    const mobileMenuElement = this.elementRef.nativeElement.querySelector(
      '.mobile-extended-menu',
    );
    const filterPanelElement =
      this.elementRef.nativeElement.querySelector('.filter-panel');
    const burgerButton =
      this.elementRef.nativeElement.querySelector('.burger-btn');
    const filterButton =
      this.elementRef.nativeElement.querySelector('.filter-btn');

    // Check if click is outside the topbar component entirely
    const isClickInsideComponent =
      this.elementRef.nativeElement.contains(target);

    if (!isClickInsideComponent) {
      // Click is outside the entire component - close everything
      if (this.isMenuOpen) {
        this.closeMenu();
      }
      if (this.isFilterPanelOpen) {
        this.closeFilterPanel();
      }
      this.cdr.detectChanges();
      return;
    }

    // Check if click is on the burger button or mobile menu
    const isBurgerButton = burgerButton?.contains(target);
    const isMobileMenu = mobileMenuElement?.contains(target);

    // Check if click is on the filter button or filter panel
    const isFilterButton = filterButton?.contains(target);
    const isFilterPanel = filterPanelElement?.contains(target);

    // If menu is open and click is outside the mobile menu and not on the burger button
    if (this.isMenuOpen && !isMobileMenu && !isBurgerButton) {
      // Check if click is on filter elements - if so, don't close menu (let filter toggle handle it)
      if (!isFilterButton && !isFilterPanel) {
        this.closeMenu();
        this.cdr.detectChanges();
      }
    }

    // If filter panel is open and click is outside the filter panel and not on the filter button
    if (this.isFilterPanelOpen && !isFilterPanel && !isFilterButton) {
      // Check if click is on mobile menu elements - if so, don't close filter (let menu toggle handle it)
      if (!isMobileMenu && !isBurgerButton) {
        this.closeFilterPanel();
        this.cdr.detectChanges();
      }
    }
  }
}
