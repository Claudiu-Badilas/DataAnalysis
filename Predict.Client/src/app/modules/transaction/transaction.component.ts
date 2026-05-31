import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { RangeSelectorComponent } from 'src/app/shared/components/date-range-picker/date-range-picker.component';
import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { SearchInputComponent } from 'src/app/shared/components/search-input/search-input.component';
import { ToggleButtonActionsComponent } from 'src/app/shared/components/toggle-button-actions/toggle-button-actions.component';
import { TopBarComponent } from 'src/app/shared/components/top-bar/top-bar.component';

import * as TransactionsActions from 'src/app/modules/transaction/actions/transactions.actions';
import * as fromTransactions from 'src/app/modules/transaction/reducers/transactions.reducer';
import { Colors } from 'src/app/shared/styles/colors';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
@Component({
  selector: 'p-transaction',
  imports: [
    CommonModule,
    CommonModule,
    RouterModule,
    ToggleButtonActionsComponent,
    TopBarComponent,
    CommonModule,
    CommonModule,
    RangeSelectorComponent,
    DropdownSelectComponent,
    SearchInputComponent,
    TopBarComponent,
    ToggleButtonActionsComponent,
  ],
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss'],
})
export class TransactionComponent {
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
