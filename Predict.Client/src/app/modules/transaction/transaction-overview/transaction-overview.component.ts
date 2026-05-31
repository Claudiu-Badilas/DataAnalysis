import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';

import * as TransactionsActions from 'src/app/modules/transaction/actions/transactions.actions';
import * as fromTransactions from 'src/app/modules/transaction/reducers/transactions.reducer';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import { Colors } from 'src/app/shared/styles/colors';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import { TransactionHeaderComponent } from './components/transaction-header/transaction-header.component';
import { DailyTransactionChartUtils } from './utils/daily-transactions.chart.util';

@Component({
  selector: 'p-transaction-overview',
  imports: [
    CommonModule,
    CommonModule,
    TransactionHeaderComponent,
    HighchartWrapperComponent,
    ToggleButtonComponent,
  ],
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

  selectedProvider = toSignal(
    this.store.select(fromTransactions.getSelectedProvider),
  );

  selectedServiceProvider = toSignal(
    this.store.select(fromTransactions.getSelectedServiceProvider),
  );

  monthlyTransactionsChart = toSignal(
    this.store.select(fromTransactions.getMonthlyTransactionsChart),
  );

  dailyTransactionsChart = computed(() =>
    DailyTransactionChartUtils.getChart(
      this.startDate(),
      this.endDate(),
      this.transactions(),
    ),
  );

  minDate = new Date('2018-01-01');
  maxDate = new Date('2030-01-01');

  constructor(private readonly store: Store<fromTransactions.State>) {
    this.store.dispatch(TransactionsActions.loadTransactions());
  }

  colors = Colors;
  transactionType = signal<'Daily' | 'Monthly'>('Daily');

  onTransactionTypeChange($event: string) {
    this.transactionType.set($event as 'Daily' | 'Monthly');
  }

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/transactions/${module.toLowerCase()}`,
      }),
    );
  }
}
