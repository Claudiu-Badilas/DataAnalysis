import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Input,
  signal,
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
        <div class="comparison-card">
          <!-- Header -->
          <div class="card-header">
            <div class="header-left">
              <span class="loan-badge loan-badge--left">
                {{ validManagers()[0].getBaseName() }}
              </span>
              <span class="vs-divider">VS</span>
              <span class="loan-badge loan-badge--right">
                {{ validManagers()[1].getBaseName() }}
              </span>
            </div>
            <div class="duration-badge">
              <span class="duration-item duration-left">
                {{ validManagers()[0].getDuration() ?? 'N/A' }}y
              </span>
              <span class="duration-separator">•</span>
              <span class="duration-item duration-right">
                {{ validManagers()[1].getDuration() ?? 'N/A' }}y
              </span>
            </div>
          </div>

          <!-- Metrics Grid -->
          <div class="metrics-grid">
            <!-- Principal -->
            <div class="metric-item">
              <div class="metric-header">
                <span class="metric-label">Principal</span>
                <span
                  class="metric-diff"
                  [class.positive]="getDifference('principal') > 0"
                  [class.negative]="getDifference('principal') < 0"
                >
                  {{ getDifference('principal') | numberFormat: '0.00' }}
                </span>
              </div>
              <div class="metric-values">
                <span class="value-left">
                  {{
                    validManagers()[0].getUnpaidPrincipalAmmount()
                      | numberFormat: '0.00'
                  }}
                </span>
                <span class="vs-mini">↔</span>
                <span class="value-right">
                  {{
                    validManagers()[1].getUnpaidPrincipalAmmount()
                      | numberFormat: '0.00'
                  }}
                </span>
              </div>
            </div>

            <!-- Interest -->
            <div class="metric-item">
              <div class="metric-header">
                <span class="metric-label">Interest</span>
                <span
                  class="metric-diff"
                  [class.positive]="getDifference('interest') > 0"
                  [class.negative]="getDifference('interest') < 0"
                >
                  {{ getDifference('interest') | numberFormat: '0.00' }}
                </span>
              </div>
              <div class="metric-values">
                <span class="value-left">
                  {{
                    validManagers()[0].getUnpaidAmmountInterest()
                      | numberFormat: '0.00'
                  }}
                </span>
                <span class="vs-mini">↔</span>
                <span class="value-right">
                  {{
                    validManagers()[1].getUnpaidAmmountInterest()
                      | numberFormat: '0.00'
                  }}
                </span>
              </div>
            </div>

            <!-- Insurance -->
            <div class="metric-item">
              <div class="metric-header">
                <span class="metric-label">Insurance</span>
                <span
                  class="metric-diff"
                  [class.positive]="getDifference('insurance') > 0"
                  [class.negative]="getDifference('insurance') < 0"
                >
                  {{ getDifference('insurance') | numberFormat: '0.00' }}
                </span>
              </div>
              <div class="metric-values">
                <span class="value-left">
                  {{
                    validManagers()[0].getUnpaidInsuranceAmmount()
                      | numberFormat: '0.00'
                  }}
                </span>
                <span class="vs-mini">↔</span>
                <span class="value-right">
                  {{
                    validManagers()[1].getUnpaidInsuranceAmmount()
                      | numberFormat: '0.00'
                  }}
                </span>
              </div>
            </div>

            <!-- Total (Highlighted) -->
            <div class="metric-item metric-item--highlight">
              <div class="metric-header">
                <span class="metric-label metric-label--bold">Total</span>
                <span
                  class="metric-diff metric-diff--large"
                  [class.positive]="getDifference('total') > 0"
                  [class.negative]="getDifference('total') < 0"
                >
                  {{ getDifference('total') | numberFormat: '0.00' }}
                </span>
              </div>
              <div class="metric-values">
                <span class="value-left value-bold">
                  {{
                    validManagers()[0].getPaidAmmount() | numberFormat: '0.00'
                  }}
                </span>
                <span class="vs-mini">↔</span>
                <span class="value-right value-bold">
                  {{
                    validManagers()[1].getPaidAmmount() | numberFormat: '0.00'
                  }}
                </span>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-icon">📊</div>
          <p class="empty-text">Select two loans to compare</p>
          <span class="empty-subtext"
            >Compare rates, terms, and total costs</span
          >
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
      max-width: 1200px;
      margin: 0 auto;
      padding: 0.5rem;
    }

    /* Card */
    .comparison-card {
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.06),
        0 2px 8px rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(226, 232, 240, 0.6);
      transition: all 0.2s ease;
    }

    .comparison-card:hover {
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.08);
    }

    /* Header */
    .card-header {
      padding: 0.875rem 1.25rem;
      background: linear-gradient(135deg, #fafcff 0%, #f8fafc 100%);
      border-bottom: 1px solid #eef2f8;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .loan-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.7rem;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .loan-badge--left {
      background: linear-gradient(135deg, #20c997, #0d9488);
      color: white;
      box-shadow: 0 2px 8px rgba(32, 201, 151, 0.3);
    }

    .loan-badge--right {
      background: linear-gradient(135deg, #e91e63, #be185d);
      color: white;
      box-shadow: 0 2px 8px rgba(233, 30, 99, 0.3);
    }

    .vs-divider {
      font-size: 0.65rem;
      font-weight: 800;
      color: #94a3b8;
      letter-spacing: 0.05em;
    }

    .duration-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: white;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      font-size: 0.7rem;
      font-weight: 600;
    }

    .duration-item {
      padding: 0.1rem 0.3rem;
      border-radius: 4px;
    }

    .duration-left {
      color: #0d9488;
    }

    .duration-right {
      color: #be185d;
    }

    .duration-separator {
      color: #cbd5e1;
      font-size: 0.5rem;
    }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
    }

    .metric-item {
      background: #fafcff;
      border-radius: 10px;
      padding: 0.5rem 0.75rem;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }

    .metric-item:hover {
      background: #f8fafc;
      border-color: #e2e8f0;
    }

    .metric-item--highlight {
      grid-column: 1 / -1;
      background: linear-gradient(135deg, #fffbeb, #fefce8);
      border: 1px solid #fde68a;
      padding: 0.625rem 0.875rem;
    }

    .metric-item--highlight:hover {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      border-color: #f59e0b;
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;
    }

    .metric-label {
      font-size: 0.65rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .metric-label--bold {
      font-weight: 700;
      color: #92400e;
    }

    .metric-values {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.25rem;
    }

    .value-left,
    .value-right {
      font-size: 0.8rem;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }

    .value-left {
      color: #0d9488;
    }

    .value-right {
      color: #be185d;
    }

    .value-bold {
      font-weight: 800;
      font-size: 0.85rem;
    }

    .vs-mini {
      font-size: 0.55rem;
      font-weight: 700;
      color: #cbd5e1;
      flex-shrink: 0;
    }

    .metric-diff {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.1rem 0.5rem;
      border-radius: 12px;
      background: #f1f5f9;
      color: #475569;
      min-width: 55px;
      text-align: center;
      transition: all 0.2s ease;
    }

    .metric-diff--large {
      font-weight: 800;
      font-size: 0.7rem;
      min-width: 65px;
    }

    .metric-diff.positive {
      background: #d1fae5;
      color: #065f46;
    }

    .metric-diff.positive::before {
      content: '+';
    }

    .metric-diff.negative {
      background: #fee2e2;
      color: #991b1b;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 2.5rem 2rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
      border: 2px dashed #e2e8f0;
    }

    .empty-icon {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
      display: block;
    }

    .empty-text {
      color: #475569;
      font-size: 0.9rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
    }

    .empty-subtext {
      color: #94a3b8;
      font-size: 0.75rem;
    }

    /* ============================================
       MOBILE RESPONSIVE
       ============================================ */

    @media (max-width: 640px) {
      .comparison-wrapper {
        padding: 0.25rem;
      }

      .card-header {
        padding: 0.625rem 0.75rem;
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
      }

      .header-left {
        justify-content: center;
      }

      .loan-badge {
        font-size: 0.6rem;
        padding: 0.2rem 0.6rem;
      }

      .duration-badge {
        justify-content: center;
        font-size: 0.6rem;
        padding: 0.2rem 0.6rem;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
        gap: 0.35rem;
        padding: 0.5rem 0.75rem;
      }

      .metric-item {
        padding: 0.4rem 0.6rem;
        border-radius: 8px;
      }

      .metric-item--highlight {
        grid-column: 1 / -1;
        padding: 0.5rem 0.6rem;
      }

      .metric-header {
        margin-bottom: 0.2rem;
      }

      .metric-label {
        font-size: 0.55rem;
      }

      .value-left,
      .value-right {
        font-size: 0.7rem;
      }

      .value-bold {
        font-size: 0.75rem;
      }

      .vs-mini {
        font-size: 0.5rem;
      }

      .metric-diff {
        font-size: 0.55rem;
        padding: 0.05rem 0.4rem;
        min-width: 45px;
      }

      .metric-diff--large {
        font-size: 0.6rem;
        min-width: 55px;
      }

      .empty-state {
        padding: 1.5rem 1rem;
      }

      .empty-icon {
        font-size: 2rem;
      }

      .empty-text {
        font-size: 0.8rem;
      }

      .empty-subtext {
        font-size: 0.65rem;
      }
    }

    @media (max-width: 380px) {
      .card-header {
        padding: 0.5rem;
      }

      .loan-badge {
        font-size: 0.5rem;
        padding: 0.15rem 0.4rem;
      }

      .vs-divider {
        font-size: 0.5rem;
      }

      .duration-badge {
        font-size: 0.5rem;
        padding: 0.15rem 0.4rem;
      }

      .metrics-grid {
        padding: 0.35rem 0.5rem;
        gap: 0.25rem;
      }

      .metric-item {
        padding: 0.3rem 0.4rem;
      }

      .value-left,
      .value-right {
        font-size: 0.6rem;
      }

      .value-bold {
        font-size: 0.65rem;
      }

      .metric-diff {
        font-size: 0.5rem;
        min-width: 38px;
        padding: 0.05rem 0.3rem;
      }

      .metric-diff--large {
        font-size: 0.55rem;
        min-width: 45px;
      }
    }

    /* Tablet */
    @media (min-width: 641px) and (max-width: 1024px) {
      .metrics-grid {
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
      }

      .metric-item--highlight {
        grid-column: 1 / -1;
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
