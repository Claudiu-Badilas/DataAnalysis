import { Routes } from '@angular/router';
import { TransactionInsightsComponent } from './transaction-insights/transaction-insights.component';
import { TransactionComponent } from './transaction.component';

export const transactionRoutes: Routes = [
  {
    path: '',
    component: TransactionComponent,
    children: [
      { path: 'overview', component: TransactionComponent },
      { path: 'insights', component: TransactionInsightsComponent },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
    ],
  },
];
