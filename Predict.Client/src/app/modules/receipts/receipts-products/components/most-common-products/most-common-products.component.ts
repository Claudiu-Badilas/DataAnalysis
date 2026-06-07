import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import { ReceiptsProductDomain } from '../../models/receipts-products.model';

interface GroupedProduct {
  id: number;
  name: string;
  count: number;
  totalQuantity: number;
  totalRevenue: number;
  avgPrice: number;
  latestDate: Date | null;
  dates: Date[];
  percentageOfTotalQuantity: number;
  percentageOfTotalRevenue: number;
}

interface PeriodGroup {
  id: string;
  title: string;
  year: number;
  monthIndex?: number;
  totalRevenue: number;
  totalQuantity: number;
  uniqueProducts: number;
  transactionCount: number;
  products: ReceiptsProductDomain[];
  multiple: GroupedProduct[];
  isExpanded: boolean;
  month?: string;
}

interface ReceiptGroup {
  id: string;
  receiptId: string;
  receiptDate: Date;
  totalRevenue: number;
  totalQuantity: number;
  products: ReceiptsProductDomain[];
  isExpanded: boolean;
}

@Component({
  selector: 'p-most-common-products',
  standalone: true,
  imports: [CommonModule, NumberFormatPipe, ToggleButtonComponent, NgbTooltip],
  template: `
    <div class="products-analytics mt-2">
      <div class="analytics-header">
        <div class="text-center">
          <p class="subtitle">Products Insights Overview</p>
        </div>
        <div class="header-right">
          <p-toggle-button
            [options]="[
              { label: 'Monthly' },
              { label: 'Yearly' },
              { label: 'All' },
              { label: 'Receipts' },
            ]"
            [selected]="getSelectedViewLabel()"
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
          <div class="stat-icon revenue-icon">
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
            <span class="stat-label">Total Revenue</span>
            <span class="stat-value positive">{{
              totalRevenue() | numberFormat: '0.00'
            }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon quantity-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 7L4 7M20 12L4 12M20 17L4 17"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Items Sold</span>
            <span class="stat-value">{{ totalItemsSold() }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon products-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 7L4 7M20 12L4 12M20 17L4 17"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Unique Products</span>
            <span class="stat-value">{{ uniqueProductsCount() }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon avg-icon">
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
            <span class="stat-label">Avg Price</span>
            <span class="stat-value">{{
              averagePrice() | numberFormat: '0.00'
            }}</span>
          </div>
        </div>
      </div>

      <div class="table-container">
        <div class="period-view">
          @if (viewMode() === 'all') {
            <div class="period-card expanded">
              <div class="period-content">
                <div class="data-table-wrapper">
                  <!-- Desktop Table -->
                  <table class="data-table desktop-table">
                    <thead>
                      <tr>
                        <th>Last Purchase</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Total Revenue</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (item of getAllGroupedProducts(); track item.id) {
                        <tr class="highlight-row">
                          <td data-label="Last Purchase" class="date-cell">
                            {{ formatDay(item.latestDate) }}
                          </td>
                          <td data-label="Product" class="product-cell">
                            <span
                              class="product-badge multiple"
                              [ngbTooltip]="item.name"
                              placement="top"
                              container="body"
                            >
                              {{ item.count }}x {{ item.name }}
                            </span>
                          </td>
                          <td data-label="Quantity" class="quantity-cell">
                            {{ item.totalQuantity }}
                          </td>
                          <td
                            data-label="Total Revenue"
                            class="amount-cell positive"
                          >
                            {{ item.totalRevenue | numberFormat: '0.00' }}
                          </td>
                          <td class="percentage-cell">
                            <div class="percentage-bar">
                              <div
                                class="percentage-fill revenue-fill"
                                [style.width.%]="item.percentageOfTotalRevenue"
                              ></div>
                              <span class="percentage-text"
                                >{{
                                  item.percentageOfTotalRevenue
                                    | numberFormat: '0.0'
                                }}%</span
                              >
                            </div>
                          </td>
                        </tr>
                      }

                      @if (!getAllGroupedProducts().length) {
                        <tr>
                          <td colspan="5" class="empty-cell">
                            No products available
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>

                  <!-- Mobile Cards -->
                  <div class="mobile-cards pt-2">
                    @for (item of getAllGroupedProducts(); track item.id) {
                      <div class="mobile-card highlight-card">
                        <div class="mobile-card-header">
                          <span
                            class="product-badge multiple"
                            [ngbTooltip]="item.name"
                            placement="top"
                            container="body"
                          >
                            {{ item.count }}x {{ item.name }}
                          </span>
                        </div>
                        <div class="mobile-card-details">
                          <div class="detail-row">
                            <span class="detail-label">Last Purchase:</span>
                            <span class="detail-value">{{
                              formatDay(item.latestDate)
                            }}</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">Quantity:</span>
                            <span class="detail-value">{{
                              item.totalQuantity
                            }}</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">Revenue:</span>
                            <span class="detail-value positive">{{
                              item.totalRevenue | numberFormat: '0.00'
                            }}</span>
                          </div>
                          <div class="mobile-percentages">
                            <div class="percentage-bar-mobile">
                              <div
                                class="percentage-fill-mobile revenue-fill"
                                [style.width.%]="item.percentageOfTotalRevenue"
                              ></div>
                              <span class="percentage-text-mobile">
                                {{
                                  item.percentageOfTotalRevenue
                                    | numberFormat: '0.0'
                                }}% of revenue
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    }

                    @if (!getAllGroupedProducts().length) {
                      <div class="empty-mobile">No products available</div>
                    }
                  </div>
                </div>
              </div>
            </div>
          } @else if (viewMode() === 'receipts') {
            <!-- Receipts View - Grouped by Receipt ID -->
            <div class="receipts-view">
              @for (receipt of receiptGroups(); track receipt.id) {
                <div class="receipt-card" [class.expanded]="receipt.isExpanded">
                  <div class="receipt-header" (click)="toggleReceipt(receipt)">
                    <div class="receipt-info">
                      <div class="receipt-title">
                        Receipt #{{ receipt.receiptId }}
                      </div>
                      <div class="receipt-date">
                        {{ formatFullDate(receipt.receiptDate) }}
                      </div>
                      <div class="receipt-summary">
                        {{ receipt.products.length }} product{{
                          receipt.products.length !== 1 ? 's' : ''
                        }}
                      </div>
                    </div>
                    <div class="receipt-totals">
                      <span class="buble"
                        >{{ receipt.totalQuantity }} items</span
                      >
                      @if (receipt.totalRevenue > 0) {
                        <span class="revenue-badge">{{
                          receipt.totalRevenue | numberFormat: '0.00'
                        }}</span>
                      }
                    </div>
                  </div>

                  @if (receipt.isExpanded) {
                    <div class="receipt-content">
                      <div class="data-table-wrapper">
                        <!-- Desktop Table -->
                        <table class="data-table desktop-table">
                          <thead>
                            <tr>
                              <th>Product Name</th>
                              <th>Quantity</th>
                              <th>Unit Price</th>
                              <th>Total Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (
                              product of receipt.products;
                              track product.id
                            ) {
                              <tr>
                                <td
                                  data-label="Product Name"
                                  class="product-cell"
                                >
                                  <span class="product-badge multiple">
                                    {{ product.name }}
                                  </span>
                                </td>
                                <td data-label="Quantity" class="quantity-cell">
                                  {{ product.quantity }}
                                </td>
                                <td data-label="Unit Price" class="amount-cell">
                                  {{
                                    product.price ?? 0 | numberFormat: '0.00'
                                  }}
                                </td>
                                <td
                                  data-label="Total Price"
                                  class="amount-cell positive"
                                >
                                  {{
                                    (product.price ?? 0) *
                                      (product.quantity ?? 0)
                                      | numberFormat: '0.00'
                                  }}
                                </td>
                              </tr>
                            }
                          </tbody>
                        </table>

                        <!-- Mobile Cards -->
                        <div class="mobile-cards pt-2">
                          @for (product of receipt.products; track product.id) {
                            <div class="mobile-card">
                              <div class="mobile-card-header">
                                <span class="product-badge multiple">
                                  {{ product.name }}
                                </span>
                              </div>
                              <div class="mobile-card-details">
                                <div class="detail-row">
                                  <span class="detail-label">Quantity:</span>
                                  <span class="detail-value">{{
                                    product.quantity
                                  }}</span>
                                </div>
                                <div class="detail-row">
                                  <span class="detail-label">Unit Price:</span>
                                  <span class="detail-value">{{
                                    product.price ?? 0 | numberFormat: '0.00'
                                  }}</span>
                                </div>
                                <div class="detail-row">
                                  <span class="detail-label">Total Price:</span>
                                  <span class="detail-value positive">{{
                                    (product.price ?? 0) *
                                      (product.quantity ?? 0)
                                      | numberFormat: '0.00'
                                  }}</span>
                                </div>
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }

              @if (!receiptGroups().length) {
                <div class="empty-state">No receipts available</div>
              }
            </div>
          } @else {
            @for (period of currentPeriods(); track period.id) {
              <div class="period-card" [class.expanded]="period.isExpanded">
                <div class="period-header" (click)="togglePeriod(period)">
                  <div class="period-info">
                    <div>
                      <div class="period-title">{{ period.title }}</div>
                    </div>
                  </div>
                  <div class="period-totals">
                    <span class="buble"
                      >{{ period.transactionCount }} items</span
                    >
                    @if (period.totalRevenue > 0) {
                      <span class="revenue-badge">{{
                        period.totalRevenue | numberFormat: '0.00'
                      }}</span>
                    }
                  </div>
                </div>

                @if (period.isExpanded) {
                  <div class="period-content">
                    <div class="data-table-wrapper">
                      <!-- Desktop Table -->
                      <table class="data-table desktop-table">
                        <thead>
                          <tr>
                            <th>Last Purchase</th>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Total Revenue</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (item of period.multiple; track item.id) {
                            <tr class="highlight-row">
                              <td data-label="Last Purchase" class="date-cell">
                                {{ formatDay(item.latestDate) }}
                              </td>
                              <td data-label="Product" class="product-cell">
                                <span
                                  class="product-badge multiple"
                                  [ngbTooltip]="item.name"
                                  placement="top"
                                  container="body"
                                >
                                  {{ item.count }}x {{ item.name }}
                                </span>
                              </td>
                              <td data-label="Quantity" class="quantity-cell">
                                {{ item.totalQuantity }}
                              </td>
                              <td
                                data-label="Total Revenue"
                                class="amount-cell positive"
                              >
                                {{ item.totalRevenue | numberFormat: '0.00' }}
                              </td>
                              <td class="percentage-cell">
                                <div class="percentage-bar">
                                  <div
                                    class="percentage-fill revenue-fill"
                                    [style.width.%]="
                                      item.percentageOfTotalRevenue
                                    "
                                  ></div>
                                  <span class="percentage-text"
                                    >{{
                                      item.percentageOfTotalRevenue
                                        | numberFormat: '0.0'
                                    }}%</span
                                  >
                                </div>
                              </td>
                            </tr>
                          }

                          @if (!period.multiple.length) {
                            <tr>
                              <td colspan="5" class="empty-cell">
                                No products this period
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>

                      <!-- Mobile Cards -->
                      <div class="mobile-cards pt-2">
                        @for (item of period.multiple; track item.id) {
                          <div class="mobile-card highlight-card">
                            <div class="mobile-card-header">
                              <span
                                class="product-badge multiple"
                                [ngbTooltip]="item.name"
                                placement="top"
                                container="body"
                              >
                                {{ item.count }}x {{ item.name }}
                              </span>
                            </div>
                            <div class="mobile-card-details">
                              <div class="detail-row">
                                <span class="detail-label">Last Purchase:</span>
                                <span class="detail-value">{{
                                  formatDay(item.latestDate)
                                }}</span>
                              </div>
                              <div class="detail-row">
                                <span class="detail-label">Quantity:</span>
                                <span class="detail-value">{{
                                  item.totalQuantity
                                }}</span>
                              </div>
                              <div class="detail-row">
                                <span class="detail-label">Revenue:</span>
                                <span class="detail-value positive">{{
                                  item.totalRevenue | numberFormat: '0.00'
                                }}</span>
                              </div>
                              <div class="mobile-percentages">
                                <div class="percentage-bar-mobile">
                                  <div
                                    class="percentage-fill-mobile revenue-fill"
                                    [style.width.%]="
                                      item.percentageOfTotalRevenue
                                    "
                                  ></div>
                                  <span class="percentage-text-mobile">
                                    {{
                                      item.percentageOfTotalRevenue
                                        | numberFormat: '0.0'
                                    }}% of revenue
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        }

                        @if (!period.multiple.length) {
                          <div class="empty-mobile">
                            No products this period
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          }
          @if (
            viewMode() !== 'all' &&
            viewMode() !== 'receipts' &&
            !currentPeriods().length
          ) {
            <div class="empty-state">No product data available</div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .products-analytics {
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

    .revenue-icon {
      background: #d1fae5;
      color: #10b981;
    }

    .quantity-icon {
      background: #dbeafe;
      color: #3b82f6;
    }

    .products-icon {
      background: #fef3c7;
      color: #f59e0b;
    }

    .avg-icon {
      background: #fee2e2;
      color: #ef4444;
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

    .table-container {
      overflow-y: auto;
      background: #f9fafb;
      height: calc(100vh - 200px);
    }

    .period-view {
      padding: 5px;
    }

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

    .receipt-card {
      background: white;
      border-radius: 12px;
      margin-bottom: 5px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
    }

    .receipt-card:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .receipt-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      cursor: pointer;
      background: white;
      transition: background 0.2s ease;
    }

    .receipt-header:hover {
      background: #f9fafb;
    }

    .receipt-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .receipt-title {
      font-weight: 600;
      font-size: 0.875rem;
      color: #1f2937;
    }

    .receipt-date {
      font-size: 0.7rem;
      color: #6b7280;
    }

    .receipt-summary {
      font-size: 0.7rem;
      color: #3b82f6;
      font-weight: 500;
    }

    .receipt-totals {
      display: flex;
      gap: 8px;
    }

    .receipt-content {
      padding: 0 20px 20px 20px;
      background: white;
      border-top: 1px solid #f3f4f6;
      animation: slideDown 0.3s ease;
    }

    .revenue-badge,
    .quantity-badge {
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

    .revenue-badge {
      background: #d1fae5;
      color: #10b981;
    }

    .quantity-badge {
      background: #dbeafe;
      color: #3b82f6;
    }

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

    .data-table-wrapper {
      overflow-x: auto;
    }

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

    .product-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
    }

    .product-badge.multiple {
      background: #dbeafe;
      color: #1e40af;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-right: 4px;
      font-size: 11px;
    }

    .quantity-cell {
      font-weight: 600;
      color: #3b82f6;
    }

    .amount-cell {
      font-weight: 600;
    }

    .amount-cell.positive {
      color: #10b981;
    }

    .percentage-cell {
      width: 140px;
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
      border-radius: 10px;
      transition: width 0.3s ease;
    }

    .revenue-fill {
      background: linear-gradient(90deg, #3b82f6, #10b981);
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
      font-weight: 700;
    }

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
      box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.05),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
      flex-direction: column;
      gap: 8px;
    }

    .mobile-percentages {
      margin-top: 8px;
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

    .percentage-bar-mobile {
      position: relative;
      background: #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
      height: 20px;
      display: flex;
      align-items: center;
    }

    .percentage-fill-mobile {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
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

    .mt-1 {
      margin-top: 4px;
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

      .receipt-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .receipt-content {
        padding: 0 16px 16px 16px;
      }

      .desktop-table {
        display: none;
      }

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

      .revenue-badge,
      .quantity-badge {
        width: 75px;
        text-align: center;
        padding: 2px 8px;
        font-size: 0.6875rem;
      }

      .buble {
        padding: 2px 8px;
        font-size: 0.6875rem;
      }
    }

    @media (max-width: 480px) {
      .products-analytics {
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

      .revenue-badge,
      .quantity-badge {
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

      .receipt-content {
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
        height: 16px;
      }

      .percentage-text-mobile {
        font-size: 0.5625rem;
        padding: 20px;
      }

      .table-container {
        overflow-y: auto;
        background: #f9fafb;
        height: calc(100vh - 300px);
      }
    }
  `,
})
export class MostCommonProductsComponent {
  receipts = input<ReceiptsProductDomain[]>([]);

