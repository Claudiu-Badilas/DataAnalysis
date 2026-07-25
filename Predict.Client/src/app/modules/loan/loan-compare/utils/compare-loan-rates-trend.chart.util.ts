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
      // Principal series - solid line
      const principalSeries: Highcharts.SeriesLineOptions = {
        type: 'line',
        name: `${name} – Principal`,
        color,
        data: repaymentSchedule.monthlyInstalments.map((r, index) => ({
          x: r.paymentDate.getTime(),
          y: Number(r.principalAmount.toFixed(2)),
          date: DateUtils.fromJsDateToString(r.paymentDate),
          instalment: index + 1,
          totalInstalment: Number(r.totalInstalment.toFixed(2)),
        })),
      };

      // Interest series - dashed line
      const interestSeries: Highcharts.SeriesLineOptions = {
        type: 'line',
        name: `${name} – Dobanda`,
        color,
        dashStyle: 'ShortDash',
        data: repaymentSchedule.monthlyInstalments.map((r, index) => ({
          x: r.paymentDate.getTime(),
          y: Number(r.interestAmount.toFixed(2)),
          date: DateUtils.fromJsDateToString(r.paymentDate),
          instalment: index + 1,
          totalInstalment: Number(r.totalInstalment.toFixed(2)),
        })),
      };

      series.push(principalSeries);
      series.push(interestSeries);
    });

    return {
      title: { text: null, align: 'left' },
      chart: {
        zooming: { type: 'x' },
        style: {
          fontFamily: 'Arial, sans-serif',
        },
      },
      xAxis: {
        type: 'datetime',
        labels: {
          formatter: function () {
            return Highcharts.dateFormat('%b %Y', this.value as number);
          },
        },
      },
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
      plotOptions: {
        series: {
          marker: { enabled: false },
          events: {
            mouseOver: function () {
              // Trigger tooltip update
            },
          },
        },
      },
      tooltip: {
        shared: true,
        useHTML: true,
        formatter: function () {
          const points = (this as any).points;
          if (!points || points.length === 0) return '';

          const firstPoint = points[0]?.point;
          const date = firstPoint?.date || '';

          // Separate principal and interest points
          const principalPoints = points.filter((p: any) =>
            p.series.name.includes('Principal'),
          );
          const interestPoints = points.filter((p: any) =>
            p.series.name.includes('Dobanda'),
          );

          let tooltipHtml = `
      <div style="padding: 8px 0; min-width: 250px;">
        <b style="font-size: 14px;"> Date: ${date}</b>
        <hr style="border: 1px solid #ddd; margin: 8px 0;" />
    `;

          // === PRINCIPAL AREA ===
          if (principalPoints.length > 0) {
            tooltipHtml += `
        <div style="margin: 6px 0; padding: 8px; background: #f0f7fa; border-radius: 6px; border-left: 4px solid #00838f;">
          <strong style="font-size: 13px; color: #00838f;">Principal</strong>
      `;

            principalPoints.forEach((p: any) => {
              const sourceName = p.series.name.split(' – ')[0] || p.series.name;
              tooltipHtml += `
          <div style="display: flex; justify-content: space-between; padding: 2px 0; margin-left: 8px;">
            <span>
              <span style="color:${p.series.color}; font-weight: bold;">●</span>
              ${sourceName}:
            </span>
            <span><b>${p.y.toFixed(2)}</b></span>
          </div>
        `;
            });

            tooltipHtml += `</div>`;
          }

          // === INTEREST AREA ===
          if (interestPoints.length > 0) {
            tooltipHtml += `
        <div style="margin: 6px 0; padding: 8px; background: #fcf4f4; border-radius: 6px; border-left: 4px solid #e91e63;">
          <strong style="font-size: 13px; color: #e91e63;">Dobanda</strong>
      `;

            interestPoints.forEach((p: any) => {
              const sourceName = p.series.name.split(' – ')[0] || p.series.name;
              tooltipHtml += `
          <div style="display: flex; justify-content: space-between; padding: 2px 0; margin-left: 8px;">
            <span>
              <span style="color:${p.series.color}; font-weight: bold;">─</span>
              ${sourceName}:
            </span>
            <span><b>${p.y.toFixed(2)}</b></span>
          </div>
        `;
            });

            tooltipHtml += `</div>`;
          }

          tooltipHtml += `</div>`;
          return tooltipHtml;
        },
      },
      legend: {
        enabled: true,
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom',
        itemStyle: {
          fontSize: '12px',
        },
      },
      series,
    };
  }
}
