import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { MonthlyInstalmentManager } from '../../models/overview-mortgage-loan.model';

@Component({
  selector: 'p-mortgage-loan-overview-header',
  imports: [CommonModule, NumberFormatPipe],
  templateUrl: './mortgage-loan-overview-header.component.html',
  styleUrl: './mortgage-loan-overview-header.component.scss',
})
export class MortgageLoanOverviewHeaderComponent {
  monthlyInstalmentGroups = input.required<MonthlyInstalmentManager[]>();

  overviewLoanInstalments = computed(() =>
    this.monthlyInstalmentGroups()
      .flatMap((r) => r.instalments)
      .filter((r) => r.instalmentPayment || r.earlyPayment),
  );

  payments = computed(() =>
    this.overviewLoanInstalments().filter(
      (r) => r.instalmentPayment || r.earlyPayment,
    ),
  );

  instalmentPayments = computed(() =>
    this.overviewLoanInstalments().filter((r) => r.instalmentPayment),
  );

  totalInstalmentPayments = computed(() =>
    Calculator.sum(this.instalmentPayments().map((a) => a.totalInstalment)),
  );
  totalInterestPayment = computed(() =>
    Calculator.sum(
      this.instalmentPayments().map((a) =>
        Calculator.sum([a.interestAmount, a.insuranceCost]),
      ),
    ),
  );
  totalPrincipalPayment = computed(() =>
    Calculator.sum(this.payments().map((a) => a.principalAmount)),
  );

  earlyPayments = computed(() =>
    this.overviewLoanInstalments().filter((r) => r.earlyPayment),
  );

  lastEarlyPayment = computed(() => this.earlyPayments().at(-1));

  totalEarlyPayment = computed(() =>
    Calculator.sum(this.earlyPayments().map((a) => a.principalAmount)),
  );

  paidMonthlyInstalments = computed(() =>
    Calculator.sum(
      this.monthlyInstalmentGroups()
        .filter((r) => r.completed)
        .map((r) => r.instalments.length),
    ),
  );

  monthlyInstalments = computed(() =>
    Calculator.sum(
      this.monthlyInstalmentGroups().map((r) => r.instalments.length),
    ),
  );

  totalPayment = computed(() =>
    Calculator.sum([this.totalInstalmentPayments(), this.totalEarlyPayment()]),
  );

  initialRemainingBalance = computed(() => {
    const firstInstalment = this.overviewLoanInstalments()[0];
    return Calculator.sum([
      firstInstalment?.remainingBalance,
      firstInstalment?.principalAmount,
    ]);
  });
}
