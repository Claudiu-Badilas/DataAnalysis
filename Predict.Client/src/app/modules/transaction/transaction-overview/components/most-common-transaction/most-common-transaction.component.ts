import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
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
  // New fields for salary grouping
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
  templateUrl: './most-common-transaction.component.html',
  styleUrls: ['./most-common-transaction.component.scss'],
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
    return `${day} ${month} ${date.getFullYear()}`;
  }

  // Unified computed property for current periods
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

    return grouped
      .map((g) => ({
        ...g,
        percentageOfIncome:
          g.total > 0 && totalIncome > 0 ? (g.total / totalIncome) * 100 : 0,
        percentageOfExpense:
          g.total < 0 && totalExpense > 0
            ? (Math.abs(g.total) / totalExpense) * 100
            : 0,
      }))
      .sort((a, b) => {
        const aIsIncome = a.total > 0;
        const bIsIncome = b.total > 0;

        if (aIsIncome && bIsIncome) {
          return b.percentageOfIncome - a.percentageOfIncome;
        }

        if (!aIsIncome && !bIsIncome) {
          return b.percentageOfExpense - a.percentageOfExpense;
        }

        if (aIsIncome && !bIsIncome) {
          return -1;
        }

        return 1;
      });
  });

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

  // New method for salary-based grouping (15th of each month)
  private groupedBySalaryPeriod = computed((): PeriodGroup[] => {
    const txs = this.selectedTransaction();
    if (!txs?.length) return [];

    // Group transactions by salary period (15th of month to 14th of next month)
    const map = new Map<string, TransactionDomain[]>();

    for (const tx of txs) {
      const date = tx.completionDate || tx.registrationDate;
      if (!date) continue;

      // Calculate the salary period key
      const periodKey = this.getSalaryPeriodKey(date);
      if (!map.has(periodKey)) map.set(periodKey, []);
      map.get(periodKey)!.push(tx);
    }

    return Array.from(map.entries())
      .map(([key, txs]) => {
        const [year, month, day] = key.split('-').map(Number);
        const periodStart = new Date(year, month, day);
        const periodEnd = new Date(year, month, day + 14); // 14 days after start

        const monthName = new Date(year, month).toLocaleString('default', {
          month: 'short',
        });
        const id = `salary-${key}`;

        const processedData = this.processTransactions(txs);

        return {
          id,
          title: `${monthName} ${year} (${day}-${periodEnd.getDate()})`,
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

  // Helper method to determine salary period key
  private getSalaryPeriodKey(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // If day is 15 or later, this belongs to the current month's salary period
    if (day >= 15) {
      return `${year}-${month}-15`;
    } else {
      // If day is before 15, this belongs to the previous month's salary period
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      return `${prevYear}-${prevMonth}-15`;
    }
  }

  // Shared processing logic
  private processTransactions(txs: TransactionDomain[]) {
    const grouped = this.groupLocal(txs);

    // Calculate total income and expense separately
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

    // NEW SORTING LOGIC: Income first (by percentage desc), then Expense (by percentage desc)
    const sortedGroups = groupsWithPercentages.sort((a, b) => {
      // Determine if transaction is income or expense
      const aIsIncome = a.total > 0;
      const bIsIncome = b.total > 0;

      // If both are income, sort by percentageOfIncome descending
      if (aIsIncome && bIsIncome) {
        return b.percentageOfIncome - a.percentageOfIncome;
      }

      // If both are expense, sort by percentageOfExpense descending
      if (!aIsIncome && !bIsIncome) {
        return b.percentageOfExpense - a.percentageOfExpense;
      }

      // If one is income and the other is expense, income comes first
      if (aIsIncome && !bIsIncome) {
        return -1;
      }

      // Expense comes after income
      return 1;
    });

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
      const key = `${tx.category}-${tx.serviceProvider}`;
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
