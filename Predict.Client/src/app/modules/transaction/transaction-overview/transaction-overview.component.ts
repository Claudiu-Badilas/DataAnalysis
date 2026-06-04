import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';

import * as TransactionsActions from 'src/app/modules/transaction/actions/transactions.actions';
import * as fromTransactions from 'src/app/modules/transaction/reducers/transactions.reducer';
import { Colors } from 'src/app/shared/styles/colors';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import { MostCommonTransactionComponent } from './components/most-common-transaction/most-common-transaction.component';

@Component({
  selector: 'p-transaction-overview',
  imports: [CommonModule, CommonModule, MostCommonTransactionComponent],
  templateUrl: './transaction-overview.component.html',
  styleUrls: ['./transaction-overview.component.scss'],
})
export class TransactionOverviewComponent {
  startDate = toSignal(this.store.select(fromTransactions.getStartDate));
  endDate = toSignal(this.store.select(fromTransactions.getEndDate));

  transactions = toSignal(
    this.store.select(fromTransactions.getAvailableTransactions),
    { initialValue: [] },
  );

  readonly validTransactions = computed(() =>
    this.transactions().filter((t) => !t.ignored),
  );

  selectedProvider = toSignal(
    this.store.select(fromTransactions.getSelectedProvider),
  );

  selectedServiceProvider = toSignal(
    this.store.select(fromTransactions.getSelectedServiceProvider),
  );

  minDate = new Date('2018-01-01');
  maxDate = new Date('2030-01-01');

  constructor(private readonly store: Store<fromTransactions.State>) {
    this.store.dispatch(TransactionsActions.loadTransactions());
  }

  colors = Colors;

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/transactions/${module.toLowerCase()}`,
      }),
    );
  }
}
