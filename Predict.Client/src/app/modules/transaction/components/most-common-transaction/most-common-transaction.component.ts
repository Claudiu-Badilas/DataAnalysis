import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { TransactionDomain } from '../../models/transactions.model';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';

interface GroupedTransaction {
  provider: string;
  count: number;
  total: number;
  currency: string | null;
  latestDate: Date | null;
  dates: Date[];
}

interface MonthlyGroup {
  month: string;
  year: number;
  monthIndex: number;
  totalIncome: number;
  totalExpense: number;
  difference: number;
  multiple: GroupedTransaction[];
  single: GroupedTransaction[];
  isExpanded: boolean;
}

interface YearlyGroup {
  year: number;
  totalIncome: number;
  totalExpense: number;
  difference: number;
  multiple: GroupedTransaction[];
  single: GroupedTransaction[];
  isExpanded: boolean;
}

@Component({
  selector: 'p-most-common-transaction',
  imports: [CommonModule, NumberFormatPipe, ToggleButtonComponent],
  template: `
    <div class="card">
      <div class="header">
        <p-toggle-button
          [options]="['Lunar', 'Anual']"
          [selected]="viewMode() === 'monthly' ? 'Lunar' : 'Anual'"
          [gradient]="{
            primaryColor: '#047f94',
            secondaryColor: '#d5a326',
          }"
          (selectionChange)="onToggle($event)"
        />
        <div class="header-stats">
          <span class="stat positive">
            +{{ totalIncome() | numberFormat: '0.00' }}
          </span>
          <span class="stat negative">
            -{{ totalExpense() | numberFormat: '0.00' }}
          </span>
        </div>
      </div>

      <div class="content">
        <!-- MONTHLY VIEW -->
        @if (viewMode() === 'monthly') {
          @for (
            month of groupedByMonth();
            track month.year + '-' + month.monthIndex
          ) {
            <div class="section">
              <div
                class="section-title"
                (click)="toggleMonth(month.year, month.monthIndex)"
              >
                <div class="section-name">
                  <span class="expand-icon">{{
                    month.isExpanded ? '▼' : '▶'
                  }}</span>
                  {{ month.month }} {{ month.year }}
                </div>
                <div class="section-totals">
                  @if (month.totalIncome > 0) {
                    <span class="income-total">
                      +{{ month.totalIncome | numberFormat: '0.00' }}
                    </span>
                  }
                  @if (month.totalExpense > 0) {
                    <span class="expense-total">
                      -{{ month.totalExpense | numberFormat: '0.00' }}
                    </span>
                  }
                  @if (month.difference !== 0) {
                    <span
                      class="difference-total"
                      [class.positive-diff]="month.difference > 0"
                      [class.negative-diff]="month.difference < 0"
                    >
                      {{ month.difference > 0 ? '+' : ''
                      }}{{ month.difference | numberFormat: '0.00' }}
                    </span>
                  }
                </div>
              </div>

              @if (month.isExpanded) {
                <div class="section-content">
                  @for (g of month.multiple; track g.provider) {
                    <ng-container
                      [ngTemplateOutlet]="rowTpl"
                      [ngTemplateOutletContext]="{ g: g, viewMode: 'monthly' }"
                    />
                  }
                  @for (g of month.single; track g.provider) {
                    <ng-container
                      [ngTemplateOutlet]="rowTpl"
                      [ngTemplateOutletContext]="{
                        g: g,
                        single: true,
                        viewMode: 'monthly',
                      }"
                    />
                  }
                  @if (!month.multiple.length && !month.single.length) {
                    <div class="empty-section">No transactions this month</div>
                  }
                </div>
              }
            </div>
          }
          @if (!groupedByMonth().length) {
            <div class="empty">No transactions</div>
          }
        }

        <!-- YEARLY VIEW -->
        @if (viewMode() === 'yearly') {
          @for (year of groupedByYear(); track year.year) {
            <div class="section">
              <div class="section-title" (click)="toggleYear(year.year)">
                <div class="section-name">
                  <span class="expand-icon">{{
                    year.isExpanded ? '▼' : '▶'
                  }}</span>
                  {{ year.year }}
                </div>
                <div class="section-totals">
                  @if (year.totalIncome > 0) {
                    <span class="income-total">
                      +{{ year.totalIncome | numberFormat: '0.00' }}
                    </span>
                  }
                  @if (year.totalExpense > 0) {
                    <span class="expense-total">
                      -{{ year.totalExpense | numberFormat: '0.00' }}
                    </span>
                  }
                  @if (year.difference !== 0) {
                    <span
                      class="difference-total"
                      [class.positive-diff]="year.difference > 0"
                      [class.negative-diff]="year.difference < 0"
                    >
                      ({{ year.difference > 0 ? '+' : ''
                      }}{{ year.difference | numberFormat: '0.00' }})
                    </span>
                  }
                </div>
              </div>

              @if (year.isExpanded) {
                <div class="section-content">
                  @for (g of year.multiple; track g.provider) {
                    <ng-container
                      [ngTemplateOutlet]="rowTpl"
                      [ngTemplateOutletContext]="{ g: g, viewMode: 'yearly' }"
                    />
                  }
                  @for (g of year.single; track g.provider) {
                    <ng-container
                      [ngTemplateOutlet]="rowTpl"
                      [ngTemplateOutletContext]="{
                        g: g,
                        single: true,
                        viewMode: 'yearly',
                      }"
                    />
                  }
                  @if (!year.multiple.length && !year.single.length) {
                    <div class="empty-section">No transactions this year</div>
                  }
                </div>
              }
            </div>
          }
          @if (!groupedByYear().length) {
            <div class="empty">No transactions</div>
          }
        }
      </div>
    </div>

    <!-- Reusable row -->
    <ng-template #rowTpl let-g="g" let-single="single" let-viewMode="viewMode">
      <div class="group">
        <div class="row">
          <span class="provider" [class.other-provider]="single">
            {{ g.provider }}
          </span>
          <span class="date-badge">
            @if (viewMode === 'monthly') {
              {{ formatDate(g.latestDate) }}
            } @else {
              {{ formatMonthDay(g.latestDate) }}
            }
            <span class="date-count" *ngIf="g.count > 1">({{ g.count }}x)</span>
          </span>
          <span
            class="amount"
            [class.positive]="g.total > 0"
            [class.negative]="g.total < 0"
          >
            {{ g.total > 0 ? '+' : '' }}{{ g.total | numberFormat: '0.00' }}
          </span>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
    .card {
      background: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      height: 320px;
      display: flex;
      flex-direction: column;
    }
    .header {
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #eee;
      background: white;
      flex-shrink: 0;
    }
    .header-stats {
      display: flex;
      gap: 12px;
      font-weight: 700;
    }
    .stat.positive {
      color: #10b981;
    }
    .stat.negative {
      color: #ef4444;
    }
    .content {
      flex: 1;
      overflow-y: auto;
      position: relative;
    }
    .section {
      position: relative;
    }
    .section-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      background: #f1f5f9;
      font-weight: 700;
      cursor: pointer;
      user-select: none;
      position: sticky;
      top: 0;
      z-index: 10;
      transition: background-color 0.2s ease;
      border-bottom: 1px solid #e2e8f0;
    }
    .section-title:hover {
      background: #e2e8f0;
    }
    .section-name {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #1e293b;
    }
    .expand-icon {
      font-size: 10px;
      transition: transform 0.2s ease;
      display: inline-block;
      color: #64748b;
    }
    .section-totals {
      display: flex;
      gap: 5px;
      align-items: center;
    }
    .income-total {
      color: #059669;
      background-color: #d1fae5;
      border: 1px solid #a7f3d0;
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: 600;
      display: inline-block;
      font-size: 12px;
    }
    .expense-total {
      color: #dc2626;
      background-color: #fee2e2;
      border: 1px solid #fecaca;
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: 600;
      display: inline-block;
      font-size: 12px;
    }
    .difference-total {
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: 600;
      display: inline-block;
      font-size: 12px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
    }
    .positive-diff {
      color: #10b981;
    }
    .negative-diff {
      color: #ef4444;
    }
    .section-content {
      animation: slideDown 0.2s ease-out;
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
    .group {
      padding: 0 20px;
    }
    .row {
      display: flex;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
      gap: 12px;
      transition: background-color 0.2s ease;
    }
    .row:hover {
      background-color: #f8fafc;
    }
    .provider {
      flex: 1;
      font-size: 13px;
      color: #1e293b;
    }
    .provider.other-provider {
      opacity: 0.6;
      color: #64748b;
    }
    .date-badge {
      background: #fef3c7;
      padding: 2px 8px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 500;
      color: #d97706;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .date-count {
      font-size: 10px;
      opacity: 0.8;
    }
    .amount {
      min-width: 100px;
      text-align: right;
      font-weight: 600;
      font-size: 13px;
    }
    .amount.positive {
      color: #10b981;
    }
    .amount.negative {
      color: #ef4444;
    }
    .empty,
    .empty-section {
      text-align: center;
      padding: 20px;
      color: #94a3b8;
      font-size: 13px;
    }
  `,
})
export class MostCommonTransactionComponent {
  transactions = input<TransactionDomain[]>([]);

