import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { HistoricalInstalmentPaymentBatch } from '../../models/base-loan-rate.model';

@Component({
  selector: 'p-historical-instalments-table',
  imports: [CommonModule, NumberFormatPipe],
  templateUrl: './historical-instalments-table.component.html',
  styleUrl: './historical-instalments-table.component.scss',
})
export class HistoricalInstalmentsTableComponent {
  showOnlyTotalRow = input.required<boolean>();
  monthlyInstalmentGroups = input<HistoricalInstalmentPaymentBatch[]>([]);

  toggleGroup(group: HistoricalInstalmentPaymentBatch) {
    group.expanded = !group.expanded;
  }

  hasInstallmentOrEarly(group: HistoricalInstalmentPaymentBatch): boolean {
    return group.instalments.some(
      (row) => row.instalmentPayment || row.earlyPayment,
    );
  }

  getSubtotal(group: HistoricalInstalmentPaymentBatch) {
    const instalments = group.instalments;
    const installment = instalments.find((s) => s.instalmentPayment);
    const early = instalments.filter((s) => s.earlyPayment);

    return {
      instalmentsCount: !!installment ? 1 : 0,
      earlyCount: early.length,
      principal: Calculator.sum(instalments.map((e) => e.principalAmount)),
      interest: installment?.interestAmount || 0,
      insuranceCost: installment?.insuranceCost || 0,
      total: Calculator.sum(
        instalments
          .map((e) => e.principalAmount)
          .concat([
            installment?.interestAmount || 0,
            installment?.insuranceCost || 0,
          ]),
      ),
      remainingBalance:
        early?.at(-1)?.remainingBalance || installment?.remainingBalance || 0,
      count: instalments.length,
    };
  }
}
