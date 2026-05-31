import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';

import * as TransactionsActions from 'src/app/modules/transaction/actions/transactions.actions';
import * as fromTransactions from 'src/app/modules/transaction/reducers/transactions.reducer';
import { RangeSelectorComponent } from 'src/app/shared/components/date-range-picker/date-range-picker.component';
import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { SearchInputComponent } from 'src/app/shared/components/search-input/search-input.component';
import { ToggleButtonActionsComponent } from 'src/app/shared/components/toggle-button-actions/toggle-button-actions.component';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import { TopBarComponent } from 'src/app/shared/components/top-bar/top-bar.component';
import { Colors } from 'src/app/shared/styles/colors';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import { TransactionHeaderComponent } from './components/transaction-header/transaction-header.component';
import { DailyTransactionChartUtils } from './utils/daily-transactions.chart.util';

@Component({
  selector: 'p-transaction-overview',
  imports: [
    CommonModule,
    CommonModule,
    RangeSelectorComponent,
    DropdownSelectComponent,
    SearchInputComponent,
    TransactionHeaderComponent,
    HighchartWrapperComponent,
    TopBarComponent,
    ToggleButtonComponent,
    ToggleButtonActionsComponent,
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

  // 🔹 Derived signals (replace pipe(map()))
  providerDropDownSelectOptions = computed(() => {
    const t = this.transactions();
    return ['No Selection', ...new Set(t.map((x) => x.provider))];
  });

  dropDownSelectOptions = computed(() => {
    const t = this.transactions();
    return ['No Selection', ...new Set(t.map((x) => x.serviceProvider))];
  });

  dailyTransactionsChart = computed(() =>
    DailyTransactionChartUtils.getChart(
      this.startDate(),
      this.endDate(),
      this.transactions(),
      { loadExpenses: this.transactionType() === 'Expense' },
    ),
  );

  minDate = new Date('2018-01-01');
  maxDate = new Date('2030-01-01');

  constructor(private readonly store: Store<fromTransactions.State>) {
    this.store.dispatch(TransactionsActions.loadTransactions());
  }

  handleRangeChange(value: any) {
    this.store.dispatch(
      TransactionsActions.dateRangeChanged({
        startDate: value.startDate,
        endDate: value.endDate,
      }),
    );
    this.store.dispatch(TransactionsActions.loadTransactions());
  }

  onProviderDropdownSelected(value: string) {
    this.store.dispatch(
      TransactionsActions.selectedProviderChanged({ provider: value }),
    );
  }

  onDropdownSelected(value: string) {
    this.store.dispatch(
      TransactionsActions.selectedServiceProviderChanged({
        serviceProvider: value,
      }),
    );
  }

  onSearch(value: string) {
    this.store.dispatch(
      TransactionsActions.searchTermChanged({ searchTerm: value }),
    );
  }

  colors = Colors;
  transactionType = signal<'Expense' | 'Income'>('Expense');

  onTransactionTypeChange($event: string) {
    this.transactionType.set($event as 'Expense' | 'Income');
  }

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/transactions/${module.toLowerCase()}`,
      }),
    );
  }
}
