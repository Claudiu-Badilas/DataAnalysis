import { Routes } from '@angular/router';
import { LoanSettingsComponent } from './components/loan-settings/loan-settings.component';
import { ReceiptsSettingsComponent } from './components/receipts-settings/receipts-settings.component';
import { TransactionsSettingsComponent } from './components/transactions-settings/transactions-settings.component';
import { SettingsComponent } from './settings.component';

export const settingsRoutes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      { path: 'loan', component: LoanSettingsComponent },
      { path: 'transactions', component: TransactionsSettingsComponent },
      { path: 'receipts', component: ReceiptsSettingsComponent },
      { path: '', redirectTo: 'loan', pathMatch: 'full' },
    ],
  },
];
