import Highcharts from 'highcharts';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Colors } from 'src/app/shared/styles/colors';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { DateUtils } from 'src/app/shared/utils/date.utils';
import { ObjectUtil } from 'src/app/shared/utils/object.utils';
import { TransactionDomain } from '../../models/transactions.model';

export namespace DailyTransactionChartUtils {
  export function getChart(
    startDate: Date,
    endDate: Date,
    transactions: TransactionDomain[],
    { loadExpenses = true } = {},
  ): Highcharts.Options {
    const validTransactions = transactions.filter((t) => !t.ignored);
    const incomes = validTransactions.filter((t) => t.amount > 0);
    const expenses = validTransactions.filter((t) => t.amount < 0);

    const getData = (transactions: TransactionDomain[], multiplier: number) => {
      const group = ObjectUtil.groupBy(transactions, (t) =>
        DateUtils.fromJsDateToString(t.registrationDate),
      );

      const sortedEntries = Object.entries(group).sort(
        ([dateKeyA], [dateKeyB]) => {
          const dateA = DateUtils.fromStringToJsDate(dateKeyA);
          const dateB = DateUtils.fromStringToJsDate(dateKeyB);
          return dateA.getTime() - dateB.getTime();
        },
      );

      return sortedEntries.map(([dateKey, transactions]) => {
        const sortedTransactions = [...transactions].sort(
          (a, b) => Math.abs(b.amount) - Math.abs(a.amount),
        );

        const total =
          Calculator.sum(sortedTransactions.map((t) => t.amount)) * multiplier;

        const date = DateUtils.fromStringToJsDate(dateKey);

        return {
          x: date.valueOf(),
          y: Number(total.toFixed(2)),
          date: dateKey,
          transactions: sortedTransactions, // attach transactions
        };
      });
    };

    const baseColor = loadExpenses ? Colors.PINK_500 : Colors.GREEN_500;

    return {
      title: { text: null },
      legend: { enabled: false },
      chart: { zooming: { type: 'x' }, backgroundColor: 'transparent' },
      xAxis: {
        type: 'datetime',
        min: startDate.getTime(),
        max: endDate.getTime(),
        lineColor: '#E0E0E0',
        tickColor: '#E0E0E0',
      },
      yAxis: { title: { text: null }, gridLineColor: '#F0F0F0' },
      tooltip: {
        formatter: function (this: any) {
          const point = this.point as any;

          const transactions: TransactionDomain[] = point.transactions || [];

          const maxItems = 6;
          const visibleTransactions = transactions.slice(0, maxItems);
          const remaining = transactions.length - maxItems;

          const transactionsHtml = visibleTransactions
            .map(
              (t) => `
                <div style="display:flex; justify-content:space-between; gap:12px;">
                  <span style="opacity:0.8;">
                    ${t.serviceProvider || '—'}
                  </span>
                  <b style="color:${t.amount < 0 ? '#E53935' : '#43A047'}">
                   ${NumberFormatPipe.numberFormat(t.amount as number)}  
                  </b>
                </div>
              `,
            )
            .join('');

          const moreHtml =
            remaining > 0
              ? `<div style="margin-top:4px; opacity:0.6;">+${remaining} more</div>`
              : '';

          return `
            <div style="min-width:200px;">
              <div class="d-flex justify-content-between">
              <b>${point.date}</b> 
              <b>${NumberFormatPipe.numberFormat(point.y)}  </b>
              </div>

              <hr style="margin:8px 0; border:none; border-top:1px solid #E0E0E0;" />

              <div style="display:flex; flex-direction:column; gap:4px;">
                ${transactionsHtml}
                ${moreHtml}
              </div>
            </div>
          `;
        },
        useHTML: true,
        backgroundColor: '#FFFFFF',
        borderColor: '#E0E0E0',
        borderRadius: 8,
        shadow: true,
      },
      plotOptions: {
        series: { animation: true },
        areaspline: {
          linecap: 'round',
          lineWidth: 1,
          marker: { enabled: false },
          states: { hover: { lineWidthPlus: 1 } },
          connectNulls: true,
          threshold: 0,
        },
      },

      series: [
        {
          type: 'areaspline',
          data: loadExpenses ? getData(expenses, -1) : getData(incomes, 1),
          name: loadExpenses ? 'Expenses' : 'Income',
          color: baseColor,
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, baseColor],
              [1, 'rgba(255,255,255,0)'],
            ],
          },
        },
      ],
    };
  }
}
