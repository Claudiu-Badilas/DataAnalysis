import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  input,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
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
              <!-- Chart Section - Hidden on mobile -->
              @if (selectedCategory() === null) {
                <div class="chart-section desktop-only">
                  <p-highcharts-wrapper
                    class="chart-wrapper"
                    [chartOptions]="updateBarChart(selectedTransaction())"
                  />
                </div>
              }

              <!-- Transactions List -->
              <div class="transactions-section">
                <div class="section-header">
                  <span class="section-title">Top</span>
                  <span class="section-badge">{{
                    getAllGroupedTransactions().length
                  }}</span>
                </div>

                <!-- Transactions Grid -->
                <div class="transactions-grid">
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
                          <span class="tx-count">{{ item.count }}</span>
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
                        <div class="amount-group">
                          <span
                            class="amount-text"
                            [class.positive]="item.total > 0"
                            [class.negative]="item.total < 0"
                          >
                            {{ item.total | numberFormat: '0.00' }}
                          </span>
                          @if (item.total > 0 && totalIncome() > 0) {
                            <span class="percentage-badge income-badge">
                              {{
                                item.percentageOfIncome | numberFormat: '0.0'
                              }}%
                            </span>
                          } @else if (item.total < 0 && totalExpense() > 0) {
                            <span class="percentage-badge expense-badge">
                              {{
                                item.percentageOfExpense | numberFormat: '0.0'
                              }}%
                            </span>
                          }
                        </div>
                      </div>
                    </div>
                  }

                  @if (!getAllGroupedTransactions().length) {
                    <div class="empty-state">No transactions</div>
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
                      <span class="header-count">{{
                        period.transactionCount
                      }}</span>
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
                      <!-- Chart Section - Hidden on mobile -->
                      @if (selectedCategory() === null) {
                        <div class="chart-section compact-chart desktop-only">
                          <p-highcharts-wrapper
                            class="chart-wrapper"
                            [chartOptions]="updateBarChart(period.transactions)"
                          />
                        </div>
                      }

                      <div class="transactions-section compact">
                        <!-- Transactions Grid -->
                        <div class="transactions-grid">
                          @for (item of period.multiple; track item.provider) {
                            <div class="transaction-card highlight-card">
                              <div class="card-row">
                                <div
                                  class="category-pill"
                                  (click)="onSelectCategory(item.category)"
                                  [style.background]="
                                    getCategoryColor(item.category)
                                  "
                                >
                                  {{ getCategoryLabel(item.category) }}
                                </div>
                                <div class="provider-group">
                                  <span class="tx-count">{{ item.count }}</span>
                                </div>
                                <div class="amount-group">
                                  <span
                                    class="amount-text"
                                    [class.positive]="item.total > 0"
                                    [class.negative]="item.total < 0"
                                  >
                                    {{ item.total | numberFormat: '0.00' }}
                                  </span>
                                  @if (
                                    item.total > 0 && period.totalIncome > 0
                                  ) {
                                    <span class="percentage-badge income-badge">
                                      {{
                                        item.percentageOfIncome
                                          | numberFormat: '0.0'
                                      }}%
                                    </span>
                                  } @else if (
                                    item.total < 0 && period.totalExpense > 0
                                  ) {
                                    <span
                                      class="percentage-badge expense-badge"
                                    >
                                      {{
                                        item.percentageOfExpense
                                          | numberFormat: '0.0'
                                      }}%
                                    </span>
                                  }
                                </div>
                              </div>
                            </div>
                          }

                          @if (!period.multiple.length) {
                            <div class="empty-state">No transactions</div>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }

              @if (!currentPeriods().length) {
                <div class="empty-state-large">No data</div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: `
    /* ===== CONTAINER ===== */
    .dashboard-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .header-section {
      flex-shrink: 0;
      padding: 4px 12px 0 12px;
    }

    .content-area {
      flex: 1;
      overflow: hidden;
      padding: 4px 12px 8px 12px;
      min-height: 0;
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
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      overflow: hidden;
    }

    .chart-section.compact-chart {
      padding: 4px 6px;
      margin-bottom: 4px;
    }

    /* Hide chart on mobile */
    .desktop-only {
      display: block;
    }

    /* Chart wrapper */
    .chart-wrapper {
      width: 100%;
      height: 300px;
      display: block;
      min-height: 200px;
    }

    .chart-wrapper ::ng-deep .highcharts-container {
      width: 100% !important;
      height: 100% !important;
    }

    /* Compact chart height */
    .chart-section.compact-chart .chart-wrapper {
      height: 240px;
      min-height: 160px;
    }

    /* ===== RESPONSIVE CHART HEIGHTS ===== */
    @media (max-width: 1024px) {
      .chart-wrapper {
        height: 260px;
        min-height: 180px;
      }
      .chart-section.compact-chart .chart-wrapper {
        height: 210px;
        min-height: 150px;
      }
    }

    @media (max-width: 768px) {
      /* Hide chart on tablets and smaller */
      .desktop-only {
        display: none !important;
      }

      .chart-wrapper {
        height: 220px;
        min-height: 150px;
      }
      .chart-section.compact-chart .chart-wrapper {
        height: 180px;
        min-height: 130px;
      }
    }

    @media (max-width: 480px) {
      /* Hide chart on mobile */
      .desktop-only {
        display: none !important;
      }

      .chart-wrapper {
        height: 180px;
        min-height: 120px;
      }
      .chart-section.compact-chart .chart-wrapper {
        height: 150px;
        min-height: 100px;
      }
    }

    @media (max-width: 380px) {
      .chart-wrapper {
        height: 150px;
        min-height: 100px;
      }
      .chart-section.compact-chart .chart-wrapper {
        height: 130px;
        min-height: 90px;
      }
    }

    /* ===== TRANSACTIONS SECTION ===== */
    .transactions-section {
      background: white;
      border-radius: 8px;
      padding: 6px 8px;
      border: 1px solid #f0f2f5;
      flex-shrink: 0;
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
      font-size: 0.85rem;
      font-weight: 600;
      color: #1a1a2e;
    }

    .section-badge {
      font-size: 0.7rem;
      font-weight: 500;
      color: #6b6b8d;
      background: #f0f2f5;
      padding: 0 8px;
      border-radius: 8px;
      line-height: 1.8;
    }

    /* ===== TRANSACTION CARDS ===== */
    .transactions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 4px;
    }

    .transaction-card {
      background: #fafbfc;
      border-radius: 6px;
      padding: 5px;
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
      padding: 2px 0;
    }

    .card-row.middle {
      border-top: 1px solid #eef0f3;
      padding: 4px 0;
      margin: 2px 0 0 0;
    }

    .provider-group {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
      min-width: 0;
    }

    .provider-name {
      font-weight: 500;
      font-size: 0.85rem;
      color: #1a1a2e;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tx-count {
      font-size: 0.6rem;
      color: #8b8baa;
      background: #eef0f3;
      padding: 0 6px;
      border-radius: 6px;
      flex-shrink: 0;
      line-height: 1.6;
    }

    .category-pill {
      flex-shrink: 0;
      padding: 0 8px;
      border-radius: 8px;
      color: white;
      font-size: 0.7rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      user-select: none;
      line-height: 1.8;
    }

    .category-pill:hover {
      transform: scale(1.05);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
    }

    .category-pill:active {
      transform: scale(0.92);
    }

    .date-text {
      font-size: 0.75rem;
      color: #6b6b8d;
      font-weight: 500;
    }

    .amount-group {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .amount-text {
      font-size: 0.95rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    .amount-text.positive {
      color: #0caa6c;
    }
    .amount-text.negative {
      color: #e74c5e;
    }

    .percentage-badge {
      font-size: 0.6rem;
      font-weight: 600;
      padding: 1px 6px;
      border-radius: 4px;
      white-space: nowrap;
    }

    .income-badge {
      background: #ecfdf5;
      color: #0caa6c;
    }

    .expense-badge {
      background: #fef2f2;
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
      padding: 6px 10px;
      cursor: pointer;
      transition: background 0.15s ease;
      gap: 6px;
      min-height: 36px;
      flex-wrap: nowrap;
    }

    .period-header:hover {
      background: #fafbfc;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
      min-width: 0;
      flex-wrap: nowrap;
    }

    .header-title {
      font-weight: 600;
      font-size: 0.95rem;
      color: #1a1a2e;
      white-space: nowrap;
    }

    .header-count {
      font-size: 0.7rem;
      color: #6b6b8d;
      background: #f0f2f5;
      padding: 0 8px;
      border-radius: 6px;
      line-height: 1.6;
      flex-shrink: 0;
    }

    .salary-tag {
      font-size: 0.75rem;
      flex-shrink: 0;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
      flex-wrap: nowrap;
    }

    .income-tag,
    .expense-tag,
    .diff-tag {
      padding: 0 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
      line-height: 1.8;
      flex-shrink: 0;
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
      min-width: 40px;
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
      font-size: 0.75rem;
      color: #9ca3af;
      transition: transform 0.2s ease;
      margin-left: 4px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .period-content {
      padding: 0 10px 8px 10px;
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
      padding: 12px;
      color: #8b8baa;
      font-size: 0.85rem;
    }

    .empty-state-large {
      text-align: center;
      padding: 24px;
      color: #8b8baa;
      font-size: 0.95rem;
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 1024px) {
      .transactions-grid {
        grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
        gap: 4px;
      }

      .provider-name {
        font-size: 0.8rem;
      }

      .amount-text {
        font-size: 0.85rem;
      }

      .category-pill {
        font-size: 0.65rem;
      }

      .percentage-badge {
        font-size: 0.55rem;
        padding: 1px 5px;
      }
    }

    @media (max-width: 768px) {
      .header-section {
        padding: 4px 10px 0 10px;
      }

      .content-area {
        padding: 4px 10px 6px 10px;
      }

      /* Mobile: 2 cards per row on tablets */
      .transactions-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 4px;
      }

      .period-header {
        padding: 6px 10px;
        min-height: 32px;
        flex-wrap: nowrap;
      }

      .header-title {
        font-size: 0.85rem;
      }

      .header-count {
        font-size: 0.65rem;
        padding: 0 6px;
      }

      .income-tag,
      .expense-tag,
      .diff-tag {
        font-size: 0.7rem;
        padding: 0 6px;
      }

      .diff-tag {
        min-width: 34px;
      }

      .period-content {
        padding: 0 10px 6px 10px;
      }

      .chart-section {
        padding: 4px 6px;
        border-radius: 6px;
        margin-bottom: 4px;
      }

      .transactions-section {
        padding: 4px 6px;
        border-radius: 6px;
      }

      .section-header {
        margin-bottom: 4px;
        padding-bottom: 4px;
      }

      .section-title {
        font-size: 0.8rem;
      }

      .section-badge {
        font-size: 0.65rem;
        padding: 0 6px;
        line-height: 1.6;
      }

      .transaction-card {
        padding: 4px 6px;
      }

      .provider-name {
        font-size: 0.75rem;
      }

      .amount-text {
        font-size: 0.8rem;
      }

      .date-text {
        font-size: 0.65rem;
      }

      .category-pill {
        font-size: 0.6rem;
        padding: 0 6px;
        line-height: 1.6;
      }

      .tx-count {
        font-size: 0.55rem;
        padding: 0 4px;
      }

      .percentage-badge {
        font-size: 0.5rem;
        padding: 0 4px;
      }

      .card-row {
        padding: 1px 0;
      }

      .card-row.middle {
        padding: 3px 0;
        margin: 1px 0 0 0;
      }

      .amount-group {
        gap: 4px;
      }

      .expand-icon {
        font-size: 0.7rem;
      }
    }

    @media (max-width: 480px) {
      .header-section {
        padding: 2px 6px 0 6px;
      }

      .content-area {
        padding: 2px 6px 4px 6px;
      }

      /* Mobile: 1 card per row on phones */
      .transactions-grid {
        grid-template-columns: 1fr;
        gap: 4px;
      }

      .period-header {
        padding: 4px 8px;
        min-height: 28px;
        flex-wrap: nowrap;
        gap: 4px;
      }

      .header-left {
        flex: 1;
        min-width: 0;
        gap: 4px;
        flex-wrap: nowrap;
      }

      .header-right {
        flex: 0 0 auto;
        width: auto;
        justify-content: flex-end;
        gap: 3px;
        flex-wrap: nowrap;
      }

      .header-title {
        font-size: 0.7rem;
        white-space: nowrap;
      }

      .header-count {
        font-size: 0.55rem;
        padding: 0 4px;
        flex-shrink: 0;
      }

      .income-tag,
      .expense-tag,
      .diff-tag {
        font-size: 0.6rem;
        padding: 0 4px;
        line-height: 1.4;
        flex-shrink: 0;
      }

      .diff-tag {
        min-width: 24px;
      }

      .expand-icon {
        font-size: 0.65rem;
        flex-shrink: 0;
      }

      .salary-tag {
        font-size: 0.55rem;
        flex-shrink: 0;
      }

      .period-content {
        padding: 0 6px 4px 6px;
      }

      .chart-section {
        padding: 3px 4px;
        border-radius: 4px;
        margin-bottom: 3px;
      }

      .transactions-section {
        padding: 3px 4px;
        border-radius: 4px;
      }

      .section-title {
        font-size: 0.7rem;
      }

      .section-badge {
        font-size: 0.55rem;
        padding: 0 4px;
      }

      .transaction-card {
        padding: 6px 8px;
        border-radius: 6px;
      }

      .provider-name {
        font-size: 0.8rem;
      }

      .tx-count {
        font-size: 0.55rem;
        padding: 0 5px;
      }

      .category-pill {
        font-size: 0.6rem;
        padding: 0 8px;
        line-height: 1.8;
        border-radius: 8px;
      }

      .amount-text {
        font-size: 0.85rem;
      }

      .date-text {
        font-size: 0.65rem;
      }

      .percentage-badge {
        font-size: 0.5rem;
        padding: 1px 5px;
        border-radius: 4px;
      }

      .card-row {
        padding: 2px 0;
      }

      .card-row.middle {
        padding: 4px 0;
        margin: 2px 0 0 0;
      }

      .amount-group {
        gap: 5px;
      }

      .empty-state {
        padding: 8px;
        font-size: 0.75rem;
      }

      .empty-state-large {
        padding: 16px;
        font-size: 0.8rem;
      }
    }

    @media (max-width: 380px) {
      .transactions-grid {
        grid-template-columns: 1fr;
        gap: 3px;
      }

      .period-header {
        padding: 3px 6px;
        min-height: 24px;
        gap: 2px;
      }

      .header-title {
        font-size: 0.6rem;
      }

      .header-count {
        font-size: 0.5rem;
        padding: 0 3px;
      }

      .income-tag,
      .expense-tag,
      .diff-tag {
        font-size: 0.5rem;
        padding: 0 3px;
        line-height: 1.2;
      }

      .diff-tag {
        min-width: 20px;
      }

      .expand-icon {
        font-size: 0.6rem;
      }

      .salary-tag {
        font-size: 0.5rem;
      }

      .transaction-card {
        padding: 5px 6px;
      }

      .provider-name {
        font-size: 0.75rem;
      }

      .amount-text {
        font-size: 0.8rem;
      }

      .category-pill {
        font-size: 0.55rem;
        padding: 0 6px;
      }

      .percentage-badge {
        font-size: 0.45rem;
        padding: 0 4px;
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

    // Add percentages
    const groupedWithPercentages = grouped.map((g) => ({
      ...g,
      percentageOfIncome:
        g.total > 0 && totalIncome > 0 ? (g.total / totalIncome) * 100 : 0,
      percentageOfExpense:
        g.total < 0 && totalExpense > 0
          ? (Math.abs(g.total) / totalExpense) * 100
          : 0,
    }));

    // NEW SORTING LOGIC: Income first, then expenses by category with highest expense
    return this.sortGroupedTransactions(groupedWithPercentages);
  });

  /**
   * Sorting logic:
   * 1. Income transactions (positive total) always first
   * 2. Then expenses (negative total) sorted by:
   *    a. Category with highest total expense first
   *    b. Within same category, sorted by amount descending
   */
  private sortGroupedTransactions(
    transactions: GroupedTransaction[],
  ): GroupedTransaction[] {
    // Separate income and expenses
    const incomeItems = transactions.filter((t) => t.total > 0);
    const expenseItems = transactions.filter((t) => t.total < 0);

    // Sort income items by amount descending
    const sortedIncome = incomeItems.sort((a, b) => b.total - a.total);

    // Group expenses by category
    const expenseMap = new Map<TransactionCategory, GroupedTransaction[]>();
    expenseItems.forEach((item) => {
      if (!expenseMap.has(item.category)) {
        expenseMap.set(item.category, []);
      }
      expenseMap.get(item.category)!.push(item);
    });

    // Sort categories by total expense amount (descending)
    const sortedCategories = Array.from(expenseMap.entries()).sort((a, b) => {
      const totalA = a[1].reduce((sum, item) => sum + Math.abs(item.total), 0);
      const totalB = b[1].reduce((sum, item) => sum + Math.abs(item.total), 0);
      return totalB - totalA;
    });

    // For each category, sort items by amount descending
    const sortedExpenses: GroupedTransaction[] = [];
    sortedCategories.forEach(([category, items]) => {
      const sortedItems = items.sort(
        (a, b) => Math.abs(b.total) - Math.abs(a.total),
      );
      sortedExpenses.push(...sortedItems);
    });

    // Return income first, then expenses
    return [...sortedIncome, ...sortedExpenses];
  }

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

    // Apply the same sorting logic
    const sortedGroups = this.sortGroupedTransactions(groupsWithPercentages);

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
      const key = tx.category;
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