  viewMode = signal<'all' | 'monthly' | 'yearly' | 'receipts'>('monthly');
  private expandedPeriodId = signal<string | null>(null);
  private expandedReceiptId = signal<string | null>(null);

  onToggle(value: string) {
    if (value === 'All') {
      this.viewMode.set('all');
    } else if (value === 'Monthly') {
      this.viewMode.set('monthly');
    } else if (value === 'Yearly') {
      this.viewMode.set('yearly');
    } else if (value === 'Receipts') {
      this.viewMode.set('receipts');
    }
    this.expandedPeriodId.set(null);
    this.expandedReceiptId.set(null);
  }

  getSelectedViewLabel(): string {
    if (this.viewMode() === 'all') return 'All';
    if (this.viewMode() === 'monthly') return 'Monthly';
    if (this.viewMode() === 'yearly') return 'Yearly';
    return 'Receipts';
  }

  togglePeriod(period: PeriodGroup) {
    const currentExpanded = this.expandedPeriodId();
    if (currentExpanded === period.id) {
      this.expandedPeriodId.set(null);
    } else {
      this.expandedPeriodId.set(period.id);
    }
  }

  toggleReceipt(receipt: ReceiptGroup) {
    const currentExpanded = this.expandedReceiptId();
    if (currentExpanded === receipt.id) {
      this.expandedReceiptId.set(null);
      receipt.isExpanded = false;
    } else {
      this.expandedReceiptId.set(receipt.id);
      receipt.isExpanded = true;
    }
  }

