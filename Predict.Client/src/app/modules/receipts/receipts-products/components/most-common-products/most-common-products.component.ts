import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { ReceiptsProductDomain } from '../../models/receipts-products.model';

interface GroupedProduct {
  id: number;
  name: string;
  provider: string;
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

interface Receipt {
  id: string;
  receiptId: string;
  date: Date;
  totalPrice: number;
  totalQuantity: number;
  totalDiscount?: number;
  products: ReceiptsProductDomain[];
  provider: string;
  providerIcon: string;
  providerColor: string;
}

@Component({
  selector: 'p-most-common-products',
  imports: [CommonModule, NumberFormatPipe, ToggleButtonComponent],
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
            <!-- All View - Modern Card Design -->
            <div class="receipts-container">
              <div class="desktop-view m-2">
                <div class="receipts-grid">
                  <div class="receipt-card expanded">
                    <div class="card-header">
                      <div class="header-left">
                        <div
                          class="provider-icon"
                          style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);"
                        >
                          <span class="provider-initial">AL</span>
                        </div>
                        <div class="provider-details">
                          All Products Overview
                        </div>
                        <span class="products-count">{{
                          getAllGroupedProducts().length
                        }}</span>
                      </div>
                      <div class="header-right">
                        <div class="price-summary">
                          <div class="total-price">
                            <span class="price-value"
                              >{{
                                totalRevenue() | numberFormat: '0.00'
                              }}
                              RON</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="card-expanded">
                      <div class="products-section">
                        <div class="products-table-wrapper">
                          <table class="products-table">
                            <thead>
                              <tr>
                                <th>Provider</th>
                                <th>Last Purchase</th>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Total Revenue</th>
                                <th>% of Revenue</th>
                              </tr>
                            </thead>
                            <tbody>
                              @for (
                                item of getAllGroupedProducts();
                                track item.id
                              ) {
                                <tr class="product-row">
                                  <td class="provider-cell">
                                    <div
                                      class="provider-icon-small"
                                      [style.background]="
                                        getProviderGradient(item.provider)
                                      "
                                    >
                                      <span>{{
                                        getProviderInitial(item.provider)
                                      }}</span>
                                    </div>
                                  </td>
                                  <td class="date-cell">
                                    {{ formatDay(item.latestDate) }}
                                  </td>
                                  <td class="product-name-cell">
                                    <div class="product-name">
                                      {{ item.count }}x {{ item.name }}
                                    </div>
                                  </td>
                                  <td class="product-quantity">
                                    <span class="quantity-badge">{{
                                      item.totalQuantity
                                    }}</span>
                                  </td>
                                  <td class="product-total">
                                    <strong
                                      >{{
                                        item.totalRevenue | numberFormat: '0.00'
                                      }}
                                      RON</strong
                                    >
                                  </td>
                                  <td class="percentage-cell">
                                    <div class="percentage-bar-wrapper">
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
                                    </div>
                                  </td>
                                </tr>
                              }

                              @if (!getAllGroupedProducts().length) {
                                <tr>
                                  <td colspan="6" class="empty-cell">
                                    No products available
                                  </td>
                                </tr>
                              }
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mobile View for All -->
              <div class="mobile-view">
                <div class="mobile-card expanded">
                  <div class="mobile-card-header">
                    <div class="mobile-header-left">
                      <div
                        class="provider-initial"
                        style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);"
                      >
                        AL
                      </div>
                      <div class="mobile-provider-info">
                        <div class="mobile-date">All Products</div>
                      </div>
                      <span class="products-count">{{
                        getAllGroupedProducts().length
                      }}</span>
                    </div>
                    <div class="mobile-header-right">
                      <div class="mobile-total">
                        <span class="total-value"
                          >{{ totalRevenue() | numberFormat: '0.00' }} RON</span
                        >
                      </div>
                    </div>
                  </div>

