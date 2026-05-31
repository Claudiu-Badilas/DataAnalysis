import {
  Component,
  OnInit,
  OnChanges,
  Input,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  TransactionCategory,
  TransactionDomain,
} from 'src/app/modules/transaction/models/transactions.model';
import * as Highcharts from 'highcharts';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';

@Component({
  selector: 'p-transaction-insights-body',
  imports: [CommonModule, FormsModule, HighchartWrapperComponent],
  providers: [NumberFormatPipe],
  template: `
    <div class="dashboard-container">
      <!-- Loading State -->
      <div
        *ngIf="!transactions || transactions.length === 0"
        class="loading-state"
      >
        <div class="spinner"></div>
        <p>Loading transactions...</p>
      </div>

      <!-- Dashboard Content -->
      <div *ngIf="transactions && transactions.length > 0">
        <!-- Insights Summary -->
        <div class="insights-card">
          <div class="insights-list">
            <div *ngFor="let insight of insights" class="insight-item">
              <span class="insight-icon">{{ insight.icon }}</span>
              <span class="insight-text">{{ insight.text }}</span>
            </div>
          </div>
        </div>

        <!-- Key Metrics -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">💰</div>
            <div class="metric-value">
              {{ totalIncome | currency: 'RON' : 'symbol' : '1.0-0' }}
            </div>
            <div class="metric-label">Total Income</div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">💸</div>
            <div class="metric-value">
              {{ totalExpenses | currency: 'RON' : 'symbol' : '1.0-0' }}
            </div>
            <div class="metric-label">Total Expenses</div>
          </div>
          <div
            class="metric-card"
            [class.positive]="savings >= 0"
            [class.negative]="savings < 0"
          >
            <div class="metric-icon">{{ savings >= 0 ? '📈' : '📉' }}</div>
            <div class="metric-value">
              {{ savings | currency: 'RON' : 'symbol' : '1.0-0' }}
            </div>
            <div class="metric-label">Net Savings</div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-value">
              {{ dailyAverage | currency: 'RON' : 'symbol' : '1.0-0' }}
            </div>
            <div class="metric-label">Daily Average</div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🏦</div>
            <div class="metric-value">{{ transactionsCount }}</div>
            <div class="metric-label">Transactions</div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🎯</div>
            <div class="metric-value">{{ savingsRate | number: '1.0-0' }}%</div>
            <div class="metric-label">Savings Rate</div>
          </div>
        </div>

        <!-- Spending by Category Chart -->
        <div class="chart-card">
          <p-highcharts-wrapper
            class="chart-wrapper"
            [chartOptions]="pieChartOptions"
          >
            <ng-container p-highcharts-wrapper-content>
              <div
                class="m-2 d-flex align-items-center justify-content-between"
              >
                <div class="title">Spending by Category</div>
              </div>
            </ng-container>
          </p-highcharts-wrapper>
        </div>

        <!-- Top Merchants -->
        <div class="merchants-card">
          <h3>🏪 Top 10 Merchants by Spend</h3>
          <div class="merchants-list">
            <div
              *ngFor="let merchant of topMerchants; let i = index"
              class="merchant-item"
            >
              <div class="merchant-rank">{{ i + 1 }}</div>
              <div class="merchant-name">{{ merchant.merchant }}</div>
              <div class="merchant-stats">
                <span class="merchant-count"
                  >{{ merchant.count }} transactions</span
                >
                <span class="merchant-total">{{
                  merchant.total | currency: 'RON' : 'symbol' : '1.0-0'
                }}</span>
              </div>
              <div class="merchant-bar">
                <div
                  class="merchant-bar-fill"
                  [style.width.%]="
                    (merchant.total / topMerchants[0].total) * 100
                  "
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Transactions Table with Category Selection -->
        <div class="transactions-table-card">
          <div class="table-header">
            <h3>📋 Transactions</h3>
            <div class="table-controls">
              <div class="search-box">
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  (input)="filterTransactions()"
                  placeholder="🔍 Search transactions..."
                  class="search-input"
                />
              </div>
              <div class="category-filter">
                <select
                  [(ngModel)]="selectedCategoryFilter"
                  (change)="filterTransactions()"
                  class="category-select"
                >
                  <option value="">All Categories</option>
                  <option *ngFor="let cat of categoryList" [value]="cat.value">
                    {{ cat.label }}
                  </option>
                </select>
              </div>
              <button
                (click)="saveCategoryChanges()"
                class="save-btn"
                [disabled]="!hasChanges"
              >
                💾 Save Changes
              </button>
            </div>
          </div>

          <div class="table-container">
            <table class="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="
                    let transaction of paginatedTransactions;
                    let i = index
                  "
                >
                  <td class="date-cell">
                    {{ transaction.completionDate | date: 'yyyy-MM-dd' }}
                  </td>
                  <td
                    class="description-cell"
                    [title]="transaction.description"
                  >
                    {{ truncateText(transaction.description || '', 60) }}
                  </td>
                  <td
                    class="amount-cell"
                    [class.positive]="(transaction.amount || 0) > 0"
                    [class.negative]="(transaction.amount || 0) < 0"
                  >
                    {{
                      transaction.amount || 0
                        | currency: 'RON' : 'symbol' : '1.2-2'
                    }}
                  </td>
                  <td class="category-cell">
                    <select
                      [(ngModel)]="transaction.category"
                      (change)="onCategoryChange(transaction, $event)"
                      class="category-edit-select"
                      [style.backgroundColor]="
                        getCategoryColor(transaction.category)
                      "
                    >
                      <option
                        *ngFor="let cat of categoryList"
                        [value]="cat.value"
                      >
                        {{ cat.label }}
                      </option>
                    </select>
                  </td>
                  <td class="actions-cell">
                    <button
                      (click)="updateTransactionCategory(transaction)"
                      class="update-btn"
                      [disabled]="!isCategoryChanged(transaction)"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="pagination">
            <button
              (click)="previousPage()"
              [disabled]="currentPage === 1"
              class="page-btn"
            >
              Previous
            </button>
            <span class="page-info">
              Page {{ currentPage }} of {{ totalPages }} ({{
                filteredTransactions.length
              }}
              transactions)
            </span>
            <button
              (click)="nextPage()"
              [disabled]="currentPage === totalPages"
              class="page-btn"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 20px;
        background: #f5f7fa;
        min-height: 100vh;
        font-family:
          -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
          sans-serif;
      }

      .loading-state {
        text-align: center;
        padding: 60px 20px;
      }

      .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #6c5ce7;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }

      .metric-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;
      }

      .metric-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      .metric-icon {
        font-size: 32px;
        margin-bottom: 12px;
      }

      .metric-value {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 8px;
      }

      .metric-label {
        color: #666;
        font-size: 14px;
      }

      .metric-card.positive .metric-value {
        color: #00b894;
      }

      .metric-card.negative .metric-value {
        color: #d63031;
      }

      .chart-card {
        margin-bottom: 30px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .chart-wrapper {
        width: 100%;
        min-height: 400px;
      }

      .merchants-card,
      .transactions-table-card,
      .insights-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .merchants-card h3,
      .transactions-table-card h3,
      .insights-card h3 {
        margin: 0 0 20px 0;
        color: #2d3436;
      }

      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 16px;
      }

      .table-controls {
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
      }

      .search-box {
        flex: 1;
        min-width: 200px;
      }

      .search-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        transition: border-color 0.2s;
      }

      .search-input:focus {
        outline: none;
        border-color: #6c5ce7;
      }

      .category-select {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        background: white;
        cursor: pointer;
        min-width: 150px;
      }

      .save-btn {
        padding: 8px 16px;
        background: #00b894;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }

      .save-btn:hover:not(:disabled) {
        background: #019874;
        transform: translateY(-2px);
      }

      .save-btn:disabled {
        background: #bdbdbd;
        cursor: not-allowed;
      }

      .table-container {
        overflow-x: auto;
        border-radius: 8px;
        border: 1px solid #eee;
      }

      .transactions-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
      }

      .transactions-table th {
        background: #f8f9fa;
        padding: 12px;
        text-align: left;
        font-weight: 600;
        color: #2d3436;
        border-bottom: 2px solid #eee;
      }

      .transactions-table td {
        padding: 12px;
        border-bottom: 1px solid #eee;
        vertical-align: middle;
      }

      .transactions-table tr:hover {
        background: #f8f9fa;
      }

      .date-cell {
        white-space: nowrap;
        color: #666;
        font-size: 12px;
      }

      .description-cell {
        max-width: 300px;
        word-break: break-word;
        color: #2d3436;
      }

      .amount-cell {
        font-weight: 600;
        white-space: nowrap;
      }

      .amount-cell.positive {
        color: #00b894;
      }

      .amount-cell.negative {
        color: #d63031;
      }

      .category-cell {
        min-width: 180px;
      }

      .category-edit-select {
        padding: 6px 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        color: white;
        font-weight: 500;
        transition: all 0.2s;
      }

      .category-edit-select:focus {
        outline: none;
        border-color: #6c5ce7;
        box-shadow: 0 0 0 2px rgba(108, 92, 231, 0.2);
      }

      .actions-cell {
        white-space: nowrap;
      }

      .update-btn {
        padding: 4px 12px;
        background: #6c5ce7;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
      }

      .update-btn:hover:not(:disabled) {
        background: #5b4bc4;
        transform: translateY(-1px);
      }

      .update-btn:disabled {
        background: #bdbdbd;
        cursor: not-allowed;
      }

      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 16px;
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid #eee;
      }

      .page-btn {
        padding: 6px 12px;
        background: #6c5ce7;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .page-btn:hover:not(:disabled) {
        background: #5b4bc4;
        transform: translateY(-1px);
      }

      .page-btn:disabled {
        background: #bdbdbd;
        cursor: not-allowed;
      }

      .page-info {
        color: #666;
        font-size: 14px;
      }

      .merchants-list {
        max-height: 400px;
        overflow-y: auto;
      }

      .merchant-item {
        padding: 12px;
        border-bottom: 1px solid #eee;
        position: relative;
      }

      .merchant-rank {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        font-weight: bold;
        color: #6c5ce7;
        font-size: 14px;
      }

      .merchant-name {
        margin-left: 40px;
        font-weight: 500;
        margin-bottom: 4px;
      }

      .merchant-stats {
        margin-left: 40px;
        font-size: 12px;
        color: #666;
      }

      .merchant-count {
        margin-right: 12px;
      }

      .merchant-total {
        font-weight: 500;
        color: #2d3436;
      }

      .merchant-bar {
        margin-top: 8px;
        margin-left: 40px;
        height: 4px;
        background: #eee;
        border-radius: 2px;
        overflow: hidden;
      }

      .merchant-bar-fill {
        height: 100%;
        background: #6c5ce7;
        transition: width 0.3s;
      }

      .insights-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;
      }

      .insight-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
        transition: transform 0.2s;
      }

      .insight-item:hover {
        transform: translateX(4px);
      }

      .insight-icon {
        font-size: 24px;
      }

      .insight-text {
        flex: 1;
        font-size: 14px;
        color: #2d3436;
        line-height: 1.4;
      }

      @media (max-width: 768px) {
        .dashboard-container {
          padding: 12px;
        }

        .metrics-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .table-header {
          flex-direction: column;
          align-items: stretch;
        }

        .table-controls {
          flex-direction: column;
        }

        .description-cell {
          max-width: 150px;
        }

        .category-cell {
          min-width: 140px;
        }
      }
    `,
  ],
})
export class TransactionInsightsBodyComponent implements OnInit, OnChanges {
  @Input() transactions: TransactionDomain[] = [];
  @Input() isLoading: boolean = false;
  @Input() onCategoryUpdate?: (
    transaction: TransactionDomain,
    newCategory: TransactionCategory,
  ) => void;

