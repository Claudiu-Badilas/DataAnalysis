import { Routes } from '@angular/router';
import { TransactionOverviewComponent } from './transaction-overview/transaction-overview.component';
import { TransactionComponent } from './transaction.component';

export const transactionRoutes: Routes = [
  {
    path: '',
    component: TransactionComponent,
    children: [
      { path: 'overview', component: TransactionOverviewComponent },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
    ],
  },
];
