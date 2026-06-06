import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import * as ReceiptsActions from 'src/app/modules/receipts/actions/receipts.actions';
import * as fromReceipts from 'src/app/modules/receipts/reducers/receipts.reducer';
import { RangeSelectorComponent } from 'src/app/shared/components/date-range-picker/date-range-picker.component';
import { DateRangePicker } from 'src/app/shared/components/date-range-picker/models/date-range-picker.model';
import { ToggleButtonActionsComponent } from 'src/app/shared/components/toggle-button-actions/toggle-button-actions.component';
import { TopBarComponent } from 'src/app/shared/components/top-bar/top-bar.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import { ReceiptListComponent } from './components/receipts-list/receipts-list.component';

@Component({
  selector: 'p-receipts-summary',
  imports: [
    CommonModule,
    ReceiptListComponent,
    RangeSelectorComponent,
    ToggleButtonActionsComponent,
    TopBarComponent,
  ],
  templateUrl: './receipts-summary.component.html',
  styleUrl: './receipts-summary.component.scss',
})
export class ReceiptsSummaryComponent {
  startDate$ = this.store.select(fromReceipts.getStartDate);
  endDate$ = this.store.select(fromReceipts.getEndDate);
  receipts$ = this.store.select(fromReceipts.getReceipts);

  constructor(private readonly store: Store<fromReceipts.State>) {}

  minDate = new Date('2021-01-01');
  now = new Date();

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/receipts/${module.toLowerCase()}`,
      }),
    );
  }

  handleRangeChange(value: DateRangePicker) {
    this.store.dispatch(
      ReceiptsActions.dateRangeChanged({
        startDate: value.startDate,
        endDate: value.endDate,
      }),
    );
    this.store.dispatch(ReceiptsActions.loadReceipts());
  }
}
