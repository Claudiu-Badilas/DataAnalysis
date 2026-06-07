import { Routes } from '@angular/router';
import { MortgageLoanSettingsComponent } from './components/mortgage-loan-settings/mortgage-loan-settings.component';
import { ReceiptsSettingsComponent } from './components/receipts-settings/receipts-settings.component';
import { TransactionsSettingsComponent } from './components/transactions-settings/transactions-settings.component';
import { SettingsComponent } from './settings.component';

export const settingsRoutes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      { path: 'mortgage-loan', component: MortgageLoanSettingsComponent },
      { path: 'transactions', component: TransactionsSettingsComponent },
      { path: 'receipts', component: ReceiptsSettingsComponent },
      { path: '', redirectTo: 'mortgage-loan', pathMatch: 'full' },
    ],
  },
];
