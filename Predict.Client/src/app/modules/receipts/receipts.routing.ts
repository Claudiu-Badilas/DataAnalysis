import { Routes } from '@angular/router';
import { ReceiptsProductsComponent } from './receipts-products/receipts-products.component';
import { ReceiptsSummaryComponent } from './receipts-summary/receipts-summary.component';
import { ReceiptsComponent } from './receipts.component';

export const receiptsRoutes: Routes = [
  {
    path: '',
    component: ReceiptsComponent,
    children: [
      { path: 'summary', component: ReceiptsSummaryComponent },
      { path: 'products', component: ReceiptsProductsComponent },
      { path: '', redirectTo: 'products', pathMatch: 'full' },
    ],
  },
];
