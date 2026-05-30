import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import * as MortgageLoanActions from 'src/app/modules/mortgage-loan/actions/mortgage-loan.actions';
import * as fromMortgageLoanOverview from 'src/app/modules/mortgage-loan/mortgage-loan-overview/selectors/mortgage-loan-overview.selectors';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import { LocalStorageService } from 'src/app/platform/services/local-storage.service';
import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { NumericInputComponent } from 'src/app/shared/components/numeric-input/numeric-input.component';
import { ToggleButtonActionsComponent } from 'src/app/shared/components/toggle-button-actions/toggle-button-actions.component';
import { TopBarComponent } from 'src/app/shared/components/top-bar/top-bar.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import { MortgageLoanOverviewBodyTableComponent } from './components/mortgage-loan-overview-body-table/mortgage-loan-overview-body-table.component';
import { MortgageLoanOverviewHeaderComponent } from './components/mortgage-loan-overview-header/mortgage-loan-overview-header.component';
import { mapInstalementSimulation } from './utils/instalment-simulation.utils';

@Component({
  selector: 'p-mortgage-loan-overview',
  imports: [
    CommonModule,
    DropdownSelectComponent,
    MortgageLoanOverviewHeaderComponent,
    MortgageLoanOverviewBodyTableComponent,
    NumericInputComponent,
    TopBarComponent,
    ToggleButtonActionsComponent,
  ],
  templateUrl: './mortgage-loan-overview.component.html',
  styleUrls: ['./mortgage-loan-overview.component.scss'],
})
export class MortgageLoanOverviewComponent {
  monthlyInstalmentBatches = toSignal(
    this.store.select(fromMortgageLoanOverview.getMonthlyInstalmentBatches),
  );
  selectedRepaymentScheduleName$ = this.store.select(
    fromMortgageLoanOverview.getSelectedRepaymentScheduleName,
  );
  dropDownSelectOptions$ = this.store
    .select(fromMortgageLoan.getRepaymentSchedules)
    .pipe(map((rs) => rs.map((r) => r.name)));

  selectedRepaymentScheduleBase = toSignal(
    this.store.select(fromMortgageLoanOverview.getSelectedRepaymentSchedule),
  );

  monthlyAmountKey = 'MortgageLoanOverview_MonthlyAmount';
  paymentsKey = 'MortgageLoanOverview_Payments';

  monthlyAmount = signal<number>(
    this._localStorageService.getItem(this.monthlyAmountKey) ?? 3500,
  );
  payments = signal<number>(
    this._localStorageService.getItem(this.paymentsKey) ?? 1,
  );

  constructor(
    private readonly store: Store<fromMortgageLoan.MortgageLoanState>,
    private readonly _localStorageService: LocalStorageService,
  ) {
    effect(() => {
      const [instalmentPayments, earlyPayments] = mapInstalementSimulation(
        this.selectedRepaymentScheduleBase(),
        { monthlyAmount: this.monthlyAmount(), payments: this.payments() },
      );
      this.store.dispatch(
        MortgageLoanActions.simulateInstalmentPaymentsChanged({
          selectedInstalmentPayments: instalmentPayments,
          selectedEarlyPayments: earlyPayments,
        }),
      );
    });
  }

  onDropdownSelected(value: string) {
    this.store.dispatch(
      MortgageLoanActions.selectedMortgageLoanChanged({ selected: value }),
    );
  }

  onMonthlyAmountChange(monthlyAmount: number) {
    this.monthlyAmount.set(monthlyAmount);
    this._localStorageService.setItem(this.monthlyAmountKey, monthlyAmount);
  }

  onPaymentsChange(payments: number) {
    this.payments.set(payments);
    this._localStorageService.setItem(this.paymentsKey, payments);
  }

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/mortgage-loan/${module.toLowerCase()}`,
      }),
    );
  }
}
