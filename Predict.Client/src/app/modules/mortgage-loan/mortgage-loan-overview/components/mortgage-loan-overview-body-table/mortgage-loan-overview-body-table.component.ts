// mortgage-loan-overview-body-table.component.ts
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
import {
  ColumnConfig,
  DEFAULT_COLUMN_CONFIGS,
} from './model/column-config.model';

@Component({
  selector: 'p-mortgage-loan-overview-body-table',
  imports: [CommonModule, FormsModule, NumberFormatPipe, CheckboxComponent],
  template: `
    <div class="mortgage-analytics mt-2">
      <!-- Header with Stats -->
      <div class="analytics-header">
        <div class="header-actions">
          <div class="menu-container" #menuContainer>
            <button class="menu-trigger" (click)="toggleMenu($event)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              <span>Columns</span>
            </button>
            @if (isMenuOpen) {
              <div class="column-menu">
                @for (col of columns; track col.key) {
                  <label (click)="$event.stopPropagation()">
                    <input
                      type="checkbox"
                      [(ngModel)]="col.visible"
                      (click)="$event.stopPropagation()"
                    />
                    {{ col.label }}
                  </label>
                }
              </div>
            }
          </div>
          <div class="expand-actions">
            <img
              width="24"
              height="24"
              src="assets/icons/expand.svg"
              alt="no-image"
              (click)="onExpandAll()"
            />
            <img
              width="24"
              height="24"
              src="assets/icons/collapse.svg"
              alt="no-image"
              (click)="onCollapseAll()"
            />
          </div>
        </div>
      </div>

      <!-- Period Cards (Similar to transaction analytics) -->
      <div class="periods-container">
        @for (group of monthlyInstalmentGroups(); track group.id) {
          <div class="period-card" [class.expanded]="group.expanded">
            <!-- Period Header -->
            <div class="period-header" (click)="toggleGroup(group)">
              <div class="period-info">
                <span class="expand-indicator">{{
                  group.expanded ? '▼' : '▶'
                }}</span>
                <div>
                  <div class="period-title">
                    {{ group.title | date: 'MMMM yyyy' }}
                    <span
                      style="border: 2px solid #f43f5e; padding: 2px 6px; border-radius: 20px; background: #fff1f2; color: #f43f5e;"
                    >
                      {{ getInstalmentCount(group) }}
                      @if (getEarlyPaymentCount(group) > 0) {
                        + {{ getEarlyPaymentCount(group) }}
                      }
                    </span>
                  </div>
                </div>
              </div>
              <div class="period-totals">
                @let subtotal = getSubtotal(group);
                @if (subtotal.total > 0) {
                  <span class="amount-badge early-badge">
                    {{ subtotal.total | numberFormat: '0.00' }}</span
                  >
                }
                @if (subtotal.earlyPayment > 0) {
                  <span class="amount-badge paid-badge">
                    {{ subtotal.earlyPayment | numberFormat: '0.00' }}</span
                  >
                }
              </div>
            </div>

            <!-- Period Content (Collapsible) -->
            @if (group.expanded) {
              <div class="period-content">
                <div class="table-wrapper">
                  <!-- Desktop Table -->
                  <table class="data-table desktop-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Principal</th>
                        <th>Interest</th>
                        @if (isColumnVisible('administrationFee')) {
                          <th>Administration</th>
                        }
                        @if (isColumnVisible('insuranceCost')) {
                          <th>Insurance (PAD)</th>
                        }
                        @if (isColumnVisible('managementFee')) {
                          <th>Management</th>
                        }
                        @if (isColumnVisible('recalculatedInterest')) {
                          <th>Recalculated Interest</th>
                        }
                        <th>Total</th>
                        @if (isColumnVisible('halfTotal')) {
                          <th>Half</th>
                        }
                        @if (isColumnVisible('earlyPayment')) {
                          <th>Early Payment</th>
                        }
                        @if (isColumnVisible('remainingBalance')) {
                          <th>Remaining Balance</th>
                        }
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of group.instalments; track row.instalmentId) {
                        <tr
                          [class.paid-row]="
                            row.instalmentPayment || row.earlyPayment
                          "
                          [class.early-row]="row.earlyPayment"
                          [class.regular-row]="
                            !row.instalmentPayment && !row.earlyPayment
                          "
                        >
                          <td class="id-cell">{{ row.instalmentId }}</td>
                          <td class="date-cell">
                            {{ row.paymentDate | date: 'MMM yyyy' }}
                          </td>
                          <td class="amount-cell">
                            {{ row.principalAmount | numberFormat: '0.00' }}
                          </td>
                          <td
                            class="amount-cell"
                            [class.strike]="row.earlyPayment"
                          >
                            {{ row.interestAmount | numberFormat: '0.00' }}
                          </td>

                          @if (isColumnVisible('administrationFee')) {
                            <td
                              class="amount-cell"
                              [class.strike]="row.earlyPayment"
                            >
                              {{ row.administrationFee | numberFormat: '0.00' }}
                            </td>
                          }
                          @if (isColumnVisible('insuranceCost')) {
                            <td
                              class="amount-cell"
                              [class.strike]="row.earlyPayment"
                            >
                              {{ row.insuranceCost | numberFormat: '0.00' }}
                            </td>
                          }
                          @if (isColumnVisible('managementFee')) {
                            <td
                              class="amount-cell"
                              [class.strike]="row.earlyPayment"
                            >
                              {{ row.managementFee | numberFormat: '0.00' }}
                            </td>
                          }
                          @if (isColumnVisible('recalculatedInterest')) {
                            <td
                              class="amount-cell"
                              [class.strike]="row.earlyPayment"
                            >
                              {{
                                row.recalculatedInterest | numberFormat: '0.00'
                              }}
                            </td>
                          }

                          <td class="amount-cell total-cell">
                            @if (!row.earlyPayment && !row.instalmentPayment) {
                              {{ row.totalInstalment | numberFormat: '0.00' }}
                            } @else {
                              <span class="batch-total">{{
                                row.batchTotalInstalment | numberFormat: '0.00'
                              }}</span>
                            }
                          </td>

                          @if (isColumnVisible('halfTotal')) {
                            <td class="amount-cell">
                              {{
                                row.batchTotalInstalment / 2
                                  | numberFormat: '0.00'
                              }}
                            </td>
                          }
                          @if (isColumnVisible('earlyPayment')) {
                            <td class="amount-cell early-amount">
                              {{
                                row.batchTotalEarlyPayment
                                  | numberFormat: '0.00'
                              }}
                            </td>
                          }
                          @if (isColumnVisible('remainingBalance')) {
                            <td class="amount-cell">
                              {{ row.remainingBalance | numberFormat: '0.00' }}
                            </td>
                          }

                          <td class="actions-cell">
                            <div class="checkbox-group">
                              <label
                                class="checkbox-label"
                                [class.disabled]="
                                  row.disabled || row.earlyPayment
                                "
                              >
                                <input
                                  type="checkbox"
                                  [checked]="row.instalmentPayment"
                                  [disabled]="row.disabled || row.earlyPayment"
                                  (change)="onSelectInstalmentPayment(row)"
                                />
                                <span>Installment</span>
                              </label>
                              <label
                                class="checkbox-label"
                                [class.disabled]="
                                  row.disabled || row.instalmentPayment
                                "
                              >
                                <input
                                  type="checkbox"
                                  [checked]="row.earlyPayment"
                                  [disabled]="
                                    row.disabled || row.instalmentPayment
                                  "
                                  (change)="onSelectEarlyPayment(row)"
                                />
                                <span>Early</span>
                              </label>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>

                  <!-- Mobile Cards -->
                  <div class="mobile-cards">
                    @for (row of group.instalments; track row.instalmentId) {
                      <div
                        class="mobile-card"
                        [class.paid-card]="
                          row.instalmentPayment || row.earlyPayment
                        "
                        [class.early-card]="row.earlyPayment"
                      >
                        <div class="mobile-card-header">
                          <div>
                            <span class="instalment-id"
                              >#{{ row.instalmentId }}</span
                            >
                            <span class="instalment-date">{{
                              row.paymentDate | date: 'MMM yyyy'
                            }}</span>
                          </div>
                          <div class="checkbox-group-mobile">
                            <label class="checkbox-label-mobile">
                              <input
                                type="checkbox"
                                [checked]="row.instalmentPayment"
                                [disabled]="row.disabled || row.earlyPayment"
                                (change)="onSelectInstalmentPayment(row)"
                              />
                              <span>Installment</span>
                            </label>
                            <label class="checkbox-label-mobile">
                              <input
                                type="checkbox"
                                [checked]="row.earlyPayment"
                                [disabled]="
                                  row.disabled || row.instalmentPayment
                                "
                                (change)="onSelectEarlyPayment(row)"
                              />
                              <span>Early</span>
                            </label>
                          </div>
                        </div>

                        <div class="mobile-card-details">
                          <div class="detail-row">
                            <span class="detail-label">Principal:</span>
                            <span class="detail-value">{{
                              row.principalAmount | numberFormat: '0.00'
                            }}</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">Interest:</span>
                            <span
                              class="detail-value"
                              [class.strike]="row.earlyPayment"
                              >{{
                                row.interestAmount | numberFormat: '0.00'
                              }}</span
                            >
                          </div>
                          @if (isColumnVisible('administrationFee')) {
                            <div class="detail-row">
                              <span class="detail-label">Administration:</span>
                              <span
                                class="detail-value"
                                [class.strike]="row.earlyPayment"
                                >{{
                                  row.administrationFee | numberFormat: '0.00'
                                }}</span
                              >
                            </div>
                          }
                          @if (isColumnVisible('insuranceCost')) {
                            <div class="detail-row">
                              <span class="detail-label">Insurance:</span>
                              <span
                                class="detail-value"
                                [class.strike]="row.earlyPayment"
                                >{{
                                  row.insuranceCost | numberFormat: '0.00'
                                }}</span
                              >
                            </div>
                          }
                          @if (isColumnVisible('managementFee')) {
                            <div class="detail-row">
                              <span class="detail-label">Management:</span>
                              <span
                                class="detail-value"
                                [class.strike]="row.earlyPayment"
                                >{{
                                  row.managementFee | numberFormat: '0.00'
                                }}</span
                              >
                            </div>
                          }
                          <div class="detail-row">
                            <span class="detail-label">Total:</span>
                            <span class="detail-value total-value">
                              @if (
                                !row.earlyPayment && !row.instalmentPayment
                              ) {
                                {{ row.totalInstalment | numberFormat: '0.00' }}
                              } @else {
                                {{
                                  row.batchTotalInstalment
                                    | numberFormat: '0.00'
                                }}
                              }
                            </span>
                          </div>
                          @if (isColumnVisible('remainingBalance')) {
                            <div class="detail-row">
                              <span class="detail-label">Remaining:</span>
                              <span class="detail-value">{{
                                row.remainingBalance | numberFormat: '0.00'
                              }}</span>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }

        @if (!monthlyInstalmentGroups().length) {
          <div class="empty-state">
            <p>No instalment data available</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    /* Main Container */
    .mortgage-analytics {
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

    /* Header */
    .analytics-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
      background: white;
    }

    .title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 4px 0;
      letter-spacing: -0.01em;
      color: #1f2937;
    }

    .subtitle {
      font-size: 0.8125rem;
      color: #6b7280;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .menu-container {
      position: relative;
    }

    .menu-trigger {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .menu-trigger:hover {
      background: #f3f4f6;
      border-color: #d1d5db;
    }

    .column-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      min-width: 180px;
    }

    .column-menu label {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      cursor: pointer;
      font-size: 0.8125rem;
      color: #374151;
      transition: background 0.2s ease;
    }

    .column-menu label:hover {
      background: #f9fafb;
    }

    .expand-actions {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      padding: 8px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background: #f3f4f6;
      border-color: #d1d5db;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1px;
      background: #e5e7eb;
    }

    .stat-card {
      background: white;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: background 0.2s ease;
    }

    .stat-card:hover {
      background: #f9fafb;
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .total-icon {
      background: #dbeafe;
      color: #3b82f6;
    }

    .paid-icon {
      background: #d1fae5;
      color: #10b981;
    }

    .remaining-icon {
      background: #fee2e2;
      color: #ef4444;
    }

    .progress-icon {
      background: #fef3c7;
      color: #f59e0b;
    }

    .stat-info {
      flex: 1;
    }

    .stat-label {
      font-size: 0.75rem;
      color: #6b7280;
      display: block;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 1.125rem;
      font-weight: 700;
      color: #1f2937;
    }

    .stat-value.positive {
      color: #10b981;
    }

    /* Periods Container */
    .periods-container {
      flex: 1;
      overflow-y: auto;
      background: #f9fafb;
      // padding: 16px;
    }

    .periods-container::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    .periods-container::-webkit-scrollbar-track {
      background: #f1f5f9;
    }

    .periods-container::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }

    /* Period Cards */
    .period-card {
      background: white;
      border-radius: 7px;
      margin-bottom: 5px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
    }

    .period-card:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .period-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      cursor: pointer;
      background: white;
      transition: background 0.2s ease;
    }

    .period-header:hover {
      background: #f9fafb;
    }

    .period-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .expand-indicator {
      font-size: 12px;
      color: #6b7280;
      transition: transform 0.2s ease;
    }

    .period-title {
      font-weight: 600;
      font-size: 1rem;
      color: #1f2937;
    }

    .period-stats-mini {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 2px;
    }

    .period-totals {
      display: flex;
      gap: 8px;
    }

    .amount-badge {
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .paid-badge {
      background: #d1fae5;
      color: #10b981;
    }

    .early-badge {
      background: #fef3c7;
      color: #f59e0b;
    }

    /* Period Content */
    .period-content {
      background: white;
      border-top: 1px solid #f3f4f6;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Table Wrapper */
    .table-wrapper {
      overflow-x: auto;
    }

    /* Desktop Table */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8125rem;
    }

    .data-table thead th {
      text-align: right;
      padding: 12px 8px;
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }

    .data-table thead th:first-child {
      text-align: center;
    }

    .data-table tbody td {
      padding: 12px 8px;
      border-bottom: 1px solid #f3f4f6;
      color: #4b5563;
      text-align: right;
    }

    .data-table tbody td:first-child,
    .data-table tbody td:last-child {
      text-align: center;
    }

    .data-table tbody tr:hover {
      background: #f9fafb;
    }

    .data-table tbody tr.paid-row {
      background: #ecfdf5;
    }

    .data-table tbody tr.early-row {
      background: #fffbeb;
    }

    .data-table tbody tr.regular-row {
      background: white;
    }

    .id-cell {
      font-weight: 600;
      color: #6b7280;
    }

    .date-cell {
      font-size: 0.75rem;
      color: #6b7280;
      white-space: nowrap;
    }

    .amount-cell {
      font-weight: 500;
    }

    .total-cell {
      font-weight: 700;
      color: #0f766e;
    }

    .early-amount {
      color: #f59e0b;
      font-weight: 600;
    }

    .batch-total {
      color: #10b981;
      font-weight: 700;
    }

    .strike {
      text-decoration: line-through;
      color: #9ca3af;
    }

    .actions-cell {
      text-align: center;
    }

    .checkbox-group {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      cursor: pointer;
      user-select: none;
    }

    .checkbox-label.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .checkbox-label input {
      cursor: pointer;
    }

    .checkbox-label.disabled input {
      cursor: not-allowed;
    }

    /* Mobile Cards */
    .mobile-cards {
      display: none;
      flex-direction: column;
      gap: 5px;
    }

    .mobile-card {
      background: #f9fafb;
      border-radius: 12px;
      padding: 12px;
      transition: all 0.2s ease;
    }

    .mobile-card.paid-card {
      background: #ecfdf5;
      border-left: 3px solid #10b981;
    }

    .mobile-card.early-card {
      background: #fffbeb;
      border-left: 3px solid #f59e0b;
    }

    .mobile-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }

    .instalment-id {
      font-weight: 600;
      font-size: 0.875rem;
      color: #1f2937;
      margin-right: 8px;
    }

    .instalment-date {
      font-size: 0.6875rem;
      color: #6b7280;
    }

    .checkbox-group-mobile {
      display: flex;
      gap: 12px;
    }

    .checkbox-label-mobile {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.6875rem;
      cursor: pointer;
    }

    .mobile-card-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
    }

    .detail-label {
      color: #6b7280;
      font-weight: 500;
    }

    .detail-value {
      font-weight: 600;
      color: #1f2937;
    }

    .total-value {
      color: #0f766e;
      font-weight: 700;
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      color: #9ca3af;
    }

    /* Responsive Breakpoints */
    @media (max-width: 1024px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .analytics-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
        text-align: center;
      }

      .header-actions {
        justify-content: center;
      }

      .period-header {
        gap: 12px;
        align-items: stretch;
      }

      .period-totals {
        justify-content: flex-start;
      }

      .period-content {
        padding: 16px;
      }

      /* Hide desktop table on mobile */
      .desktop-table {
        display: none;
      }

      /* Show mobile cards */
      .mobile-cards {
        display: flex;
      }
    }

    @media (max-width: 640px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .stat-card {
        padding: 12px 16px;
      }

      .periods-container {
        // padding: 12px;
      }

      .period-title {
        font-size: 0.875rem;
      }

      .period-header {
        padding: 12px 16px;
      }
    }

    @media (max-width: 480px) {
      .mortgage-analytics {
        border-radius: 12px;
      }

      .analytics-header {
        padding: 16px;
      }

      .title {
        font-size: 1rem;
      }

      .subtitle {
        font-size: 0.6875rem;
      }

      .stat-icon {
        width: 32px;
        height: 32px;
      }

      .stat-icon svg {
        width: 16px;
        height: 16px;
      }

      .stat-value {
        font-size: 0.875rem;
      }

      .period-content {
        padding: 5px;
      }

      .mobile-card {
        padding: 10px;
      }

      .instalment-id {
        font-size: 0.8125rem;
      }
    }
  `,
})
export class MortgageLoanOverviewBodyTableComponent {
  monthlyInstalmentGroups = input<MonthlyInstalmentManager[]>([]);

