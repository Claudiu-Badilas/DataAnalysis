import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  input,
  signal,
  ChangeDetectionStrategy,
  inject,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
  effect,
} from '@angular/core';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { ReceiptsProductDomain } from '../../models/receipts-products.model';
import { ObjectUtil } from 'src/app/shared/utils/object.utils';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { ProductPriceTrendChartUtils } from '../../utils/products-price-trend.chart.util';

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
  imports: [
    CommonModule,
    NumberFormatPipe,
    ToggleButtonComponent,
    HighchartWrapperComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              @for (
                                item of getAllGroupedProducts();
                                let first = $first;
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
                                  <td class="actions-cell">
                                    @if (hasPriceTrendChart(item.name)) {
                                      <button
                                        class="action-btn chart-btn"
                                        (click)="openProductModal(item)"
                                        title="View price trend chart"
                                      >
                                        <svg
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          stroke-width="2"
                                        >
                                          <path d="M4 20h16M6 16l4-4 4 4 4-4" />
                                          <path d="M18 12l-4-4-4 4-4-4" />
                                        </svg>
                                        <span>Chart</span>
                                      </button>
                                    }
                                  </td>
                                </tr>
                              }

                              @if (!getAllGroupedProducts().length) {
                                <tr>
                                  <td colspan="7" class="empty-cell">
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
                            <div class="mobile-actions">
                              <span class="product-quantity-badge"
                                >Qty: {{ item.totalQuantity }}</span
                              >
                              @if (hasPriceTrendChart(item.name)) {
                                <button
                                  class="action-btn-mobile chart-btn"
                                  (click)="openProductModal(item)"
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                  >
                                    <path d="M4 20h16M6 16l4-4 4 4 4-4" />
                                    <path d="M18 12l-4-4-4 4-4-4" />
                                  </svg>
                                </button>
                              }
                            </div>
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
                                    <th>Actions</th>
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
                                      <td class="actions-cell">
                                        @if (hasPriceTrendChart(product.name)) {
                                          <button
                                            class="action-btn chart-btn"
                                            (click)="
                                              openProductModalFromReceipt(
                                                product,
                                                receipt
                                              )
                                            "
                                            title="View price trend chart"
                                          >
                                            <svg
                                              width="16"
                                              height="16"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              stroke-width="2"
                                            >
                                              <path
                                                d="M4 20h16M6 16l4-4 4 4 4-4"
                                              />
                                              <path d="M18 12l-4-4-4 4-4-4" />
                                            </svg>
                                            <span>Chart</span>
                                          </button>
                                        }
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
                                <div class="mobile-actions">
                                  <span class="product-quantity-badge"
                                    >x{{ product.quantity }}</span
                                  >
                                  @if (hasPriceTrendChart(product.name)) {
                                    <button
                                      class="action-btn-mobile chart-btn"
                                      (click)="
                                        openProductModalFromReceipt(
                                          product,
                                          receipt
                                        )
                                      "
                                    >
                                      <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                      >
                                        <path d="M4 20h16M6 16l4-4 4 4 4-4" />
                                        <path d="M18 12l-4-4-4 4-4-4" />
                                      </svg>
                                    </button>
                                  }
                                </div>
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
                                    <th>Actions</th>
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
                                      <td class="actions-cell">
                                        @if (hasPriceTrendChart(item.name)) {
                                          <button
                                            class="action-btn chart-btn"
                                            (click)="openProductModal(item)"
                                            title="View price trend chart"
                                          >
                                            <svg
                                              width="16"
                                              height="16"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              stroke-width="2"
                                            >
                                              <path
                                                d="M4 20h16M6 16l4-4 4 4 4-4"
                                              />
                                              <path d="M18 12l-4-4-4 4-4-4" />
                                            </svg>
                                            <span>Chart</span>
                                          </button>
                                        }
                                      </td>
                                    </tr>
                                  }

                                  @if (!period.multiple.length) {
                                    <tr>
                                      <td colspan="7" class="empty-cell">
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
                                <div class="mobile-actions">
                                  <span class="product-quantity-badge"
                                    >Qty: {{ item.totalQuantity }}</span
                                  >
                                  @if (hasPriceTrendChart(item.name)) {
                                    <button
                                      class="action-btn-mobile chart-btn"
                                      (click)="openProductModal(item)"
                                    >
                                      <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                      >
                                        <path d="M4 20h16M6 16l4-4 4 4 4-4" />
                                        <path d="M18 12l-4-4-4 4-4-4" />
                                      </svg>
                                    </button>
                                  }
                                </div>
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

    <!-- Product Detail Modal -->
    @if (isModalOpen()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ selectedProduct()?.name }} - Price Trend</h3>
            <button class="modal-close" (click)="closeModal()">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="product-summary">
              <div class="summary-item">
                <span class="label">Total Purchases</span>
                <span class="value">{{ selectedProduct()?.count }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Total Quantity</span>
                <span class="value">{{
                  selectedProduct()?.totalQuantity
                }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Total Revenue</span>
                <span class="value"
                  >{{
                    selectedProduct()?.totalRevenue | numberFormat: '0.00'
                  }}
                  RON</span
                >
              </div>
              <div class="summary-item">
                <span class="label">Avg Price</span>
                <span class="value"
                  >{{
                    selectedProduct()?.avgPrice | numberFormat: '0.00'
                  }}
                  RON</span
                >
              </div>
            </div>
            <div class="chart-container">
              <!-- Performance Optimized Chart Loading -->
              @defer (on viewport; prefetch on idle) {
                <p-highcharts-wrapper
                  class="modal-chart-wrapper"
                  [chartOptions]="getModalChartOptions()"
                />
              } @placeholder {
                <div
                  class="chart-placeholder modal-placeholder"
                  style="height: 300px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center;"
                >
                  <span style="font-size: 14px; color: #9ca3af;"
                    >Loading chart...</span
                  >
                </div>
              } @loading (minimum 500ms) {
                <div
                  class="chart-placeholder modal-placeholder"
                  style="height: 300px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center;"
                >
                  <div
                    class="loading-spinner"
                    style="width: 30px; height: 30px; border: 3px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite;"
                  ></div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Add loading spinner animation -->
    <style>
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* Modal Styles */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .modal-content {
        background: white;
        border-radius: 16px;
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease;
      }

      @keyframes slideUp {
        from {
          transform: translateY(30px) scale(0.95);
          opacity: 0;
        }
        to {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e5e7eb;
        position: sticky;
        top: 0;
        background: white;
        border-radius: 16px 16px 0 0;
        z-index: 10;
      }

      .modal-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
      }

      .modal-close {
        background: #f3f4f6;
        border: none;
        border-radius: 8px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        color: #6b7280;
      }

      .modal-close:hover {
        background: #e5e7eb;
        color: #1f2937;
      }

      .modal-body {
        padding: 24px;
      }

      .product-summary {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin-bottom: 24px;
      }

      .summary-item {
        background: #f8fafc;
        padding: 12px 16px;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .summary-item .label {
        font-size: 11px;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }

      .summary-item .value {
        font-size: 16px;
        font-weight: 700;
        color: #1e293b;
      }

      .summary-item .value.total {
        color: #059669;
      }

      .chart-container {
        min-height: 300px;
      }

      .modal-chart-wrapper {
        width: 100%;
        height: 300px;
      }

      .modal-placeholder {
        height: 300px !important;
      }

      /* Action Button Styles */
      .actions-cell {
        width: 100px;
        text-align: center;
      }

      .action-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        background: #eff6ff;
        color: #3b82f6;
      }

      .action-btn:hover {
        background: #dbeafe;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
      }

      .action-btn:active {
        transform: translateY(0);
      }

      .action-btn svg {
        flex-shrink: 0;
      }

      .action-btn-mobile {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 4px 8px;
        border: none;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        background: #eff6ff;
        color: #3b82f6;
      }

      .action-btn-mobile:hover {
        background: #dbeafe;
      }

      .mobile-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      @media (max-width: 768px) {
        .modal-content {
          width: 95%;
          margin: 20px;
        }

        .product-summary {
          grid-template-columns: repeat(2, 1fr);
        }

        .modal-body {
          padding: 16px;
        }
      }

      @media (max-width: 480px) {
        .modal-content {
          width: 100%;
          margin: 10px;
          border-radius: 12px;
        }

        .modal-header {
          padding: 16px 20px;
        }

        .modal-header h3 {
          font-size: 16px;
        }

        .product-summary {
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .summary-item {
          padding: 10px 12px;
        }

        .summary-item .value {
          font-size: 14px;
        }

        .modal-body {
          padding: 12px;
        }

        .action-btn {
          padding: 4px 10px;
          font-size: 11px;
        }

        .action-btn span {
          display: none;
        }

        .action-btn-mobile {
          padding: 3px 6px;
        }
      }
    </style>
  `,
  styles: `
    // most-common-products.component.scss

    .products-analytics {
      .analytics-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;

        .subtitle {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .header-right {
          display: flex;
          align-items: center;
        }
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        margin-bottom: 1.5rem;

        @media (max-width: 768px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 480px) {
          grid-template-columns: 1fr;
        }
      }

      .stat-card {
        background: white;
        border-radius: 12px;
        padding: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition:
          transform 0.2s,
          box-shadow 0.2s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;

          &.revenue-icon {
            background: linear-gradient(135deg, #059669, #10b981);
          }

          &.quantity-icon {
            background: linear-gradient(135deg, #2563eb, #3b82f6);
          }

          &.products-icon {
            background: linear-gradient(135deg, #7c3aed, #8b5cf6);
          }

          &.avg-icon {
            background: linear-gradient(135deg, #d97706, #f59e0b);
          }
        }

        .stat-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;

          .stat-label {
            font-size: 0.75rem;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }

          .stat-value {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1e293b;

            &.positive {
              color: #059669;
            }
          }
        }
      }

      .table-container {
        background: white;
        border-radius: 12px;
        padding: 1rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

        .period-view {
          .receipts-container {
            .desktop-view {
              display: block;

              @media (max-width: 768px) {
                display: none;
              }
            }

            .mobile-view {
              display: none;

              @media (max-width: 768px) {
                display: block;
              }
            }

            .receipts-grid {
              display: flex;
              flex-direction: column;
              gap: 1rem;
            }

            .receipt-card {
              background: white;
              border-radius: 12px;
              border: 1px solid #e5e7eb;
              overflow: hidden;
              transition: all 0.3s ease;

              &:hover {
                border-color: #d1d5db;
              }

              &.expanded {
                border-color: #3b82f6;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
              }

              .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 1.25rem;
                cursor: pointer;
                transition: background 0.2s;
                user-select: none;

                &:hover {
                  background: #f8fafc;
                }

                .header-left {
                  display: flex;
                  align-items: center;
                  gap: 0.75rem;
                  flex: 1;
                  min-width: 0;

                  .provider-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;

                    .provider-initial {
                      color: white;
                      font-weight: 700;
                      font-size: 14px;
                    }
                  }

                  .provider-details {
                    font-weight: 600;
                    color: #1e293b;
                    font-size: 0.95rem;
                  }

                  .receipt-date-small {
                    font-size: 0.8rem;
                    color: #6b7280;
                    margin-left: 0.25rem;
                  }

                  .products-count {
                    background: #e5e7eb;
                    color: #4b5563;
                    font-size: 0.7rem;
                    font-weight: 600;
                    padding: 0.15rem 0.6rem;
                    border-radius: 20px;
                    margin-left: 0.5rem;
                  }
                }

                .header-right {
                  display: flex;
                  align-items: center;
                  gap: 0.75rem;

                  .price-summary {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;

                    .total-price {
                      .price-value {
                        font-weight: 700;
                        color: #1e293b;
                        font-size: 1rem;
                      }
                    }

                    .discount-badge {
                      background: #fef2f2;
                      color: #dc2626;
                      font-size: 0.7rem;
                      padding: 0.15rem 0.5rem;
                      border-radius: 6px;
                      font-weight: 600;
                    }
                  }
                }
              }

              .card-expanded {
                padding: 0 1.25rem 1.25rem;
                border-top: 1px solid #e5e7eb;
                animation: expandIn 0.3s ease;

                .products-section {
                  .products-table-wrapper {
                    overflow-x: auto;

                    .products-table {
                      width: 100%;
                      border-collapse: collapse;
                      font-size: 0.875rem;

                      thead {
                        th {
                          text-align: left;
                          padding: 0.75rem 0.5rem;
                          font-weight: 600;
                          color: #6b7280;
                          font-size: 0.75rem;
                          text-transform: uppercase;
                          letter-spacing: 0.3px;
                          border-bottom: 2px solid #e5e7eb;
                          white-space: nowrap;
                        }
                      }

                      tbody {
                        td {
                          padding: 0.75rem 0.5rem;
                          border-bottom: 1px solid #f3f4f6;
                          vertical-align: middle;

                          &.provider-cell {
                            width: 50px;

                            .provider-icon-small {
                              width: 32px;
                              height: 32px;
                              border-radius: 50%;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              font-size: 12px;
                              font-weight: 700;
                              color: white;
                            }
                          }

                          &.product-name-cell {
                            .product-name {
                              font-weight: 500;
                              color: #1e293b;
                            }
                          }

                          &.product-price {
                            color: #4b5563;
                            white-space: nowrap;
                          }

                          &.product-quantity {
                            .quantity-badge {
                              background: #f3f4f6;
                              padding: 0.15rem 0.6rem;
                              border-radius: 6px;
                              font-size: 0.75rem;
                              font-weight: 600;
                              color: #4b5563;
                              white-space: nowrap;
                            }
                          }

                          &.product-total {
                            font-weight: 600;
                            color: #1e293b;
                            white-space: nowrap;
                          }

                          &.percentage-cell {
                            .percentage-bar-wrapper {
                              min-width: 100px;

                              .percentage-bar {
                                position: relative;
                                height: 20px;
                                background: #f3f4f6;
                                border-radius: 6px;
                                overflow: hidden;

                                .percentage-fill {
                                  height: 100%;
                                  border-radius: 6px;
                                  transition: width 0.6s ease;

                                  &.revenue-fill {
                                    background: linear-gradient(
                                      90deg,
                                      #3b82f6,
                                      #10b981
                                    );
                                  }
                                }

                                .percentage-text {
                                  position: absolute;
                                  top: 50%;
                                  left: 50%;
                                  transform: translate(-50%, -50%);
                                  font-size: 0.7rem;
                                  font-weight: 600;
                                  color: #1e293b;
                                  white-space: nowrap;
                                }
                              }
                            }
                          }

                          &.actions-cell {
                            .action-btn {
                              display: inline-flex;
                              align-items: center;
                              gap: 4px;
                              padding: 4px 10px;
                              border: none;
                              border-radius: 6px;
                              font-size: 0.7rem;
                              font-weight: 600;
                              cursor: pointer;
                              transition: all 0.2s;
                              background: #eff6ff;
                              color: #3b82f6;

                              &:hover {
                                background: #dbeafe;
                                transform: translateY(-1px);
                                box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
                              }

                              svg {
                                width: 14px;
                                height: 14px;
                              }
                            }
                          }
                        }

                        tr:last-child td {
                          border-bottom: none;
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          // Mobile styles
          .mobile-view {
            .mobile-card {
              background: white;
              border-radius: 12px;
              border: 1px solid #e5e7eb;
              overflow: hidden;
              margin-bottom: 1rem;

              .mobile-card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.875rem 1rem;
                cursor: pointer;
                user-select: none;

                &:active {
                  background: #f8fafc;
                }

                .mobile-header-left {
                  display: flex;
                  align-items: center;
                  gap: 0.75rem;
                  flex: 1;
                  min-width: 0;

                  .provider-initial {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    font-size: 13px;
                    flex-shrink: 0;
                  }

                  .mobile-provider-info {
                    flex: 1;
                    min-width: 0;

                    .mobile-provider-name {
                      font-weight: 600;
                      color: #1e293b;
                      font-size: 0.9rem;
                    }

                    .mobile-date {
                      font-size: 0.75rem;
                      color: #6b7280;
                    }
                  }

                  .products-count {
                    background: #e5e7eb;
                    color: #4b5563;
                    font-size: 0.65rem;
                    font-weight: 600;
                    padding: 0.15rem 0.5rem;
                    border-radius: 20px;
                    margin-left: 0.25rem;
                    flex-shrink: 0;
                  }
                }

                .mobile-header-right {
                  display: flex;
                  flex-direction: column;
                  align-items: flex-end;
                  gap: 0.15rem;

                  .mobile-total {
                    .total-value {
                      font-weight: 700;
                      color: #1e293b;
                      font-size: 0.9rem;
                    }
                  }

                  .mobile-discount {
                    font-size: 0.7rem;
                    color: #dc2626;
                    font-weight: 600;
                  }
                }
              }

              .mobile-card-body {
                padding: 0 1rem 1rem;
                border-top: 1px solid #e5e7eb;

                .mobile-products-list {
                  .mobile-product-item {
                    padding: 0.75rem 0;
                    border-bottom: 1px solid #f3f4f6;

                    &:last-child {
                      border-bottom: none;
                    }

                    .mobile-product-header {
                      display: flex;
                      justify-content: space-between;
                      align-items: center;

                      .product-header-left {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        flex: 1;
                        min-width: 0;

                        .provider-icon-small-mobile {
                          width: 28px;
                          height: 28px;
                          border-radius: 50%;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          font-size: 10px;
                          font-weight: 700;
                          color: white;
                          flex-shrink: 0;
                        }

                        .product-name {
                          font-weight: 500;
                          color: #1e293b;
                          font-size: 0.85rem;
                        }
                      }

                      .mobile-actions {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;

                        .product-quantity-badge {
                          background: #f3f4f6;
                          padding: 0.1rem 0.5rem;
                          border-radius: 4px;
                          font-size: 0.7rem;
                          font-weight: 600;
                          color: #4b5563;
                          white-space: nowrap;
                        }

                        .action-btn-mobile {
                          display: inline-flex;
                          align-items: center;
                          justify-content: center;
                          padding: 3px 6px;
                          border: none;
                          border-radius: 4px;
                          font-size: 0.65rem;
                          font-weight: 600;
                          cursor: pointer;
                          transition: all 0.2s;
                          background: #eff6ff;
                          color: #3b82f6;

                          &:hover {
                            background: #dbeafe;
                          }

                          svg {
                            width: 14px;
                            height: 14px;
                          }
                        }
                      }
                    }

                    .mobile-product-details {
                      display: grid;
                      grid-template-columns: 1fr 1fr;
                      gap: 0.5rem;
                      margin-top: 0.5rem;

                      .detail-item {
                        display: flex;
                        flex-direction: column;
                        gap: 0.1rem;

                        &.full-width {
                          grid-column: 1 / -1;
                        }

                        .detail-label {
                          font-size: 0.65rem;
                          color: #6b7280;
                          text-transform: uppercase;
                          letter-spacing: 0.3px;
                        }

                        .detail-value {
                          font-size: 0.85rem;
                          font-weight: 600;
                          color: #1e293b;

                          &.total {
                            color: #059669;
                          }
                        }

                        .percentage-bar-mobile {
                          position: relative;
                          height: 16px;
                          background: #f3f4f6;
                          border-radius: 4px;
                          overflow: hidden;

                          .percentage-fill-mobile {
                            height: 100%;
                            border-radius: 4px;
                            transition: width 0.6s ease;

                            &.revenue-fill {
                              background: linear-gradient(
                                90deg,
                                #3b82f6,
                                #10b981
                              );
                            }
                          }

                          .percentage-text-mobile {
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            font-size: 0.6rem;
                            font-weight: 600;
                            color: #1e293b;
                            white-space: nowrap;
                          }
                        }
                      }
                    }
                  }

                  .empty-mobile {
                    text-align: center;
                    padding: 2rem 0;
                    color: #6b7280;
                    font-size: 0.9rem;
                  }
                }
              }
            }
          }

          .empty-state {
            text-align: center;
            padding: 3rem 0;
            color: #6b7280;
            font-size: 1rem;
          }
        }
      }
    }

    @keyframes expandIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    // Modal styles
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      max-width: 800px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease;

      @media (max-width: 768px) {
        width: 95%;
        margin: 20px;
      }

      @media (max-width: 480px) {
        width: 100%;
        margin: 10px;
        border-radius: 12px;
      }
    }

    @keyframes slideUp {
      from {
        transform: translateY(30px) scale(0.95);
        opacity: 0;
      }
      to {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
      position: sticky;
      top: 0;
      background: white;
      border-radius: 16px 16px 0 0;
      z-index: 10;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;

        @media (max-width: 480px) {
          font-size: 16px;
        }
      }

      .modal-close {
        background: #f3f4f6;
        border: none;
        border-radius: 8px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        color: #6b7280;

        &:hover {
          background: #e5e7eb;
          color: #1f2937;
        }
      }
    }

    .modal-body {
      padding: 24px;

      @media (max-width: 768px) {
        padding: 16px;
      }

      @media (max-width: 480px) {
        padding: 12px;
      }

      .product-summary {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin-bottom: 24px;

        @media (max-width: 768px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 480px) {
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .summary-item {
          background: #f8fafc;
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;

          @media (max-width: 480px) {
            padding: 10px 12px;
          }

          .label {
            font-size: 11px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }

          .value {
            font-size: 16px;
            font-weight: 700;
            color: #1e293b;

            @media (max-width: 480px) {
              font-size: 14px;
            }

            &.total {
              color: #059669;
            }
          }
        }
      }

      .chart-container {
        min-height: 300px;

        .modal-chart-wrapper {
          width: 100%;
          height: 300px;
        }
      }
    }

    .loading-spinner {
      width: 30px;
      height: 30px;
      border: 3px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class MostCommonProductsComponent implements OnChanges {
  private cdr = inject(ChangeDetectorRef);

  receipts = input<ReceiptsProductDomain[]>([]);

  // Chart cache for performance optimization
  private chartCache = new Map<string, any>();
  private chartLoading = new Map<string, boolean>();
  private chartLoaded = new Map<string, boolean>();

  viewMode = signal<'all' | 'monthly' | 'yearly' | 'receipts'>('monthly');
  expandedPeriodId = signal<string | null>(null);
  expandedReceiptId = signal<string | null>(null);

  // Modal state
  isModalOpen = signal<boolean>(false);
  selectedProduct = signal<GroupedProduct | null>(null);
  private modalChartOptions = signal<any>(null);

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
          #0050AA 0%,
          #0050AA 50%,
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

  // Effect to clear cache when receipts change
  constructor() {
    effect(() => {
      // Trigger when receipts change
      const currentReceipts = this.receipts();
      if (currentReceipts) {
        // Clear caches when data changes
        this.chartCache.clear();
        this.chartLoading.clear();
        this.chartLoaded.clear();
        this.cdr.markForCheck();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['receipts']) {
      // Clear all caches when input changes
      this.chartCache.clear();
      this.chartLoading.clear();
      this.chartLoaded.clear();
      this.cdr.markForCheck();
    }
  }

  hasPriceTrendChart(productName: string): any {
    return this.receipts().filter((r) => r.name === productName)?.length > 1;
  }

  // Optimized chart loading with caching
  getPriceTrendChartOptimized(productName: string): any {
    // Check if we already have the chart in cache
    if (this.chartCache.has(productName)) {
      return this.chartCache.get(productName);
    }

    // Check if chart is currently loading
    if (this.chartLoading.get(productName)) {
      return null;
    }

    // Mark as loading
    this.chartLoading.set(productName, true);

    // Use requestIdleCallback or setTimeout for non-blocking loading
    const loadChart = () => {
      try {
        const options = ProductPriceTrendChartUtils.getChart(
          this.receipts()?.filter((p) => p.name === productName) ?? [],
        );
        this.chartCache.set(productName, options);
        this.chartLoaded.set(productName, true);
        this.chartLoading.set(productName, false);
        this.cdr.markForCheck();
      } catch (error) {
        console.error('Error loading chart for product:', productName, error);
        this.chartLoading.set(productName, false);
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadChart, { timeout: 1000 });
    } else {
      setTimeout(loadChart, 50);
    }

    return null;
  }

  // Legacy method for compatibility (can be removed if not used elsewhere)
  getPriceTrentChart(productName: string) {
    return this.getPriceTrendChartOptimized(productName);
  }

  // Open modal for product
  openProductModal(product: GroupedProduct) {
    this.selectedProduct.set(product);
    this.isModalOpen.set(true);
    // Pre-load chart data
    this.getModalChartOptions();
    this.cdr.markForCheck();
  }

  // Open modal from receipt product
  openProductModalFromReceipt(
    product: ReceiptsProductDomain,
    receipt: Receipt,
  ) {
    // Create a GroupedProduct from the receipt product
    const groupedProduct: GroupedProduct = {
      id: product.id,
      name: product.name,
      provider: product.provider,
      count: 1,
      totalQuantity: product.quantity ?? 0,
      totalRevenue: (product.price ?? 0) * (product.quantity ?? 0),
      avgPrice: product.price ?? 0,
      latestDate: product.purchasedDate ?? null,
      dates: [product.purchasedDate ?? new Date()],
      percentageOfTotalQuantity: 0,
      percentageOfTotalRevenue: 0,
    };
    this.openProductModal(groupedProduct);
  }

  // Get modal chart options
  getModalChartOptions(): any {
    const product = this.selectedProduct();
    if (!product) return null;

    if (this.modalChartOptions()) {
      return this.modalChartOptions();
    }

    // Get all receipts for this product
    const productReceipts = this.receipts().filter(
      (p) => p.name === product.name,
    );

    if (productReceipts.length <= 1) return null;

    const options = ProductPriceTrendChartUtils.getChart(productReceipts);
    this.modalChartOptions.set(options);
    return options;
  }

  // Close modal
  closeModal() {
    this.isModalOpen.set(false);
    this.selectedProduct.set(null);
    this.modalChartOptions.set(null);
  }

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
