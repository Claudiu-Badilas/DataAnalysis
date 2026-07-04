import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import * as MortgageLoanDetailedActions from 'src/app/modules/mortgage-loan/loan-detailed/actions/loan-detailed.actions';
import * as fromMortgageLoanDetailed from 'src/app/modules/mortgage-loan/loan-detailed/selectors/loan-detailed.selectors';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { LoanDetailedBodyComponent } from './components/loan-detailed-body/loan-detailed-body.component';
import { LoanDetailedHeaderComponent } from './components/loan-detailed-header/loan-detailed-header.component';
import { ToggleButtonActionsComponent } from 'src/app/shared/components/toggle-button-actions/toggle-button-actions.component';
import { TopBarComponent } from 'src/app/shared/components/top-bar/top-bar.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';

@Component({
  selector: 'p-loan-detailed',
  imports: [
    CommonModule,
    LoanDetailedHeaderComponent,
    LoanDetailedBodyComponent,
    DropdownSelectComponent,
    TopBarComponent,
    ToggleButtonActionsComponent,
  ],
  templateUrl: './loan-detailed.component.html',
  styleUrl: './loan-detailed.component.scss',
})
export class LoanDetailedComponent {
  selectedRepaymentScheduleName$ = this.store.select(
    fromMortgageLoanDetailed.getDetailedSelectedRepaymentScheduleName,
  );
  dropDownSelectOptions$ = this.store
    .select(fromMortgageLoan.getRepaymentSchedules)
    .pipe(map((rs) => rs.map((r) => r.name)));

  constructor(private store: Store<fromMortgageLoan.MortgageLoanState>) {}

  onDropdownSelected(value: string) {
    this.store.dispatch(
      MortgageLoanDetailedActions.selectedMortgageLoanChanged({
        selected: value,
      }),
    );
  }

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/mortgage-loan/${module.toLowerCase()}`,
      }),
    );
  }
}
