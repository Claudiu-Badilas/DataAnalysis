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

        <!-- Recent Transactions -->
        <div class="transactions-card">
          <h3>📋 Recent Transactions</h3>
          <div class="transactions-list">
            <div
              *ngFor="let transaction of recentTransactions"
              class="transaction-item"
            >
              <div class="transaction-date">
                {{ transaction.completionDate | date: 'MMM d, y' }}
              </div>
              <div
                class="transaction-category"
                [style.backgroundColor]="getCategoryColor(transaction.category)"
              >
                {{ transaction.categoryLabel }}
              </div>
              <div class="transaction-description">
                {{ transaction.description }}
              </div>
              <div
                class="transaction-amount"
                [class.positive]="(transaction.amount || 0) > 0"
                [class.negative]="(transaction.amount || 0) < 0"
              >
                {{
                  transaction.amount || 0 | currency: 'RON' : 'symbol' : '1.2-2'
                }}
              </div>
            </div>
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
      .transactions-card,
      .insights-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .merchants-card h3,
      .transactions-card h3,
      .insights-card h3 {
        margin: 0 0 20px 0;
        color: #2d3436;
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

      .transactions-list {
        max-height: 500px;
        overflow-y: auto;
      }

      .transaction-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px;
        border-bottom: 1px solid #eee;
        transition: background 0.2s;
      }

      .transaction-item:hover {
        background: #f8f9fa;
      }

      .transaction-date {
        min-width: 90px;
        font-size: 12px;
        color: #666;
      }

      .transaction-category {
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 500;
        color: white;
        min-width: 90px;
        text-align: center;
      }

      .transaction-description {
        flex: 1;
        font-size: 14px;
        color: #2d3436;
      }

      .transaction-amount {
        font-weight: 600;
        font-size: 14px;
        min-width: 100px;
        text-align: right;
      }

      .transaction-amount.positive {
        color: #00b894;
      }

      .transaction-amount.negative {
        color: #d63031;
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

        .transaction-item {
          flex-wrap: wrap;
        }

        .transaction-date,
        .transaction-category {
          flex: 1;
        }
      }
    `,
  ],
})
export class TransactionInsightsBodyComponent implements OnInit, OnChanges {
  @Input() transactions: TransactionDomain[] = [];
  @Input() isLoading: boolean = false;

  private numberFormatPipe = inject(NumberFormatPipe);

  filteredTransactions: TransactionDomain[] = [];
  selectedMonth: string = '';

  totalIncome = 0;
  totalExpenses = 0;
  savings = 0;
  dailyAverage = 0;
  transactionsCount = 0;
  savingsRate = 0;

  pieChartOptions: Highcharts.Options = {};
  topMerchants: any[] = [];
  recentTransactions: TransactionDomain[] = [];
  insights: any[] = [];

  constructor() {}

  ngOnInit() {
    this.processTransactions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['transactions']) {
      this.processTransactions();
    }
  }

  private processTransactions() {
    if (this.transactions && this.transactions.length > 0) {
      this.filteredTransactions = [...this.transactions];
      this.calculateMetrics();
      this.updateCharts();
    }
  }

  filterByMonth() {
    if (this.selectedMonth) {
      const [year, month] = this.selectedMonth.split('-');
      this.filteredTransactions = this.transactions.filter((t) => {
        if (t.completionDate) {
          return (
            t.completionDate.getFullYear() === parseInt(year) &&
            t.completionDate.getMonth() + 1 === parseInt(month)
          );
        }
        return false;
      });
    } else {
      this.filteredTransactions = [...this.transactions];
    }
    this.calculateMetrics();
    this.updateCharts();
  }

  resetFilters() {
    this.selectedMonth = '';
    this.filteredTransactions = [...this.transactions];
    this.calculateMetrics();
    this.updateCharts();
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

    // Calculate daily average
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
    this.updateRecentTransactions();
    this.updateInsights();
  }

  updatePieChart() {
    const categorySummary = this.getCategorySummary(this.filteredTransactions);
    const self = this; // Store reference to component instance

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
          // Use the component's formatCurrency method
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

  updateRecentTransactions() {
    this.recentTransactions = [...this.filteredTransactions]
      .sort(
        (a, b) =>
          (b.completionDate?.getTime() || 0) -
          (a.completionDate?.getTime() || 0),
      )
      .slice(0, 20);
  }

  updateInsights() {
    this.insights = [];

    // Get category summary for insights
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

    // Insight 2: Savings rate
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

    // Insight 3: Top merchant
    const topMerchant = this.topMerchants[0];
    if (topMerchant) {
      this.insights.push({
        icon: '🏪',
        text: `Most spent at: ${topMerchant.merchant} (${topMerchant.total.toFixed(0)} RON over ${topMerchant.count} transactions)`,
      });
    }

    // Insight 4: Daily average
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

  formatCurrency(value: number): string {
    return this.numberFormatPipe.transform(value, 'RON');
  }

  getCategoryColor(category: TransactionCategory): string {
    const colors: Record<TransactionCategory, string> = {
      [TransactionCategory.SUPERMARKET]: '#4CAF50',
      [TransactionCategory.RESTAURANT_FASTFOOD]: '#FF9800',
      [TransactionCategory.DELIVERY]: '#FF5722',
      [TransactionCategory.GAS_STATION]: '#2196F3',
      [TransactionCategory.UTILITIES]: '#9C27B0',
      [TransactionCategory.SHOPPING]: '#E91E63',
      [TransactionCategory.PHARMACY]: '#00BCD4',
      [TransactionCategory.SALARY]: '#8BC34A',
      [TransactionCategory.TRANSFER]: '#607D8B',
      [TransactionCategory.TRANSPORT]: '#795548',
      [TransactionCategory.MOBILE_BILL]: '#3F51B5',
      [TransactionCategory.SUBSCRIPTION]: '#009688',
      [TransactionCategory.HEALTHCARE]: '#FF4081',
      [TransactionCategory.ENTERTAINMENT]: '#FFC107',
      [TransactionCategory.OTHER]: '#9E9E9E',
      [TransactionCategory.RECEIVED]: '#CDDC39',
      [TransactionCategory.INTERNAL_TRANSFER]: '#BDBDBD',
    };
    return colors[category] || '#9E9E9E';
  }

  getCategoryLabel(category: TransactionCategory): string {
    const labels: Record<TransactionCategory, string> = {
      [TransactionCategory.SUPERMARKET]: 'Supermarket',
      [TransactionCategory.RESTAURANT_FASTFOOD]: 'Restaurants',
      [TransactionCategory.DELIVERY]: 'Food Delivery',
      [TransactionCategory.GAS_STATION]: 'Fuel',
      [TransactionCategory.UTILITIES]: 'Utilities',
      [TransactionCategory.SHOPPING]: 'Shopping',
      [TransactionCategory.PHARMACY]: 'Pharmacy',
      [TransactionCategory.SALARY]: 'Salary',
      [TransactionCategory.TRANSFER]: 'Transfers',
      [TransactionCategory.TRANSPORT]: 'Transport',
      [TransactionCategory.MOBILE_BILL]: 'Mobile',
      [TransactionCategory.SUBSCRIPTION]: 'Subscriptions',
      [TransactionCategory.HEALTHCARE]: 'Healthcare',
      [TransactionCategory.ENTERTAINMENT]: 'Entertainment',
      [TransactionCategory.OTHER]: 'Other',
      [TransactionCategory.RECEIVED]: 'Received',
      [TransactionCategory.INTERNAL_TRANSFER]: 'Internal Transfer',
    };
    return labels[category] || 'Other';
  }
}