  viewMode = signal<'monthly' | 'yearly'>('monthly');
  private expandedMonth = signal<string | null>(null);
  private expandedYear = signal<number | null>(null);

  onToggle(value: string) {
    this.viewMode.set(value === 'Lunar' ? 'monthly' : 'yearly');
    this.expandedMonth.set(null);
    this.expandedYear.set(null);
  }

  toggleMonth(year: number, monthIndex: number) {
    const key = `${year}-${monthIndex}`;
    const currentExpanded = this.expandedMonth();
    if (currentExpanded === key) {
      this.expandedMonth.set(null);
    } else {
      this.expandedMonth.set(key);
    }
  }

  isMonthExpanded(year: number, monthIndex: number): boolean {
    return this.expandedMonth() === `${year}-${monthIndex}`;
  }

  toggleYear(year: number) {
    const currentExpanded = this.expandedYear();
    if (currentExpanded === year) {
      this.expandedYear.set(null);
    } else {
      this.expandedYear.set(year);
    }
  }

  isYearExpanded(year: number): boolean {
    return this.expandedYear() === year;
  }

  formatDate(date: Date | null): string {
    if (!date) return '';
    const day = date.getDate();
    const suffix = this.getDaySuffix(day);
    return `${day}${suffix}`;
  }

  formatMonthDay(date: Date | null): string {
    if (!date) return '';
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    const suffix = this.getDaySuffix(day);
    return `${month} ${day}${suffix}`;
  }

