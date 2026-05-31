import { Routes } from '@angular/router';
import { TransactionInsightsComponent } from './transaction-insights/transaction-insights.component';
import { TransactionOverviewComponent } from './transaction-overview/transaction-overview.component';
import { TransactionComponent } from './transaction.component';

export const transactionRoutes: Routes = [
  {
    path: '',
    component: TransactionComponent,
    children: [
      { path: 'overview', component: TransactionOverviewComponent },
      { path: 'insights', component: TransactionInsightsComponent },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
    ],
  },
];
