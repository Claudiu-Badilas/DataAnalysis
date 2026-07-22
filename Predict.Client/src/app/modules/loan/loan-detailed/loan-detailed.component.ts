import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import * as LoanActions from 'src/app/modules/loan/actions/loan.actions';
import * as LoanDetailedActions from 'src/app/modules/loan/loan-detailed/actions/loan-detailed.actions';
import * as fromLoanDetailed from 'src/app/modules/loan/loan-detailed/selectors/loan-detailed.selectors';
import * as fromLoan from 'src/app/modules/loan/reducers/loan.reducer';
import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { FooToggleComponent } from 'src/app/shared/components/foo-toggle/foo-toggle.component';
import { ToggleButtonActionsComponent } from 'src/app/shared/components/toggle-button-actions/toggle-button-actions.component';
import { TopBarComponent } from 'src/app/shared/components/top-bar/top-bar.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import { LoanDetailedBodyComponent } from './components/loan-detailed-body/loan-detailed-body.component';
import { LoanDetailedHeaderComponent } from './components/loan-detailed-header/loan-detailed-header.component';

@Component({
  selector: 'p-loan-detailed',
  imports: [
    CommonModule,
    LoanDetailedHeaderComponent,
    LoanDetailedBodyComponent,
    DropdownSelectComponent,
    TopBarComponent,
    ToggleButtonActionsComponent,
    FooToggleComponent,
  ],
  templateUrl: './loan-detailed.component.html',
  styleUrl: './loan-detailed.component.scss',
})
export class LoanDetailedComponent {
  selectedRepaymentScheduleName$ = this.store.select(
    fromLoanDetailed.getDetailedSelectedRepaymentScheduleName,
  );
  dropDownSelectOptions$ = this.store
    .select(fromLoan.getRepaymentSchedules)
    .pipe(map((rs) => rs.map((r) => r.name)));
  calculateRepaymentSchedules = toSignal(
    this.store.select(fromLoan.getCalculateRepaymentSchedules),
  );
  constructor(private store: Store<fromLoan.LoanState>) {}

  onDropdownSelected(value: string) {
    this.store.dispatch(
      LoanDetailedActions.selectedLoanChanged({
        selected: value,
      }),
    );
  }

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/loan/${module.toLowerCase()}`,
      }),
    );
  }

  onCalculateRepaymentSchedulesChanged(state: boolean) {
    this.store.dispatch(
      LoanActions.calculateRepaymentSchedulesChanged({
        calculateRepaymentSchedules: state,
      }),
    );

    this.store.dispatch(LoanActions.loadRepaymentSchedules());
  }
}