  private getDaySuffix(day: number): string {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  groupedByMonth = computed(() => {
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
        const grouped = this.groupLocal(txs);
        const totalIncome = txs
          .filter((t) => (t.amount ?? 0) > 0)
          .reduce((s, t) => s + (t.amount ?? 0), 0);
        const totalExpense = Math.abs(
          txs
            .filter((t) => (t.amount ?? 0) < 0)
            .reduce((s, t) => s + (t.amount ?? 0), 0),
        );

        return {
          year,
          monthIndex,
          month: new Date(year, monthIndex).toLocaleString('default', {
            month: 'long',
          }),
          totalIncome,
          totalExpense,
          difference: totalIncome - totalExpense,
          multiple: grouped.filter((g) => g.count >= 2),
          single: grouped.filter((g) => g.count === 1),
          isExpanded: this.isMonthExpanded(year, monthIndex),
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.monthIndex - a.monthIndex;
      });
  });

  groupedByYear = computed(() => {
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
        const grouped = this.groupLocal(txs);
        const totalIncome = txs
          .filter((t) => (t.amount ?? 0) > 0)
          .reduce((s, t) => s + (t.amount ?? 0), 0);
        const totalExpense = Math.abs(
          txs
            .filter((t) => (t.amount ?? 0) < 0)
            .reduce((s, t) => s + (t.amount ?? 0), 0),
        );

        return {
          year,
          totalIncome,
          totalExpense,
          difference: totalIncome - totalExpense,
          multiple: grouped.filter((g) => g.count >= 2),
          single: grouped.filter((g) => g.count === 1),
          isExpanded: this.isYearExpanded(year),
        };
      })
      .sort((a, b) => b.year - a.year);
  });

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

  private groupLocal(txs: TransactionDomain[]): GroupedTransaction[] {
    const map = new Map<string, GroupedTransaction>();

    for (const tx of txs) {
      const key = tx.serviceProvider || 'Unknown';
      const date = tx.completionDate || tx.registrationDate;

      if (!map.has(key)) {
        map.set(key, {
          provider: key,
          count: 0,
          total: 0,
          currency: tx.currency,
          latestDate: null,
          dates: [],
        });
      }

      const g = map.get(key)!;
      g.count++;
      g.total += tx.amount ?? 0;

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
}
