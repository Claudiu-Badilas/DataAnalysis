import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import * as fromTransactions from 'src/app/modules/transaction/reducers/transactions.reducer';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';

@Component({
  selector: 'p-transaction-charts',
  imports: [CommonModule, ToggleButtonComponent, HighchartWrapperComponent],
  templateUrl: './transaction-charts.component.html',
  styleUrls: ['./transaction-charts.component.scss'],
})
export class MostCommonTransactionComponent {
  constructor(private readonly store: Store<fromTransactions.State>) {}

  dailyTransactionsChart = toSignal(
    this.store.select(fromTransactions.getDailyTransactionsChart),
  );
  monthlyTransactionsChart = toSignal(
    this.store.select(fromTransactions.getMonthlyTransactionsChart),
  );

  transactionType = signal<'Daily' | 'Monthly'>('Daily');

  onTransactionTypeChange($event: string) {
    this.transactionType.set($event as 'Daily' | 'Monthly');
  }
}
