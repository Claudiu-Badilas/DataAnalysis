import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromTransactions from 'src/app/modules/transaction/reducers/transactions.reducer';
import { CheckboxComponent } from 'src/app/shared/components/checkbox/checkbox.component';
import { BoldSearchPipe } from 'src/app/shared/pipes/bold-search-term.pipe';

@Component({
  selector: 'p-transaction-table',
  imports: [CommonModule, CheckboxComponent, BoldSearchPipe],
  templateUrl: './transaction-table.component.html',
  styleUrls: ['./transaction-table.component.scss'],
})
export class TransactionTableComponent {
  transactions$ = this.store.select(fromTransactions.getAvailableTransactions);
  searchTerm$ = this.store.select(fromTransactions.getSearchTerm);

  constructor(private readonly store: Store<fromTransactions.State>) {}
}