  @ViewChild('menuContainer') menuContainer!: ElementRef;

  store = inject(Store<fromMortgageLoan.MortgageLoanState>);

  isMenuOpen = false;
  columns: ColumnConfig[] = DEFAULT_COLUMN_CONFIGS;

  toggleGroup(group: MonthlyInstalmentManager) {
    group.expanded = !group.expanded;
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (
      this.isMenuOpen &&
      this.menuContainer &&
      !this.menuContainer.nativeElement.contains(event.target)
    ) {
      this.isMenuOpen = false;
    }
  }

  isColumnVisible(key: ColumnConfig['key']): boolean {
    const column = this.columns.find((col) => col.key === key);
    return column ? column.visible : true;
  }

  getInstalmentCount(group: MonthlyInstalmentManager): number {
    return group.instalments.filter((i) => !i.earlyPayment).length;
  }

  getEarlyPaymentCount(group: MonthlyInstalmentManager): number {
    return group.instalments.filter((i) => i.earlyPayment).length;
  }

  getSubtotal(group: MonthlyInstalmentManager) {
    const instalments = group.instalments;
    const installment = instalments.find((s) => s.instalmentPayment);
    const early = instalments.filter((s) => s.earlyPayment);

    return {
      instalmentsCount: !!installment ? 1 : 0,
      earlyCount: early.length,
      principal: Calculator.sum(instalments.map((e) => e.principalAmount)),
      interest: installment?.interestAmount || 0,
      administrationFee: installment?.administrationFee || 0,
      insurance: installment?.insuranceCost || 0,
      managementFee: installment?.managementFee || 0,
      recalculatedInterest: installment?.recalculatedInterest || 0,
      total: Calculator.sum(
        early
          .map((e) => e.principalAmount)
          .concat(installment?.totalInstalment || 0),
      ),
      earlyPayment: Calculator.sum(early.map((e) => e.principalAmount)),
      restant: instalments?.at(-1)?.remainingBalance,
      count: instalments.length,
    };
  }

