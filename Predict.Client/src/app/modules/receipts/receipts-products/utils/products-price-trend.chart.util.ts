import Highcharts from 'highcharts';
import { DateUtils } from 'src/app/shared/utils/date.utils';
import { ReceiptsProductDomain } from '../models/receipts-products.model';

export namespace ProductPriceTrendChartUtils {
  export function getChart(
    receiptProducts: ReceiptsProductDomain[],
  ): Highcharts.Options {
    // Filter and sort products by date
    const validProducts = receiptProducts
      .filter((p) => p.price !== null)
      .sort((a, b) => a.purchasedDate.getTime() - b.purchasedDate.getTime());

    if (validProducts.length <= 1) {
      return {
        chart: { type: 'line', height: 300 },
        title: { text: 'Not enough data' },
        series: [],
        tooltip: { enabled: false },
      };
    }

    const prices = validProducts.map((p) => Number(p.price!.toFixed(2)));
    const isUpwardTrend = prices[prices.length - 1] > prices[0];

    const series: Highcharts.SeriesLineOptions = {
      type: 'line',
      name: 'Price Trend',
      color: {
        linearGradient: { x1: 0, x2: 1, y1: 0, y2: 0 },
        stops: isUpwardTrend
          ? [
              [0, '#6BCB77'],
              [0.5, '#FFD93D'],
              [1, '#FF6B6B'],
            ]
          : [
              [0, '#FF6B6B'],
              [0.5, '#FFD93D'],
              [1, '#6BCB77'],
            ],
      },
      lineWidth: 3,
      data: validProducts.map((p) => ({
        x: p.purchasedDate.getTime(),
        y: Number(p.price!.toFixed(2)),
        date: DateUtils.fromJsDateToString(p.purchasedDate),
        productName: p.name,
        provider: p.provider,
      })),
      marker: {
        enabled: true,
        radius: 5,
        fillColor: '#FFFFFF',
        lineWidth: 2,
        lineColor: '#666666',
        symbol: 'circle',
        states: {
          hover: {
            radius: 7,
            lineWidth: 3,
          },
        },
      },
      states: {
        hover: {
          lineWidth: 4,
        },
      },
      // Add custom tooltip for each point
      tooltip: {
        pointFormatter: function () {
          const point = this as any;
          return `
            <strong>${point.productName}</strong><br/>
            <strong>${point.provider}</strong><br/>
            <span style="color: #666; font-size: 12px;">${point.date}</span><br/>
            <span style="font-size: 16px; font-weight: bold;">${point.y.toFixed(2)}</span>
          `;
        },
      },
    };

    return {
      chart: {
        type: 'spline',
        height: 300,
        backgroundColor: 'transparent',
        spacing: [10, 10, 10, 10],
      },
      title: { text: null },
      subtitle: { text: null },
      tooltip: {
        enabled: true,
        shared: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#E0E0E0',
        borderRadius: 8,
        borderWidth: 1,
        shadow: true,
        padding: 12,
        style: {
          fontSize: '13px',
          fontFamily: 'Arial, sans-serif',
          color: '#333333',
        },
        headerFormat: '',
        pointFormat: `
          <strong>{point.productName}</strong><br/>
          <strong>{point.provider}</strong><br/>
          <span style="color: #666; font-size: 12px;">{point.date}</span><br/>
          <span style="font-size: 18px; font-weight: bold; color: #2E7D32;">{point.y:.2f}</span>
        `,
      },
      xAxis: {
        type: 'datetime',
        title: { text: null },
        gridLineWidth: 0,
        tickWidth: 0,
        lineWidth: 1,
        lineColor: '#E0E0E0',
        labels: {
          enabled: false,
          style: {
            fontSize: '11px',
            color: '#999999',
          },
        },
      },
      yAxis: {
        title: { text: null },
        gridLineWidth: 0,
        gridLineColor: '#F0F0F0',
        lineWidth: 0,
        tickWidth: 0,
        labels: {
          enabled: false,
          style: {
            fontSize: '11px',
            color: '#999999',
          },
        },
      },
      legend: { enabled: false },
      credits: { enabled: false },
      responsive: getResponsiveConfig(),
      series: [series],
    };
  }

  export function getResponsiveConfig(): Highcharts.ResponsiveOptions {
    return {
      rules: [
        {
          condition: {
            maxWidth: 580, // Mobile
          },
          chartOptions: {
            chart: {
              spacing: [2, 2, 2, 2],
              height: 75, // Very small height
            },
            tooltip: {
              style: {
                fontSize: '9px',
              },
              padding: 4,
              pointFormat: `
                <strong>{point.productName}</strong><br/>
                <strong>{point.provider}</strong><br/>
                {point.date}<br/>
                <span style="font-size: 12px; font-weight: bold;">{point.y:.2f}</span>
              `,
            },
            xAxis: {
              labels: {
                style: {
                  fontSize: '7px',
                },
              },
            },
            yAxis: {
              labels: {
                style: {
                  fontSize: '7px',
                },
              },
            },
          },
        },
        {
          condition: {
            minWidth: 481,
            maxWidth: 768, // Tablet
          },
          chartOptions: {
            chart: {
              spacing: [10, 10, 10, 10],
              height: 320,
            },
            tooltip: {
              style: {
                fontSize: '12px',
              },
              padding: 8,
              pointFormat: `
                <strong>{point.productName}</strong><br/>
                <strong>{point.provider}</strong><br/>
                {point.date}<br/>
                <span style="font-size: 14px; font-weight: bold;">{point.y:.2f}</span>
              `,
            },
          },
        },
        {
          condition: {
            minWidth: 769, // Desktop
          },
          chartOptions: {
            chart: {
              height: 420,
            },
            tooltip: {
              style: {
                fontSize: '13px',
              },
              padding: 12,
              pointFormat: `
                <strong>{point.productName}</strong><br/>
                <strong>{point.provider}</strong><br/>
                {point.date}<br/>
                <span style="font-size: 18px; font-weight: bold; color: #2E7D32;">{point.y:.2f}</span>
              `,
            },
          },
        },
      ],
    };
  }
}
