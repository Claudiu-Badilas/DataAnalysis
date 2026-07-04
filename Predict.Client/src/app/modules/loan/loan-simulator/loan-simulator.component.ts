import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import * as LoanActions from 'src/app/modules/loan/actions/loan.actions';
import * as fromLoanSimulator from 'src/app/modules/loan/loan-simulator/selectors/loan-simulator.selectors';
import * as fromLoan from 'src/app/modules/loan/reducers/loan.reducer';
import { LocalStorageService } from 'src/app/platform/services/local-storage.service';
import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { NumericInputComponent } from 'src/app/shared/components/numeric-input/numeric-input.component';
import { ToggleButtonActionsComponent } from 'src/app/shared/components/toggle-button-actions/toggle-button-actions.component';
import { TopBarComponent } from 'src/app/shared/components/top-bar/top-bar.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import { LoanSimulatorBodyTableComponent } from './components/loan-simulator-body-table/loan-simulator-body-table.component';
import { LoanSimulatorHeaderComponent } from './components/loan-simulator-header/loan-simulator-header.component';
import { mapInstalementSimulation } from './utils/instalment-simulation.utils';

@Component({
  selector: 'p-loan-simulator',
  imports: [
    CommonModule,
    DropdownSelectComponent,
    LoanSimulatorHeaderComponent,
    LoanSimulatorBodyTableComponent,
    NumericInputComponent,
    TopBarComponent,
    ToggleButtonActionsComponent,
  ],
  templateUrl: './loan-simulator.component.html',
  styleUrls: ['./loan-simulator.component.scss'],
})
export class LoanSimulatorComponent {
  monthlyInstalmentBatches = toSignal(
    this.store.select(fromLoanSimulator.getMonthlyInstalmentBatches),
  );
  selectedRepaymentScheduleName$ = this.store.select(
    fromLoanSimulator.getSelectedRepaymentScheduleName,
  );
  dropDownSelectOptions$ = this.store
    .select(fromLoan.getRepaymentSchedules)
    .pipe(map((rs) => rs.map((r) => r.name)));

  selectedRepaymentScheduleBase = toSignal(
    this.store.select(fromLoanSimulator.getSelectedRepaymentSchedule),
  );

  monthlyAmountKey = 'LoanSimulator_MonthlyAmount';
  paymentsKey = 'LoanSimulator_Payments';

  monthlyAmount = signal<number>(
    this._localStorageService.getItem(this.monthlyAmountKey) ?? 3500,
  );
  payments = signal<number>(
    this._localStorageService.getItem(this.paymentsKey) ?? 1,
  );

  constructor(
    private readonly store: Store<fromLoan.LoanState>,
    private readonly _localStorageService: LocalStorageService,
  ) {
    effect(() => {
      const [instalmentPayments, earlyPayments] = mapInstalementSimulation(
        this.selectedRepaymentScheduleBase(),
        { monthlyAmount: this.monthlyAmount(), payments: this.payments() },
      );
      this.store.dispatch(
        LoanActions.simulateInstalmentPaymentsChanged({
          selectedInstalmentPayments: instalmentPayments,
          selectedEarlyPayments: earlyPayments,
        }),
      );
    });
  }

  onDropdownSelected(value: string) {
    this.store.dispatch(
      LoanActions.selectedLoanChanged({ selected: value }),
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
        route: `/loan/${module.toLowerCase()}`,
      }),
    );
  }
}
