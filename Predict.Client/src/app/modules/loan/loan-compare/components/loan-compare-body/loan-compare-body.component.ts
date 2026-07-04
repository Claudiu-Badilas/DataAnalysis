import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import * as fromLoanCompare from 'src/app/modules/loan/loan-compare/selectors/loan-compare.selectors';
import * as fromLoan from 'src/app/modules/loan/reducers/loan.reducer';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';

@Component({
  selector: 'p-loan-compare-body',
  imports: [CommonModule, NumberFormatPipe],
  templateUrl: './loan-compare-body.component.html',
  styleUrl: './loan-compare-body.component.scss',
})
export class LoanCompareBodyComponent {
  private readonly store = inject(Store<fromLoan.LoanState>);

  leftHistoricalInstalmentPaymentBatchesManager = toSignal(
    this.store.select(
      fromLoanCompare.getLeftHistoricalInstalmentPaymentBatchesManager,
    ),
  );
  rightHistoricalInstalmentPaymentBatchesManager = toSignal(
    this.store.select(
      fromLoanCompare.getRightHistoricalInstalmentPaymentBatchesManager,
    ),
  );

  validManagers = computed(() => {
    const managers = [
      this.leftHistoricalInstalmentPaymentBatchesManager(),
      this.rightHistoricalInstalmentPaymentBatchesManager(),
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

  getDifference(
    type: 'principal' | 'interest' | 'insurance' | 'total',
  ): number {
    const managers = this.validManagers();
    if (managers.length !== 2) return 0;

    const left = managers[0];
    const right = managers[1];

    switch (type) {
      case 'principal':
        return (
          left.getUnpaidPrincipalAmmount() - right.getUnpaidPrincipalAmmount()
        );
      case 'interest':
        return (
          left.getUnpaidAmmountInterest() - right.getUnpaidAmmountInterest()
        );
      case 'insurance':
        return (
          left.getUnpaidInsuranceAmmount() - right.getUnpaidInsuranceAmmount()
        );
      case 'total':
        return left.getPaidAmmount() - right.getPaidAmmount();
      default:
        return 0;
    }
  }
}
