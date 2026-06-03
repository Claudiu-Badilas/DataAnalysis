import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import {
  TransactionCategorizer,
  TransactionCategory,
  TransactionDomain,
} from '../../../models/transactions.model';
import { TransactionStatusBarChartUtils } from '../../utils/transaction-status-bar.chart.utils';

interface GroupedTransaction {
  provider: string;
  description: string;
  count: number;
  total: number;
  currency: string | null;
  latestDate: Date | null;
  dates: Date[];
  category: TransactionCategory;
  percentageOfTotal: number;
}

interface PeriodGroup {
  id: string;
  title: string;
  year: number;
  monthIndex?: number;
  totalIncome: number;
  totalExpense: number;
  difference: number;
  transactionCount: number;
  transactions: TransactionDomain[];
  multiple: GroupedTransaction[];
  isExpanded: boolean;
  month?: string;
}

@Component({
  selector: 'p-most-common-transaction',
  imports: [
    CommonModule,
    NumberFormatPipe,
    ToggleButtonComponent,
    HighchartWrapperComponent,
    NgbTooltip,
  ],
  template: `<div class="transaction-analytics mt-2">
    <div class="analytics-header">
      <div class="text-center">
        <p class="subtitle">Most Common Transactions Overview</p>
      </div>
      <div class="header-right">
        <p-toggle-button
          [options]="[{ label: 'Monthly' }, { label: 'Yearly' }]"
          [selected]="viewMode() === 'monthly' ? 'Monthly' : 'Yearly'"
          [gradient]="{
            primaryColor: '#3b82f6',
            secondaryColor: '#10b981',
          }"
          (selectionChange)="onToggle($event)"
        />
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon income-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2v20M17 7l-5-5-5 5M7 17l5 5 5-5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Income</span>
          <span class="stat-value positive">{{
            totalIncome() | numberFormat: '0.00'
          }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon expense-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2v20M17 7l-5-5-5 5M7 17l5 5 5-5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Expense</span>
          <span class="stat-value negative"
            >-{{ totalExpense() | numberFormat: '0.00' }}</span
          >
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon balance-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6h18M9 12h6M7 18h10"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Net Balance</span>
          <span
            class="stat-value"
            [class.positive]="totalIncome() - totalExpense() > 0"
            [class.negative]="totalIncome() - totalExpense() < 0"
          >
            {{ totalIncome() - totalExpense() | numberFormat: '0.00' }}
          </span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon count-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Transactions</span>
          <span class="stat-value">{{ totalTransactions() }}</span>
        </div>
      </div>
    </div>

    <div class="table-container">
      <div class="period-view">
        @for (period of currentPeriods(); track period.id) {
          <div class="period-card" [class.expanded]="period.isExpanded">
            <div class="period-header" (click)="togglePeriod(period)">
              <div class="period-info">
                <div>
                  <div class="period-title">{{ period.title }}</div>
                </div>
              </div>
              <div class="period-totals">
                <span class="buble">{{ period.transactionCount }} </span>
                @if (period.totalIncome > 0) {
                  <span class="income-badge">{{
                    period.totalIncome | numberFormat: '0.00'
                  }}</span>
                }
                @if (period.totalExpense > 0) {
                  <span class="expense-badge"
                    >-{{ period.totalExpense | numberFormat: '0.00' }}</span
                  >
                }
                @if (period.difference !== 0) {
                  <span
                    class="diff-badge"
                    [class.positive]="period.difference > 0"
                    [class.negative]="period.difference < 0"
                  >
                    {{ period.difference | numberFormat: '0.00' }}
                  </span>
                }
              </div>
            </div>

            @if (period.isExpanded) {
              <div class="period-content">
                <p-highcharts-wrapper
                  class="chart-wrapper"
                  [chartOptions]="updateBarChart(period.transactions)"
                />
                <div class="data-table-wrapper">
                  <!-- Desktop Table -->
                  <table class="data-table desktop-table">
                    <thead>
                      <tr>
                        <th>Provider</th>
                        <th>Category</th>
                        <th>Total</th>
                        <th>
                          % of
                          {{ viewMode() === 'monthly' ? 'Period' : 'Year' }}
                        </th>
                        <th>Last Transaction</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (item of period.multiple; track item.provider) {
                        <tr class="highlight-row">
                          <td data-label="Provider" class="provider-cell">
                            <span
                              class="provider-badge multiple"
                              [ngbTooltip]="item.description"
                              placement="top"
                              container="body"
                            >
                              {{ item.count }}x {{ item.provider }}
                            </span>
                          </td>
                          <td data-label="Category" class="amount-cell">
                            <div
                              class="category-edit-select"
                              [style.backgroundColor]="
                                getCategoryColor(item.category)
                              "
                            >
                              {{ getCategoryLabel(item.category) }}
                            </div>
                          </td>
                          <td
                            data-label="Total"
                            class="amount-cell"
                            [class.positive]="item.total > 0"
                            [class.negative]="item.total < 0"
                          >
                            {{ item.total | numberFormat: '0.00' }}
                          </td>
                          <td data-label="% of Period" class="percentage-cell">
                            <div class="percentage-bar">
                              <div
                                class="percentage-fill"
                                [style.width.%]="item.percentageOfTotal"
                              ></div>
                              <span class="percentage-text"
                                >{{
                                  item.percentageOfTotal | numberFormat: '0.0'
                                }}%</span
                              >
                            </div>
                          </td>
                          <td data-label="Last Transaction" class="date-cell">
                            {{ formatDay(item.latestDate) }}
                          </td>
                        </tr>
                      }

                      @if (!period.multiple.length) {
                        <tr>
                          <td colspan="6" class="empty-cell">
                            No transactions this period
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>

                  <!-- Mobile Cards -->
                  <div class="mobile-cards pt-2">
                    @for (item of period.multiple; track item.provider) {
                      <div class="mobile-card highlight-card">
                        <div class="mobile-card-header">
                          <span
                            class="provider-badge multiple"
                            [ngbTooltip]="item.description"
                            placement="top"
                            container="body"
                          >
                            {{ item.count }}x {{ item.provider }}
                          </span>
                          <div class="detail-row w-25">
                            <div
                              class="category-edit-select"
                              [style.backgroundColor]="
                                getCategoryColor(item.category)
                              "
                            >
                              {{ getCategoryLabel(item.category) }}
                            </div>
                          </div>
                        </div>
                        <div class="mobile-card-details">
                          <span class="detail-value">{{
                            formatDay(item.latestDate)
                          }}</span>
                          <span
                            class="detail-value"
                            [class.positive]="item.total > 0"
                            [class.negative]="item.total < 0"
                          >
                            {{ item.total | numberFormat: '0.00' }}
                          </span>
                          <div class="percentage-bar-mobile">
                            <div
                              class="percentage-fill-mobile"
                              [style.width.%]="item.percentageOfTotal"
                            ></div>

                            <span class="percentage-text-mobile"
                              >{{
                                item.percentageOfTotal | numberFormat: '0.0'
                              }}%</span
                            >
                          </div>
                        </div>
                      </div>
                    }

                    @if (!period.multiple.length) {
                      <div class="empty-mobile">
                        No transactions this period
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }
        @if (!currentPeriods().length) {
          <div class="empty-state">No transaction data available</div>
        }
      </div>
    </div>
  </div>`,
  styles: `
    .transaction-analytics {
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
      padding: 10px;
      border-bottom: 1px solid #e5e7eb;
    }

    .subtitle {
      font-size: 0.8125rem;
      opacity: 0.9;
      margin: 0;
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
      transition: all 0.2s ease;
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

    .income-icon {
      background: #d1fae5;
      color: #10b981;
    }

    .expense-icon {
      background: #fee2e2;
      color: #ef4444;
    }

    .balance-icon {
      background: #dbeafe;
      color: #3b82f6;
    }

    .count-icon {
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
    }

    .stat-value.positive {
      color: #10b981;
    }

    .stat-value.negative {
      color: #ef4444;
    }

    /* Table Container */
    .table-container {
      overflow-y: auto;
      background: #f9fafb;
      height: 800px;

      &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      &::-webkit-scrollbar-track {
        background: #f1f5f9;
      }

      &::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
      }
    }

    .period-view {
      padding: 5px;
    }

    /* Period Cards */
    .period-card {
      background: white;
      border-radius: 12px;
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
      padding: 10px;
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

    .period-title {
      font-weight: 600;
      font-size: 1rem;
      color: #1f2937;
    }

    .period-totals {
      display: flex;
      gap: 8px;
    }

    .income-badge,
    .expense-badge,
    .diff-badge {
      width: 100px;
      text-align: center;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .buble {
      text-align: center;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #e5e7eb;
      color: #4b5563;
    }

    .income-badge {
      background: #d1fae5;
      color: #10b981;
    }

    .expense-badge {
      background: #fee2e2;
      color: #ef4444;
    }

    .diff-badge {
      background: #f3f4f6;
      color: #6b7280;
    }

    .diff-badge.positive {
      background: white;
      color: #10b981;
      border: 1px solid #10b981;
    }

    .diff-badge.negative {
      background: white;
      color: #ef4444;
      border: 1px solid #ef4444;
    }

    /* Period Content */
    .period-content {
      padding: 0 20px 20px 20px;
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

    /* Data Table Wrapper */
    .data-table-wrapper {
      overflow-x: auto;
    }

    /* Desktop Table */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8125rem;
    }

    .data-table thead th {
      text-align: left;
      padding: 12px 8px;
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }

    .data-table tbody td {
      padding: 12px 8px;
      border-bottom: 1px solid #f3f4f6;
      color: #4b5563;
    }

    .data-table tbody tr:hover {
      background: #f9fafb;
    }

    .data-table tbody tr.highlight-row {
      background: #fef3c7;
    }

    .data-table tbody tr.highlight-row:hover {
      background: #fde68a;
    }

    .provider-cell {
      font-weight: 500;
    }

    .provider-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
    }

    .provider-badge.multiple {
      background: #dbeafe;
      color: #1e40af;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-right: 4px;
      font-size: 11px;
    }

    .count-cell {
      font-weight: 600;
      color: #6b7280;
    }

    .amount-cell {
      font-weight: 600;
    }

    .amount-cell.positive {
      color: #10b981;
    }

    .amount-cell.negative {
      color: #ef4444;
    }

    .percentage-cell {
      width: 120px;
    }

    .percentage-bar {
      position: relative;
      background: #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
      height: 24px;
      display: flex;
      align-items: center;
    }

    .percentage-fill {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      border-radius: 10px;
      transition: width 0.3s ease;
    }

    .percentage-text {
      position: relative;
      z-index: 1;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0 8px;
      color: #1f2937;
    }

    .date-cell {
      font-size: 0.75rem;
      color: #6b7280;
      white-space: nowrap;
    }

    /* Mobile Cards */
    .mobile-cards {
      display: none;
      flex-direction: column;
      gap: 8px;
    }

    .mobile-card {
      background: #f9fafb;
      border-radius: 6px;
      padding: 12px;
      transition: all 0.2s ease;
    }

    .mobile-card.highlight-card {
      background: #fef3c7;
    }

    .mobile-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }

    .mobile-card-details {
      display: flex;
      align-items: center;
      justify-content: space-between;
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

    .detail-value.positive {
      color: #10b981;
    }

    .detail-value.negative {
      color: #ef4444;
    }

    .percentage-bar-mobile {
      position: relative;
      background: #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
      height: 20px;
      width: 120px;
      display: flex;
      align-items: center;
    }

    .percentage-fill-mobile {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      border-radius: 10px;
      transition: width 0.3s ease;
    }

    .percentage-text-mobile {
      position: relative;
      z-index: 1;
      font-size: 0.625rem;
      font-weight: 600;
      padding: 0 6px;
      color: #1f2937;
    }

    .empty-mobile {
      text-align: center;
      padding: 24px;
      color: #9ca3af;
      font-size: 0.75rem;
    }

    .empty-cell {
      text-align: center;
      padding: 32px;
      color: #9ca3af;
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
        gap: 10px;
        align-items: stretch;
        text-align: center;
        padding: 16px 20px;
      }

      .period-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 10px;
      }

      .period-content {
        padding: 0 16px 16px 16px;
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

      .period-view {
        padding: 5px;
      }

      .period-title {
        font-size: 0.875rem;
      }

      .income-badge,
      .expense-badge,
      .diff-badge {
        width: 75px;
        text-align: center;
        padding: 2px 8px;
        font-size: 0.6875rem;
      }

      .buble {
        padding: 2px 8px;
        font-size: 0.6875rem;
      }

      .detail-row {
        font-size: 0.6875rem;
      }

      .percentage-bar-mobile {
        width: 100px;
        height: 18px;
      }
    }

    @media (max-width: 480px) {
      .transaction-analytics {
        border-radius: 12px;
      }

      .analytics-header {
        padding: 12px 16px;
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

      .period-header {
        padding: 10px;
      }

      .period-info {
        gap: 8px;
      }

      .period-title {
        font-size: 0.8125rem;
      }

      .income-badge,
      .expense-badge,
      .diff-badge {
        width: 75px;
        text-align: center;
        padding: 2px 6px;
        font-size: 0.625rem;
      }

      .buble {
        text-align: center;
        padding: 2px 6px;
        font-size: 0.625rem;
      }

      .period-content {
        padding: 0 10px 10px 10px;
      }

      .mobile-card {
        padding: 8px;
      }

      .detail-label,
      .detail-value {
        font-size: 0.625rem;
      }

      .percentage-bar-mobile {
        width: 80px;
        height: 16px;
      }

      .percentage-text-mobile {
        font-size: 0.5625rem;
        padding: 0 4px;
      }
    }

    .category-edit-select {
      width: 100%;
      text-align: center;
      padding: 3px;
      color: white;
      border-radius: 6px;
    }

    .chart-wrapper {
      width: 100%;
      max-height: 400px;
    }
  `,
})
export class MostCommonTransactionComponent {
  transactions = input<TransactionDomain[]>([]);

