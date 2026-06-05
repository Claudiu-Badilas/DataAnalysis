import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { MonthlyInstalmentManager } from '../../models/overview-mortgage-loan.model';

@Component({
  selector: 'p-mortgage-loan-overview-header',
  imports: [CommonModule, NumberFormatPipe],
  template: `
    <!-- Desktop View -->
    <div class="desktop-view">
      <div class="summary-grid">
        <div class="summary-row">
          <!-- Rata -->
          <div class="summary-section stat-item stat-item--orange">
            <div class="stat-row">
              <span class="stat-item__label">Rata</span>
              <span class="stat-item__label">Anticipat</span>
            </div>

            <div class="stat-row">
              <span class="stat-item__value">
                {{ totalInstalmentPayments() | numberFormat: '0.00' }}
              </span>
              <span class="stat-item__value">
                {{ totalEarlyPayment() | numberFormat: '0.00' }}
              </span>
            </div>
          </div>

          <!-- Dobanda -->
          <div class="summary-section stat-item stat-item--amber">
            <div class="stat-row">
              <span class="stat-item__label">Dobanda</span>
              <span class="stat-item__label">Principal</span>
            </div>

            <div class="stat-row">
              <span class="stat-item__value">
                {{ totalInterestPayment() | numberFormat: '0.00' }}
              </span>
              <span class="stat-item__value">
                {{ totalPrincipalPayment() | numberFormat: '0.00' }}
              </span>
            </div>
          </div>

          <!-- Total -->
          <div class="summary-section stat-item stat-item--rose">
            <div class="stat-row">
              <span class="stat-item__label">Total</span>
              <span class="stat-item__label">1 / 2</span>
            </div>

            <div class="stat-row">
              <span class="stat-item__value">
                {{ totalPayment() | numberFormat: '0.00' }}
              </span>
              <span class="stat-item__value">
                {{ totalPayment() / 2 | numberFormat: '0.00' }}
              </span>
            </div>
          </div>

          <!-- Sold -->
          <div class="summary-section stat-item stat-item--violet">
            <div class="stat-row">
              <span class="stat-item__label">Sold</span>
              <span class="stat-item__value">
                {{ paidMonthlyInstalments() | numberFormat: '0' : 0 }}
                /
                {{ monthlyInstalments() | numberFormat: '0' : 0 }}
              </span>
            </div>

            <div class="stat-row">
              <span class="stat-item__value">
                {{ initialRemainingBalance() | numberFormat: '0.00' }}
              </span>
              <span class="stat-item__value">
                {{
                  payments()?.at(-1)?.remainingBalance | numberFormat: '0.00'
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile View - 2 Rows with same styling as web -->
    <div class="mobile-view">
      <div class="summary-grid">
        <!-- Row 1 -->
        <div class="summary-row">
          <!-- Rata -->
          <div class="summary-section stat-item stat-item--orange">
            <div class="stat-row">
              <span class="stat-item__label">Rata</span>
              <span class="stat-item__label">Anticipat</span>
            </div>

            <div class="stat-row">
              <span class="stat-item__value">
                {{ totalInstalmentPayments() | numberFormat: '0.00' }}
              </span>
              <span class="stat-item__value">
                {{ totalEarlyPayment() | numberFormat: '0.00' }}
              </span>
            </div>
          </div>

          <!-- Dobanda -->
          <div class="summary-section stat-item stat-item--amber">
            <div class="stat-row">
              <span class="stat-item__label">Dobanda</span>
              <span class="stat-item__label">Principal</span>
            </div>

            <div class="stat-row">
              <span class="stat-item__value">
                {{ totalInterestPayment() | numberFormat: '0.00' }}
              </span>
              <span class="stat-item__value">
                {{ totalPrincipalPayment() | numberFormat: '0.00' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Row 2 -->
        <div class="summary-row">
          <!-- Total -->
          <div class="summary-section stat-item stat-item--rose">
            <div class="stat-row">
              <span class="stat-item__label">Total</span>
              <span class="stat-item__label">1 / 2</span>
            </div>

            <div class="stat-row">
              <span class="stat-item__value">
                {{ totalPayment() | numberFormat: '0.00' }}
              </span>
              <span class="stat-item__value">
                {{ totalPayment() / 2 | numberFormat: '0.00' }}
              </span>
            </div>
          </div>

          <!-- Sold -->
          <div class="summary-section stat-item stat-item--violet">
            <div class="stat-row">
              <span class="stat-item__label">Sold</span>
              <span class="stat-item__value">
                {{ paidMonthlyInstalments() | numberFormat: '0' : 0 }}
                /
                {{ monthlyInstalments() | numberFormat: '0' : 0 }}
              </span>
            </div>

            <div class="stat-row">
              <span class="stat-item__value">
                {{ initialRemainingBalance() | numberFormat: '0.00' }}
              </span>
              <span class="stat-item__value">
                {{
                  payments()?.at(-1)?.remainingBalance | numberFormat: '0.00'
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    /* Desktop View */
    .desktop-view {
      display: block;
    }

    .summary-grid {
      width: 100%;
    }

    .summary-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .summary-row:last-child {
      margin-bottom: 0;
    }

    /* TABLET - keep 2 rows */
    @media (max-width: 1200px) {
      .summary-row {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
      }
    }

    /* CARD */
    .summary-section {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0.75rem;
      border-radius: 12px;
      min-height: 70px;
      transition: all 0.15s ease;
      background: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-row:first-child {
      margin-bottom: 0.5rem;
    }

    .stat-item__label {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .stat-item__value {
      font-size: 14px;
      font-weight: 700;
      color: #1f2937;
    }

    /* Color styles */
    .stat-item {
      border-left: 3px solid transparent;
    }

    .stat-item--orange {
      border-left-color: #f97316;
    }

    .stat-item--amber {
      border-left-color: #f59e0b;
    }

    .stat-item--rose {
      border-left-color: #f43f5e;
    }

    .stat-item--violet {
      border-left-color: #8b5cf6;
    }

    /* Mobile View */
    .mobile-view {
      display: none;
    }

    /* Responsive - Mobile Styles */
    @media (max-width: 768px) {
      .desktop-view {
        display: none;
      }

      .mobile-view {
        display: block;
        // padding: 12px;
        // background: #f8fafc;
      }

      .mobile-view .summary-grid {
        width: 100%;
      }

      .mobile-view .summary-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .mobile-view .summary-row:last-child {
        margin-bottom: 0;
      }

      /* Same card styling as web */
      .mobile-view .summary-section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0.75rem;
        border-radius: 12px;
        min-height: 70px;
        transition: all 0.15s ease;
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .mobile-view .stat-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .mobile-view .stat-row:first-child {
        margin-bottom: 0.5rem;
      }

      .mobile-view .stat-item__label {
        font-size: 11px;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }

      .mobile-view .stat-item__value {
        font-size: 13px;
        font-weight: 700;
        color: #1f2937;
      }

      /* Same color styles as web */
      .mobile-view .stat-item {
        border-left: 3px solid transparent;
      }

      .mobile-view .stat-item--orange {
        border-left-color: #f97316;
      }

      .mobile-view .stat-item--amber {
        border-left-color: #f59e0b;
      }

      .mobile-view .stat-item--rose {
        border-left-color: #f43f5e;
      }

      .mobile-view .stat-item--violet {
        border-left-color: #8b5cf6;
      }
    }

    /* Extra small screens - adjust spacing but keep 2 rows */
    @media (max-width: 480px) {
      .mobile-view .summary-section {
        padding: 0.5rem;
        min-height: 60px;
      }

      .mobile-view .stat-item__label {
        font-size: 10px;
      }

      .mobile-view .stat-item__value {
        font-size: 12px;
      }
    }
  `,
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
