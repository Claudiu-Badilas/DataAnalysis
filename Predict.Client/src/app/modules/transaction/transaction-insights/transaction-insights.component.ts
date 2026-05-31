import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';

import { toSignal } from '@angular/core/rxjs-interop';
import * as TransactionsActions from 'src/app/modules/transaction/actions/transactions.actions';
import * as fromTransactions from 'src/app/modules/transaction/reducers/transactions.reducer';
import { ToggleButtonActionsComponent } from 'src/app/shared/components/toggle-button-actions/toggle-button-actions.component';
import { TopBarComponent } from 'src/app/shared/components/top-bar/top-bar.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import { TransactionInsightsBodyComponent } from './components/transaction-insights-body/transaction-insights-body.component';

@Component({
  selector: 'p-transaction-insights',
  templateUrl: './transaction-insights.component.html',
  styleUrls: ['./transaction-insights.component.scss'],
  imports: [
    CommonModule,
    CommonModule,
    TopBarComponent,
    ToggleButtonActionsComponent,
    TransactionInsightsBodyComponent,
  ],
})
export class TransactionInsightsComponent {
  constructor(private readonly store: Store<fromTransactions.State>) {
    this.store.dispatch(TransactionsActions.loadTransactions2());
  }

  transactions = toSignal(
    this.store.select(fromTransactions.getAvailableTransactions),
    { initialValue: [] },
  );

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/transactions/${module.toLowerCase()}`,
      }),
    );
  }
}
