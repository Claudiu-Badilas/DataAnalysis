import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as LoanActions from 'src/app/modules/loan/actions/loan.actions';
import * as fromLoan from 'src/app/modules/loan/reducers/loan.reducer';
import { CheckboxComponent } from 'src/app/shared/components/checkbox/checkbox.component';
import { HoldTriggerDirective } from 'src/app/shared/directives/hold-trigger.directive';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import {
  MonthlyInstalmentManager,
  LoanSimulatorInstalment,
} from '../../models/loan-simulator.model';
import { toSignal } from '@angular/core/rxjs-interop';
import * as fromLoanSimulator from 'src/app/modules/loan/loan-simulator/selectors/loan-simulator.selectors';

@Component({
  selector: 'p-loan-simulator-body-table',
  imports: [
    CommonModule,
    FormsModule,
    NumberFormatPipe,
    CheckboxComponent,
    HoldTriggerDirective,
  ],
  templateUrl: './loan-simulator-body-table.component.html',
  styleUrl: './loan-simulator-body-table.component.scss',
})
export class LoanSimulatorBodyTableComponent {
  monthlyInstalmentGroups = input<MonthlyInstalmentManager[]>([]);

  store = inject(Store<fromLoan.LoanState>);

  selectedRepaymentScheduleBase = toSignal(
    this.store.select(fromLoanSimulator.getSelectedRepaymentSchedule),
  );

  toggleGroup(group: MonthlyInstalmentManager) {
    group.expanded = !group.expanded;
  }

  toggleRow(row: LoanSimulatorInstalment) {
    row.instalmentPayment = !row.instalmentPayment;
  }

  getSubtotal(group: MonthlyInstalmentManager) {
    const instalments = group.instalments;
    const installment = instalments.find((s) => s.instalmentPayment);
    const early = instalments.filter((s) => s.earlyPayment);

    return {
      instalmentsCount: !!installment ? 1 : 0,
      earlyCount: early.length,
      principal: Calculator.sum(instalments.map((e) => e.principalAmount)),
      interest: installment?.interestAmount ?? 0,
      insurance: installment?.insuranceCost ?? 0,
      total: Calculator.sum(
        early
          .map((e) => e.principalAmount)
          .concat(installment?.totalInstalment ?? 0),
      ),
      earlyPaymenrt: Calculator.sum(early.map((e) => e.principalAmount)),
      restant: instalments?.at(-1)?.remainingBalance,
      count: instalments.length,
    };
  }

  onSelectInstalmentPayment(instalment: LoanSimulatorInstalment) {
    this.store.dispatch(
      LoanActions.selectedInstalmentPaymentChanged({
        values: [instalment.instalmentId],
      }),
    );
  }

  onSelectEarlyPayment(instalment: LoanSimulatorInstalment) {
    this.store.dispatch(
      LoanActions.selectedEarlyPaymentChanged({
        values: [instalment.instalmentId],
      }),
    );
  }

  onExpandAll() {
    this.monthlyInstalmentGroups().forEach((group) => (group.expanded = true));
  }

  onCollapseAll() {
    this.monthlyInstalmentGroups().forEach((group) => (group.expanded = false));
  }

  expandState = true;

  onExpandOrCollapse() {
    this.expandState = !this.expandState;
    this.monthlyInstalmentGroups().forEach(
      (group) => (group.expanded = this.expandState),
    );
  }
}
