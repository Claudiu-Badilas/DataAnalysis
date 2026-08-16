import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { HistoricalInstalmentPaymentBatch } from '../../models/base-loan-rate.model';

@Component({
  selector: 'p-historical-instalments-table',
  imports: [CommonModule, NumberFormatPipe],
  template: `<div class="historical-instalments">
    <!-- Desktop Table Wrapper -->
    <div class="desktop-view">
      <div class="table-wrapper">
        <table class="instalment-table">
          <thead>
            <tr>
              <th class="text-center">Data Plății</th>
              <th class="text-center"></th>
              <th class="text-center">Total</th>
              <th class="text-center">Rată Credit</th>
              <th class="text-center">Rată Dobândă</th>
              <th class="text-center">Asig.</th>
              <th class="text-center">Sold Rest Plată</th>
            </tr>
          </thead>
          <tbody>
            @for (group of monthlyGroups(); track group.title) {
              <!-- Monthly Group Header -->
              <tr class="monthly-group-header-row">
                @let subtotal = group.subtotal;

                <td class="text-center">
                  <span class="group-title">{{
                    group.title | date: 'MMM yyyy'
                  }}</span>
                </td>
                <td class="text-center">
                  <span class="count bold"
                    >{{ subtotal.instalmentsCount }} +
                    {{ subtotal.earlyCount }}</span
                  >
                </td>
                <td class="text-center">
                  <span class="subtotal-total">
                    {{ subtotal.total | numberFormat: '0.00' }}</span
                  >
                </td>
                <td class="text-center">
                  <span class="semi-bold">
                    {{ subtotal.principal | numberFormat: '0.00' }}</span
                  >
                </td>
                <td class="text-center">
                  <span class="semi-bold">
                    {{ subtotal.interest | numberFormat: '0.00' }}</span
                  >
                </td>
                <td class="text-center">
                  <span class="semi-bold">
                    {{ subtotal.insuranceCost | numberFormat: '0.00' }}</span
                  >
                </td>
                <td class="text-center">
                  <span class="semi-bold">
                    {{ subtotal.remainingBalance | numberFormat: '0.00' }}</span
                  >
                </td>
              </tr>
            }
          </tbody>
        </table>

        @if (!monthlyGroups().length) {
          <div class="empty-state">No instalment data available</div>
        }
      </div>
    </div>

    <!-- Mobile View -->
    <div class="mobile-view">
      @for (group of monthlyGroups(); track group.title) {
        <!-- Mobile Month Card -->
        <div class="mobile-group-card">
          <!-- Month Details as Individual Items -->
          <div class="mobile-items-list">
            <!-- Month Total as first item -->
            <div class="mobile-item mobile-total-item">
              <div class="mobile-item-row">
                <div class="mobile-item-col">
                  <span class="item-label">{{
                    group.title | date: 'MMM yyyy'
                  }}</span>
                  <span class="item-value total-value  ">
                    {{ group.subtotal.instalmentsCount }} +
                    {{ group.subtotal.earlyCount }}
                  </span>
                </div>
                <div class="mobile-item-col">
                  <span class="item-label">Total</span>
                  <span class="item-value total-value">
                    {{ group.subtotal.total | numberFormat: '0.00' }}
                  </span>
                </div>
                <div class="mobile-item-col">
                  <span class="item-label">Principal</span>
                  <span class="item-value principal-value">
                    {{ group.subtotal.principal | numberFormat: '0.00' }}
                  </span>
                </div>
                <div class="mobile-item-col">
                  <span class="item-label">Dobândă</span>
                  <span class="item-value interest-value">
                    {{ group.subtotal.interest | numberFormat: '0.00' }}
                  </span>
                </div>
                <div class="mobile-item-col">
                  <span class="item-label">Asig.</span>
                  <span class="item-value">
                    {{ group.subtotal.insuranceCost | numberFormat: '0.00' }}
                  </span>
                </div>
                <div class="mobile-item-col">
                  <span class="item-label">Sold</span>
                  <span class="item-value remaining-value">
                    {{ group.subtotal.remainingBalance | numberFormat: '0.00' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  </div>`,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: `
    :host {
      display: block;
    }

    /* Desktop View */
    .desktop-view {
      display: block;
    }

    .table-wrapper {
      border-radius: 16px;
      margin: 10px 0;
      background: white;
      height: calc(100vh - 185px);
      overflow: auto;
      box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .instalment-table {
      width: 100%;
      table-layout: auto;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 13px;
    }

    .instalment-table th,
    .instalment-table td {
      padding: 5px 10px;
      border-bottom: 1px solid #eeeeee;
      vertical-align: middle;
      min-width: 80px;
    }

    .instalment-table th {
      background: #f9fafb;
      font-weight: 600;
      border-bottom: 2px solid #e2e6ee;
      font-size: 14px;
    }

    /* Sticky Header */
    .instalment-table thead th {
      position: sticky;
      top: 0;
      z-index: 25;
      background: #f9fafb;
    }

    /* Sticky First Column */
    .instalment-table th:first-child,
    .instalment-table td:first-child {
      position: sticky;
      left: 0;
      z-index: 30;
    }

    /* Header first column above everything */
    .instalment-table thead th:first-child {
      z-index: 50;
      background: #f9fafb;
    }

    /* Body first column */
    .instalment-table tbody td:first-child {
      z-index: 40;
    }

    /* Helpers */
    .text-center {
      text-align: center;
    }

    .bold {
      font-weight: 700;
    }

    .semi-bold {
      font-weight: 600;
    }

    /* Monthly Group Row */
    .monthly-group-header-row {
      background: #f8fafc;
      border-bottom: 2px solid #e2e6ee;
    }

    .group-title {
      font-weight: 700;
      font-size: 13px;
    }

    .subtotal-total {
      color: #0f766e;
      font-weight: 700;
    }

    .count {
      color: #3b82f6;
      font-size: 12px;
      background: #fff1f2;
      padding: 2px 10px;
      border-radius: 30px;
      border: 1px solid #3b82f6;
    }

    /* Payment Rows */
    .payment-row {
      transition: background 0.15s ease;
    }

    .yellow {
      background: #fffbeb;
    }
    .yellow td:first-child {
      border-left: 3px solid #f59e0b;
    }
    .yellow td:last-child {
      border-right: 3px solid #f59e0b;
    }

    .green {
      background: #ecfdf5;
    }
    .green td:first-child {
      border-left: 3px solid #10b981;
    }
    .green td:last-child {
      border-right: 3px solid #10b981;
    }

    .gray {
      background: #f8fafc;
    }
    .gray td:first-child {
      border-left: 3px solid #94a3b8;
    }
    .gray td:last-child {
      border-right: 3px solid #94a3b8;
    }

    .strike {
      text-decoration: line-through;
      color: #9ca3af;
    }

    .total-value {
      color: #0f766e;
      font-weight: 700;
    }

    .principal-value {
      color: #10b981;
      font-weight: 600;
    }

    .interest-value {
      color: #ef4444;
      font-weight: 600;
    }

    .remaining-value {
      color: #3b82f6;
      font-weight: 600;
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      color: #9ca3af;
    }

    /* Mobile View */
    .mobile-view {
      display: none;
      box-shadow:
        0 2px 2px -1px rgba(0, 0, 0, 0.05),
        0 2px 2px -1px rgba(0, 0, 0, 0.06);
    }

    /* Responsive - Mobile Styles */
    @media (max-width: 768px) {
      .desktop-view {
        display: none;
      }

      .mobile-view {
        display: block;
        overflow-y: auto;
        height: calc(100vh - 200px);
      }

      .mobile-group-card {
        background: white;
        border-bottom: 1px solid #e2e6ee;
        overflow: hidden;
      }

      .mobile-group-header {
        padding: 12px 16px;
        background: #f8fafc;
        border-bottom: 2px solid #e2e6ee;
      }

      .mobile-group-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .mobile-group-title {
        font-weight: 600;
        font-size: 14px;
        color: #1f2937;
      }

      .mobile-group-count {
        color: #ef4444;
        font-size: 10px;
        background: white;
        padding: 2px 8px;
        border-radius: 30px;
        border: 1px solid #ef4444;
        white-space: nowrap;
      }

      .mobile-items-list {
        background: white;
      }

      .mobile-item {
        padding: 8px 5px;
        border-bottom: 1px solid #f0f0f0;
      }

      .mobile-item:last-child {
        border-bottom: none;
      }

      .mobile-total-item {
        background: #f9fafb;
        border-bottom: 2px solid #e2e6ee;
      }

      .orange-item {
        background: #fffbeb;
        border-left: 3px solid #f59e0b;
      }

      .green-item {
        background: #ecfdf5;
        border-left: 3px solid #10b981;
      }

      .gray-item {
        background: #f8fafc;
        border-left: 3px solid #94a3b8;
      }

      .mobile-item-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 4px;
      }

      .mobile-item-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        min-width: 40px;
      }

      .item-index {
        font-weight: 700;
        font-size: 12px;
        color: #1f2937;
      }

      .item-date {
        font-size: 10px;
        color: #6b7280;
      }

      .item-label {
        font-size: 8px;
        color: #6b7280;
        font-weight: 700;
        text-transform: uppercase;
        margin-bottom: 2px;
      }

      .item-value {
        font-weight: 600;
        font-size: 11px;
        color: #1f2937;
      }

      .principal-value {
        color: #10b981;
      }

      .interest-value {
        color: #ef4444;
      }

      .total-value {
        color: #0f766e;
        font-weight: 700;
      }

      .remaining-value {
        color: #3b82f6;
        font-weight: 700;
      }

      .strike {
        text-decoration: line-through;
        color: #9ca3af;
      }
    }

    /* Extra small screens */
    @media (max-width: 480px) {
      .mobile-view {
        height: calc(100vh - 180px);
      }

      .mobile-group-header {
        padding: 10px 12px;
      }

      .mobile-group-title {
        font-size: 12px;
      }

      .mobile-group-count {
        font-size: 9px;
        padding: 2px 6px;
      }

      .mobile-item {
        padding: 8px 5px;
      }

      .item-index {
        font-size: 10px;
      }

      .item-date {
        font-size: 9px;
      }

      .item-label {
        font-size: 7px;
      }

      .item-value {
        font-size: 9px;
      }
    }
  `,
})
export class HistoricalInstalmentsTableComponent {
  showOnlyTotalRow = input.required<boolean>();
  monthlyInstalmentGroups = input<HistoricalInstalmentPaymentBatch[]>([]);

