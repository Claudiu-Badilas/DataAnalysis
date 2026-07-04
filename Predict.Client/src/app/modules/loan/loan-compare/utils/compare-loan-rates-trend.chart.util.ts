import Highcharts from 'highcharts';
import { Colors } from 'src/app/shared/styles/colors';
import { DateUtils } from 'src/app/shared/utils/date.utils';
import { RepaymentSchedule } from '../../models/loan.model';

export namespace CompareRatesTrendChartUtils {
  export function getChart(
    left: RepaymentSchedule,
    right: RepaymentSchedule,
  ): Highcharts.Options {
    const sources: Array<[RepaymentSchedule, string, string]> = [
      left ? [left, left.name, Colors.BS_TEAL] : null,
      right ? [right, right.name, Colors.PINK_500] : null,
    ].filter(Boolean) as Array<[RepaymentSchedule, string, string]>;

    const series: Highcharts.SeriesOptionsType[] = [];

    sources.forEach(([repaymentSchedule, name, color]) => {
      const principalSeries: Highcharts.SeriesLineOptions = {
        type: 'line',
        name: `${name} – Principal`,
        color,
        data: repaymentSchedule.monthlyInstalments.map((r) => ({
          x: r.paymentDate.getTime(),
          y: Number(r.principalAmount.toFixed(2)),
          date: DateUtils.fromJsDateToString(r.paymentDate),
        })),
      };

      const interestSeries: Highcharts.SeriesLineOptions = {
        type: 'line',
        name: `${name} – Dobanda`,
        color,
        dashStyle: 'ShortDash',
        data: repaymentSchedule.monthlyInstalments.map((r) => ({
          x: r.paymentDate.getTime(),
          y: Number(r.interestAmount.toFixed(2)),
          date: DateUtils.fromJsDateToString(r.paymentDate),
        })),
      };

      series.push(principalSeries);
      series.push(interestSeries);
    });

    return {
      title: { text: null, align: 'left' },
      chart: { zooming: { type: 'x' } },
      xAxis: { type: 'datetime' },
      yAxis: {
        title: { text: null },
        labels: {
          formatter: function () {
            const value = this.value as number;
            if (value >= 1000) {
              return value / 1000 + 'k';
            }
            return value.toString();
          },
        },
      },
      plotOptions: { series: { marker: { enabled: false } } },
      tooltip: {
        shared: true,
        useHTML: true,
        formatter: function () {
          const points = (this as any).points;
          const date = points?.[0]?.point?.date;

          return `
        <b>Date: ${date}</b><br/>
        ${
          points
            ?.map(
              (p: any) =>
                `<span style="color:${p.series.color}">●</span>
                 ${p.series.name}: <b>${p.y}</b><br/>`,
            )
            .join('') || ''
        }
      `;
        },
      },
      legend: { enabled: false },
      series,
    };
  }
}
