import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReceiptDomain } from '../../../models/receipts-domain.model';

@Component({
  selector: 'p-receipts-list',
  imports: [CommonModule],
  template: `<div class="receipts-container">
    <!-- Desktop View - Modern Card Design -->
    <div class="desktop-view">
      <div class="receipts-grid">
        @for (receipt of receipts; track receipt.id) {
          <div
            class="receipt-card"
            [class.expanded]="expandedId === receipt.id"
          >
            <!-- Card Header -->
            <div class="card-header" (click)="toggle(receipt.id)">
              <div class="header-left">
                <div class="provider-icon">
                  <span class="provider-initial">{{
                    receipt.provider.charAt(0)
                  }}</span>
                </div>
                <div class="provider-details">
                  <h3 class="provider-name">{{ receipt.provider }}</h3>
                  <span class="receipt-date">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    {{ receipt.date | date: 'dd MMM yyyy' }}
                  </span>
                </div>
              </div>
              <div class="header-right">
                <div class="price-summary">
                  <div class="total-price">
                    <span class="price-label">Total</span>
                    <span class="price-value">{{
                      receipt.totalPrice | currency: 'RON'
                    }}</span>
                  </div>
                  @if (receipt.totalDiscount) {
                    <div class="discount-badge">
                      <span
                        >-{{ receipt.totalDiscount | currency: 'RON' }}</span
                      >
                    </div>
                  }
                </div>
                <button
                  class="expand-btn"
                  [class.rotated]="expandedId === receipt.id"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Expanded Content -->
            @if (expandedId === receipt.id) {
              <div class="card-expanded">
                <div class="products-section">
                  <div class="section-header">
                    <div class="section-title">
                      <span class="title-icon">📦</span>
                      <h4>Products</h4>
                      <span class="products-count">{{
                        receipt.products.length
                      }}</span>
                    </div>
                    <div class="section-summary">
                      <div class="summary-item">
                        <span>Subtotal:</span>
                        <strong>{{
                          receipt.totalPrice + (receipt.totalDiscount || 0)
                            | currency: 'RON'
                        }}</strong>
                      </div>
                      @if (receipt.totalDiscount) {
                        <div class="summary-item discount">
                          <span>Discount:</span>
                          <strong
                            >-{{
                              receipt.totalDiscount | currency: 'RON'
                            }}</strong
                          >
                        </div>
                      }
                      <div class="summary-item total">
                        <span>Total:</span>
                        <strong>{{
                          receipt.totalPrice | currency: 'RON'
                        }}</strong>
                      </div>
                    </div>
                  </div>

                  <div class="products-table-wrapper">
                    <table class="products-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Price</th>
                          <th>Qty</th>
                          <th>Type</th>
                          <th>VAT</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (product of receipt.products; track product.id) {
                          <tr class="product-row">
                            <td class="product-name-cell">
                              <div class="product-name">{{ product.name }}</div>
                            </td>
                            <td class="product-price">
                              {{ product.price | currency: 'RON' }}
                            </td>
                            <td class="product-quantity">
                              <span class="quantity-badge">{{
                                product.quantity
                              }}</span>
                            </td>
                            <td class="product-type">
                              <span class="type-badge">{{
                                product.quantityType
                              }}</span>
                            </td>
                            <td class="product-vat">
                              <span class="vat-badge">{{ product.vat }}%</span>
                            </td>
                            <td class="product-total">
                              <strong>{{
                                product.price * product.quantity
                                  | currency: 'RON'
                              }}</strong>
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
      @for (receipt of receipts; track receipt.id) {
        <div class="mobile-card">
          <div class="mobile-card-header" (click)="toggle(receipt.id)">
            <div class="mobile-header-left">
              <div class="provider-initial">
                {{ receipt.provider.charAt(0) }}
              </div>
              <div class="mobile-provider-info">
                <div class="mobile-provider-name">{{ receipt.provider }}</div>
                <div class="mobile-date">
                  {{ receipt.date | date: 'dd MMM yyyy' }}
                </div>
              </div>
            </div>
            <div class="mobile-header-right">
              <div class="mobile-total">
                <span class="total-label">Total</span>
                <span class="total-value">{{
                  receipt.totalPrice | currency: 'RON'
                }}</span>
              </div>
              @if (receipt.totalDiscount) {
                <div class="mobile-discount">
                  -{{ receipt.totalDiscount | currency: 'RON' }}
                </div>
              }
              <button
                class="mobile-expand-btn"
                [class.rotated]="expandedId === receipt.id"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
          </div>

          @if (expandedId === receipt.id) {
            <div class="mobile-card-body">
              <div class="mobile-products-list">
                @for (product of receipt.products; track product.id) {
                  <div class="mobile-product-item">
                    <div class="mobile-product-header">
                      <span class="product-name">{{ product.name }}</span>
                      <span class="product-quantity-badge"
                        >x{{ product.quantity }}</span
                      >
                    </div>
                    <div class="mobile-product-details">
                      <div class="detail-item">
                        <span class="detail-label">Price</span>
                        <span class="detail-value">{{
                          product.price | currency: 'RON'
                        }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Type</span>
                        <span class="detail-value">{{
                          product.quantityType
                        }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">VAT</span>
                        <span class="detail-value vat">{{ product.vat }}%</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Total</span>
                        <span class="detail-value total">{{
                          product.price * product.quantity | currency: 'RON'
                        }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
              <div class="mobile-summary">
                <div class="summary-row">
                  <span>Subtotal:</span>
                  <strong>{{
                    receipt.totalPrice + (receipt.totalDiscount || 0)
                      | currency: 'RON'
                  }}</strong>
                </div>
                @if (receipt.totalDiscount) {
                  <div class="summary-row discount">
                    <span>Discount:</span>
                    <strong
                      >-{{ receipt.totalDiscount | currency: 'RON' }}</strong
                    >
                  </div>
                }
                <div class="summary-row total">
                  <span>Total:</span>
                  <strong>{{ receipt.totalPrice | currency: 'RON' }}</strong>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  </div>`,
  styles: `
    /* Container */
    .receipts-container {
      height: calc(100vh - 100px);
      overflow-y: auto;
      padding: 20px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }

    /* Desktop View */
    .desktop-view {
      display: block;
    }

    /* Grid Layout */
    .receipts-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Receipt Card */
    .receipt-card {
      background: white;
      border-radius: 16px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .receipt-card:hover {
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
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
      transition: all 0.2s ease;
      background: white;
    }

    .receipt-card.expanded .card-header {
      background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
      border-bottom: 2px solid #e2e8f0;
    }

    /* Header Left Section */
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
    }

    .provider-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
    }

    .provider-initial {
      color: white;
      font-size: 20px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .provider-details {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .provider-name {
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      letter-spacing: -0.3px;
    }

    .receipt-date {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #64748b;
      font-size: 12px;
      font-weight: 500;
    }

    .receipt-date svg {
      color: #94a3b8;
    }

    /* Header Right Section */
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

    .price-label {
      font-size: 11px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
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

    /* Expand Button */
    .expand-btn {
      background: #f1f5f9;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #64748b;
    }

    .expand-btn:hover {
      background: #e2e8f0;
      transform: scale(1.05);
    }

    .expand-btn.rotated svg {
      transform: rotate(180deg);
    }

    .expand-btn svg {
      transition: transform 0.3s ease;
    }

    /* Expanded Content */
    .card-expanded {
      animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
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
      padding: 24px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .title-icon {
      font-size: 24px;
    }

    .section-title h4 {
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .products-count {
      background: #3b82f6;
      color: white;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }

    .section-summary {
      display: flex;
      gap: 20px;
      align-items: center;
      flex-wrap: wrap;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #64748b;
      padding: 6px 12px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .summary-item strong {
      color: #1e293b;
      font-weight: 700;
    }

    .summary-item.discount strong {
      color: #dc2626;
    }

    .summary-item.total {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
    }

    .summary-item.total strong {
      color: #059669;
      font-size: 14px;
    }

    /* Products Table */
    .products-table-wrapper {
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      background: white;
    }

    .products-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 800px;
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
      transition: all 0.2s ease;
    }

    .product-row:hover {
      background-color: #f8fafc;
    }

    .product-row:last-child td {
      border-bottom: none;
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

    .type-badge {
      display: inline-block;
      background: #dbeafe;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      color: #3b82f6;
    }

    .vat-badge {
      display: inline-block;
      background: #fef2f2;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      color: #dc2626;
    }

    .product-total {
      font-weight: 700;
      color: #0f766e;
      text-align: right;
    }

    /* Mobile View */
    .mobile-view {
      display: none;
    }

    /* Responsive - Mobile Styles */
    @media (max-width: 768px) {
      .desktop-view {
        display: none;
      }

      .mobile-view {
        display: block;
        padding: 12px;
        overflow-y: auto;
        height: calc(100vh - 100px);
      }

      .mobile-card {
        background: white;
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
        transition: background 0.2s ease;
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

      .provider-initial {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
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

      .total-label {
        font-size: 9px;
        color: #6b7280;
        text-transform: uppercase;
        display: block;
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

      .mobile-expand-btn {
        background: white;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #64748b;
      }

      .mobile-expand-btn.rotated svg {
        transform: rotate(180deg);
      }

      .mobile-expand-btn svg {
        transition: transform 0.3s ease;
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
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }

      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
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

      .detail-value.vat {
        color: #dc2626;
      }

      .detail-value.total {
        color: #0f766e;
      }

      .mobile-summary {
        padding: 12px;
        background: #f1f5f9;
        border-top: 1px solid #e2e8f0;
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #64748b;
        margin-bottom: 6px;
      }

      .summary-row:last-child {
        margin-bottom: 0;
      }

      .summary-row strong {
        color: #1e293b;
      }

      .summary-row.discount strong {
        color: #dc2626;
      }

      .summary-row.total {
        font-size: 14px;
        font-weight: 700;
        padding-top: 6px;
        border-top: 1px solid #cbd5e1;
        margin-top: 6px;
      }

      .summary-row.total strong {
        color: #059669;
        font-size: 16px;
      }
    }

    /* Extra small screens */
    @media (max-width: 480px) {
      .receipts-container {
        padding: 12px;
      }

      .mobile-view {
        padding: 8px;
      }

      .mobile-card-header {
        padding: 10px;
      }

      .provider-initial {
        width: 36px;
        height: 36px;
        font-size: 14px;
      }

      .mobile-provider-name {
        font-size: 13px;
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

      .summary-row.total strong {
        font-size: 14px;
      }
    }

    /* Scrollbar Styling */
    .receipts-container::-webkit-scrollbar {
      width: 8px;
    }

    .receipts-container::-webkit-scrollbar-track {
      background: #e2e8f0;
      border-radius: 10px;
    }

    .receipts-container::-webkit-scrollbar-thumb {
      background: #94a3b8;
      border-radius: 10px;
    }

    .receipts-container::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }
  `,
})
export class ReceiptListComponent {
  @Input() receipts: ReceiptDomain[] = [];

  expandedId: number | null = null;

  toggle(id: number) {
    if (this.expandedId === id) {
      this.expandedId = null;
    } else {
      this.expandedId = id;
    }
  }
}
