import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as MortgageLoanActions from 'src/app/modules/mortgage-loan/actions/mortgage-loan.actions';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import { CheckboxComponent } from 'src/app/shared/components/checkbox/checkbox.component';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import {
  MonthlyInstalmentManager,
  OverviewLoanInstalment,
} from '../../models/overview-mortgage-loan.model';

@Component({
  selector: 'p-mortgage-loan-overview-body-table',
  imports: [CommonModule, FormsModule, NumberFormatPipe, CheckboxComponent],
  template: `
    <!-- Desktop Table Wrapper -->
    <div class="table-wrapper desktop-view">
      <table>
        <thead>
          <tr>
            <th class="">
              <div class="d-flex align-items-center justify-content-center">
                <img
                  width="15"
                  height="15"
                  src="assets/icons/collapse.svg"
                  alt="no-image"
                  (click)="onCollapseAll()"
                />
                <img
                  class="mx-1"
                  width="15"
                  height="15"
                  src="assets/icons/expand.svg"
                  alt="no-image"
                  (click)="onExpandAll()"
                />
              </div>
            </th>
            <th class="text-center">Data</th>
            <th class="text-center">Credit</th>
            <th class="text-center">Dobândă</th>
            <th class="text-center">PAD</th>
            <th class="text-center">Total</th>
            <th class="text-center">1/2</th>
            <th class="text-center">Anticipat</th>
            <th class="text-center">Sold</th>
          </tr>
        </thead>

        <tbody>
          @for (group of monthlyInstalmentGroups(); track group.id) {
            <!-- Group Header -->
            @if (group.completed) {
              <tr
                class="group-header-subtotal-row"
                [class.expanded-group]="group.expanded"
                (click)="toggleGroup(group)"
              >
                @let subtotal = getSubtotal(group);

                <td class="text-center">
                  <span class="count bold"
                    >{{ subtotal.instalmentsCount }}
                    @if (subtotal.earlyCount > 0) {
                      + {{ subtotal.earlyCount }}
                    }
                  </span>
                </td>

                <td class="bold text-center">
                  {{ group.title | date: 'MMM yyyy' }}
                </td>

                <td class="bold text-center">
                  {{ subtotal.principal | numberFormat: '0.00' }}
                </td>

                <td class="bold text-center">
                  {{ subtotal.interest | numberFormat: '0.00' }}
                </td>

                <td class="bold text-center">
                  {{ subtotal.insurance | numberFormat: '0.00' }}
                </td>

                <td class="bold text-center subtotal-total">
                  {{ subtotal.total | numberFormat: '0.00' }}
                </td>

                <td class="bold text-center">
                  {{ subtotal.total / 2 | numberFormat: '0.00' }}
                </td>
                <td class="bold text-center">
                  {{ subtotal.earlyPaymenrt | numberFormat: '0.00' }}
                </td>
                <td class="bold text-center">
                  {{ subtotal.restant | numberFormat: '0.00' }}
                </td>
              </tr>
            }

            <!-- Rows -->
            @if (!group.completed || group.expanded) {
              @for (
                row of group.instalments;
                let last = $last;
                track row.instalmentId
              ) {
                <tr
                  [class.yellow]="row.instalmentPayment"
                  [class.green]="row.earlyPayment"
                  [class.gray]="!row.instalmentPayment && !row.earlyPayment"
                >
                  <td
                    class="text-center gap"
                    [ngClass]="{
                      'last-bottom-border': last && row.earlyPayment,
                    }"
                  >
                    <div
                      class="d-flex align-items-center justify-content-center"
                    >
                      <span>
                        {{ row.instalmentId }}
                      </span>
                      <p-checkbox
                        class="mx-1"
                        [id]="row.instalmentId"
                        [checked]="row.instalmentPayment"
                        [disabled]="row.disabled || row.earlyPayment"
                        (valueChange)="onSelectInstalmentPayment(row)"
                      /><p-checkbox
                        [id]="row.instalmentId"
                        [checked]="row.earlyPayment"
                        [disabled]="row.disabled || row.instalmentPayment"
                        (valueChange)="onSelectEarlyPayment(row)"
                      />
                    </div>
                  </td>

                  <td
                    class="text-center"
                    [ngClass]="{
                      strike: row.earlyPayment || row.instalmentPayment,
                      'last-bottom-border': last && row.earlyPayment,
                      disabled: !group.completed && row.disabled,
                    }"
                  >
                    {{ row.paymentDate | date: 'MMM yyyy' }}
                  </td>
                  <td
                    class="text-center"
                    [ngClass]="{
                      'semi-bold': row.earlyPayment || row.instalmentPayment,
                      'last-bottom-border': last && row.earlyPayment,
                      disabled: !group.completed && row.disabled,
                    }"
                  >
                    {{ row.principalAmount | numberFormat: '0.00' }}
                  </td>
                  <td
                    class="text-center"
                    [ngClass]="{
                      strike: row.earlyPayment,
                      'last-bottom-border': last && row.earlyPayment,
                      disabled: !group.completed && row.disabled,
                    }"
                  >
                    {{ row.interestAmount | numberFormat: '0.00' }}
                  </td>

                  <td
                    class="text-center"
                    [ngClass]="{
                      strike: row.earlyPayment,
                      'last-bottom-border': last && row.earlyPayment,
                      disabled: !group.completed && row.disabled,
                    }"
                  >
                    {{ row.insuranceCost | numberFormat: '0.00' }}
                  </td>

                  <td
                    class="text-center"
                    [ngClass]="{
                      'last-bottom-border': last && row.earlyPayment,
                      disabled: !group.completed && row.disabled,
                    }"
                  >
                    @if (!row.earlyPayment && !row.instalmentPayment) {
                      <span [ngClass]="{ strike: row.earlyPayment }">
                        {{ row.totalInstalment | numberFormat: '0.00' }}
                      </span>
                    } @else {
                      <span
                        [ngClass]="{
                          'subtotal-total':
                            row.instalmentPayment || row.earlyPayment,
                        }"
                        >{{ row.batchTotalInstalment | numberFormat: '-' }}
                      </span>
                    }
                  </td>
                  <td
                    class="text-center"
                    [ngClass]="{
                      'last-bottom-border': last && row.earlyPayment,
                      disabled: !group.completed && row.disabled,
                    }"
                  >
                    {{ row.batchTotalInstalment / 2 | numberFormat: '-' }}
                  </td>
                  <td
                    class="text-center"
                    [ngClass]="{
                      'last-bottom-border': last && row.earlyPayment,
                      disabled: !group.completed && row.disabled,
                    }"
                  >
                    {{ row.batchTotalEarlyPayment | numberFormat: '-' }}
                  </td>

                  <td
                    class="text-center"
                    [ngClass]="{
                      strike:
                        !last && (row.earlyPayment || row.instalmentPayment),
                      'semi-bold':
                        last && (row.earlyPayment || row.instalmentPayment),
                      'last-bottom-border': last && row.earlyPayment,
                      disabled: !group.completed && row.disabled,
                    }"
                  >
                    {{ row.remainingBalance | numberFormat: '0.00' }}
                  </td>
                </tr>
              }
            }
          }
        </tbody>
      </table>
    </div>

    <!-- Mobile View -->
    <div class="mobile-view">
      @for (group of monthlyInstalmentGroups(); track group.id) {
        @if (group.completed) {
          @let subtotal = getSubtotal(group);
          <!-- Mobile Group with Completed Payments -->
          <div class="mobile-group-card">
            <div class="mobile-group-header" (click)="toggleGroup(group)">
              <div class="mobile-group-info">
                <div class="mobile-group-title">
                  {{ group.title | date: 'MMM yyyy' }}
                </div>
                <span class="mobile-group-count bold"
                  >{{ subtotal.instalmentsCount }}
                  @if (subtotal.earlyCount > 0) {
                    + {{ subtotal.earlyCount }}
                  }
                </span>

                <div class="mobile-group-total mobile-group-total-green">
                  {{ subtotal.principal | numberFormat: '0.00' }}
                </div>
                <div class="mobile-group-total mobile-group-total-red">
                  {{
                    subtotal.interest + subtotal.insurance
                      | numberFormat: '0.00'
                  }}
                </div>

                <div class="mobile-group-total mobile-group-total-red">
                  {{ subtotal.total | numberFormat: '0.00' }}
                </div>
                <div class="mobile-group-total mobile-group-total-red">
                  {{ subtotal.total / 2 | numberFormat: '0.00' }}
                </div>

                <div class="mobile-group-total mobile-group-total-black">
                  {{ subtotal.restant | numberFormat: '0.00' }}
                </div>
              </div>
            </div>

            @if (group.expanded) {
              <div class="mobile-items-list">
                @for (row of group.instalments; track row.instalmentId) {
                  <div
                    class="mobile-item"
                    [class.orange-item]="row.instalmentPayment"
                    [class.green-item]="row.earlyPayment"
                    [class.gray-item]="
                      !row.instalmentPayment && !row.earlyPayment
                    "
                  >
                    <div class="mobile-item-row">
                      <div class="mobile-item-col">
                        <div class="checkbox-group">
                          <span class="item-index"
                            >#{{ row.instalmentId }}</span
                          >
                          <p-checkbox
                            class="mx-1"
                            [id]="row.instalmentId"
                            [checked]="row.instalmentPayment"
                            [disabled]="row.disabled || row.earlyPayment"
                            (valueChange)="onSelectInstalmentPayment(row)"
                          />
                          <p-checkbox
                            [id]="row.instalmentId"
                            [checked]="row.earlyPayment"
                            [disabled]="row.disabled || row.instalmentPayment"
                            (valueChange)="onSelectEarlyPayment(row)"
                          />
                        </div>
                        <div class="checkbox-group">
                          <span
                            class="item-date"
                            [class.strike]="
                              row.earlyPayment || row.instalmentPayment
                            "
                          >
                            {{ row.paymentDate | date: 'MMM yyyy' }}
                          </span>
                        </div>
                      </div>
                      <div class="mobile-item-col">
                        <span class="item-label">Credit</span>
                        <span class="item-value principal-value"
                          >{{ row.principalAmount | numberFormat: '0.00' }}
                        </span>
                      </div>
                      <div class="mobile-item-col">
                        <span class="item-label">Dobândă</span>
                        <span
                          class="item-value interest-value"
                          [class.strike]="row.earlyPayment"
                        >
                          {{
                            row.interestAmount + row.insuranceCost
                              | numberFormat: '0.00'
                          }}
                        </span>
                      </div>

                      <div class="mobile-item-col">
                        <span class="item-label">Total</span>
                        <span class="item-value total-value">
                          @if (!row.earlyPayment && !row.instalmentPayment) {
                            {{ row.totalInstalment | numberFormat: '0.00' }}
                          } @else {
                            {{ row.batchTotalInstalment | numberFormat: '-' }}
                          }
                        </span>
                      </div>
                      <div class="mobile-item-col">
                        <span class="item-label">1/2</span>
                        <span class="item-value">
                          {{ row.batchTotalInstalment / 2 | numberFormat: '-' }}
                        </span>
                      </div>
                      <div class="mobile-item-col">
                        <span class="item-label">Anticipat</span>
                        <span class="item-value early-value">
                          {{ row.batchTotalEarlyPayment | numberFormat: '-' }}
                        </span>
                      </div>
                      <div class="mobile-item-col">
                        <span class="item-label">Sold</span>
                        <span class="item-value remaining-value">
                          {{ row.remainingBalance | numberFormat: '0.00' }}
                        </span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        } @else {
          <!-- Mobile Normal Rows (incomplete groups) -->
          <div class="mobile-normal-section">
            <div class="mobile-items-list">
              @for (row of group.instalments; track row.instalmentId) {
                <div class="mobile-item gray-item">
                  <div class="mobile-item-row">
                    <div class="mobile-item-col">
                      <div class="checkbox-group">
                        <span class="item-index">#{{ row.instalmentId }}</span
                        ><p-checkbox
                          class="mx-1"
                          [id]="row.instalmentId"
                          [checked]="row.instalmentPayment"
                          [disabled]="row.disabled || row.earlyPayment"
                          (valueChange)="onSelectInstalmentPayment(row)"
                        /><p-checkbox
                          [id]="row.instalmentId"
                          [checked]="row.earlyPayment"
                          [disabled]="row.disabled || row.instalmentPayment"
                          (valueChange)="onSelectEarlyPayment(row)"
                        />
                      </div>
                      <div class="checkbox-group">
                        <span
                          class="item-date"
                          [class.strike]="
                            row.earlyPayment || row.instalmentPayment
                          "
                        >
                          {{ row.paymentDate | date: 'MMM yyyy' }}
                        </span>
                      </div>
                    </div>
                    <div class="mobile-item-col">
                      <span class="item-label">Credit</span>
                      <span class="item-value principal-value"
                        >{{ row.principalAmount | numberFormat: '0.00' }}
                      </span>
                    </div>
                    <div class="mobile-item-col">
                      <span class="item-label">Dobândă</span>
                      <span class="item-value interest-value">
                        {{ row.interestAmount | numberFormat: '0.00' }}
                      </span>
                    </div>
                    <div class="mobile-item-col">
                      <span class="item-label">Total</span>
                      <span class="item-value total-value">
                        {{ row.totalInstalment | numberFormat: '0.00' }}
                      </span>
                    </div>
                    <div class="mobile-item-col">
                      <span class="item-label">Sold</span>
                      <span class="item-value remaining-value">
                        {{ row.remainingBalance | numberFormat: '0.00' }}
                      </span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      }
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

    table {
      width: 100%;
      table-layout: auto;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 13px;
    }

    th,
    td {
      padding: 8px 12px;
      border-bottom: 1px solid #eeeeee;
      vertical-align: middle;
      min-width: 80px;
    }

    th {
      background: #f9fafb;
      font-weight: 600;
      border-bottom: 2px solid #e2e6ee;
      font-size: 14px;
    }

    /* Sticky Header */
    thead th {
      position: sticky;
      top: 0;
      z-index: 25;
      background: #f9fafb;
    }

    /* Sticky First Column */
    th:first-child,
    td:first-child {
      position: sticky;
      left: 0;
      z-index: 30;
    }

    /* Header first column above everything */
    thead th:first-child {
      z-index: 50;
      background: #f9fafb;
    }

    /* Body first column */
    tbody td:first-child {
      z-index: 40;
    }

    /* Helpers */
    .text-center {
      text-align: center;
    }

    .text-right {
      text-align: right;
    }

    .bold {
      font-weight: 700;
    }

    .semi-bold {
      font-weight: 600;
    }

    /* Group Header */
    .group-header-subtotal-row {
      cursor: pointer;
      font-size: 14px;
      background: #fff1f2;
      transition: background 0.2s ease;

      td {
        padding: 10px 12px;
      }
    }

    .count {
      color: #3b82f6;
      font-size: 12px;
      background: #fff1f2;
      padding: 2px 10px;
      border-radius: 30px;
      border: 1px solid #3b82f6;
    }

    /* Row Colors - Enhanced with left/right borders */
    .yellow {
      background: #fffbeb;

      td:first-child {
        border-left: 2px solid #f59e0b;
        background: #fffbeb;
      }

      td:last-child {
        border-right: 2px solid #f59e0b;
      }

      td {
        border-bottom: 1px solid #f59e0b;
      }
    }

    .green {
      background: #ecfdf5;

      td:first-child {
        border-left: 2px solid #10b981;
        background: #ecfdf5;
      }

      td:last-child {
        border-right: 2px solid #10b981;
      }

      .last-bottom-border {
        border-bottom: 1px solid #10b981;
      }
    }

    .gray {
      background: #f8fafc;

      td:first-child {
        border-left: 2px solid #676c72;
        background: #f8fafc;
      }

      td:last-child {
        border-right: 2px solid #676c72;
      }
    }

    .last-bottom-border {
      border-bottom: 1px solid currentColor;
    }

    /* Totals */
    .subtotal-total {
      color: #0f766e;
      font-weight: 700;
    }

    .strike {
      text-decoration: line-through;
      color: #9ca3af;
    }

    .disabled {
      color: rgb(192, 192, 192);
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
        padding: 12px;
        overflow-y: auto;
        height: calc(100vh - 200px);
      }

      .mobile-group-card {
        background: white;
        border: 1px solid #e2e6ee;
        border-radius: 12px;
        margin-bottom: 5px;
        overflow: hidden;
        box-shadow:
          0 2px 2px -1px rgba(0, 0, 0, 0.05),
          0 2px 2px -1px rgba(0, 0, 0, 0.06);
      }

      .mobile-normal-section {
        background: white;
        border: 1px solid #e2e6ee;
        overflow: hidden;
      }

      .mobile-group-header {
        padding: 12px;
        background: #fff1f2;
        cursor: pointer;
        transition: background 0.2s ease;
      }

      .mobile-group-header:active {
        background: #e0f2fe;
      }

      .normal-header {
        background: #f8fafc;
        cursor: default;
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
        color: #1f2937;
      }

      .mobile-group-count {
        color: #3b82f6;
        font-size: 10px;
        background: #fff1f2;
        padding: 2px 8px;
        border-radius: 30px;
        border: 1px solid #3b82f6;
        white-space: nowrap;
      }

      .mobile-group-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 6px;
      }

      .mobile-group-total {
        font-weight: 600;
        font-size: 9px;
        padding: 2px 6px;
        border-radius: 12px;
        background: white;

        &-green {
          color: #0f766e;
          border: 1px solid #0f766e;
        }

        &-black {
          color: #212529;
          border: 1px solid #212529;
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
        background: #fffbeb;
        border-left: 2px solid #f59e0b;
      }

      .green-item {
        background: #ecfdf5;
        border-left: 2px solid #10b981;
      }

      .gray-item {
        background: #f8fafc;
        border-left: 2px solid #94a3b8;
      }

      /* Mobile Item Layout */
      .mobile-item-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }

      .mobile-item-row:last-child {
        margin-bottom: 0;
      }

      .mobile-item-col {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        flex: 1;
        min-width: 70px;
      }

      .checkbox-group {
        display: flex;
        align-items: center;
        gap: 2px;
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        cursor: pointer;

        input {
          margin: 0;
          cursor: pointer;
        }

        span {
          color: #4b5563;
        }
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
        color: #10b981;
      }

      .interest-value {
        color: #ef4444;
      }

      .total-value {
        color: #0f766e;
        font-weight: 700;
      }

      .early-value {
        color: #f59e0b;
      }

      .remaining-value {
        color: #1f2937;
      }

      .strike {
        text-decoration: line-through;
        color: #9ca3af;
      }
    }

    /* Extra small screens */
    @media (max-width: 480px) {
      .mobile-view {
        padding: 8px 0 0 0;
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
        font-size: 8px;
      }

      .mobile-item {
        padding: 10px 5px;
      }

      .mobile-item-col {
        min-width: 50px;
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

      .checkbox-label {
        font-size: 9px;

        span {
          font-size: 9px;
        }
      }
    }
  `,
})
export class MortgageLoanOverviewBodyTableComponent {
  monthlyInstalmentGroups = input<MonthlyInstalmentManager[]>([]);

