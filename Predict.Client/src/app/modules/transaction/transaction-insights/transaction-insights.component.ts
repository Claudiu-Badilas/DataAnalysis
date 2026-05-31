import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';

import { toSignal } from '@angular/core/rxjs-interop';
import * as TransactionsActions from 'src/app/modules/transaction/actions/transactions.actions';
import * as fromTransactions from 'src/app/modules/transaction/reducers/transactions.reducer';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import { TransactionInsightsBodyComponent } from './components/transaction-insights-body/transaction-insights-body.component';

@Component({
  selector: 'p-transaction-insights',
  templateUrl: './transaction-insights.component.html',
  styleUrls: ['./transaction-insights.component.scss'],
  imports: [CommonModule, CommonModule, TransactionInsightsBodyComponent],
})
export class TransactionInsightsComponent {
  constructor(private readonly store: Store<fromTransactions.State>) {
    this.store.dispatch(TransactionsActions.loadTransactions());
  }

  transactions = toSignal(
    this.store.select(fromTransactions.getAvailableTransactions),
    { initialValue: [] },
  );
}
