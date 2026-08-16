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
  template: `
    <div class="comparison-wrapper">
      @if (validManagers().length === 2) {
        <div class="comparison-container">
          <!-- LEFT LOAN -->
          <div class="loan-panel loan-panel--left">
            <div class="loan-header">
              <span class="loan-name">{{
                validManagers()[0].getBaseName()
              }}</span>
              <span class="loan-duration"
                >{{ validManagers()[0].getDuration() ?? 'N/A' }} years</span
              >
            </div>
            <div class="loan-stats">
              <div class="stat-item">
                <span class="stat-label">Principal</span>
                <span class="stat-value">{{
                  validManagers()[0].getUnpaidPrincipalAmmount()
                    | numberFormat: '0.00'
                }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Interest</span>
                <span class="stat-value">{{
                  validManagers()[0].getUnpaidAmmountInterest()
                    | numberFormat: '0.00'
                }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Insurance</span>
                <span class="stat-value">{{
                  validManagers()[0].getUnpaidInsuranceAmmount()
                    | numberFormat: '0.00'
                }}</span>
              </div>
              <div class="stat-item stat-item--total">
                <span class="stat-label">Total</span>
                <span class="stat-value stat-value--total">{{
                  validManagers()[0].getPaidAmmount() | numberFormat: '0.00'
                }}</span>
              </div>
            </div>
          </div>

          <!-- VS DIVIDER -->
          <div class="vs-divider-container">
            <div class="vs-ring">VS</div>
            <div class="vs-line"></div>
            <div class="vs-differences">
              <div
                class="diff-item"
                [class.positive]="getDifference('principal') > 0"
                [class.negative]="getDifference('principal') < 0"
              >
                {{ getDifference('principal') | numberFormat: '0.00' }}
              </div>
              <div
                class="diff-item"
                [class.positive]="getDifference('interest') > 0"
                [class.negative]="getDifference('interest') < 0"
              >
                {{ getDifference('interest') | numberFormat: '0.00' }}
              </div>
              <div
                class="diff-item"
                [class.positive]="getDifference('insurance') > 0"
                [class.negative]="getDifference('insurance') < 0"
              >
                {{ getDifference('insurance') | numberFormat: '0.00' }}
              </div>
              <div
                class="diff-item diff-item--total"
                [class.positive]="getDifference('total') > 0"
                [class.negative]="getDifference('total') < 0"
              >
                {{ getDifference('total') | numberFormat: '0.00' }}
              </div>
            </div>
          </div>

          <!-- RIGHT LOAN -->
          <div class="loan-panel loan-panel--right">
            <div class="loan-header">
              <span class="loan-name">{{
                validManagers()[1].getBaseName()
              }}</span>
              <span class="loan-duration"
                >{{ validManagers()[1].getDuration() ?? 'N/A' }} years</span
              >
            </div>
            <div class="loan-stats">
              <div class="stat-item">
                <span class="stat-label">Principal</span>
                <span class="stat-value">{{
                  validManagers()[1].getUnpaidPrincipalAmmount()
                    | numberFormat: '0.00'
                }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Interest</span>
                <span class="stat-value">{{
                  validManagers()[1].getUnpaidAmmountInterest()
                    | numberFormat: '0.00'
                }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Insurance</span>
                <span class="stat-value">{{
                  validManagers()[1].getUnpaidInsuranceAmmount()
                    | numberFormat: '0.00'
                }}</span>
              </div>
              <div class="stat-item stat-item--total">
                <span class="stat-label">Total</span>
                <span class="stat-value stat-value--total">{{
                  validManagers()[1].getPaidAmmount() | numberFormat: '0.00'
                }}</span>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-icon">⚖️</div>
          <p class="empty-text">Select two loans to compare</p>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      font-family:
        -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .comparison-wrapper {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0.5rem;
    }

    .comparison-container {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 0;
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
      border: 1px solid #eef2f8;
      min-height: 320px;
    }

    /* Loan Panels */
    .loan-panel {
      padding: 1.5rem 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .loan-panel--left {
      background: linear-gradient(135deg, #fafffe 0%, #f0fdf4 100%);
    }

    .loan-panel--right {
      background: linear-gradient(135deg, #fafffe 0%, #fdf2f8 100%);
    }

    .loan-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid rgba(0, 0, 0, 0.04);
    }

    .loan-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: #1e293b;
      letter-spacing: 0.02em;
    }

    .loan-panel--left .loan-name {
      color: #0d9488;
    }

    .loan-panel--right .loan-name {
      color: #be185d;
    }

    .loan-duration {
      font-size: 0.65rem;
      font-weight: 600;
      color: #94a3b8;
      background: white;
      padding: 0.15rem 0.6rem;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .loan-stats {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.3rem 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.03);
    }

    .stat-item:last-child {
      border-bottom: none;
    }

    .stat-label {
      font-size: 0.7rem;
      font-weight: 500;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .stat-value {
      font-size: 0.8rem;
      font-weight: 600;
      color: #1e293b;
      font-variant-numeric: tabular-nums;
    }

    .stat-item--total {
      margin-top: 0.25rem;
      padding-top: 0.5rem;
      border-top: 2px solid rgba(0, 0, 0, 0.06);
    }

    .stat-value--total {
      font-size: 0.95rem;
      font-weight: 800;
    }

    .loan-panel--left .stat-value--total {
      color: #0d9488;
    }

    .loan-panel--right .stat-value--total {
      color: #be185d;
    }

    /* VS Divider */
    .vs-divider-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem 1rem;
      background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
      position: relative;
      min-width: 80px;
    }

    .vs-ring {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.75rem;
      color: #475569;
      border: 2px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      margin-bottom: 0.75rem;
      position: relative;
      z-index: 2;
    }

    .vs-line {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      width: 2px;
      background: linear-gradient(
        180deg,
        transparent,
        #e2e8f0 20%,
        #e2e8f0 80%,
        transparent
      );
      transform: translateX(-50%);
    }

    .vs-differences {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      width: 100%;
      position: relative;
      z-index: 2;
    }

    .diff-item {
      font-size: 0.6rem;
      font-weight: 700;
      text-align: center;
      padding: 0.1rem 0.3rem;
      border-radius: 8px;
      background: white;
      border: 1px solid #e2e8f0;
      font-variant-numeric: tabular-nums;
    }

    .diff-item.positive {
      background: #d1fae5;
      color: #065f46;
      border-color: #6ee7b7;
    }

    .diff-item.negative {
      background: #fee2e2;
      color: #991b1b;
      border-color: #fca5a5;
    }

    .diff-item--total {
      font-size: 0.7rem;
      padding: 0.2rem 0.4rem;
      margin-top: 0.2rem;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      background: white;
      border-radius: 20px;
      box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
      border: 2px dashed #e2e8f0;
    }

    .empty-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 0.75rem;
    }

    .empty-text {
      color: #475569;
      font-size: 0.9rem;
      font-weight: 600;
      margin: 0;
    }

    /* Mobile */
    @media (max-width: 768px) {
      .comparison-container {
        grid-template-columns: 1fr;
        gap: 0;
      }

      .loan-panel {
        padding: 1rem 1.25rem;
      }

      .vs-divider-container {
        flex-direction: row;
        padding: 0.5rem 1rem;
        min-width: unset;
        min-height: 60px;
        gap: 1rem;
      }

      .vs-line {
        top: 50%;
        left: 0;
        right: 0;
        width: auto;
        height: 2px;
        transform: translateY(-50%);
        background: linear-gradient(
          90deg,
          transparent,
          #e2e8f0 20%,
          #e2e8f0 80%,
          transparent
        );
      }

      .vs-ring {
        width: 36px;
        height: 36px;
        font-size: 0.6rem;
        margin-bottom: 0;
      }

      .vs-differences {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.3rem;
      }

      .diff-item {
        font-size: 0.55rem;
        padding: 0.05rem 0.4rem;
        min-width: 50px;
      }

      .loan-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.25rem 1rem;
      }

      .stat-item {
        border-bottom: none;
        padding: 0.15rem 0;
      }

      .stat-item--total {
        grid-column: 1 / -1;
        margin-top: 0;
        padding-top: 0.25rem;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
      }

      .loan-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }
    }

    @media (max-width: 480px) {
      .loan-panel {
        padding: 0.75rem 1rem;
      }

      .loan-name {
        font-size: 0.75rem;
      }

      .stat-label {
        font-size: 0.6rem;
      }

      .stat-value {
        font-size: 0.7rem;
      }

      .stat-value--total {
        font-size: 0.85rem;
      }

      .loan-stats {
        grid-template-columns: 1fr;
        gap: 0.15rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
