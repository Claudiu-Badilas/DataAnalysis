import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import {
  TransactionCategorizer,
  TransactionCategory,
  TransactionDomain,
} from '../../../models/transactions.model';
import { TransactionStatusBarChartUtils } from '../../utils/transaction-status-bar.chart.utils';
import { TransactionOverviewHeaderComponent } from '../transaction-overview-header/transaction-overview-header.component';

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
  percentageOfIncome: number;
  percentageOfExpense: number;
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
  salaryPeriodStart?: Date;
  salaryPeriodEnd?: Date;
  isSalaryPeriod?: boolean;
}

@Component({
  selector: 'p-most-common-transaction',
  imports: [
    CommonModule,
    NumberFormatPipe,
    HighchartWrapperComponent,
    NgbTooltip,
    TransactionOverviewHeaderComponent,
  ],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <p-transaction-overview-header
        class="header-section"
        [totalIncome]="totalIncome()"
        [totalExpense]="totalExpense()"
        [totalTransactions]="totalTransactions()"
      ></p-transaction-overview-header>

      <!-- Main Content -->
      <div class="content-area">
        <div class="scroll-container">
          @if (viewMode() === 'all') {
            <!-- All View -->
            <div class="view-all">
              <!-- Chart Section -->
              @if (selectedCategory() === null) {
                <div class="chart-section">
                  <p-highcharts-wrapper
                    class="chart-wrapper"
                    [chartOptions]="updateBarChart(selectedTransaction())"
                  />
                </div>
              }

              <!-- Transactions List -->
              <div class="transactions-section">
                <div class="section-header">
                  <span class="section-title">Top Transactions</span>
                  <span class="section-badge">{{
                    getAllGroupedTransactions().length
                  }}</span>
                </div>

                <!-- Desktop Grid -->
                <div class="transactions-grid desktop-grid">
                  @for (
                    item of getAllGroupedTransactions();
                    track item.provider
                  ) {
                    <div class="transaction-card highlight-card">
                      <div class="card-row">
                        <div class="provider-group">
                          <span
                            class="provider-name"
                            [ngbTooltip]="item.description"
                          >
                            {{ item.provider }}
                          </span>
                          <span class="tx-count">{{ item.count }}×</span>
                        </div>
                        <div
                          class="category-pill"
                          (click)="onSelectCategory(item.category)"
                          [style.background]="getCategoryColor(item.category)"
                        >
                          {{ getCategoryLabel(item.category) }}
                        </div>
                      </div>
                      <div class="card-row middle">
                        <span class="date-text">{{
                          formatDay(item.latestDate)
                        }}</span>
                        <span
                          class="amount-text"
                          [class.positive]="item.total > 0"
                          [class.negative]="item.total < 0"
                        >
                          {{ item.total | numberFormat: '0.00' }}
                        </span>
                      </div>
                      <div class="card-row progress-row">
                        @if (item.total > 0 && totalIncome() > 0) {
                          <div class="progress-bar">
                            <div
                              class="progress-fill income-fill"
                              [style.width.%]="item.percentageOfIncome"
                            ></div>
                            <span class="progress-label"
                              >{{
                                item.percentageOfIncome | numberFormat: '0.0'
                              }}%</span
                            >
                          </div>
                        } @else if (item.total < 0 && totalExpense() > 0) {
                          <div class="progress-bar">
                            <div
                              class="progress-fill expense-fill"
                              [style.width.%]="item.percentageOfExpense"
                            ></div>
                            <span class="progress-label"
                              >{{
                                item.percentageOfExpense | numberFormat: '0.0'
                              }}%</span
                            >
                          </div>
                        }
                      </div>
                    </div>
                  }

                  @if (!getAllGroupedTransactions().length) {
                    <div class="empty-state">No transactions</div>
                  }
                </div>

                <!-- Mobile List -->
                <div class="mobile-list">
                  @for (
                    item of getAllGroupedTransactions();
                    track item.provider
                  ) {
                    <div class="mobile-item highlight-card">
                      <div class="mobile-row">
                        <span class="mobile-provider">{{ item.provider }}</span>
                        <span class="mobile-count">{{ item.count }}×</span>
                        <div
                          class="category-chip"
                          (click)="onSelectCategory(item.category)"
                          [style.background]="getCategoryColor(item.category)"
                        >
                          {{ getCategoryLabel(item.category) }}
                        </div>
                      </div>
                      <div class="mobile-row">
                        <span class="mobile-date">{{
                          formatDay(item.latestDate)
                        }}</span>
                        <span
                          class="mobile-amount"
                          [class.positive]="item.total > 0"
                          [class.negative]="item.total < 0"
                        >
                          {{ item.total | numberFormat: '0.00' }}
                        </span>
                      </div>
                      <div class="mobile-row progress-row">
                        @if (item.total > 0 && totalIncome() > 0) {
                          <div class="progress-bar">
                            <div
                              class="progress-fill income-fill"
                              [style.width.%]="item.percentageOfIncome"
                            ></div>
                            <span class="progress-label"
                              >{{
                                item.percentageOfIncome | numberFormat: '0.0'
                              }}%</span
                            >
                          </div>
                        } @else if (item.total < 0 && totalExpense() > 0) {
                          <div class="progress-bar">
                            <div
                              class="progress-fill expense-fill"
                              [style.width.%]="item.percentageOfExpense"
                            ></div>
                            <span class="progress-label"
                              >{{
                                item.percentageOfExpense | numberFormat: '0.0'
                              }}%</span
                            >
                          </div>
                        }
                      </div>
                    </div>
                  }

                  @if (!getAllGroupedTransactions().length) {
                    <div class="empty-mobile">No transactions</div>
                  }
                </div>
              </div>
            </div>
          } @else {
            <!-- Period View -->
            <div class="view-periods">
              @for (period of currentPeriods(); track period.id) {
                <div
                  class="period-container"
                  [class.expanded]="period.isExpanded"
                >
                  <!-- Period Header -->
                  <div class="period-header" (click)="togglePeriod(period)">
                    <div class="header-left">
                      <span class="header-title">{{ period.title }}</span>
                      <span class="header-count"
                        >{{ period.transactionCount }}tx</span
                      >
                      @if (period.isSalaryPeriod) {
                        <span class="salary-tag">💰</span>
                      }
                    </div>
                    <div class="header-right">
                      @if (period.totalIncome > 0) {
                        <span class="income-tag"
                          >+{{
                            period.totalIncome | numberFormat: '0.00'
                          }}</span
                        >
                      }
                      @if (period.totalExpense > 0) {
                        <span class="expense-tag"
                          >-{{
                            period.totalExpense | numberFormat: '0.00'
                          }}</span
                        >
                      }
                      @if (period.difference !== 0) {
                        <span
                          class="diff-tag"
                          [class.positive]="period.difference > 0"
                          [class.negative]="period.difference < 0"
                        >
                          {{ period.difference | numberFormat: '0.00' }}
                        </span>
                      }
                      <span class="expand-icon">{{
                        period.isExpanded ? '−' : '+'
                      }}</span>
                    </div>
                  </div>

                  <!-- Period Content -->
                  @if (period.isExpanded) {
                    <div class="period-content">
                      @if (selectedCategory() === null) {
                        <div class="chart-section">
                          <p-highcharts-wrapper
                            class="chart-wrapper"
                            [chartOptions]="updateBarChart(period.transactions)"
                          />
                        </div>
                      }

                      <div class="transactions-section compact">
                        <!-- Desktop Grid -->
                        <div class="transactions-grid desktop-grid">
                          @for (item of period.multiple; track item.provider) {
                            <div class="transaction-card highlight-card">
                              <div class="card-row">
                                <div class="provider-group">
                                  <span
                                    class="provider-name"
                                    [ngbTooltip]="item.description"
                                  >
                                    {{ item.provider }}
                                  </span>
                                  <span class="tx-count"
                                    >{{ item.count }}×</span
                                  >
                                </div>
                                <div
                                  class="category-pill"
                                  (click)="onSelectCategory(item.category)"
                                  [style.background]="
                                    getCategoryColor(item.category)
                                  "
                                >
                                  {{ getCategoryLabel(item.category) }}
                                </div>
                              </div>
                              <div class="card-row middle">
                                <span class="date-text">{{
                                  formatDay(item.latestDate)
                                }}</span>
                                <span
                                  class="amount-text"
                                  [class.positive]="item.total > 0"
                                  [class.negative]="item.total < 0"
                                >
                                  {{ item.total | numberFormat: '0.00' }}
                                </span>
                              </div>
                              <div class="card-row progress-row">
                                @if (item.total > 0 && period.totalIncome > 0) {
                                  <div class="progress-bar">
                                    <div
                                      class="progress-fill income-fill"
                                      [style.width.%]="item.percentageOfIncome"
                                    ></div>
                                    <span class="progress-label"
                                      >{{
                                        item.percentageOfIncome
                                          | numberFormat: '0.0'
                                      }}%</span
                                    >
                                  </div>
                                } @else if (
                                  item.total < 0 && period.totalExpense > 0
                                ) {
                                  <div class="progress-bar">
                                    <div
                                      class="progress-fill expense-fill"
                                      [style.width.%]="item.percentageOfExpense"
                                    ></div>
                                    <span class="progress-label"
                                      >{{
                                        item.percentageOfExpense
                                          | numberFormat: '0.0'
                                      }}%</span
                                    >
                                  </div>
                                }
                              </div>
                            </div>
                          }

                          @if (!period.multiple.length) {
                            <div class="empty-state">No transactions</div>
                          }
                        </div>

                        <!-- Mobile List -->
                        <div class="mobile-list">
                          @for (item of period.multiple; track item.provider) {
                            <div class="mobile-item highlight-card">
                              <div class="mobile-row">
                                <span class="mobile-provider">{{
                                  item.provider
                                }}</span>
                                <span class="mobile-count"
                                  >{{ item.count }}×</span
                                >
                                <div
                                  class="category-chip"
                                  (click)="onSelectCategory(item.category)"
                                  [style.background]="
                                    getCategoryColor(item.category)
                                  "
                                >
                                  {{ getCategoryLabel(item.category) }}
                                </div>
                              </div>
                              <div class="mobile-row">
                                <span class="mobile-date">{{
                                  formatDay(item.latestDate)
                                }}</span>
                                <span
                                  class="mobile-amount"
                                  [class.positive]="item.total > 0"
                                  [class.negative]="item.total < 0"
                                >
                                  {{ item.total | numberFormat: '0.00' }}
                                </span>
                              </div>
                              <div class="mobile-row progress-row">
                                @if (item.total > 0 && period.totalIncome > 0) {
                                  <div class="progress-bar">
                                    <div
                                      class="progress-fill income-fill"
                                      [style.width.%]="item.percentageOfIncome"
                                    ></div>
                                    <span class="progress-label"
                                      >{{
                                        item.percentageOfIncome
                                          | numberFormat: '0.0'
                                      }}%</span
                                    >
                                  </div>
                                } @else if (
                                  item.total < 0 && period.totalExpense > 0
                                ) {
                                  <div class="progress-bar">
                                    <div
                                      class="progress-fill expense-fill"
                                      [style.width.%]="item.percentageOfExpense"
                                    ></div>
                                    <span class="progress-label"
                                      >{{
                                        item.percentageOfExpense
                                          | numberFormat: '0.0'
                                      }}%</span
                                    >
                                  </div>
                                }
                              </div>
                            </div>
                          }

                          @if (!period.multiple.length) {
                            <div class="empty-mobile">No transactions</div>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }

              @if (!currentPeriods().length) {
                <div class="empty-state-large">No data available</div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    /* ===== CONTAINER ===== */
    .dashboard-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #f5f7fb;
      font-family:
        -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
        sans-serif;
    }

    .header-section {
      flex-shrink: 0;
      padding: 4px 12px 0 12px;
    }

    .content-area {
      flex: 1;
      overflow: hidden;
      padding: 4px 12px 8px 12px;
    }

    .scroll-container {
      height: 100%;
      overflow-y: auto;
      padding-right: 2px;
    }

    /* ===== SCROLLBAR ===== */
    .scroll-container::-webkit-scrollbar {
      width: 3px;
    }
    .scroll-container::-webkit-scrollbar-track {
      background: transparent;
    }
    .scroll-container::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 3px;
    }

    /* ===== CHART SECTION ===== */
    .chart-section {
      background: white;
      border-radius: 8px;
      padding: 6px 8px;
      margin-bottom: 6px;
      border: 1px solid #f0f2f5;
    }

    .chart-wrapper {
      width: 100%;
      max-height: 220px;
    }

    /* ===== TRANSACTIONS SECTION ===== */
    .transactions-section {
      background: white;
      border-radius: 8px;
      padding: 6px 8px;
      border: 1px solid #f0f2f5;
    }

    .transactions-section.compact {
      padding: 0;
      border: none;
      background: transparent;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
      padding-bottom: 4px;
      border-bottom: 1px solid #f0f2f5;
    }

    .section-title {
      font-size: 0.7rem;
      font-weight: 600;
      color: #1a1a2e;
    }

    .section-badge {
      font-size: 0.55rem;
      font-weight: 500;
      color: #6b6b8d;
      background: #f0f2f5;
      padding: 0 6px;
      border-radius: 8px;
      line-height: 1.6;
    }

    /* ===== TRANSACTION CARDS ===== */
    .transactions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 4px;
    }

    .transaction-card {
      background: #fafbfc;
      border-radius: 6px;
      padding: 4px 6px;
      border: 1px solid #eef0f3;
      transition: all 0.15s ease;
    }

    .transaction-card:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .transaction-card.highlight-card {
      background: #fffbf0;
      border-color: #fde68a;
    }

    .card-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 4px;
      padding: 1px 0;
    }

    .card-row.middle {
      border-top: 1px solid #eef0f3;
      border-bottom: 1px solid #eef0f3;
      padding: 2px 0;
      margin: 1px 0;
    }

    .card-row.progress-row {
      padding-top: 1px;
    }

    .provider-group {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
      min-width: 0;
    }

    .provider-name {
      font-weight: 500;
      font-size: 0.65rem;
      color: #1a1a2e;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tx-count {
      font-size: 0.5rem;
      color: #8b8baa;
      background: #eef0f3;
      padding: 0 4px;
      border-radius: 6px;
      flex-shrink: 0;
      line-height: 1.4;
    }

    .category-pill {
      flex-shrink: 0;
      padding: 0 6px;
      border-radius: 8px;
      color: white;
      font-size: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      user-select: none;
      line-height: 1.6;
    }

    .category-pill:hover {
      transform: scale(1.05);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
    }

    .category-pill:active {
      transform: scale(0.92);
    }

    .date-text {
      font-size: 0.6rem;
      color: #6b6b8d;
      font-weight: 500;
    }

    .amount-text {
      font-size: 0.7rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    .amount-text.positive {
      color: #0caa6c;
    }
    .amount-text.negative {
      color: #e74c5e;
    }

    .progress-bar {
      position: relative;
      background: #eef0f3;
      border-radius: 8px;
      overflow: hidden;
      height: 14px;
      width: 100%;
      display: flex;
      align-items: center;
    }

    .progress-fill {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      border-radius: 8px;
      transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .income-fill {
      background: linear-gradient(90deg, #6366f1, #0caa6c);
    }
    .expense-fill {
      background: linear-gradient(90deg, #f97316, #e74c5e);
    }

    .progress-label {
      position: relative;
      z-index: 1;
      font-size: 0.5rem;
      font-weight: 600;
      padding: 0 4px;
      color: #1a1a2e;
      width: 100%;
      text-align: center;
    }

    /* ===== MOBILE LIST ===== */
    .mobile-list {
      display: none;
      flex-direction: column;
      gap: 4px;
    }

    .mobile-item {
      background: #fafbfc;
      border-radius: 6px;
      padding: 4px 6px;
      border: 1px solid #eef0f3;
    }

    .mobile-item.highlight-card {
      background: #fffbf0;
      border-color: #fde68a;
    }

    .mobile-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 4px;
      padding: 1px 0;
    }

    .mobile-row.progress-row {
      padding-top: 1px;
    }

    .mobile-provider {
      font-weight: 500;
      font-size: 0.65rem;
      color: #1a1a2e;
      flex: 1;
    }

    .mobile-count {
      font-size: 0.5rem;
      color: #8b8baa;
      background: #eef0f3;
      padding: 0 4px;
      border-radius: 6px;
      line-height: 1.4;
    }

    .category-chip {
      padding: 0 6px;
      border-radius: 8px;
      color: white;
      font-size: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      flex-shrink: 0;
      line-height: 1.6;
    }

    .category-chip:active {
      transform: scale(0.92);
    }

    .mobile-date {
      font-size: 0.55rem;
      color: #6b6b8d;
    }

    .mobile-amount {
      font-size: 0.7rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    .mobile-amount.positive {
      color: #0caa6c;
    }
    .mobile-amount.negative {
      color: #e74c5e;
    }

    /* ===== PERIOD CONTAINER ===== */
    .period-container {
      background: white;
      border-radius: 8px;
      margin-bottom: 4px;
      border: 1px solid #f0f2f5;
      transition: all 0.2s ease;
      overflow: hidden;
    }

    .period-container.expanded {
      border-color: #dce0e6;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .period-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 8px;
      cursor: pointer;
      transition: background 0.15s ease;
      gap: 4px;
      min-height: 32px;
    }

    .period-header:hover {
      background: #fafbfc;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
      min-width: 0;
    }

    .header-title {
      font-weight: 600;
      font-size: 0.7rem;
      color: #1a1a2e;
    }

    .header-count {
      font-size: 0.5rem;
      color: #6b6b8d;
      background: #f0f2f5;
      padding: 0 4px;
      border-radius: 6px;
      line-height: 1.4;
    }

    .salary-tag {
      font-size: 0.6rem;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 3px;
      flex-shrink: 0;
    }

    .income-tag,
    .expense-tag,
    .diff-tag {
      padding: 0 4px;
      border-radius: 4px;
      font-size: 0.55rem;
      font-weight: 600;
      white-space: nowrap;
      line-height: 1.6;
    }

    .income-tag {
      background: #ecfdf5;
      color: #0caa6c;
    }

    .expense-tag {
      background: #fef2f2;
      color: #e74c5e;
    }

    .diff-tag {
      background: #f0f2f5;
      color: #6b6b8d;
      min-width: 32px;
      text-align: center;
    }

    .diff-tag.positive {
      background: #ecfdf5;
      color: #0caa6c;
    }

    .diff-tag.negative {
      background: #fef2f2;
      color: #e74c5e;
    }

    .expand-icon {
      font-size: 0.6rem;
      color: #9ca3af;
      transition: transform 0.2s ease;
      margin-left: 2px;
      font-weight: 700;
    }

    .period-content {
      padding: 0 8px 6px 8px;
      border-top: 1px solid #f0f2f5;
      animation: slideDown 0.2s cubic-bezier(0.22, 1, 0.36, 1);
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-3px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .period-content .chart-section {
      margin-bottom: 4px;
    }

    /* ===== EMPTY STATES ===== */
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 8px;
      color: #8b8baa;
      font-size: 0.65rem;
    }

    .empty-state-large {
      text-align: center;
      padding: 20px;
      color: #8b8baa;
      font-size: 0.75rem;
    }

    .empty-mobile {
      text-align: center;
      padding: 8px;
      color: #8b8baa;
      font-size: 0.6rem;
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 1024px) {
      .transactions-grid {
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 4px;
      }
    }

    @media (max-width: 768px) {
      .header-section {
        padding: 3px 8px 0 8px;
      }

      .content-area {
        padding: 3px 8px 6px 8px;
      }

      .transactions-grid {
        display: none;
      }

      .mobile-list {
        display: flex;
      }

      .period-header {
        padding: 3px 6px;
        min-height: 28px;
      }

      .header-title {
        font-size: 0.65rem;
      }

      .income-tag,
      .expense-tag,
      .diff-tag {
        font-size: 0.5rem;
        padding: 0 3px;
      }

      .diff-tag {
        min-width: 28px;
      }

      .period-content {
        padding: 0 6px 4px 6px;
      }

      .chart-section {
        padding: 4px 6px;
        border-radius: 6px;
        margin-bottom: 4px;
      }

      .chart-wrapper {
        max-height: 160px;
      }

      .transactions-section {
        padding: 4px 6px;
        border-radius: 6px;
      }

      .section-header {
        margin-bottom: 3px;
        padding-bottom: 3px;
      }

      .section-title {
        font-size: 0.65rem;
      }

      .mobile-item {
        padding: 3px 4px;
      }

      .mobile-provider {
        font-size: 0.6rem;
      }

      .mobile-amount {
        font-size: 0.65rem;
      }
    }

    @media (max-width: 480px) {
      .header-section {
        padding: 2px 4px 0 4px;
      }

      .content-area {
        padding: 2px 4px 4px 4px;
      }

      .period-header {
        padding: 2px 4px;
        min-height: 24px;
        flex-wrap: wrap;
      }

      .header-left {
        width: 100%;
      }

      .header-right {
        width: 100%;
        justify-content: flex-start;
      }

      .header-title {
        font-size: 0.6rem;
      }

      .header-count {
        font-size: 0.45rem;
        padding: 0 3px;
      }

      .income-tag,
      .expense-tag,
      .diff-tag {
        font-size: 0.45rem;
        padding: 0 3px;
        line-height: 1.4;
      }

      .diff-tag {
        min-width: 24px;
      }

      .period-content {
        padding: 0 4px 3px 4px;
      }

      .chart-section {
        padding: 3px 4px;
        border-radius: 4px;
        margin-bottom: 3px;
      }

      .chart-wrapper {
        max-height: 120px;
      }

      .transactions-section {
        padding: 3px 4px;
        border-radius: 4px;
      }

      .section-title {
        font-size: 0.6rem;
      }

      .section-badge {
        font-size: 0.45rem;
        padding: 0 4px;
      }

      .mobile-item {
        padding: 2px 3px;
        border-radius: 4px;
      }

      .mobile-provider {
        font-size: 0.55rem;
      }

      .mobile-count {
        font-size: 0.45rem;
        padding: 0 3px;
      }

      .category-chip {
        font-size: 0.45rem;
        padding: 0 4px;
      }

      .mobile-amount {
        font-size: 0.6rem;
      }

      .mobile-date {
        font-size: 0.5rem;
      }

      .mobile-row {
        padding: 0.5px 0;
      }

      .progress-bar {
        height: 12px;
      }

      .progress-label {
        font-size: 0.4rem;
        padding: 0 2px;
      }

      .empty-state {
        padding: 4px;
        font-size: 0.55rem;
      }

      .empty-state-large {
        padding: 12px;
        font-size: 0.65rem;
      }

      .expand-icon {
        font-size: 0.5rem;
      }
    }

    /* ===== REDUCED MOTION ===== */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `,
})
export class MostCommonTransactionComponent {
  transactions = input<TransactionDomain[]>([]);
  viewMode = input<'all' | 'monthly' | 'yearly' | 'salary'>('monthly');

  selectedCategory = signal<TransactionCategory | null>(null);

  selectedTransaction = computed(() =>
    this.transactions().filter(
      (t) =>
        this.selectedCategory() === null ||
        t.category === this.selectedCategory(),
    ),
  );

  private expandedPeriodId = signal<string | null>(null);

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
    return `${day} ${month}`;
  }

  currentPeriods = computed((): PeriodGroup[] => {
    if (this.viewMode() === 'monthly') {
      return this.groupedByMonth();
    } else if (this.viewMode() === 'yearly') {
      return this.groupedByYear();
    } else if (this.viewMode() === 'salary') {
      return this.groupedBySalaryPeriod();
    }
    return [];
  });

  getAllGroupedTransactions = computed((): GroupedTransaction[] => {
    if (this.viewMode() !== 'all') return [];

    const txs = this.selectedTransaction();
    if (!txs?.length) return [];

    const grouped = this.groupLocal(txs);

    const totalIncome = txs
      .filter((t) => (t.amount ?? 0) > 0)
      .reduce((s, t) => s + (t.amount ?? 0), 0);

    const totalExpense = Math.abs(
      txs
        .filter((t) => (t.amount ?? 0) < 0)
        .reduce((s, t) => s + (t.amount ?? 0), 0),
    );

    return grouped
      .map((g) => ({
        ...g,
        percentageOfIncome:
          g.total > 0 && totalIncome > 0 ? (g.total / totalIncome) * 100 : 0,
        percentageOfExpense:
          g.total < 0 && totalExpense > 0
            ? (Math.abs(g.total) / totalExpense) * 100
            : 0,
      }))
      .sort((a, b) => {
        const aIsIncome = a.total > 0;
        const bIsIncome = b.total > 0;

        if (aIsIncome && bIsIncome) {
          return b.percentageOfIncome - a.percentageOfIncome;
        }

        if (!aIsIncome && !bIsIncome) {
          return b.percentageOfExpense - a.percentageOfExpense;
        }

        if (aIsIncome && !bIsIncome) {
          return -1;
        }

        return 1;
      });
  });

  private groupedByMonth = computed((): PeriodGroup[] => {
    const txs = this.selectedTransaction();
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
    const txs = this.selectedTransaction();
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

  private groupedBySalaryPeriod = computed((): PeriodGroup[] => {
    const txs = this.selectedTransaction();
    if (!txs?.length) return [];

    const map = new Map<string, TransactionDomain[]>();

    for (const tx of txs) {
      const date = tx.completionDate || tx.registrationDate;
      if (!date) continue;

      const periodKey = this.getSalaryPeriodKey(date);
      if (!map.has(periodKey)) map.set(periodKey, []);
      map.get(periodKey)!.push(tx);
    }

    return Array.from(map.entries())
      .map(([key, txs]) => {
        const [year, month, day] = key.split('-').map(Number);
        const periodStart = new Date(year, month, day);
        const periodEnd = new Date(year, month, day + 14);

        const monthName = new Date(year, month).toLocaleString('default', {
          month: 'short',
        });
        const id = `salary-${key}`;

        const processedData = this.processTransactions(txs);

        return {
          id,
          title: `${monthName} ${year}`,
          year,
          monthIndex: month,
          month: monthName,
          salaryPeriodStart: periodStart,
          salaryPeriodEnd: periodEnd,
          isSalaryPeriod: true,
          ...processedData,
          isExpanded: this.expandedPeriodId() === id,
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.monthIndex! - a.monthIndex!;
      });
  });

  private getSalaryPeriodKey(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    if (day >= 15) {
      return `${year}-${month}-15`;
    } else {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      return `${prevYear}-${prevMonth}-15`;
    }
  }

  private processTransactions(txs: TransactionDomain[]) {
    const grouped = this.groupLocal(txs);

    const totalIncome = txs
      .filter((t) => (t.amount ?? 0) > 0)
      .reduce((s, t) => s + (t.amount ?? 0), 0);

    const totalExpense = Math.abs(
      txs
        .filter((t) => (t.amount ?? 0) < 0)
        .reduce((s, t) => s + (t.amount ?? 0), 0),
    );

    const groupsWithPercentages = grouped.map((g) => ({
      ...g,
      percentageOfIncome:
        g.total > 0 && totalIncome > 0 ? (g.total / totalIncome) * 100 : 0,
      percentageOfExpense:
        g.total < 0 && totalExpense > 0
          ? (Math.abs(g.total) / totalExpense) * 100
          : 0,
    }));

    const sortedGroups = groupsWithPercentages.sort((a, b) => {
      const aIsIncome = a.total > 0;
      const bIsIncome = b.total > 0;

      if (aIsIncome && bIsIncome) {
        return b.percentageOfIncome - a.percentageOfIncome;
      }

      if (!aIsIncome && !bIsIncome) {
        return b.percentageOfExpense - a.percentageOfExpense;
      }

      if (aIsIncome && !bIsIncome) {
        return -1;
      }

      return 1;
    });

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
      this.selectedTransaction()
        ?.filter((tx) => (tx.amount ?? 0) > 0)
        .reduce((s, tx) => s + (tx.amount ?? 0), 0) ?? 0,
  );

  totalExpense = computed(() =>
    Math.abs(
      this.selectedTransaction()
        ?.filter((tx) => (tx.amount ?? 0) < 0)
        .reduce((s, tx) => s + (tx.amount ?? 0), 0) ?? 0,
    ),
  );

  totalTransactions = computed(() => this.selectedTransaction()?.length ?? 0);

  private groupLocal(txs: TransactionDomain[]): GroupedTransaction[] {
    const map = new Map<string, GroupedTransaction>();

    for (const tx of txs) {
      const key = `${tx.category}-${tx.serviceProvider}`;
      const date = tx.completionDate || tx.registrationDate;

      if (!map.has(key)) {
        map.set(key, {
          provider: tx.serviceProvider,
          description: tx.description || '',
          count: 0,
          total: 0,
          currency: tx.currency,
          latestDate: null,
          dates: [],
          category: null,
          percentageOfTotal: 0,
          percentageOfIncome: 0,
          percentageOfExpense: 0,
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

  onSelectCategory(category: TransactionCategory) {
    if (this.selectedCategory() === null) {
      this.selectedCategory.set(category);
    } else {
      this.selectedCategory.set(null);
    }
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
