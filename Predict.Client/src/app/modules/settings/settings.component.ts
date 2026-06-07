import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { TopBarComponent } from 'src/app/shared/components/top-bar/top-bar.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import * as fromAppStore from 'src/app/store/app-state.reducer';

@Component({
  selector: 'p-settings',
  imports: [CommonModule, RouterModule, TopBarComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  activeTab: string = 'tab1';

  tabs = [
    { id: 'tab1', label: 'Mortgage', url: 'mortgage-loan' },
    { id: 'tab2', label: 'Transactions', url: 'transactions' },
    { id: 'tab3', label: 'Receipts', url: 'receipts' },
  ];

  store = inject(Store<fromAppStore.AppState>);

  onNavigateTo(url: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({ route: `settings/${url}` }),
    );
  }
}
