import { Colors } from 'src/app/shared/styles/colors';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { ObjectUtil } from 'src/app/shared/utils/object.utils';
import { TransactionDomain } from '../../models/transactions.model';

export namespace MonthlyTransactionChartUtils {
  export function getChart(
    startDate: Date,
    endDate: Date,
    transactions: TransactionDomain[],
  ): Highcharts.Options {
    const validTransactions = transactions.filter((t) => !t.ignored);
    const incomes = validTransactions.filter((t) => t.amount > 0);
    const expenses = validTransactions.filter((t) => t.amount < 0);

    const groupTransactionByDate = (trans: TransactionDomain[]) =>
      ObjectUtil.groupBy(trans, (t) =>
        t.registrationDate.toLocaleString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
      );

    const groupedIncomesByMonth = groupTransactionByDate(incomes);
    const groupedExpensesByMonth = groupTransactionByDate(expenses);

    const categories = getAvailableMonths(startDate, endDate);

    const getData = (
      group: Record<string, TransactionDomain[]>,
    ): [string, number][] =>
      categories.map((cat) => [
        cat,
        Calculator.sum((group[cat] ?? []).map((t) => t.amount)),
      ]);

    const incomesData = getData(groupedIncomesByMonth);
    const expensesData = getData(groupedExpensesByMonth);

    // ✅ Net amount (income - expenses)
    const netAmountData = categories.map((cat) => {
      const incomesTotal = incomesData.find(([c]) => c === cat)?.[1] ?? 0;
      const expensesTotal = Math.abs(
        expensesData.find(([c]) => c === cat)?.[1] ?? 0,
      );

      return incomesTotal - expensesTotal;
    });

    const allValues = [
      ...incomesData.map(([_, v]) => v),
      ...expensesData.map(([_, v]) => v),
      ...netAmountData,
    ];
    const maxAbs = Math.max(...allValues.map((v) => Math.abs(v)), 0);

    return {
      chart: { zooming: { type: 'x' } },
      title: { text: null },
      legend: { enabled: false },
      xAxis: { categories },
      yAxis: {
        title: null,
        min: -maxAbs,
        max: maxAbs,
        plotLines: [
          {
            value: 0,
            width: 1,
            color: Colors.BS_BLACK,
          },
        ],
      },
      tooltip: {
        shared: true,
        useHTML: true,
        valueDecimals: 2,
        headerFormat: '<b>{point.key}</b><br/>',
        pointFormat:
          '<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:{series.color}; margin-right:8px;"></span> {series.name}: <b>{point.y:,.2f}</b><br/>',
      },
      series: [
        {
          type: 'column',
          name: 'Income',
          color: Colors.GREEN_500,
          data: incomesData.map(([_, v]) => v),
        },
        {
          type: 'column',
          name: 'Expenses',
          color: Colors.PINK_500,
          data: expensesData.map(([_, v]) => Math.abs(v)),
        },
        {
          type: 'spline',
          name: 'Net',
          data: netAmountData,
          color: Colors.YELLOW_500,
          marker: { enabled: false },
        },
      ],
    };
  }

  function getAvailableMonths(startDate: Date, endDate: Date): string[] {
    const result: string[] = [];

    let current = new Date(Math.min(startDate.getTime(), endDate.getTime()));
    const last = new Date(Math.max(startDate.getTime(), endDate.getTime()));

    current.setDate(1);
    last.setDate(1);

    while (current <= last) {
      result.push(
        current.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
      );
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }

    return result;
  }
}
