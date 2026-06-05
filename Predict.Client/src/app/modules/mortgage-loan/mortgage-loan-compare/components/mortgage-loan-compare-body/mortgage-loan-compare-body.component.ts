import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import * as fromMortgageLoanCompare from 'src/app/modules/mortgage-loan/mortgage-loan-compare/selectors/mortgage-loan-compare.selectors';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { HistoricalInstalmentPaymentBatchesManager } from '../../../mortgage-loan-detailed/models/base-loan-rate.model';
import { JsDateUtils } from 'src/app/shared/utils/js-date.utils';
import { Calculator } from 'src/app/shared/utils/calculator.utils';

@Component({
  selector: 'p-mortgage-loan-compare-body',
  imports: [CommonModule, NumberFormatPipe],
  templateUrl: './mortgage-loan-compare-body.component.html',
  styleUrl: './mortgage-loan-compare-body.component.scss',
})
export class MortgageLoanCompareBodyComponent {
  private readonly store = inject(Store<fromMortgageLoan.MortgageLoanState>);

  baseHistoricalInstalmentPaymentBatchesManager = toSignal(
    this.store.select(
      fromMortgageLoanCompare.getBaseHistoricalInstalmentPaymentBatchesManager,
    ),
  );
  leftHistoricalInstalmentPaymentBatchesManager = toSignal(
    this.store.select(
      fromMortgageLoanCompare.getLeftHistoricalInstalmentPaymentBatchesManager,
    ),
  );
  rightHistoricalInstalmentPaymentBatchesManager = toSignal(
    this.store.select(
      fromMortgageLoanCompare.getRightHistoricalInstalmentPaymentBatchesManager,
    ),
  );

  years = computed(() => {
    const leftManager =
      this.leftHistoricalInstalmentPaymentBatchesManager()?.selected
        ?.monthlyInstalments;
    const leftFirstDate = leftManager?.at(0)?.paymentDate;
    const leftLastDate = leftManager?.at(-1)?.paymentDate;
    const rightManager =
      this.rightHistoricalInstalmentPaymentBatchesManager()?.selected
        ?.monthlyInstalments;
    const rightFirstDate = rightManager?.at(0)?.paymentDate;
    const rightLastDate = rightManager?.at(-1)?.paymentDate;

    return this.getEvenlySpacedYears(
      [leftFirstDate, leftLastDate, rightFirstDate, rightLastDate].filter(
        Boolean,
      ),
      30,
    );
  });

  validManagers = computed(() => {
    const managers = [
      this.leftHistoricalInstalmentPaymentBatchesManager(),
      this.rightHistoricalInstalmentPaymentBatchesManager(),
      this.baseHistoricalInstalmentPaymentBatchesManager(),
    ].filter(Boolean);

    const uniqueManagers = [];
    const seenNames = new Set();

    for (const manager of managers) {
      if (manager && !seenNames.has(manager.getBaseName())) {
        seenNames.add(manager.getBaseName());
        uniqueManagers.push(manager);
      }
    }
    return uniqueManagers;
  });

  getLabelDate(year: number): Date {
    const now = new Date();
    return new Date(`${year}-${now.getMonth() + 1}-01`);
  }

  getPrincipalAmount(
    year: number,
    manager: HistoricalInstalmentPaymentBatchesManager,
  ) {
    const date = this.getLabelDate(year);
    const inst = manager.selected.monthlyInstalments.filter((i) =>
      JsDateUtils.isSameOrAfter(i.paymentDate, date),
    );
    return Calculator.sum(inst.map((i) => i.principalAmount));
  }

  getEvenlySpacedYears(dates: Date[], limit: number): number[] {
    if (!dates.length || limit <= 0) return [];

    const parsed = dates.map((d) => (d instanceof Date ? d : new Date(d)));

    const minDate = new Date(Math.min(...parsed.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...parsed.map((d) => d.getTime())));

    const startYear = minDate.getFullYear();
    const endYear = maxDate.getFullYear();

    if (limit === 1 || startYear === endYear) {
      return [startYear];
    }

    const span = endYear - startYear;
    const step = span / (limit - 1);

    const years: number[] = [];

    for (let i = 0; i < limit; i++) {
      const year = Math.round(startYear + step * i);
      years.push(year);
    }

    years[0] = startYear;
    years[years.length - 1] = endYear;

    return [...new Set(years)];
  }
}
