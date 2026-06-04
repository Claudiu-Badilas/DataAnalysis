import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { HistoricalInstalmentPaymentBatch } from '../../models/base-loan-rate.model';

@Component({
  selector: 'p-historical-instalments-table',
  imports: [CommonModule, NumberFormatPipe],
  template: `
    <div class="historical-instalments">
      <!-- Desktop Table Wrapper -->
      <div class="table-wrapper">
        <table class="instalment-table">
          <thead>
            <tr>
              <th class="text-center">#</th>
              <th class="text-center">Data Plății</th>
              <th class="text-center">Total</th>
              <th class="text-center">Rată Credit</th>
              <th class="text-center">Rată Dobândă</th>
              <th class="text-center">PAD</th>
              <th class="text-center">Sold Rest Plată</th>
            </tr>
          </thead>
          <tbody>
            @for (group of monthlyInstalmentGroups(); track group.title) {
              @let hasValidPayments = hasInstallmentOrEarly(group);

              @if (hasValidPayments) {
                <!-- Group Header Row -->
                <tr class="group-header-row" (click)="toggleGroup(group)">
                  @let subtotal = getSubtotal(group);
                  <td class="text-center">
                    <span class="group-count bold"
                      >{{ subtotal.instalmentsCount }} +
                      {{ subtotal.earlyCount }}</span
                    >
                  </td>
                  <td class="text-center">
                    <span class="group-title">{{
                      group.title | date: 'dd MMM yyyy'
                    }}</span>
                  </td>
                  <td class="text-center">
                    <span class="group-title">
                      {{ subtotal.total | numberFormat: '0.00' }}</span
                    >
                  </td>
                  <td class="text-center">
                    <span class="total-remaining ">
                      {{ subtotal.principal | numberFormat: '0.00' }}</span
                    >
                  </td>
                  <td class="text-center">
                    <span class="total-interest bold">
                      {{ subtotal.interest | numberFormat: '0.00' }}</span
                    >
                  </td>
                  <td class="text-center">
                    <span class="total-interest bold">
                      {{ subtotal.insuranceCost | numberFormat: '0.00' }}</span
                    >
                  </td>
                  <td class="text-center">
                    <span class="total-remaining">
                      {{
                        subtotal.remainingBalance | numberFormat: '0.00'
                      }}</span
                    >
                  </td>
                </tr>

                <!-- Group Rows -->
                @if (group.expanded) {
                  @for (
                    row of group.instalments;
                    let last = $last;
                    track row.index
                  ) {
                    @let rowTotal =
                      row.principalAmount +
                      row.interestAmount +
                      row.insuranceCost;
                    <tr
                      [class.orange]="row.instalmentPayment"
                      [class.green]="row.earlyPayment"
                      [class.gray]="!row.instalmentPayment && !row.earlyPayment"
                    >
                      <td
                        class="text-center"
                        [class.last-bottom-border]="last && row.earlyPayment"
                      >
                        {{ row.index }}
                      </td>
                      <td
                        class="text-center"
                        [class.strike]="
                          row.earlyPayment || row.instalmentPayment
                        "
                        [class.last-bottom-border]="last && row.earlyPayment"
                      >
                        {{ row.paymentDate | date: 'dd MMM yyyy' }}
                      </td>
                      <td
                        class="text-center bold total-column"
                        [class.strike]="row.earlyPayment"
                        [class.last-bottom-border]="last && row.earlyPayment"
                      >
                        {{ rowTotal | numberFormat: '0.00' }}
                      </td>
                      <td
                        class="text-center"
                        [class.bold]="row.earlyPayment || row.instalmentPayment"
                        [class.last-bottom-border]="last && row.earlyPayment"
                      >
                        {{ row.principalAmount | numberFormat: '0.00' }}
                      </td>
                      <td
                        class="text-center"
                        [class.strike]="row.earlyPayment"
                        [class.last-bottom-border]="last && row.earlyPayment"
                      >
                        {{ row.interestAmount | numberFormat: '0.00' }}
                      </td>
                      <td
                        class="text-center"
                        [class.strike]="row.earlyPayment"
                        [class.last-bottom-border]="last && row.earlyPayment"
                      >
                        {{ row.insuranceCost | numberFormat: '0.00' }}
                      </td>
                      <td
                        class="text-center"
                        [class.strike]="!last"
                        [class.last-bottom-border]="last && row.earlyPayment"
                      >
                        {{ row.remainingBalance | numberFormat: '0.00' }}
                      </td>
                    </tr>

                    <tr></tr>
                  }
                }
              } @else {
                <!-- Normal Rows (no installment/early payments) -->
                @for (
                  row of group.instalments;
                  let last = $last;
                  track row.index
                ) {
                  @let rowTotal =
                    row.principalAmount +
                    row.interestAmount +
                    row.insuranceCost;
                  <tr class="gray">
                    <td
                      class="text-center"
                      [class.last-bottom-border]="last && row.earlyPayment"
                    >
                      {{ row.index }}
                    </td>
                    <td
                      class="text-center"
                      [class.last-bottom-border]="last && row.earlyPayment"
                    >
                      {{ row.paymentDate | date: 'dd MMM yyyy' }}
                    </td>
                    <td
                      class="text-center bold total-column"
                      [class.last-bottom-border]="last && row.earlyPayment"
                    >
                      {{ rowTotal | numberFormat: '0.00' }}
                    </td>
                    <td
                      class="text-center"
                      [class.last-bottom-border]="last && row.earlyPayment"
                    >
                      {{ row.principalAmount | numberFormat: '0.00' }}
                    </td>
                    <td
                      class="text-center"
                      [class.last-bottom-border]="last && row.earlyPayment"
                    >
                      {{ row.interestAmount | numberFormat: '0.00' }}
                    </td>
                    <td
                      class="text-center"
                      [class.last-bottom-border]="last && row.earlyPayment"
                    >
                      {{ row.insuranceCost | numberFormat: '0.00' }}
                    </td>
                    <td
                      class="text-center"
                      [class.last-bottom-border]="last && row.earlyPayment"
                    >
                      {{ row.remainingBalance | numberFormat: '0.00' }}
                    </td>
                  </tr>
                }
              }
            }
          </tbody>
        </table>

        @if (!monthlyInstalmentGroups().length) {
          <div class="empty-state">No instalment data available</div>
        }
      </div>

      <!-- Simplified Mobile View - 2 Row Layout without Total -->
      <div class="mobile-view">
        @for (group of monthlyInstalmentGroups(); track group.title) {
          @let hasValidPayments = hasInstallmentOrEarly(group);

          @if (hasValidPayments) {
            <!-- Mobile Group with Installment/Early Payments -->
            <div class="mobile-group-card">
              <div class="mobile-group-header" (click)="toggleGroup(group)">
                @let subtotal = getSubtotal(group);
                <div class="mobile-group-info">
                  <div class="mobile-group-title">
                    {{ group.title | date: 'dd MMM yyyy' }}
                  </div>
                  <span class="mobile-group-count bold"
                    >{{ subtotal.instalmentsCount }} +
                    {{ subtotal.earlyCount }}</span
                  >
                </div>
                <div class="mobile-group-total mobile-group-total-green">
                  {{
                    subtotal.interest + subtotal.insuranceCost
                      | numberFormat: '0.00'
                  }}
                </div>
                <div class="mobile-group-total mobile-group-total-blue">
                  {{ subtotal.principal | numberFormat: '0.00' }}
                </div>

                <div class="mobile-group-total mobile-group-total-red">
                  {{ subtotal.total | numberFormat: '0.00' }}
                </div>
                <div class="mobile-group-total mobile-group-total-green">
                  {{ subtotal.remainingBalance | numberFormat: '0.00' }}
                </div>
              </div>

              @if (group.expanded) {
                <div class="mobile-items-list">
                  @for (row of group.instalments; track row.index) {
                    <div
                      class="mobile-item"
                      [class.orange-item]="row.instalmentPayment"
                      [class.green-item]="row.earlyPayment"
                      [class.gray-item]="
                        !row.instalmentPayment && !row.earlyPayment
                      "
                    >
                      <!-- Row 1: Index, Date, Principal -->
                      <div class="mobile-item-row">
                        <div class="mobile-item-col  ">
                          <span class="item-index">#{{ row.index }}</span>
                        </div>
                        <div class="mobile-item-col">
                          <span
                            class="item-date"
                            [class.strike]="
                              row.earlyPayment || row.instalmentPayment
                            "
                          >
                            {{ row.paymentDate | date: 'dd MMM' }}
                          </span>
                        </div>
                        <div class="mobile-item-col  ">
                          <span class="item-label">Principal</span>
                          <span class="item-value principal-value">{{
                            row.principalAmount | numberFormat: '0.00'
                          }}</span>
                        </div>
                        <div class="mobile-item-col  ">
                          <span class="item-label">Interest</span>
                          <span
                            class="item-value interest-value"
                            [class.strike]="row.earlyPayment"
                          >
                            {{ row.interestAmount | numberFormat: '0.00' }}
                          </span>
                        </div>
                        <div class="mobile-item-col ">
                          <span class="item-label">PAD</span>
                          <span
                            class="item-value "
                            [class.strike]="row.earlyPayment"
                          >
                            {{ row.insuranceCost | numberFormat: '0.00' }}
                          </span>
                        </div>
                        <div class="mobile-item-col  ">
                          <span class="item-label">Remaining</span>
                          <span class="item-value remaining-value">{{
                            row.remainingBalance | numberFormat: '0.00'
                          }}</span>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          } @else {
            <!-- Mobile Normal Rows -->
            <div class="mobile-normal-section">
              <div class="mobile-normal-header">
                <div class="mobile-group-title">
                  {{ group.title | date: 'dd MMM yyyy' }}
                </div>
                <span class="mobile-normal-count"
                  >{{ group.instalments.length }} rows</span
                >
              </div>
              <div class="mobile-items-list">
                @for (row of group.instalments; track row.index) {
                  <div class="mobile-item gray-item">
                    <!-- Row 1: Index, Date, Principal -->
                    <div class="mobile-item-row">
                      <div class="mobile-item-col col-index">
                        <span class="item-index">#{{ row.index }}</span>
                      </div>
                      <div class="mobile-item-col col-date">
                        <span class="item-date">{{
                          row.paymentDate | date: 'dd MMM'
                        }}</span>
                      </div>
                      <div class="mobile-item-col col-principal">
                        <span class="item-label">Principal</span>
                        <span class="item-value principal-value">{{
                          row.principalAmount | numberFormat: '0.00'
                        }}</span>
                      </div>
                    </div>

                    <!-- Row 2: Interest, PAD, Remaining Balance -->
                    <div class="mobile-item-row">
                      <div class="mobile-item-col col-interest">
                        <span class="item-label">Interest</span>
                        <span class="item-value interest-value">{{
                          row.interestAmount | numberFormat: '0.00'
                        }}</span>
                      </div>
                      <div class="mobile-item-col col-pad">
                        <span class="item-label">PAD</span>
                        <span class="item-value pad-value">{{
                          row.insuranceCost | numberFormat: '0.00'
                        }}</span>
                      </div>
                      <div class="mobile-item-col col-remaining">
                        <span class="item-label">Remaining</span>
                        <span class="item-value remaining-value">{{
                          row.remainingBalance | numberFormat: '0.00'
                        }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .historical-instalments {
      background: white;
      border-radius: 16px;
      box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
      overflow: hidden;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    /* Table Wrapper */
    .table-wrapper {
      display: block;
      border: 1px solid #e2e6ee;
      border-radius: 7.5px;
      background: white;
      overflow: auto;
      flex: 1;
    }

    .instalment-table {
      width: 100%;
      table-layout: fixed;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 13px;
    }

    .instalment-table th,
    .instalment-table td {
      padding: 8px 12px;
      border-bottom: 1px solid #eeeeee;
      vertical-align: middle;
    }

    .instalment-table th {
      background: #f9fafb;
      font-weight: 600;
      border-bottom: 2px solid #e2e6ee;
      font-size: 14px;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .bold {
      font-weight: 700;
    }

    .strike {
      text-decoration: line-through;
      color: #9ca3af;
    }

    /* Group Header Row */
    .group-header-row {
      cursor: pointer;
      background: #eff6ff;
    }

    .group-header-row:hover {
      background: #e0f2fe;
    }

    .group-header-cell {
      padding: 12px 16px !important;
    }

    .group-header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .group-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .chevron {
      display: flex;
      align-items: center;
      color: #3b82f6;
    }

    .group-title {
      font-weight: 700;
      font-size: 15px;
    }

    .group-count {
      color: #3b82f6;
      font-size: 12px;
      background: #eff6ff;
      padding: 2px 10px;
      border-radius: 30px;
      border: 1px solid #3b82f6;
    }

    .total-principal {
      color: #f59e0b;
      font-weight: 600;
    }

    .total-remaining {
      color: #10b981;
      font-weight: 600;
    }

    /* Row Colors */
    .orange {
      background: #fff7ed;
    }
    .orange td:first-child {
      border-left: 7px solid #f97316;
    }
    .orange td:last-child {
      border-right: 7px solid #f97316;
    }

    .green {
      background: #ecfdf5;
    }
    .green td:first-child {
      border-left: 7px solid #10b981;
    }
    .green td:last-child {
      border-right: 7px solid #10b981;
    }

    .gray {
      background: #f8fafc;
    }
    .gray td:first-child {
      border-left: 7px solid #676c72;
    }
    .gray td:last-child {
      border-right: 7px solid #676c72;
    }

    .last-bottom-border {
      border-bottom: 1px solid currentColor;
    }

    /* Mobile View */
    .mobile-view {
      display: none;
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      color: #9ca3af;
    }

    /* Responsive - Mobile Styles */
    @media (max-width: 768px) {
      .table-wrapper {
        display: none;
      }

      .mobile-view {
        display: block;
        padding: 12px;
        overflow-y: auto;
        height: calc(100vh - 200px);
      }

      .mobile-group-card {
        background: white;
        border: 1px solid #e2e6ee;
        border-radius: 12px;
        margin-bottom: 6px;
        overflow: hidden;
        box-shadow:
          0 2px 4px -1px rgba(0, 0, 0, 0.05),
          0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }

      .mobile-normal-section {
        background: white;
        border: 1px solid #e2e6ee;
        border-radius: 12px;
        margin-bottom: 12px;
        overflow: hidden;
      }

      .mobile-normal-header {
        background: #f8fafc;
        padding: 10px 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #e2e6ee;
      }

      .mobile-normal-count {
        color: #6b7280;
        font-size: 11px;
        background: #f1f5f9;
        padding: 2px 8px;
        border-radius: 12px;
      }

      .mobile-group-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: #eff6ff;
        cursor: pointer;
        transition: background 0.2s ease;
      }

      .mobile-group-header:active {
        background: #e0f2fe;
      }

      .mobile-group-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 5px;
      }

      .mobile-group-title {
        font-weight: 600;
        font-size: 14px;
      }

      .mobile-group-count {
        color: #3b82f6;
        font-size: 10px;
        background: #eff6ff;
        padding: 2px 8px;
        border-radius: 30px;
        border: 1px solid #3b82f6;
        white-space: nowrap;
      }

      .mobile-group-total {
        font-weight: 600;
        font-size: 9px;
        padding: 2px 6px;
        border-radius: 12px;

        &-green {
          color: #0f766e;
          border: 1px solid #0f766e;
        }

        &-blue {
          color: #3b82f6;
          border: 1px solid #3b82f6;
        }

        &-red {
          color: #c5103e;
          border: 1px solid #c5103e;
        }
      }

      .mobile-items-list {
        border-top: 1px solid #e2e6ee;
      }

      .mobile-item {
        padding: 12px;
        border-bottom: 1px solid #f0f0f0;
      }

      .mobile-item:last-child {
        border-bottom: none;
      }

      .orange-item {
        background: #fff7ed;
        border-left: 3px solid #f97316;
      }

      .green-item {
        background: #ecfdf5;
        border-left: 3px solid #10b981;
      }

      .gray-item {
        background: #f8fafc;
        border-left: 3px solid #94a3b8;
      }

      /* 2-Row Layout Grid */
      .mobile-item-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .mobile-item-row:last-child {
        margin-bottom: 0;
      }

      .mobile-item-col {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }

      /* Column widths for first row */
      .col-index {
        width: 42px;
        flex-shrink: 0;
      }
      .col-date {
        width: 80px;
        flex-shrink: 0;
      }
      .col-principal {
        flex: 1;
        align-items: flex-end;
        text-align: right;
      }

      /* Column widths for second row */
      .col-interest {
        flex: 1;
        align-items: flex-start;
      }
      .col-pad {
        flex: 1;
        align-items: flex-start;
      }
      .col-remaining {
        width: 100px;
        flex-shrink: 0;
        align-items: flex-end;
        text-align: right;
      }

      .item-index {
        font-weight: 700;
        font-size: 13px;
        color: #1f2937;
      }

      .item-date {
        font-size: 11px;
        color: #6b7280;
      }

      .item-label {
        font-size: 9px;
        color: #6b7280;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        margin-bottom: 2px;
      }

      .item-value {
        font-weight: 600;
        font-size: 12px;
        color: #1f2937;
      }

      .principal-value {
        color: #f59e0b;
      }

      .interest-value {
        color: #ef4444;
      }

      .pad-value {
        color: #3b82f6;
      }

      .remaining-value {
        color: #10b981;
      }

      .strike {
        text-decoration: line-through;
        color: #9ca3af;
      }
    }

    /* Extra small screens */
    @media (max-width: 480px) {
      .mobile-view {
        padding: 8px;
        height: calc(100vh - 180px);
      }

      .mobile-group-header {
        padding: 10px;
      }

      .mobile-group-title {
        font-size: 12px;
      }

      .mobile-group-count {
        font-size: 9px;
        padding: 2px 6px;
      }

      .mobile-group-total {
        font-size: 9px;
      }

      .mobile-item {
        padding: 10px;
      }

      .col-index {
        width: 36px;
      }

      .col-date {
        width: 70px;
      }

      .col-remaining {
        width: 85px;
      }

      .item-index {
        font-size: 11px;
      }

      .item-date {
        font-size: 10px;
      }

      .item-label {
        font-size: 8px;
      }

      .item-value {
        font-size: 10px;
      }
    }
  `,
})
export class HistoricalInstalmentsTableComponent {
  showOnlyTotalRow = input.required<boolean>();
  monthlyInstalmentGroups = input<HistoricalInstalmentPaymentBatch[]>([]);

  toggleGroup(group: HistoricalInstalmentPaymentBatch) {
    group.expanded = !group.expanded;
  }

  hasInstallmentOrEarly(group: HistoricalInstalmentPaymentBatch): boolean {
    return group.instalments.some(
      (row) => row.instalmentPayment || row.earlyPayment,
    );
  }

  getSubtotal(group: HistoricalInstalmentPaymentBatch) {
    const instalments = group.instalments;
    const installment = instalments.find((s) => s.instalmentPayment);
    const early = instalments.filter((s) => s.earlyPayment);

    return {
      instalmentsCount: !!installment ? 1 : 0,
      earlyCount: early.length,
      principal: Calculator.sum(instalments.map((e) => e.principalAmount)),
      interest: installment?.interestAmount || 0,
      insuranceCost: installment?.insuranceCost || 0,
      total: Calculator.sum(
        instalments
          .map((e) => e.principalAmount)
          .concat([
            installment?.interestAmount || 0,
            installment?.insuranceCost || 0,
          ]),
      ),
      remainingBalance:
        early?.at(-1)?.remainingBalance || installment?.remainingBalance || 0,
      count: instalments.length,
    };
  }
}