  store = inject(Store<fromMortgageLoan.MortgageLoanState>);

  toggleGroup(group: MonthlyInstalmentManager) {
    group.expanded = !group.expanded;
  }

  toggleRow(row: OverviewLoanInstalment) {
    row.instalmentPayment = !row.instalmentPayment;
  }

  getSubtotal(group: MonthlyInstalmentManager) {
    const instalments = group.instalments;
    const installment = instalments.find((s) => s.instalmentPayment);
    const early = instalments.filter((s) => s.earlyPayment);

    return {
      instalmentsCount: !!installment ? 1 : 0,
      earlyCount: early.length,
      principal: Calculator.sum(instalments.map((e) => e.principalAmount)),
      interest: installment?.interestAmount ?? 0,
      insurance: installment?.insuranceCost ?? 0,
      total: Calculator.sum(
        early
          .map((e) => e.principalAmount)
          .concat(installment?.totalInstalment ?? 0),
      ),
      earlyPaymenrt: Calculator.sum(early.map((e) => e.principalAmount)),
      restant: instalments?.at(-1)?.remainingBalance,
      count: instalments.length,
    };
  }

  onSelectInstalmentPayment(instalment: OverviewLoanInstalment) {
    this.store.dispatch(
      MortgageLoanActions.selectedInstalmentPaymentChanged({
        values: [instalment.instalmentId],
      }),
    );
  }

  onSelectEarlyPayment(instalment: OverviewLoanInstalment) {
    this.store.dispatch(
      MortgageLoanActions.selectedEarlyPaymentChanged({
        values: [instalment.instalmentId],
      }),
    );
  }

  onExpandAll() {
    this.monthlyInstalmentGroups().forEach((group) => (group.expanded = true));
  }

  onCollapseAll() {
    this.monthlyInstalmentGroups().forEach((group) => (group.expanded = false));
  }
}
