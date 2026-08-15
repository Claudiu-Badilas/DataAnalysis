import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import * as ReceiptsActions from 'src/app/modules/receipts/actions/receipts.actions';
import * as fromReceipts from 'src/app/modules/receipts/reducers/receipts.reducer';
import { RangeSelectorComponent } from 'src/app/shared/components/date-range-picker/date-range-picker.component';
import { SearchInputComponent } from 'src/app/shared/components/search-input/search-input.component';
import { ToggleButtonActionsComponent } from 'src/app/shared/components/toggle-button-actions/toggle-button-actions.component';
import { TopBarComponent } from 'src/app/shared/components/top-bar/top-bar.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import { MostCommonProductsComponent } from './components/most-common-products/most-common-products.component';

@Component({
  selector: 'p-receipts-products',
  imports: [
    CommonModule,
    RangeSelectorComponent,
    ToggleButtonActionsComponent,
    SearchInputComponent,
    TopBarComponent,
    MostCommonProductsComponent,
  ],
  templateUrl: './receipts-products.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './receipts-products.component.scss',
})
export class ReceiptsProductsComponent {
  startDate$ = this.store.select(fromReceipts.getStartDate);
  endDate$ = this.store.select(fromReceipts.getEndDate);
  receipts$ = this.store.select(
    fromReceipts.getAvailableReceiptsProductBySearchTerm,
  );

  minDate = new Date('2016-01-01');
  now = new Date();

  constructor(private readonly store: Store<fromReceipts.State>) {}

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/receipts/${module.toLowerCase()}`,
      }),
    );
  }

  handleRangeChange(value: any) {
    this.store.dispatch(
      ReceiptsActions.dateRangeChanged({
        startDate: value.startDate,
        endDate: value.endDate,
      }),
    );
    this.store.dispatch(ReceiptsActions.loadReceipts());
  }

  onSearch(value: string) {
    this.store.dispatch(
      ReceiptsActions.searchTermChanged({ searchTerm: value }),
    );
  }
}
