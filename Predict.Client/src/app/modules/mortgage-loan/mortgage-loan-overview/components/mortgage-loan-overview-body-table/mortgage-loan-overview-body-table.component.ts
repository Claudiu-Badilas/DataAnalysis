import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as MortgageLoanActions from 'src/app/modules/mortgage-loan/actions/mortgage-loan.actions';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import { CheckboxComponent } from 'src/app/shared/components/checkbox/checkbox.component';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import {
  MonthlyInstalmentManager,
  OverviewLoanInstalment,
} from '../../models/overview-mortgage-loan.model';
import {
  ColumnConfig,
  DEFAULT_COLUMN_CONFIGS,
} from './model/column-config.model';

@Component({
  selector: 'p-mortgage-loan-overview-body-table',
  imports: [CommonModule, FormsModule, NumberFormatPipe, CheckboxComponent],
  templateUrl: './mortgage-loan-overview-body-table.component.html',
  styleUrl: './mortgage-loan-overview-body-table.component.scss',
})
export class MortgageLoanOverviewBodyTableComponent {
  monthlyInstalmentGroups = input<MonthlyInstalmentManager[]>([]);

  @ViewChild('menuContainer') menuContainer!: ElementRef;

  store = inject(Store<fromMortgageLoan.MortgageLoanState>);

  isMenuOpen = false;
  columns: ColumnConfig[] = DEFAULT_COLUMN_CONFIGS;

  toggleGroup(group: MonthlyInstalmentManager) {
    group.expanded = !group.expanded;
  }

  toggleRow(row: OverviewLoanInstalment) {
    row.instalmentPayment = !row.instalmentPayment;
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (
      this.isMenuOpen &&
      this.menuContainer &&
      !this.menuContainer.nativeElement.contains(event.target)
    ) {
      this.isMenuOpen = false;
    }
  }

  isColumnVisible(key: ColumnConfig['key']): boolean {
    const column = this.columns.find((col) => col.key === key);
    return column ? column.visible : true;
  }

  getSubtotal(group: MonthlyInstalmentManager) {
    const instalments = group.instalments;
    const installment = instalments.find((s) => s.instalmentPayment);
    const early = instalments.filter((s) => s.earlyPayment);

    return {
      instalmentsCount: !!installment ? 1 : 0,
      earlyCount: early.length,
      principal: Calculator.sum(instalments.map((e) => e.principalAmount)),
      interest: installment.interestAmount,
      administrationFee: installment.administrationFee,
      insurance: installment.insuranceCost,
      managementFee: installment.managementFee,
      recalculatedInterest: installment.recalculatedInterest,
      total: Calculator.sum(
        early.map((e) => e.principalAmount).concat(installment.totalInstalment),
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
}
