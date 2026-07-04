import {
  enableProdMode,
  provideZoneChangeDetection,
  importProvidersFrom,
  provideZonelessChangeDetection,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { AppRouting } from './app/app.routing';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import * as fromAppStore from 'src/app/store/app-state.reducer';
import { NavigationEffects } from 'src/app/store/effects/navigation.effects';
import { AuthenticationEffects } from 'src/app/platform/authentication/effects/authentication.effects';
import { ToastNotificationEffects } from 'src/app/platform/toast-notifications/effects/toast-notification.effects';

// Feature states & effects
import * as fromInvoices from 'src/app/modules/invoices/reducers/invoices.reducer';
import { InvoicesEffects } from 'src/app/modules/invoices/effects/invoices.effects';
import * as fromReceipts from 'src/app/modules/receipts/reducers/receipts.reducer';
import { ReceiptsEffects } from 'src/app/modules/receipts/effects/receipts.effects';
import * as fromTransactions from 'src/app/modules/transaction/reducers/transactions.reducer';
import { TransactionsEffects } from 'src/app/modules/transaction/effects/transactions.effects';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import * as fromMortgageLoanCompare from 'src/app/modules/mortgage-loan/loan-compare/reducers/loan-compare.reducer';
import { MortgageLoanEffects } from 'src/app/modules/mortgage-loan/effects/mortgage-loan.effects';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthenticationInterceptor } from 'src/app/platform/authentication/interceptor/authentication.interceptor';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

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
      StoreModule.forFeature('InvoicesState', fromInvoices.reducer),
    ),
    importProvidersFrom(EffectsModule.forFeature([InvoicesEffects])),

    importProvidersFrom(
      StoreModule.forFeature('ReceiptsState', fromReceipts.reducer),
    ),
    importProvidersFrom(EffectsModule.forFeature([ReceiptsEffects])),

    importProvidersFrom(
      StoreModule.forFeature('TransactionsState', fromTransactions.reducer),
    ),
    importProvidersFrom(EffectsModule.forFeature([TransactionsEffects])),

    importProvidersFrom(
      StoreModule.forFeature('MortgageLoanState', fromMortgageLoan.reducer),
    ),
    importProvidersFrom(
      StoreModule.forFeature(
        'MortgageLoanStateCompare',
        fromMortgageLoanCompare.reducer,
      ),
    ),
    importProvidersFrom(EffectsModule.forFeature([MortgageLoanEffects])),

    // Global providers (interceptors, etc.)
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthenticationInterceptor,
      multi: true,
    },
  ],
}).catch((err) => console.error(err));
