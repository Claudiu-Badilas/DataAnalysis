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
  TransactionCategorizer,
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
            <div class="metric-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="metric-value">
              {{ totalIncome | currency: 'RON' : 'symbol' : '1.0-0' }}
            </div>
            <div class="metric-label">Total Income</div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 10H21M7 15H11M7 18H11M7 6H21M5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
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
            <div class="metric-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 6V4M12 6C10.8954 6 10 6.89543 10 8C10 9.10457 10.8954 10 12 10M12 6C13.1046 6 14 6.89543 14 8M12 10V8M12 10C13.1046 10 14 9.10457 14 8M12 10V12M12 18V20M12 18C10.8954 18 10 18.8954 10 20H14C14 18.8954 13.1046 18 12 18ZM12 18V16M12 8V4M12 8V6M12 20V16"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="metric-value">
              {{ savings | currency: 'RON' : 'symbol' : '1.0-0' }}
            </div>
            <div class="metric-label">Net Savings</div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 8V12L15 15M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="metric-value">
              {{ dailyAverage | currency: 'RON' : 'symbol' : '1.0-0' }}
            </div>
            <div class="metric-label">Daily Average</div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="metric-value">{{ transactionsCount }}</div>
            <div class="metric-label">Transactions</div>
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
            </div>
          </div>

          <!-- Mobile Card View -->
          <div class="mobile-cards">
            <div
              *ngFor="let transaction of paginatedTransactions; let i = index"
              class="transaction-card"
            >
              <div class="card-header">
                <div class="card-date">
                  {{ transaction.completionDate | date: 'MMM dd, yyyy' }}
                </div>
                <div
                  class="card-amount"
                  [class.positive]="(transaction.amount || 0) > 0"
                  [class.negative]="(transaction.amount || 0) < 0"
                >
                  {{
                    transaction.amount || 0
                      | currency: 'RON' : 'symbol' : '1.2-2'
                  }}
                </div>
                <div class="card-actions">
                  <button
                    class="action-btn filter-btn"
                    (click)="onTransactionCategoryChange(transaction.category)"
                    title="Filter by this category"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 4H21M6 9H18M10 14H14M12 19H12.01"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg></button
                  ><button
                    class="action-btn apply-btn"
                    (click)="onTransactionCategoryChange(null)"
                    title="Apply category change"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 13L9 17L19 7"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="card-description" [title]="transaction.description">
                {{ truncateText(transaction.description || '', 80) }}
              </div>

              <div class="card-footer">
                <div class="card-category">
                  <div
                    class="category-edit-select-mobile"
                    [style.backgroundColor]="
                      getCategoryColor(transaction.category)
                    "
                  >
                    {{ transaction.category }}
                  </div>
                </div>
                <div class="card-service" *ngIf="transaction.serviceProvider">
                  <span class="service-icon">🏢</span>
                  {{ truncateText(transaction.serviceProvider, 30) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop Table View -->
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
                    <div
                      class="category-edit-select"
                      [style.backgroundColor]="
                        getCategoryColor(transaction.category)
                      "
                    >
                      {{ transaction.category }}
                    </div>
                  </td>
                  <td class="actions-cell">
                    <button
                      class="action-btn-table filter-btn"
                      (click)="
                        onTransactionCategoryChange(transaction.category)
                      "
                      title="Filter by category"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 4H21M6 9H18M10 14H14M12 19H12.01"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                        />
                      </svg>
                    </button>
                    <button
                      class="action-btn-table apply-btn"
                      (click)="onTransactionCategoryChange(null)"
                      title="Apply changes"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 6L18 18M18 6L6 18"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
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
        margin-bottom: 12px;
        color: #6c5ce7;
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
        width: 100%;
        padding: 6px 10px;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        color: white;
        font-weight: 500;
        transition: all 0.2s;
      }

      .category-edit-select:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(108, 92, 231, 0.2);
      }

      .actions-cell {
        white-space: nowrap;
        display: flex;
        gap: 8px;
      }

      .action-btn-table {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s;
      }

      .action-btn-table svg {
        stroke: currentColor;
      }

      .action-btn-table.apply-btn {
        background: #00b894;
        color: white;
      }

      .action-btn-table.apply-btn:hover:not(:disabled) {
        background: #019874;
        transform: translateY(-1px);
      }

      .action-btn-table.apply-btn:disabled {
        background: #bdbdbd;
        cursor: not-allowed;
        opacity: 0.6;
      }

      .action-btn-table.filter-btn {
        background: #6c5ce7;
        color: white;
      }

      .action-btn-table.filter-btn:hover {
        background: #5b4bc4;
        transform: translateY(-1px);
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

      /* Mobile Card View */
      .mobile-cards {
        display: none;
      }

      .transaction-card {
        background: white;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        transition: all 0.2s ease;
        border: 1px solid #f0f0f0;
      }

      .transaction-card:active {
        transform: scale(0.98);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 5px;
        flex-wrap: wrap;
        gap: 5px;
      }

      .card-date {
        font-size: 13px;
        color: #666;
        font-weight: 500;
      }

      .card-amount {
        font-size: 20px;
        font-weight: bold;
      }

      .card-amount.positive {
        color: #00b894;
      }

      .card-amount.negative {
        color: #d63031;
      }

      .card-description {
        font-size: 14px;
        color: #2d3436;
        margin-bottom: 12px;
        line-height: 1.4;
        word-break: break-word;
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 12px;
      }

      .card-category {
        flex: 1;
        min-width: 140px;
      }

      .category-edit-select-mobile {
        width: 100%;
        padding: 8px 12px;
        border: none;
        border-radius: 8px;
        font-size: 13px;
        cursor: pointer;
        color: white;
        font-weight: 500;
        transition: all 0.2s;
      }

      .category-edit-select-mobile:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(108, 92, 231, 0.2);
      }

      .card-service {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #666;
        background: #f8f9fa;
        padding: 4px 8px;
        border-radius: 6px;
      }

      .service-icon {
        font-size: 12px;
      }

      .card-actions {
        display: flex;
      }

      .action-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
      }

      .action-btn svg {
        stroke: currentColor;
      }

      .action-btn.apply-btn {
        background: #00b894;
        color: white;
      }

      .action-btn.apply-btn:hover:not(:disabled) {
        background: #019874;
      }

      .action-btn.apply-btn:disabled {
        background: #bdbdbd;
        cursor: not-allowed;
        opacity: 0.6;
      }

      .action-btn.filter-btn {
        background: #6c5ce7;
        color: white;
      }

      .action-btn.filter-btn:hover {
        background: #5b4bc4;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .dashboard-container {
          padding: 12px;
        }

        .metrics-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .metric-card {
          padding: 16px;
        }

        .metric-value {
          font-size: 22px;
        }

        .metric-icon svg {
          width: 28px;
          height: 28px;
        }

        .table-header {
          flex-direction: column;
          align-items: stretch;
        }

        .table-header h3 {
          margin-bottom: 12px;
        }

        .table-controls {
          flex-direction: column;
          gap: 10px;
        }

        .search-box {
          width: 100%;
        }

        .category-filter {
          width: 100%;
        }

        .category-select {
          width: 100%;
        }

        /* Hide desktop table on mobile */
        .table-container {
          display: none;
        }

        /* Show mobile cards on mobile */
        .mobile-cards {
          display: block;
        }

        .pagination {
          flex-direction: column;
          gap: 12px;
          padding: 12px;
        }

        .page-info {
          order: -1;
          text-align: center;
          width: 100%;
        }

        .page-btn {
          padding: 10px 20px;
          min-width: 120px;
        }

        .insights-list {
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .insight-item {
          padding: 12px;
        }

        .insight-text {
          font-size: 13px;
        }

        .chart-card {
          margin-bottom: 20px;
        }

        .chart-wrapper {
          min-height: 300px;
        }
      }

      /* Tablet view */
      @media (min-width: 769px) and (max-width: 1024px) {
        .mobile-cards {
          display: none;
        }

        .table-container {
          display: block;
          overflow-x: auto;
        }

        .transactions-table {
          min-width: 800px;
        }

        .category-edit-select {
          min-width: 150px;
        }
      }

      /* Desktop view */
      @media (min-width: 1025px) {
        .mobile-cards {
          display: none;
        }

        .table-container {
          display: block;
        }
      }

      /* Small mobile devices */
      @media (max-width: 480px) {
        .dashboard-container {
          padding: 8px;
        }

        .metrics-grid {
          grid-template-columns: 1fr;
          gap: 10px;
        }

        .transaction-card {
          padding: 12px;
        }

        .card-amount {
          font-size: 18px;
        }

        .card-date {
          font-size: 11px;
        }

        .card-description {
          font-size: 13px;
        }

        .category-edit-select-mobile {
          font-size: 12px;
          padding: 6px 10px;
        }

        .action-btn {
          padding: 8px;
          font-size: 13px;
        }

        .action-btn svg {
          width: 16px;
          height: 16px;
        }

        .page-btn {
          padding: 8px 16px;
          font-size: 13px;
        }

        .page-info {
          font-size: 12px;
        }
      }

      /* Touch-friendly improvements */
      @media (hover: none) and (pointer: coarse) {
        .page-btn,
        .category-edit-select-mobile,
        .search-input,
        .category-select,
        .action-btn {
          min-height: 44px;
        }

        .transaction-card {
          cursor: pointer;
        }
      }

      /* Loading state improvements for mobile */
      @media (max-width: 768px) {
        .loading-state {
          padding: 40px 16px;
        }

        .loading-state p {
          font-size: 14px;
        }

        .spinner {
          width: 40px;
          height: 40px;
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
  originalCategories: Map<number, TransactionCategory> = new Map();

  // Metrics
  totalIncome = 0;
  totalExpenses = 0;
  savings = 0;
  dailyAverage = 0;
  transactionsCount = 0;
  savingsRate = 0;

  // Chart options
  pieChartOptions: Highcharts.Options = {};

  // Insights
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
      label: TransactionCategorizer.getCategoryLabel(cat),
    }));
  }

  private processTransactions() {
    if (this.transactions && this.transactions.length > 0) {
      this.filteredTransactions = [...this.transactions];
      this.storeOriginalCategories();
      this.calculateMetrics();
      this.updateCharts();
      this.updatePagination();
    }
  }

  private storeOriginalCategories() {
    this.originalCategories.clear();
    this.transactions.forEach((transaction) => {
      if (transaction.id) {
        this.originalCategories.set(transaction.id, transaction.category);
      }
    });
  }

  hasCategoryChange(transaction: TransactionDomain): boolean {
    const newCategory = this.categoryChanges.get(transaction.id!);
    const originalCategory = this.originalCategories.get(transaction.id!);
    return newCategory !== undefined && newCategory !== originalCategory;
  }

  applyCategoryChange(transaction: TransactionDomain) {
    const newCategory = this.categoryChanges.get(transaction.id!);
    if (newCategory && this.onCategoryUpdate) {
      this.onCategoryUpdate(transaction, newCategory);
      // Update original category after successful update
      this.originalCategories.set(transaction.id!, newCategory);
      this.categoryChanges.delete(transaction.id!);

      // Update the transaction category in the local array
      transaction.category = newCategory;

      // Refresh metrics and charts
      this.calculateMetrics();
      this.updateCharts();
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

  onTransactionCategoryChange(category: TransactionCategory) {
    this.selectedCategoryFilter = category;
    this.filterTransactions();
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
      legend: { enabled: false },
      title: {
        text: undefined,
      },
      tooltip: {
        formatter: function (this: any) {
          const percentage = this.percentage?.toFixed(1) || '0';
          const amount = this.y || 0;
          const formattedAmount = self.formatCurrency(amount);
          return `${this.point.name}: <b>${percentage}%</b><br/>Amount: <b>${formattedAmount}</b>`;
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
    return TransactionCategorizer.getCategoryColor(category) || '#9E9E9E';
  }

  getCategoryLabel(category: TransactionCategory): string {
    return TransactionCategorizer.getCategoryLabel(category) || 'Other';
  }
}
