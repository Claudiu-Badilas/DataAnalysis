import { Component, computed, input } from '@angular/core';
import { MostCommonTransactionComponent } from '../most-common-transaction/most-common-transaction.component';
import { TransactionDomain } from '../../../models/transactions.model';

@Component({
  selector: 'p-transaction-header',
  imports: [MostCommonTransactionComponent],
  templateUrl: './transaction-header.component.html',
  styleUrls: ['./transaction-header.component.scss'],
})
export class TransactionHeaderComponent {
  readonly transactions = input.required<TransactionDomain[]>();

  readonly ValidTransactions = computed(() =>
    this.transactions().filter((t) => !t.ignored),
  );
}
