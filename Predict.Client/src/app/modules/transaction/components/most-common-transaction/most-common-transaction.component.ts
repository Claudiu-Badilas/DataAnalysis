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
  averageAmount: number;
  percentageOfTotal: number;
}

@Component({
  selector: 'p-most-common-transaction',
  imports: [CommonModule, NumberFormatPipe, ToggleButtonComponent],
  templateUrl: './most-common-transaction.component.html',
  styleUrl: './most-common-transaction.component.scss',
})
export class MostCommonTransactionComponent {
  transactions = input<TransactionDomain[]>([]);

  viewMode = signal<'monthly' | 'yearly'>('monthly');
  private expandedMonth = signal<string | null>(null);
  private expandedYear = signal<number | null>(null);

  onToggle(value: string) {
    this.viewMode.set(value === 'Monthly' ? 'monthly' : 'yearly');
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
        const totalAmount = txs.reduce(
          (s, t) => s + Math.abs(t.amount ?? 0),
          0,
        );

        const groupsWithPercentages = grouped.map((g) => ({
          ...g,
          percentageOfTotal:
            totalAmount > 0 ? (Math.abs(g.total) / totalAmount) * 100 : 0,
        }));

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
          transactionCount: txs.length,
          multiple: groupsWithPercentages.filter((g) => g.count >= 2),
          single: groupsWithPercentages.filter((g) => g.count === 1),
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
        const totalAmount = txs.reduce(
          (s, t) => s + Math.abs(t.amount ?? 0),
          0,
        );

        const groupsWithPercentages = grouped.map((g) => ({
          ...g,
          percentageOfTotal:
            totalAmount > 0 ? (Math.abs(g.total) / totalAmount) * 100 : 0,
        }));

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
          transactionCount: txs.length,
          multiple: groupsWithPercentages.filter((g) => g.count >= 2),
          single: groupsWithPercentages.filter((g) => g.count === 1),
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

  totalTransactions = computed(() => this.transactions()?.length ?? 0);

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
          averageAmount: 0,
          percentageOfTotal: 0,
        });
      }

      const g = map.get(key)!;
      g.count++;
      g.total += tx.amount ?? 0;
      g.averageAmount = g.total / g.count;

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
