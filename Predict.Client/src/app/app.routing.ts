import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'loan',
    loadChildren: () =>
      import('./modules/loan/loan.routing').then((m) => m.loanRoutes),
  },
  {
    path: 'transactions',
    loadChildren: () =>
      import('./modules/transaction/transaction.routing').then(
        (m) => m.transactionRoutes,
      ),
  },
  {
    path: 'invoices',
    loadChildren: () =>
      import('./modules/invoices/invoices.routing').then(
        (m) => m.invoicesRoutes,
      ),
  },
  {
    path: 'receipts',
    loadChildren: () =>
      import('./modules/receipts/receipts.routing').then(
        (m) => m.receiptsRoutes,
      ),
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./modules/settings/settings.routing').then(
        (m) => m.settingsRoutes,
      ),
  },
  {
    path: 'authentication',
    loadChildren: () =>
      import('./platform/authentication/authentication.routing').then(
        (m) => m.authenticationRoutes,
      ),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

export const AppRouting: ModuleWithProviders<RouterModule> =
  RouterModule.forRoot(routes, {
    useHash: true,
    onSameUrlNavigation: 'ignore',
  });