  viewMode = signal<'monthly' | 'yearly'>('monthly');
  private expandedPeriodId = signal<string | null>(null);

  onToggle(value: string) {
    this.viewMode.set(value === 'Monthly' ? 'monthly' : 'yearly');
    this.expandedPeriodId.set(null);
  }

  togglePeriod(period: PeriodGroup) {
    const currentExpanded = this.expandedPeriodId();
    if (currentExpanded === period.id) {
      this.expandedPeriodId.set(null);
    } else {
      this.expandedPeriodId.set(period.id);
    }
  }

  formatDay(date: Date | null): string {
    if (!date) return '';
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${day} ${month} ${date.getFullYear()}`;
  }

  // Unified computed property for current periods
  currentPeriods = computed((): PeriodGroup[] => {
    if (this.viewMode() === 'monthly') {
      return this.groupedByMonth();
    } else {
      return this.groupedByYear();
    }
  });

  private groupedByMonth = computed((): PeriodGroup[] => {
    const txs = this.transactions();
    if (!txs?.length) return [];

    const map = new Map<string, TransactionDomain[]>();
    for (const tx of txs) {
      const date = tx.completionDate || tx.registrationDate;
      if (!date) continue;
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tx);
    }

    return Array.from(map.entries())
      .map(([key, txs]) => {
        const [year, monthIndex] = key.split('-').map(Number);
        const month = new Date(year, monthIndex).toLocaleString('default', {
          month: 'short',
        });
        const id = `month-${year}-${monthIndex}`;

        const processedData = this.processTransactions(txs);

        return {
          id,
          title: `${month} ${year}`,
          year,
          monthIndex,
          month,
          ...processedData,
          isExpanded: this.expandedPeriodId() === id,
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.monthIndex! - a.monthIndex!;
      });
  });

  private groupedByYear = computed((): PeriodGroup[] => {
    const txs = this.transactions();
    if (!txs?.length) return [];

    const map = new Map<number, TransactionDomain[]>();
    for (const tx of txs) {
      const date = tx.completionDate || tx.registrationDate;
      if (!date) continue;
      const year = date.getFullYear();
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(tx);
    }

    return Array.from(map.entries())
      .map(([year, txs]) => {
        const id = `year-${year}`;
        const processedData = this.processTransactions(txs);

        return {
          id,
          title: `${year}`,
          year,
          ...processedData,
          isExpanded: this.expandedPeriodId() === id,
        };
      })
      .sort((a, b) => b.year - a.year);
  });

  // Shared processing logic
  private processTransactions(txs: TransactionDomain[]) {
    const grouped = this.groupLocal(txs);
    const totalAmount = txs.reduce((s, t) => s + Math.abs(t.amount ?? 0), 0);

    const groupsWithPercentages = grouped.map((g) => ({
      ...g,
      percentageOfTotal:
        totalAmount > 0 ? (Math.abs(g.total) / totalAmount) * 100 : 0,
    }));

    const sortedGroups = groupsWithPercentages.sort(
      (a, b) => b.percentageOfTotal - a.percentageOfTotal,
    );

    const totalIncome = txs
      .filter((t) => (t.amount ?? 0) > 0)
      .reduce((s, t) => s + (t.amount ?? 0), 0);
    const totalExpense = Math.abs(
      txs
        .filter((t) => (t.amount ?? 0) < 0)
        .reduce((s, t) => s + (t.amount ?? 0), 0),
    );

    return {
      totalIncome,
      totalExpense,
      difference: totalIncome - totalExpense,
      transactionCount: txs.length,
      multiple: sortedGroups,
      transactions: txs,
    };
  }

  totalIncome = computed(
    () =>
      this.transactions()
        ?.filter((tx) => (tx.amount ?? 0) > 0)
        .reduce((s, tx) => s + (tx.amount ?? 0), 0) ?? 0,
  );

  totalExpense = computed(() =>
    Math.abs(
      this.transactions()
        ?.filter((tx) => (tx.amount ?? 0) < 0)
        .reduce((s, tx) => s + (tx.amount ?? 0), 0) ?? 0,
    ),
  );

  totalTransactions = computed(() => this.transactions()?.length ?? 0);

  private groupLocal(txs: TransactionDomain[]): GroupedTransaction[] {
    const map = new Map<string, GroupedTransaction>();

    for (const tx of txs) {
      const key = tx.serviceProvider || 'Unknown';
      const date = tx.completionDate || tx.registrationDate;

      if (!map.has(key)) {
        map.set(key, {
          provider: key,
          description: tx.description || '',
          count: 0,
          total: 0,
          currency: tx.currency,
          latestDate: null,
          dates: [],
          category: null,
          percentageOfTotal: 0,
        });
      }

      const g = map.get(key)!;
      g.count++;
      g.total += tx.amount ?? 0;
      g.category = tx.category;

      if (date) {
        g.dates.push(date);
        if (!g.latestDate || date > g.latestDate) {
          g.latestDate = date;
        }
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      b.count !== a.count
        ? b.count - a.count
        : Math.abs(b.total) - Math.abs(a.total),
    );
  }

  getCategoryColor = (category: TransactionCategory): string =>
    TransactionCategorizer.getCategoryColor(category);

  getCategoryLabel = (category: TransactionCategory): string =>
    TransactionCategorizer.getCategoryLabel(category);

  updateBarChart = (
    filteredTransactions: TransactionDomain[],
  ): Highcharts.Options =>
    TransactionStatusBarChartUtils.getChart(filteredTransactions);
}
