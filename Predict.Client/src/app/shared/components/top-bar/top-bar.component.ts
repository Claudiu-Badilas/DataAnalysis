import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import * as fromAppStore from 'src/app/store/app-state.reducer';

@Component({
  selector: 'p-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  imports: [CommonModule],
})
export class TopBarComponent {
  @Input() hasModuleNavContent: boolean = false;

  modules = [
    { label: 'Mortgage', icon: 'wallet', url: '/mortgage-loan' },
    { label: 'Transactions', icon: 'trending', url: '/transactions' },
    { label: 'Invoices', icon: 'file', url: '/invoices' },
    { label: 'Receipts', icon: 'receipt', url: '/receipts' },
    { label: 'Settings', icon: 'settings', url: '/settings' },
  ];

  isMenuOpen = false;

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

  onNavigateTo(url: any) {
    this.store.dispatch(NavigationAction.navigateTo({ route: url }));
  }
}
