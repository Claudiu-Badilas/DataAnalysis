import {
  enableProdMode,
  importProvidersFrom,
  provideZonelessChangeDetection,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { AuthenticationEffects } from 'src/app/platform/authentication/effects/authentication.effects';
import { ToastNotificationEffects } from 'src/app/platform/toast-notifications/effects/toast-notification.effects';
import * as fromAppStore from 'src/app/store/app-state.reducer';
import { NavigationEffects } from 'src/app/store/effects/navigation.effects';
import { AppComponent } from './app/app.component';
import { AppRouting } from './app/app.routing';
import { environment } from './environments/environment';

// Feature states & effects
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InvoicesEffects } from 'src/app/modules/invoices/effects/invoices.effects';
import * as fromInvoices from 'src/app/modules/invoices/reducers/invoices.reducer';
import { LoanEffects } from 'src/app/modules/loan/effects/loan.effects';
import * as fromLoan from 'src/app/modules/loan/reducers/loan.reducer';
import { ReceiptsEffects } from 'src/app/modules/receipts/effects/receipts.effects';
import * as fromReceipts from 'src/app/modules/receipts/reducers/receipts.reducer';
import { TransactionsEffects } from 'src/app/modules/transaction/effects/transactions.effects';
import * as fromTransactions from 'src/app/modules/transaction/reducers/transactions.reducer';
import { AuthenticationInterceptor } from 'src/app/platform/authentication/interceptor/authentication.interceptor';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    importProvidersFrom(AppRouting),
    importProvidersFrom(StoreModule.forRoot(fromAppStore.appReducer)),
    importProvidersFrom(
      EffectsModule.forRoot([
        NavigationEffects,
        AuthenticationEffects,
        ToastNotificationEffects,
      ]),
    ),
    importProvidersFrom(StoreRouterConnectingModule.forRoot()),
    importProvidersFrom(NgbModule),
    // Feature stores
    importProvidersFrom(
      EffectsModule.forFeature([
        InvoicesEffects,
        ReceiptsEffects,
        TransactionsEffects,
        LoanEffects,
      ]),
    ),

    importProvidersFrom([
      StoreModule.forFeature('LoanState', fromLoan.reducer),
      StoreModule.forFeature('TransactionsState', fromTransactions.reducer),
      StoreModule.forFeature('ReceiptsState', fromReceipts.reducer),
      StoreModule.forFeature('InvoicesState', fromInvoices.reducer),
    ]),

    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthenticationInterceptor,
      multi: true,
    },
  ],
}).catch((err) => console.error(err));
