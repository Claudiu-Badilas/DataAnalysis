import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import * as ReceiptsActions from 'src/app/modules/receipts/actions/receipts.actions';
import * as fromReceipts from 'src/app/modules/receipts/reducers/receipts.reducer';
import { DateUtils } from 'src/app/shared/utils/date.utils';

@Component({
  selector: 'p-receipts',
  imports: [RouterModule, CommonModule],
  templateUrl: './receipts.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./receipts.component.scss'],
})
export class ReceiptsComponent {
  constructor(private readonly store: Store<fromReceipts.State>) {
    this.store.dispatch(ReceiptsActions.loadReceipts());
  }
}
