import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { HistoricalInstalmentPaymentBatch } from '../../models/base-loan-rate.model';

interface YearGroup {
  year: number;
  expanded: boolean;
  monthlyGroups: HistoricalInstalmentPaymentBatch[];
  subtotal: {
    instalmentsCount: number;
    earlyCount: number;
    principal: number;
    interest: number;
    insuranceCost: number;
    total: number;
    remainingBalance: number;
    count: number;
  };
}

@Component({
  selector: 'p-historical-instalments-table',
  imports: [CommonModule, NumberFormatPipe],
  templateUrl: './historical-instalments-table.component.html',
  styleUrl: './historical-instalments-table.component.scss',
})
export class HistoricalInstalmentsTableComponent {
  showOnlyTotalRow = input.required<boolean>();
  monthlyInstalmentGroups = input<HistoricalInstalmentPaymentBatch[]>([]);

  // Signal to track expanded years
  private expandedYears = signal<Set<number>>(new Set());

  // Computed property to group by year and filter payment rows
  yearGroups = computed<YearGroup[]>(() => {
    const groups = this.monthlyInstalmentGroups();
    const expandedYears = this.expandedYears();

    // Filter payment rows first
    const filteredGroups = groups
      .map((group) => ({
        ...group,
        instalments: group.instalments.filter(
          (row) => row.instalmentPayment || row.earlyPayment,
        ),
      }))
      .filter((group) => group.instalments.length > 0);

    // Group by year
    const yearMap = new Map<number, HistoricalInstalmentPaymentBatch[]>();

    filteredGroups.forEach((group) => {
      const year = new Date(group.title).getFullYear();
      if (!yearMap.has(year)) {
        yearMap.set(year, []);
      }
      yearMap.get(year)!.push(group);
    });

    // Sort years descending (most recent first)
    const sortedYears = Array.from(yearMap.keys()).sort((a, b) => b - a);

    return sortedYears.map((year) => {
      const monthlyGroups = yearMap.get(year)!;
      const allPaymentRows = monthlyGroups.flatMap((g) =>
        g.instalments.filter(
          (row) => row.instalmentPayment || row.earlyPayment,
        ),
      );

      const installment = allPaymentRows.find((s) => s.instalmentPayment);
      const early = allPaymentRows.filter((s) => s.earlyPayment);

      // Calculate year subtotal
      const subtotal = {
        instalmentsCount:
          allPaymentRows.filter((r) => r.instalmentPayment).length || 0,
        earlyCount: early.length,
        principal: Calculator.sum(allPaymentRows.map((e) => e.principalAmount)),
        interest: installment?.interestAmount || 0,
        insuranceCost: installment?.insuranceCost || 0,
        total: Calculator.sum(
          allPaymentRows
            .map((e) => e.principalAmount)
            .concat([
              installment?.interestAmount || 0,
              installment?.insuranceCost || 0,
            ]),
        ),
        remainingBalance:
          early?.at(-1)?.remainingBalance || installment?.remainingBalance || 0,
        count: allPaymentRows.length,
      };

      return {
        year,
        expanded: expandedYears.has(year),
        monthlyGroups: monthlyGroups.sort(
          (a, b) => b.title.valueOf() - a.title.valueOf(),
        ),
        subtotal,
      };
    });
  });

  // Toggle year group expansion
  toggleYearGroup(yearGroup: YearGroup) {
    const expandedYears = this.expandedYears();
    if (expandedYears.has(yearGroup.year)) {
      expandedYears.delete(yearGroup.year);
    } else {
      expandedYears.add(yearGroup.year);
    }
    this.expandedYears.set(new Set(expandedYears));
  }

  // Toggle monthly group expansion
  toggleMonthlyGroup(group: HistoricalInstalmentPaymentBatch) {
    group.expanded = !group.expanded;
  }

  hasInstallmentOrEarly(group: HistoricalInstalmentPaymentBatch): boolean {
    return group.instalments.some(
      (row) => row.instalmentPayment || row.earlyPayment,
    );
  }

  getPaymentRows(group: HistoricalInstalmentPaymentBatch) {
    return group.instalments.filter(
      (row) => row.instalmentPayment || row.earlyPayment,
    );
  }

  getSubtotal(group: HistoricalInstalmentPaymentBatch) {
    const instalments = group.instalments;
    // Only consider payment rows for subtotal
    const paymentRows = instalments.filter(
      (row) => row.instalmentPayment || row.earlyPayment,
    );
    const installment = paymentRows.find((s) => s.instalmentPayment);
    const early = paymentRows.filter((s) => s.earlyPayment);

    return {
      instalmentsCount: !!installment ? 1 : 0,
      earlyCount: early.length,
      principal: Calculator.sum(paymentRows.map((e) => e.principalAmount)),
      interest: installment?.interestAmount || 0,
      insuranceCost: installment?.insuranceCost || 0,
      total: Calculator.sum(
        paymentRows
          .map((e) => e.principalAmount)
          .concat([
            installment?.interestAmount || 0,
            installment?.insuranceCost || 0,
          ]),
      ),
      remainingBalance:
        early?.at(-1)?.remainingBalance || installment?.remainingBalance || 0,
      count: paymentRows.length,
    };
  }
}
