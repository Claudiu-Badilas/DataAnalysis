import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Input,
} from '@angular/core';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { HistoricalInstalmentPaymentBatchesManager } from '../../models/base-loan-rate.model';
import { RepaymentSchedule } from '../../../models/loan.model';

@Component({
  selector: 'p-loan-detailed-compare-body',
  imports: [CommonModule, NumberFormatPipe],
  templateUrl: './loan-detailed-compare-body.component.html',
  styleUrl: './loan-detailed-compare-body.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class LoanDetailedCompareBodyComponent {
  @Input() baseRepaymentSchedule: RepaymentSchedule | null = null;
  @Input() selectedRepaymentSchedule: RepaymentSchedule | null = null;
  @Input() repaymentSchedules: RepaymentSchedule[] = [];

  leftManager = computed(() => {
    const base = this.baseRepaymentSchedule;
    if (!base) return null;

    const filtered = this.repaymentSchedules.filter((r) => r.date <= base.date);

    return new HistoricalInstalmentPaymentBatchesManager(base, base, filtered);
  });

  rightManager = computed(() => {
    const selected = this.selectedRepaymentSchedule;
    if (!selected) return null;

    const filtered = this.repaymentSchedules.filter(
      (r) => r.date <= selected.date,
    );

    return new HistoricalInstalmentPaymentBatchesManager(
      this.baseRepaymentSchedule ?? selected,
      selected,
      filtered,
    );
  });

  validManagers = computed(() => {
    const managers = [this.leftManager(), this.rightManager()].filter(Boolean);
    const uniqueManagers: HistoricalInstalmentPaymentBatchesManager[] = [];
    const seenNames = new Set<string>();

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
