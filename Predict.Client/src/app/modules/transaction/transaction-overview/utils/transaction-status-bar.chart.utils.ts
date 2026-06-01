import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import {
  TransactionCategorizer,
  TransactionCategory,
  TransactionDomain,
} from '../../models/transactions.model';

export namespace TransactionStatusBarChartUtils {
  export function getChart(
    filteredTransactions: TransactionDomain[],
  ): Highcharts.Options {
    const categoryAmountSummary = getCategoryAmountSummary(
      filteredTransactions?.filter((t) => t.amount && t.amount < 0) || [],
    );

    const pieData = categoryAmountSummary.map((item) => ({
      name: item.categoryLabel,
      y: item.totalAmount,
      color: TransactionCategorizer.getCategoryColor(item.category),
      percentage: item.percentage,
      transactionCount: item.transactionCount,
    }));

    return {
      chart: {
        type: 'pie',
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
      },
      title: { text: null },
      tooltip: {
        formatter: function (this: any) {
          const percentage = this.point.percentage?.toFixed(1) || '0';
          const amount = this.y || 0;
          const formattedAmount = NumberFormatPipe.numberFormat(
            amount,
            getCurrency(filteredTransactions),
          );
          const transactionCount = this.point.transactionCount || 0;

          return `<b>${this.point.name}</b><br/>
                Amount: <b>${formattedAmount}</b><br/>
                Percentage: <b>${percentage}%</b><br/>
                Transactions: <b>${transactionCount}</b>`;
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
              fontSize: '11px',
              fontWeight: 'normal',
            },
            distance: 30,
          },
          showInLegend: true,
          size: '60%',
          center: ['50%', '50%'],
          borderRadius: 5,
          borderWidth: 2,
          borderColor: '#ffffff',
          states: {
            hover: {
              enabled: true,
              brightness: 0.1,
            },
          },
        },
      },
      legend: { enabled: false },
      series: [
        {
          name: 'Spending by Category',
          type: 'pie',
          data: pieData,
          colors: pieData.map((item) => item.color),
          innerSize: '65%',
        },
      ],
      credits: {
        enabled: false,
      },
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 500,
            },
            chartOptions: {
              legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom',
              },
              plotOptions: {
                pie: {
                  dataLabels: {
                    distance: 20,
                    format: '{point.percentage:.1f}%',
                  },
                },
              },
            },
          },
        ],
      },
    };
  }

  function getCategoryAmountSummary(transactions: TransactionDomain[]) {
    const summary = new Map<
      TransactionCategory,
      {
        transactionCount: number;
        totalAmount: number;
        categoryLabel: string;
        percentage: number;
      }
    >();

    // Calculate total amount (considering only positive amounts or absolute values)
    const totalAmount = transactions
      .filter((t) => t.amount && t.amount !== 0)
      .reduce((sum, t) => sum + Math.abs(t.amount!), 0);

    transactions.forEach((t) => {
      if (t.amount && t.category && t.amount !== 0) {
        const category = t.category;
        const amount = Math.abs(t.amount);

        if (!summary.has(category)) {
          summary.set(category, {
            transactionCount: 0,
            totalAmount: 0,
            categoryLabel: t.categoryLabel,
            percentage: 0,
          });
        }

        const current = summary.get(category)!;
        current.transactionCount++;
        current.totalAmount += amount;
        current.percentage =
          totalAmount > 0 ? (current.totalAmount / totalAmount) * 100 : 0;
        summary.set(category, current);
      }
    });

    return Array.from(summary.entries())
      .sort((a, b) => b[1].totalAmount - a[1].totalAmount)
      .map(([category, data]) => ({
        category,
        ...data,
      }));
  }

  // Helper function to get currency from transactions
  function getCurrency(transactions: TransactionDomain[]): string {
    const currencies = [
      ...new Set(transactions.map((t) => t.currency).filter(Boolean)),
    ];
    return currencies[0] || 'RON';
  }
}
