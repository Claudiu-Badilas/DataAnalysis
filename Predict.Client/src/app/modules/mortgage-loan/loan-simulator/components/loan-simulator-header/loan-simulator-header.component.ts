import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { DateUtils } from 'src/app/shared/utils/date.utils';
import { JsDateUtils } from 'src/app/shared/utils/js-date.utils';
import { MonthlyInstalmentManager } from '../../models/loan-simulator.model';

@Component({
  selector: 'p-loan-simulator-header',
  imports: [CommonModule, NumberFormatPipe],
  templateUrl: './loan-simulator-header.component.html',
  styleUrl: './loan-simulator-header.component.scss',
})
export class LoanSimulatorHeaderComponent {
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

  get nextPayment() {
    const now = new Date();
    const target = DateUtils.newDate(
      now.getFullYear(),
      now.getMonth() + 1,
      17,
      20,
      0,
    );
    if (JsDateUtils.isBefore(now, target))
      return JsDateUtils.dateDiffYMD(now, target);

    return JsDateUtils.dateDiffYMD(now, JsDateUtils.addMonths(target, 1));
  }
}