  getTotalLoanAmount(): number {
    const groups = this.monthlyInstalmentGroups();
    if (!groups.length) return 0;
    const firstInstalment = groups[0]?.instalments[0];
    const lastInstalment =
      groups[groups.length - 1]?.instalments[
        groups[groups.length - 1]?.instalments.length - 1
      ];
    return (
      (firstInstalment?.remainingBalance || 0) +
      (lastInstalment?.principalAmount || 0)
    );
  }

  getTotalPaid(): number {
    const groups = this.monthlyInstalmentGroups();
    let total = 0;
    groups.forEach((group) => {
      group.instalments.forEach((instalment) => {
        if (instalment.instalmentPayment || instalment.earlyPayment) {
          total +=
            instalment.batchTotalInstalment || instalment.totalInstalment || 0;
        }
      });
    });
    return total;
  }

  getRemainingBalance(): number {
    const groups = this.monthlyInstalmentGroups();
    if (!groups.length) return 0;
    const lastGroup = groups[groups.length - 1];
    const lastInstalment =
      lastGroup?.instalments[lastGroup.instalments.length - 1];
    return lastInstalment?.remainingBalance || 0;
  }

  getProgressPercentage(): number {
    const total = this.getTotalLoanAmount();
    const paid = this.getTotalPaid();
    if (total === 0) return 0;
    return (paid / total) * 100;
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