                  <div class="mobile-card-body">
                    <div class="mobile-products-list">
                      @for (item of getAllGroupedProducts(); track item.id) {
                        <div class="mobile-product-item">
                          <div class="mobile-product-header">
                            <div class="product-header-left">
                              <div
                                class="provider-icon-small-mobile"
                                [style.background]="
                                  getProviderGradient(item.provider)
                                "
                              >
                                <span>{{
                                  getProviderInitial(item.provider)
                                }}</span>
                              </div>
                              <span class="product-name"
                                >{{ item.count }}x {{ item.name }}</span
                              >
                            </div>
                            <span class="product-quantity-badge"
                              >Qty: {{ item.totalQuantity }}</span
                            >
                          </div>
                          <div class="mobile-product-details">
                            <div class="detail-item">
                              <span class="detail-label">Last Purchase</span>
                              <span class="detail-value">{{
                                formatDay(item.latestDate)
                              }}</span>
                            </div>
                            <div class="detail-item">
                              <span class="detail-label">Revenue</span>
                              <span class="detail-value total"
                                >{{
                                  item.totalRevenue | numberFormat: '0.00'
                                }}
                                RON</span
                              >
                            </div>
                            <div class="detail-item full-width">
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

                      @if (!getAllGroupedProducts().length) {
                        <div class="empty-mobile">No products available</div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          } @else if (viewMode() === 'receipts') {
            <!-- Receipts View with Modern Styling -->
            <div class="receipts-container">
              <!-- Desktop View -->
              <div class="desktop-view m-2">
                <div class="receipts-grid">
                  @for (receipt of receiptGroups(); track receipt.id) {
                    <div
                      class="receipt-card"
                      [class.expanded]="expandedReceiptId() === receipt.id"
                    >
                      <div
                        class="card-header"
                        (click)="toggleReceipt(receipt.id)"
                      >
                        <div class="header-left">
                          <div
                            class="provider-icon"
                            [style.background]="receipt.providerColor"
                          >
                            <span class="provider-initial">{{
                              receipt.providerIcon
                            }}</span>
                          </div>
                          <div class="provider-details">
                            {{ receipt.provider }}
                          </div>
                          <div class="receipt-date-small">
                            {{ receipt.date | date: 'dd MMM yyyy' }}
                          </div>
                          <span class="products-count">{{
                            receipt.products.length
                          }}</span>
                        </div>
                        <div class="header-right">
                          <div class="price-summary">
                            <div class="total-price">
                              <span class="price-value"
                                >{{
                                  receipt.totalPrice | numberFormat: '0.00'
                                }}
                                RON</span
                              >
                            </div>
                            @if (receipt.totalDiscount) {
                              <div class="discount-badge">
                                <span
                                  >-{{
                                    receipt.totalDiscount | numberFormat: '0.00'
                                  }}
                                  RON</span
                                >
                              </div>
                            }
                          </div>
                        </div>
                      </div>

                      @if (expandedReceiptId() === receipt.id) {
                        <div class="card-expanded">
                          <div class="products-section">
                            <div class="products-table-wrapper">
                              <table class="products-table">
                                <thead>
                                  <tr>
                                    <th>Provider</th>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  @for (
                                    product of receipt.products;
                                    track product.id
                                  ) {
                                    <tr class="product-row">
                                      <td class="provider-cell">
                                        <div
                                          class="provider-icon-small"
                                          [style.background]="
                                            receipt.providerColor
                                          "
                                        >
                                          <span>{{
                                            receipt.providerIcon
                                          }}</span>
                                        </div>
                                      </td>
                                      <td class="product-name-cell">
                                        <div class="product-name">
                                          {{ product.name }}
                                        </div>
                                      </td>
                                      <td class="product-price">
                                        {{
                                          product.price ?? 0
                                            | numberFormat: '0.00'
                                        }}
                                        RON
                                      </td>
                                      <td class="product-quantity">
                                        <span class="quantity-badge"
                                          >x{{ product.quantity }}</span
                                        >
                                      </td>
                                      <td class="product-total">
                                        <strong
                                          >{{
                                            (product.price ?? 0) *
                                              (product.quantity ?? 0)
                                              | numberFormat: '0.00'
                                          }}
                                          RON</strong
                                        >
                                      </td>
                                    </tr>
                                  }
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- Mobile View -->
              <div class="mobile-view">
                @for (receipt of receiptGroups(); track receipt.id) {
                  <div class="mobile-card">
                    <div
                      class="mobile-card-header"
                      (click)="toggleReceipt(receipt.id)"
                    >
                      <div class="mobile-header-left">
                        <div
                          class="provider-initial"
                          [style.background]="receipt.providerColor"
                        >
                          {{ receipt.providerIcon }}
                        </div>
                        <div class="mobile-provider-info">
                          <div class="mobile-provider-name">
                            {{ receipt.provider }}
                          </div>
                          <div class="mobile-date">
                            {{ receipt.date | date: 'dd MMM yyyy' }}
                          </div>
                        </div>
                        <span class="products-count">{{
                          receipt.products.length
                        }}</span>
                      </div>
                      <div class="mobile-header-right">
                        <div class="mobile-total">
                          <span class="total-value"
                            >{{
                              receipt.totalPrice | numberFormat: '0.00'
                            }}
                            RON</span
                          >
                        </div>
                        @if (receipt.totalDiscount) {
                          <div class="mobile-discount">
                            -{{ receipt.totalDiscount | numberFormat: '0.00' }}
                            RON
                          </div>
                        }
                      </div>
                    </div>

                    @if (expandedReceiptId() === receipt.id) {
                      <div class="mobile-card-body">
                        <div class="mobile-products-list">
                          @for (product of receipt.products; track product.id) {
                            <div class="mobile-product-item">
                              <div class="mobile-product-header">
                                <div class="product-header-left">
                                  <div
                                    class="provider-icon-small-mobile"
                                    [style.background]="receipt.providerColor"
                                  >
                                    <span>{{ receipt.providerIcon }}</span>
                                  </div>
                                  <span class="product-name">{{
                                    product.name
                                  }}</span>
                                </div>
                                <span class="product-quantity-badge"
                                  >x{{ product.quantity }}</span
                                >
                              </div>
                              <div class="mobile-product-details">
                                <div class="detail-item">
                                  <span class="detail-label">Price</span>
                                  <span class="detail-value"
                                    >{{
                                      product.price ?? 0 | numberFormat: '0.00'
                                    }}
                                    RON</span
                                  >
                                </div>
                                <div class="detail-item">
                                  <span class="detail-label">Total</span>
                                  <span class="detail-value total"
                                    >{{
                                      (product.price ?? 0) *
                                        (product.quantity ?? 0)
                                        | numberFormat: '0.00'
                                    }}
                                    RON</span
                                  >
                                </div>
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>

            @if (!receiptGroups().length) {
              <div class="empty-state">No receipts available</div>
            }
          } @else {
            <!-- Monthly/Yearly View - Modern Card Design -->
            <div class="receipts-container">
              <div class="desktop-view m-2">
                <div class="receipts-grid">
                  @for (period of currentPeriods(); track period.id) {
                    <div
                      class="receipt-card"
                      [class.expanded]="expandedPeriodId() === period.id"
                    >
                      <div
                        class="card-header"
                        (click)="togglePeriod(period.id)"
                      >
                        <div class="header-left">
                          <div
                            class="provider-icon"
                            style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);"
                          >
                            <span class="provider-initial">
                              {{
                                viewMode() === 'monthly'
                                  ? period.month?.charAt(0) || 'M'
                                  : period.year.toString().slice(-2)
                              }}
                            </span>
                          </div>
                          <div class="provider-details">
                            {{ period.title }}
                          </div>
                          <span class="products-count">{{
                            period.multiple.length
                          }}</span>
                        </div>
                        <div class="header-right">
                          <div class="price-summary">
                            <div class="total-price">
                              <span class="price-value"
                                >{{
                                  period.totalRevenue | numberFormat: '0.00'
                                }}
                                RON</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>

                      @if (expandedPeriodId() === period.id) {
                        <div class="card-expanded">
                          <div class="products-section">
                            <div class="products-table-wrapper">
                              <table class="products-table">
                                <thead>
                                  <tr>
                                    <th>Provider</th>
                                    <th>Last Purchase</th>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Total Revenue</th>
                                    <th>% of Period</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  @for (
                                    item of period.multiple;
                                    track item.id
                                  ) {
                                    <tr class="product-row">
                                      <td class="provider-cell">
                                        <div
                                          class="provider-icon-small"
                                          [style.background]="
                                            getProviderGradient(item.provider)
                                          "
                                        >
                                          <span>{{
                                            getProviderInitial(item.provider)
                                          }}</span>
                                        </div>
                                      </td>
                                      <td class="date-cell">
                                        {{ formatDay(item.latestDate) }}
                                      </td>
                                      <td class="product-name-cell">
                                        <div class="product-name">
                                          {{ item.count }}x {{ item.name }}
                                        </div>
                                      </td>
                                      <td class="product-quantity">
                                        <span class="quantity-badge">{{
                                          item.totalQuantity
                                        }}</span>
                                      </td>
                                      <td class="product-total">
                                        <strong
                                          >{{
                                            item.totalRevenue
                                              | numberFormat: '0.00'
                                          }}
                                          RON</strong
                                        >
                                      </td>
                                      <td class="percentage-cell">
                                        <div class="percentage-bar-wrapper">
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
                                        </div>
                                      </td>
                                    </tr>
                                  }

                                  @if (!period.multiple.length) {
                                    <tr>
                                      <td colspan="6" class="empty-cell">
                                        No products this period
                                      </td>
                                    </tr>
                                  }
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- Mobile View for Monthly/Yearly -->
              <div class="mobile-view">
                @for (period of currentPeriods(); track period.id) {
                  <div class="mobile-card">
                    <div
                      class="mobile-card-header"
                      (click)="togglePeriod(period.id)"
                    >
                      <div class="mobile-header-left">
                        <div
                          class="provider-initial"
                          style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);"
                        >
                          {{
                            viewMode() === 'monthly'
                              ? period.month?.charAt(0) || 'M'
                              : period.year.toString().slice(-2)
                          }}
                        </div>
                        <div class="mobile-provider-info">
                          <div class="mobile-date">{{ period.title }}</div>
                        </div>
                        <span class="products-count">{{
                          period.multiple.length
                        }}</span>
                      </div>
                      <div class="mobile-header-right">
                        <div class="mobile-total">
                          <span class="total-value"
                            >{{
                              period.totalRevenue | numberFormat: '0.00'
                            }}
                            RON</span
                          >
                        </div>
                      </div>
                    </div>

                    @if (expandedPeriodId() === period.id) {
                      <div class="mobile-card-body">
                        <div class="mobile-products-list">
                          @for (item of period.multiple; track item.id) {
                            <div class="mobile-product-item">
                              <div class="mobile-product-header">
                                <div class="product-header-left">
                                  <div
                                    class="provider-icon-small-mobile"
                                    [style.background]="
                                      getProviderGradient(item.provider)
                                    "
                                  >
                                    <span>{{
                                      getProviderInitial(item.provider)
                                    }}</span>
                                  </div>
                                  <span class="product-name"
                                    >{{ item.count }}x {{ item.name }}</span
                                  >
                                </div>
                                <span class="product-quantity-badge"
                                  >Qty: {{ item.totalQuantity }}</span
                                >
                              </div>
                              <div class="mobile-product-details">
                                <div class="detail-item">
                                  <span class="detail-label"
                                    >Last Purchase</span
                                  >
                                  <span class="detail-value">{{
                                    formatDay(item.latestDate)
                                  }}</span>
                                </div>
                                <div class="detail-item">
                                  <span class="detail-label">Revenue</span>
                                  <span class="detail-value total"
                                    >{{
                                      item.totalRevenue | numberFormat: '0.00'
                                    }}
                                    RON</span
                                  >
                                </div>
                                <div class="detail-item full-width">
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
                                      }}% of period
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
                    }
                  </div>
                }
              </div>
            </div>

            @if (!currentPeriods().length) {
              <div class="empty-state">No product data available</div>
            }
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

    /* Receipts Container Styles */
    .receipts-container {
      overflow-y: auto;
    }

    .desktop-view {
      display: block;
    }

    .receipts-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Receipt Card */
    .receipt-card {
      background: #fff;
      border-radius: 16px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .receipt-card.expanded {
      box-shadow: 0 12px 30px rgba(37, 99, 235, 0.15);
    }

    /* Card Header */
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      cursor: pointer;
      transition: all 0.2s;
      background: #fff;
    }

    .receipt-card.expanded .card-header {
      background: linear-gradient(135deg, #fff 0%, #f0f9ff 100%);
      border-bottom: 2px solid #e2e8f0;
    }

    .card-header:hover {
      background: #f9fafb;
    }

    /* Header Sections */
    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;
      flex: 1;
    }

    .provider-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }

    .provider-icon-small {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .provider-icon-small-mobile {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .provider-initial {
      color: #fff;
      font-size: 20px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .provider-icon-small .provider-initial,
    .provider-icon-small-mobile span {
      color: #fff;
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .provider-details {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .receipt-date-small {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }

    /* Header Right */
    .header-right {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .price-summary {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .total-price {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }

    .price-value {
      font-size: 20px;
      font-weight: 800;
      color: #059669;
      letter-spacing: -0.5px;
    }

    .discount-badge {
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      color: #dc2626;
    }

    .products-count {
      background: #3b82f6;
      color: #fff;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }

    /* Expanded Content */
    .card-expanded {
      animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: linear-gradient(180deg, #f8fafc 0%, #fff 100%);
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

    /* Products Section */
    .products-section {
      padding: 10px;
    }

    /* Products Table */
    .products-table-wrapper {
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      background: #fff;
    }

    .products-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 700px;
    }

    .products-table th {
      padding: 14px 16px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      color: #475569;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: left;
      border-bottom: 2px solid #e2e8f0;
    }

    .products-table td {
      padding: 14px 16px;
      color: #334155;
      font-size: 13px;
      border-bottom: 1px solid #f1f5f9;
    }

    .product-row {
      transition: all 0.2s;
    }

    .product-row:hover {
      background: #f8fafc;
    }

    .product-row:last-child td {
      border-bottom: none;
    }

    .provider-cell {
      width: 60px;
    }

    .product-name-cell {
      font-weight: 600;
      color: #1e293b;
    }

    .product-name {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .product-price {
      color: #059669;
      font-weight: 600;
    }

    .product-quantity {
      text-align: center;
    }

    .quantity-badge {
      display: inline-block;
      background: #e2e8f0;
      padding: 4px 10px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 12px;
      color: #475569;
    }

    .product-total {
      font-weight: 700;
      color: #0f766e;
      text-align: right;
    }

    .date-cell {
      font-size: 12px;
      color: #64748b;
      white-space: nowrap;
    }

    .percentage-cell {
      width: 140px;
    }

    .percentage-bar-wrapper {
      width: 100%;
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

    /* Mobile View */
    .mobile-view {
      display: none;
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

    .empty-mobile {
      text-align: center;
      padding: 24px;
      color: #9ca3af;
      font-size: 0.75rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .desktop-view {
        display: none;
      }

      .mobile-view {
        display: block;
        padding: 12px;
        overflow-y: auto;
      }

      .mobile-card {
        background: #fff;
        border: 1px solid #e2e6ee;
        border-radius: 12px;
        margin-bottom: 12px;
        overflow: hidden;
        box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.05);
      }

      .mobile-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: #eff6ff;
        cursor: pointer;
      }

      .mobile-card-header:active {
        background: #e0f2fe;
      }

      .mobile-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
      }

      .mobile-header-left .provider-initial {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-weight: 700;
        font-size: 16px;
        text-transform: uppercase;
      }

      .mobile-provider-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .mobile-provider-name {
        font-weight: 600;
        font-size: 14px;
        color: #1e293b;
      }

      .mobile-date {
        font-size: 11px;
        color: #6b7280;
      }

      .mobile-header-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .mobile-total {
        text-align: right;
      }

      .total-value {
        font-weight: 700;
        font-size: 14px;
        color: #059669;
      }

      .mobile-discount {
        background: #fee2e2;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        color: #dc2626;
      }

      .mobile-card-body {
        border-top: 1px solid #e2e6ee;
        animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .mobile-products-list {
        padding: 12px;
      }

      .mobile-product-item {
        background: #f8fafc;
        border-radius: 10px;
        margin-bottom: 10px;
        padding: 12px;
        border-left: 3px solid #3b82f6;
      }

      .mobile-product-item:last-child {
        margin-bottom: 0;
      }

      .mobile-product-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid #e2e8f0;
      }

      .product-header-left {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }

      .mobile-product-header .product-name {
        font-weight: 600;
        font-size: 13px;
        color: #1e293b;
      }

      .product-quantity-badge {
        background: #e2e8f0;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        color: #475569;
      }

      .mobile-product-details {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }

      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
      }

      .detail-item.full-width {
        flex: 1 1 100%;
        margin-top: 8px;
      }

      .detail-label {
        font-size: 9px;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }

      .detail-value {
        font-weight: 600;
        font-size: 12px;
        color: #1e293b;
      }

      .detail-value.total {
        color: #0f766e;
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
    }

    @media (max-width: 480px) {
      .mobile-view {
        padding: 8px;
      }

      .mobile-card-header {
        padding: 10px;
      }

      .mobile-header-left .provider-initial {
        width: 36px;
        height: 36px;
        font-size: 14px;
      }

      .total-value {
        font-size: 13px;
      }

      .mobile-discount {
        font-size: 10px;
        padding: 3px 6px;
      }

      .mobile-product-item {
        padding: 10px;
      }

      .mobile-product-header .product-name {
        font-size: 12px;
      }

      .detail-value {
        font-size: 11px;
      }
    }
  `,
})
export class MostCommonProductsComponent {
  receipts = input<ReceiptsProductDomain[]>([]);

  viewMode = signal<'all' | 'monthly' | 'yearly' | 'receipts'>('monthly');
  expandedPeriodId = signal<string | null>(null);
  expandedReceiptId = signal<string | null>(null);

  // Provider mapping based on product name patterns
  private readonly providerMap = new Map<
    string,
    { name: string; icon: string; color: string }
  >([
    [
      'LIDL',
      {
        name: 'LIDL',
        icon: 'L',
        color: `linear-gradient(
          135deg,
          #003580 0%,
          #003580 50%,
          #ffc107 100%
        )`,
      },
    ],
    [
      'CARREFOUR',
      {
        name: 'CARREFOUR',
        icon: 'C',
        color: `linear-gradient(
          135deg,
          #1e3a8a 0%,
          #3b82f6 50%,
          #dc2626 100%
        )`,
      },
    ],
    [
      'KAUFLAND',
      {
        name: 'KAUFLAND',
        icon: 'K',
        color: `linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #ef4444 100%)`,
      },
    ],
  ]);

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

  togglePeriod(periodId: string) {
    const currentExpanded = this.expandedPeriodId();
    if (currentExpanded === periodId) {
      this.expandedPeriodId.set(null);
    } else {
      this.expandedPeriodId.set(periodId);
    }
  }

  toggleReceipt(receiptId: string) {
    const currentExpanded = this.expandedReceiptId();
    if (currentExpanded === receiptId) {
      this.expandedReceiptId.set(null);
    } else {
      this.expandedReceiptId.set(receiptId);
    }
  }

  formatDay(date: Date | null): string {
    if (!date) return '';
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${day} ${month} ${date.getFullYear()}`;
  }

  getProviderFromProduct(provider: string): {
    name: string;
    icon: string;
    color: string;
  } {
    const upperName = provider.toUpperCase();
    for (const [key, value] of this.providerMap.entries()) {
      if (upperName.includes(key)) {
        return value;
      }
    }
    // Default for unknown providers
    return {
      name: 'STORE',
      icon: upperName.charAt(0) || 'S',
      color: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    };
  }

  getProviderInitial(provider: string): string {
    return this.getProviderFromProduct(provider).icon;
  }

  getProviderGradient(provider: string): string {
    return this.getProviderFromProduct(provider).color;
  }

  currentPeriods = computed((): PeriodGroup[] => {
    if (this.viewMode() === 'monthly') {
      return this.groupedByMonth();
    } else if (this.viewMode() === 'yearly') {
      return this.groupedByYear();
    }
    return [];
  });

  receiptGroups = computed((): Receipt[] => {
    if (this.viewMode() !== 'receipts') return [];

    const products = this.receipts();
    if (!products?.length) return [];

    const receiptMap = new Map<string, ReceiptsProductDomain[]>();

    for (const product of products) {
      const receiptKey =
        (product as any).receiptId ||
        product.purchasedDate?.getTime()?.toString() ||
        'unknown';

      if (!receiptMap.has(receiptKey)) {
        receiptMap.set(receiptKey, []);
      }
      receiptMap.get(receiptKey)!.push(product);
    }

    const receipts: Receipt[] = [];

    for (const [key, receiptProducts] of receiptMap.entries()) {
      const receiptDate = receiptProducts[0]?.purchasedDate || new Date();
      const totalPrice = receiptProducts.reduce(
        (sum, p) => sum + (p.price ?? 0) * (p.quantity ?? 0),
        0,
      );
      const totalQuantity = receiptProducts.reduce(
        (sum, p) => sum + (p.quantity ?? 0),
        0,
      );

      // Determine provider from first product
      const firstProduct = receiptProducts[0];
      const provider = this.getProviderFromProduct(
        firstProduct?.provider || '',
      );

      receipts.push({
        id: `receipt-${key}`,
        receiptId: key,
        date: receiptDate,
        totalPrice,
        totalQuantity,
        products: receiptProducts,
        provider: provider.name,
        providerIcon: provider.icon,
        providerColor: provider.color,
      });
    }

    return receipts.sort((a, b) => b.date.getTime() - a.date.getTime());
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
          provider: product.provider,
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
