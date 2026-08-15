import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';

@Component({
  selector: 'p-transaction-overview-header',
  imports: [NumberFormatPipe],
  templateUrl: './transaction-overview-header.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./transaction-overview-header.component.scss'],
})
export class TransactionOverviewHeaderComponent {
  totalIncome = input<number>();
  totalExpense = input<number>();
  totalTransactions = input<number>();
}