  private numberFormatPipe = inject(NumberFormatPipe);

  filteredTransactions: TransactionDomain[] = [];
  paginatedTransactions: TransactionDomain[] = [];

  // Search and filter
  searchTerm: string = '';
  selectedCategoryFilter: string = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 20;
  totalPages: number = 1;

  // Category tracking
  categoryChanges: Map<number, TransactionCategory> = new Map();

  // Metrics
  totalIncome = 0;
  totalExpenses = 0;
  savings = 0;
  dailyAverage = 0;
  transactionsCount = 0;
  savingsRate = 0;

  // Chart options
  pieChartOptions: Highcharts.Options = {};

  // Data
  topMerchants: any[] = [];
  insights: any[] = [];

  // Category list for dropdown
  categoryList: { value: TransactionCategory; label: string }[] = [];

  constructor() {
    this.initializeCategoryList();
  }

  ngOnInit() {
    this.processTransactions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['transactions']) {
      this.processTransactions();
    }
  }

  private initializeCategoryList() {
    this.categoryList = Object.values(TransactionCategory).map((cat) => ({
      value: cat,
      label: this.getCategoryLabel(cat),
    }));
  }

  private processTransactions() {
    if (this.transactions && this.transactions.length > 0) {
      this.filteredTransactions = [...this.transactions];
      // this.applyFilters();
      this.calculateMetrics();
      this.updateCharts();
      this.updatePagination();
    }
  }

  filterTransactions() {
    let filtered = [...this.transactions];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description?.toLowerCase().includes(term) ||
          t.serviceProvider?.toLowerCase().includes(term),
      );
    }

    // Apply category filter
    if (this.selectedCategoryFilter) {
      filtered = filtered.filter(
        (t) => t.category === this.selectedCategoryFilter,
      );
    }

    this.filteredTransactions = filtered;
    this.currentPage = 1;
    this.updatePagination();
    this.calculateMetrics();
    this.updateCharts();
  }

  private updatePagination() {
    this.totalPages = Math.ceil(
      this.filteredTransactions.length / this.pageSize,
    );
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedTransactions = this.filteredTransactions.slice(start, end);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  onCategoryChange(transaction: TransactionDomain, event: any) {
    const newCategory = event.target.value as TransactionCategory;
    this.categoryChanges.set(transaction.id!, newCategory);
  }

  isCategoryChanged(transaction: TransactionDomain): boolean {
    return this.categoryChanges.has(transaction.id!);
  }

  updateTransactionCategory(transaction: TransactionDomain) {
    const newCategory = this.categoryChanges.get(transaction.id!);
    if (newCategory && this.onCategoryUpdate) {
      this.onCategoryUpdate(transaction, newCategory);
      this.categoryChanges.delete(transaction.id!);

      // Update local transaction category
      transaction.category = newCategory;
      transaction.categoryLabel = this.getCategoryLabel(newCategory);

      // Refresh charts and metrics
      this.calculateMetrics();
      this.updateCharts();
    }
  }

  saveCategoryChanges() {
    for (const [transactionId, newCategory] of this.categoryChanges) {
      const transaction = this.transactions.find((t) => t.id === transactionId);
      if (transaction && this.onCategoryUpdate) {
        this.onCategoryUpdate(transaction, newCategory);
        transaction.category = newCategory;
        transaction.categoryLabel = this.getCategoryLabel(newCategory);
      }
    }
    this.categoryChanges.clear();
    this.calculateMetrics();
    this.updateCharts();
  }

  get hasChanges(): boolean {
    return this.categoryChanges.size > 0;
  }

  calculateMetrics() {
    this.totalIncome = this.filteredTransactions
      .filter(
        (t) =>
          t.amount &&
          t.amount > 0 &&
          t.category !== TransactionCategory.INTERNAL_TRANSFER,
      )
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    this.totalExpenses = this.filteredTransactions
      .filter(
        (t) =>
          t.amount &&
          t.amount < 0 &&
          t.category !== TransactionCategory.INTERNAL_TRANSFER,
      )
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

    this.savings = this.totalIncome - this.totalExpenses;
    this.transactionsCount = this.filteredTransactions.length;
    this.savingsRate =
      this.totalIncome > 0 ? (this.savings / this.totalIncome) * 100 : 0;

    const spendTransactions = this.filteredTransactions.filter(
      (t) => t.amount && t.amount < 0,
    );
    const uniqueDates = new Set(
      spendTransactions.map((t) => t.completionDate?.toDateString()),
    );
    this.dailyAverage =
      uniqueDates.size > 0 ? this.totalExpenses / uniqueDates.size : 0;
  }

  updateCharts() {
    this.updatePieChart();
    this.updateTopMerchants();
    this.updateInsights();
  }

  updatePieChart() {
    const categorySummary = this.getCategorySummary(this.filteredTransactions);
    const self = this;

    const pieData = categorySummary.map((item) => ({
      name: this.getCategoryLabel(item.category),
      y: item.total,
      color: this.getCategoryColor(item.category),
    }));

    this.pieChartOptions = {
      chart: {
        type: 'pie',
        backgroundColor: 'transparent',
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
      },
      title: {
        text: undefined,
      },
      tooltip: {
        formatter: function (this: any) {
          const percentage = this.percentage?.toFixed(1) || '0';
          const amount = this.y || 0;
          const formattedAmount = self.formatCurrency(amount);
          return `${this.series.name}: <b>${percentage}%</b><br/>Amount: <b>${formattedAmount}</b>`;
        },
      },
      accessibility: {
        point: {
          valueSuffix: '%',
        },
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f}%',
            style: {
              fontSize: '12px',
              fontWeight: 'normal',
            },
          },
          showInLegend: true,
          size: '70%',
        },
      },
      series: [
        {
          name: 'Spending',
          type: 'pie',
          data: pieData,
        },
      ],
      credits: {
        enabled: false,
      },
    };
  }

  getCategorySummary(transactions: TransactionDomain[]) {
    const summary = new Map<
      TransactionCategory,
      { count: number; total: number; percentage: number }
    >();
    const totalSpend = transactions
      .filter((t) => t.amount && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount!), 0);

    transactions.forEach((t) => {
      if (t.amount && t.amount < 0) {
        const category = t.category;
        const amount = Math.abs(t.amount);

        if (!summary.has(category)) {
          summary.set(category, { count: 0, total: 0, percentage: 0 });
        }

        const current = summary.get(category)!;
        current.count++;
        current.total += amount;
        current.percentage =
          totalSpend > 0 ? (current.total / totalSpend) * 100 : 0;
        summary.set(category, current);
      }
    });

    return Array.from(summary.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .map(([category, data]) => ({ category, ...data }));
  }

  updateTopMerchants() {
    const merchantMap = new Map<string, { count: number; total: number }>();

    this.filteredTransactions.forEach((t) => {
      if (t.amount && t.amount < 0 && t.serviceProvider) {
        const merchant = t.serviceProvider;
        const amount = Math.abs(t.amount);

        if (!merchantMap.has(merchant)) {
          merchantMap.set(merchant, { count: 0, total: 0 });
        }

        const current = merchantMap.get(merchant)!;
        current.count++;
        current.total += amount;
        merchantMap.set(merchant, current);
      }
    });

    this.topMerchants = Array.from(merchantMap.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10)
      .map(([merchant, data]) => ({ merchant, ...data }));
  }

  updateInsights() {
    this.insights = [];

    const categorySummary = this.getCategorySummary(this.filteredTransactions);
    const topCategory = categorySummary[0];

    if (topCategory) {
      const topCategoryLabel = this.getCategoryLabel(topCategory.category);
      const percentage = (
        (topCategory.total / this.totalExpenses) *
        100
      ).toFixed(1);
      this.insights.push({
        icon: '🎯',
        text: `Your biggest expense is ${topCategoryLabel} (${percentage}% of total spending)`,
      });
    }

    if (this.savingsRate > 20) {
      this.insights.push({
        icon: '🌟',
        text: `Great job! You're saving ${this.savingsRate.toFixed(0)}% of your income`,
      });
    } else if (this.savingsRate > 10) {
      this.insights.push({
        icon: '👍',
        text: `Good savings rate of ${this.savingsRate.toFixed(0)}%. Try to reach 20%`,
      });
    } else if (this.savingsRate > 0) {
      this.insights.push({
        icon: '⚠️',
        text: `Your savings rate is ${this.savingsRate.toFixed(0)}%. Consider reducing expenses`,
      });
    } else if (this.savingsRate < 0) {
      this.insights.push({
        icon: '🚨',
        text: `You're spending more than you earn! Review your expenses`,
      });
    }

    const topMerchant = this.topMerchants[0];
    if (topMerchant) {
      this.insights.push({
        icon: '🏪',
        text: `Most spent at: ${topMerchant.merchant} (${topMerchant.total.toFixed(0)} RON over ${topMerchant.count} transactions)`,
      });
    }

    if (this.dailyAverage > 0) {
      const monthlyProjection = this.dailyAverage * 30;
      if (monthlyProjection > this.totalIncome && this.totalIncome > 0) {
        this.insights.push({
          icon: '📊',
          text: `At current pace, you'll spend ~${monthlyProjection.toFixed(0)} RON/month, exceeding your income`,
        });
      } else {
        this.insights.push({
          icon: '📊',
          text: `Average daily spending: ${this.dailyAverage.toFixed(0)} RON (approx ${(this.dailyAverage * 30).toFixed(0)} RON/month)`,
        });
      }
    }
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  }

  formatCurrency(value: number): string {
    return this.numberFormatPipe.transform(value, 'RON');
  }

  getCategoryColor(category: TransactionCategory): string {
    const colors: Record<TransactionCategory, string> = {
      [TransactionCategory.SUPERMARKET]: '#4CAF50',
      [TransactionCategory.RESTAURANT_FASTFOOD]: '#FF9800',
      [TransactionCategory.CAFE_BAKERY]: '#FFB74D',
      [TransactionCategory.DELIVERY]: '#FF5722',
      [TransactionCategory.GAS_STATION]: '#2196F3',
      [TransactionCategory.TRANSPORT]: '#795548',
      [TransactionCategory.PARKING_TOLLS]: '#5D4037',
      [TransactionCategory.UTILITIES]: '#9C27B0',
      [TransactionCategory.RENT]: '#8D6E63',
      [TransactionCategory.HOME_MAINTENANCE]: '#6D4C41',
      [TransactionCategory.HOME_IMPROVEMENT]: '#8D6E63',
      [TransactionCategory.SHOPPING]: '#E91E63',
      [TransactionCategory.CLOTHING_ACCESSORIES]: '#EC407A',
      [TransactionCategory.ELECTRONICS]: '#26C6DA',
      [TransactionCategory.SPORTS_OUTDOOR]: '#66BB6A',
      [TransactionCategory.PHARMACY]: '#00BCD4',
      [TransactionCategory.HEALTHCARE]: '#FF4081',
      [TransactionCategory.GYM_FITNESS]: '#7C4DFF',
      [TransactionCategory.ENTERTAINMENT]: '#FFC107',
      [TransactionCategory.ONLINE_GAMING]: '#7C4DFF',
      [TransactionCategory.SUBSCRIPTION]: '#009688',
      [TransactionCategory.SALARY]: '#8BC34A',
      [TransactionCategory.RECEIVED]: '#CDDC39',
      [TransactionCategory.TRANSFER]: '#607D8B',
      [TransactionCategory.INTERNAL_TRANSFER]: '#BDBDBD',
      [TransactionCategory.REFUNDS]: '#4DB6AC',
      [TransactionCategory.BANK_FEES]: '#BDBDBD',
      [TransactionCategory.ATM_WITHDRAWAL]: '#EF5350',
      [TransactionCategory.MOBILE_BILL]: '#3F51B5',
      [TransactionCategory.TRAVEL_ACCOMMODATION]: '#FF6F00',
      [TransactionCategory.EDUCATION]: '#66BB6A',
      [TransactionCategory.INSURANCE]: '#42A5F5',
      [TransactionCategory.PERSONAL_CARE]: '#FFA726',
      [TransactionCategory.GIFTS]: '#EC407A',
      [TransactionCategory.PET_CARE]: '#A1887F',
      [TransactionCategory.TAXES_FINES]: '#F44336',
      [TransactionCategory.DONATIONS]: '#AB47BC',
      [TransactionCategory.INVESTMENTS]: '#26A69A',
      [TransactionCategory.OTHER]: '#9E9E9E',
    };
    return colors[category] || '#9E9E9E';
  }

  getCategoryLabel(category: TransactionCategory): string {
    const labels: Record<TransactionCategory, string> = {
      [TransactionCategory.SUPERMARKET]: 'Supermarket',
      [TransactionCategory.RESTAURANT_FASTFOOD]: 'Restaurants',
      [TransactionCategory.CAFE_BAKERY]: 'Cafe & Bakery',
      [TransactionCategory.DELIVERY]: 'Food Delivery',
      [TransactionCategory.GAS_STATION]: 'Fuel',
      [TransactionCategory.TRANSPORT]: 'Transport',
      [TransactionCategory.PARKING_TOLLS]: 'Parking & Tolls',
      [TransactionCategory.UTILITIES]: 'Utilities',
      [TransactionCategory.RENT]: 'Rent',
      [TransactionCategory.HOME_MAINTENANCE]: 'Home Maintenance',
      [TransactionCategory.HOME_IMPROVEMENT]: 'Home Improvement',
      [TransactionCategory.SHOPPING]: 'Shopping',
      [TransactionCategory.CLOTHING_ACCESSORIES]: 'Clothing',
      [TransactionCategory.ELECTRONICS]: 'Electronics',
      [TransactionCategory.SPORTS_OUTDOOR]: 'Sports & Outdoor',
      [TransactionCategory.PHARMACY]: 'Pharmacy',
      [TransactionCategory.HEALTHCARE]: 'Healthcare',
      [TransactionCategory.GYM_FITNESS]: 'Gym & Fitness',
      [TransactionCategory.ENTERTAINMENT]: 'Entertainment',
      [TransactionCategory.ONLINE_GAMING]: 'Online Gaming',
      [TransactionCategory.SUBSCRIPTION]: 'Subscriptions',
      [TransactionCategory.SALARY]: 'Salary',
      [TransactionCategory.RECEIVED]: 'Money Received',
      [TransactionCategory.TRANSFER]: 'Bank Transfer',
      [TransactionCategory.INTERNAL_TRANSFER]: 'Internal Transfer',
      [TransactionCategory.REFUNDS]: 'Refunds',
      [TransactionCategory.BANK_FEES]: 'Bank Fees',
      [TransactionCategory.ATM_WITHDRAWAL]: 'ATM Withdrawal',
      [TransactionCategory.MOBILE_BILL]: 'Mobile Bill',
      [TransactionCategory.TRAVEL_ACCOMMODATION]: 'Travel',
      [TransactionCategory.EDUCATION]: 'Education',
      [TransactionCategory.INSURANCE]: 'Insurance',
      [TransactionCategory.PERSONAL_CARE]: 'Personal Care',
      [TransactionCategory.GIFTS]: 'Gifts',
      [TransactionCategory.PET_CARE]: 'Pet Care',
      [TransactionCategory.TAXES_FINES]: 'Taxes & Fines',
      [TransactionCategory.DONATIONS]: 'Donations',
      [TransactionCategory.INVESTMENTS]: 'Investments',
      [TransactionCategory.OTHER]: 'Other',
    };
    return labels[category] || 'Other';
  }
}
