import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as MortgageLoanActions from 'src/app/modules/mortgage-loan/actions/mortgage-loan.actions';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import { CheckboxComponent } from 'src/app/shared/components/checkbox/checkbox.component';
import { HoldTriggerDirective } from 'src/app/shared/directives/hold-trigger.directive';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import {
  MonthlyInstalmentManager,
  OverviewLoanInstalment,
} from '../../models/overview-mortgage-loan.model';

@Component({
  selector: 'p-mortgage-loan-overview-body-table',
  imports: [
    CommonModule,
    FormsModule,
    NumberFormatPipe,
    CheckboxComponent,
    HoldTriggerDirective,
  ],
  templateUrl: './mortgage-loan-overview-body-table.component.html',
  styleUrl: './mortgage-loan-overview-body-table.component.scss',
})
export class MortgageLoanOverviewBodyTableComponent {
  monthlyInstalmentGroups = input<MonthlyInstalmentManager[]>([]);

  store = inject(Store<fromMortgageLoan.MortgageLoanState>);

  toggleGroup(group: MonthlyInstalmentManager) {
    group.expanded = !group.expanded;
  }

  toggleRow(row: OverviewLoanInstalment) {
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

  onSelectInstalmentPayment(instalment: OverviewLoanInstalment) {
    this.store.dispatch(
      MortgageLoanActions.selectedInstalmentPaymentChanged({
        values: [instalment.instalmentId],
      }),
    );
  }

  onSelectEarlyPayment(instalment: OverviewLoanInstalment) {
    this.store.dispatch(
      MortgageLoanActions.selectedEarlyPaymentChanged({
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