  // Computed property to process monthly data
  monthlyGroups = computed(() => {
    const groups = this.monthlyInstalmentGroups();

    // Filter payment rows first
    const filteredGroups = groups
      .map((group) => ({
        ...group,
        instalments: group.instalments.filter(
          (row) => row.instalmentPayment || row.earlyPayment,
        ),
      }))
      .filter((group) => group.instalments.length > 0);

    // Sort by title descending (most recent first)
    // Convert Date to string for comparison
    const sortedGroups = filteredGroups.sort((a, b) => {
      const dateA =
        a.title instanceof Date
          ? a.title.getTime()
          : new Date(a.title).getTime();
      const dateB =
        b.title instanceof Date
          ? b.title.getTime()
          : new Date(b.title).getTime();
      return dateB - dateA; // Descending order (most recent first)
    });

    // Calculate subtotals for each month
    return sortedGroups.map((group) => {
      const paymentRows = group.instalments.filter(
        (row) => row.instalmentPayment || row.earlyPayment,
      );
      const installment = paymentRows.find((s) => s.instalmentPayment);
      const early = paymentRows.filter((s) => s.earlyPayment);

      return {
        title: group.title,
        instalments: paymentRows,
        subtotal: {
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
            early?.at(-1)?.remainingBalance ||
            installment?.remainingBalance ||
            0,
          count: paymentRows.length,
        },
      };
    });
  });
}