  formatDay(date: Date | null): string {
    if (!date) return '';
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${day} ${month} ${date.getFullYear()}`;
  }

  formatFullDate(date: Date): string {
    return date.toLocaleString('default', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  currentPeriods = computed((): PeriodGroup[] => {
    if (this.viewMode() === 'monthly') {
      return this.groupedByMonth();
    } else if (this.viewMode() === 'yearly') {
      return this.groupedByYear();
    }
    return [];
  });

  receiptGroups = computed((): ReceiptGroup[] => {
    if (this.viewMode() !== 'receipts') return [];

    const products = this.receipts();
    if (!products?.length) return [];

    // Group products by receipt ID (using receiptId field)
    const receiptMap = new Map<string, ReceiptsProductDomain[]>();

    for (const product of products) {
      // Use receiptId if available, otherwise use purchased date as fallback
      const receiptKey =
        (product as any).receiptId ||
        product.purchasedDate?.getTime()?.toString() ||
        'unknown';

      if (!receiptMap.has(receiptKey)) {
        receiptMap.set(receiptKey, []);
      }
      receiptMap.get(receiptKey)!.push(product);
    }

    const receipts: ReceiptGroup[] = [];

    for (const [key, receiptProducts] of receiptMap.entries()) {
      // Use the first product's date as receipt date, or current date as fallback
      const receiptDate = receiptProducts[0]?.purchasedDate || new Date();
      const totalRevenue = receiptProducts.reduce(
        (sum, p) => sum + (p.price ?? 0) * (p.quantity ?? 0),
        0,
      );
      const totalQuantity = receiptProducts.reduce(
        (sum, p) => sum + (p.quantity ?? 0),
        0,
      );

      // Format receipt ID for display
      let displayId = key;
      if (key === 'unknown') {
        displayId = receiptDate.getTime().toString().slice(-6);
      } else if (key.length > 8) {
        displayId = key.slice(-8);
      }

      receipts.push({
        id: `receipt-${key}`,
        receiptId: displayId,
        receiptDate,
        totalRevenue,
        totalQuantity,
        products: receiptProducts,
        isExpanded: this.expandedReceiptId() === `receipt-${key}`,
      });
    }

    // Sort receipts by date (newest first)
    return receipts.sort(
      (a, b) => b.receiptDate.getTime() - a.receiptDate.getTime(),
    );
  });

  getAllGroupedProducts = computed((): GroupedProduct[] => {
    if (this.viewMode() !== 'all') return [];

    const products = this.receipts();
    if (!products?.length) return [];

    const grouped = this.groupProducts(products);

    const totalRevenue = products.reduce(
      (sum, p) => sum + (p.price ?? 0) * (p.quantity ?? 0),
      0,
    );

    return grouped
      .map((g) => ({
        ...g,
        percentageOfTotalRevenue:
          totalRevenue > 0 ? (g.totalRevenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  });

  private groupedByMonth = computed((): PeriodGroup[] => {
    const products = this.receipts();
    if (!products?.length) return [];

    const map = new Map<string, ReceiptsProductDomain[]>();
    for (const product of products) {
      const date = product.purchasedDate;
      if (!date) continue;
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(product);
    }

    return Array.from(map.entries())
      .map(([key, products]) => {
        const [year, monthIndex] = key.split('-').map(Number);
        const month = new Date(year, monthIndex).toLocaleString('default', {
          month: 'short',
        });
        const id = `month-${year}-${monthIndex}`;

        const processedData = this.processProducts(products);

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
    const products = this.receipts();
    if (!products?.length) return [];

    const map = new Map<number, ReceiptsProductDomain[]>();
    for (const product of products) {
      const date = product.purchasedDate;
      if (!date) continue;
      const year = date.getFullYear();
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(product);
    }

    return Array.from(map.entries())
      .map(([year, products]) => {
        const id = `year-${year}`;
        const processedData = this.processProducts(products);

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

  private processProducts(products: ReceiptsProductDomain[]) {
    const grouped = this.groupProducts(products);

    const totalRevenue = products.reduce(
      (sum, p) => sum + (p.price ?? 0) * (p.quantity ?? 0),
      0,
    );

    const totalQuantity = products.reduce(
      (sum, p) => sum + (p.quantity ?? 0),
      0,
    );
    const uniqueProducts = new Set(products.map((p) => p.id)).size;

    const groupsWithPercentages = grouped.map((g) => ({
      ...g,
      percentageOfTotalRevenue:
        totalRevenue > 0 ? (g.totalRevenue / totalRevenue) * 100 : 0,
    }));

    const sortedGroups = groupsWithPercentages.sort(
      (a, b) => b.totalRevenue - a.totalRevenue,
    );

    return {
      totalRevenue,
      totalQuantity,
      uniqueProducts,
      transactionCount: products.length,
      multiple: sortedGroups,
      products,
    };
  }

  totalRevenue = computed(() => {
    return this.receipts().reduce(
      (sum, p) => sum + (p.price ?? 0) * (p.quantity ?? 0),
      0,
    );
  });

  totalItemsSold = computed(() => {
    return this.receipts().reduce((sum, p) => sum + (p.quantity ?? 0), 0);
  });

  uniqueProductsCount = computed(() => {
    return new Set(this.receipts().map((p) => p.id)).size;
  });

  averagePrice = computed(() => {
    const products = this.receipts();
    if (products.length === 0) return 0;
    const total = products.reduce((sum, p) => sum + (p.price ?? 0), 0);
    return total / products.length;
  });

  private groupProducts(products: ReceiptsProductDomain[]): GroupedProduct[] {
    const map = new Map<number, GroupedProduct>();

    for (const product of products) {
      const id = product.id;
      const date = product.purchasedDate;

      if (!map.has(id)) {
        map.set(id, {
          id: product.id,
          name: product.name,
          count: 0,
          totalQuantity: 0,
          totalRevenue: 0,
          avgPrice: 0,
          latestDate: null,
          dates: [],
          percentageOfTotalQuantity: 0,
          percentageOfTotalRevenue: 0,
        });
      }

      const g = map.get(id)!;
      g.count++;
      g.totalQuantity += product.quantity ?? 0;
      g.totalRevenue += (product.price ?? 0) * (product.quantity ?? 0);
      g.avgPrice = g.totalRevenue / g.totalQuantity;

      if (date) {
        g.dates.push(date);
        if (!g.latestDate || date > g.latestDate) {
          g.latestDate = date;
        }
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      b.totalRevenue !== a.totalRevenue
        ? b.totalRevenue - a.totalRevenue
        : b.totalQuantity - a.totalQuantity,
    );
  }
}
