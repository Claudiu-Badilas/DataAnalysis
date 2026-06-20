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
      })),
      marker: {
        enabled: false, // Remove points/markers from the chart
      },
      states: {
        hover: {
          lineWidth: 4,
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
      tooltip: { enabled: false },
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
      plotOptions: {
        line: {
          animation: {
            duration: 1000,
          },
          connectNulls: false,
          threshold: null,
          marker: {
            enabled: false, // Also disable markers at plotOptions level
          },
        },
        series: {
          shadow: {
            color: 'rgba(0,0,0,0.05)',
            width: 4,
            offsetX: 0,
            offsetY: 2,
          },
          marker: {
            enabled: false, // Disable markers for all series
          },
        },
      },
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
            plotOptions: {
              pie: {
                innerSize: '70%', // Even thicker on very small screens
                size: '60%', // Smaller pie size
                dataLabels: {
                  style: {
                    fontSize: '6px',
                    fontWeight: 'bold',
                  },
                  distance: 3,
                  connectorPadding: 2,
                  padding: 2,
                },
              },
            },
            tooltip: {
              style: {
                fontSize: '9px',
              },
              padding: 4,
            },
            legend: {
              itemStyle: {
                fontSize: '8px',
              },
              itemMarginBottom: 2,
              itemMarginTop: 2,
              padding: 2,
            },
            title: {
              style: {
                fontSize: '10px',
              },
            },
            subtitle: {
              style: {
                fontSize: '8px',
              },
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
            plotOptions: {
              pie: {
                innerSize: '40%', // Thicker on tablet
                size: '75%',
                dataLabels: {
                  style: {
                    fontSize: '8px',
                  },
                  distance: 8,
                  connectorPadding: 6,
                },
              },
            },
            tooltip: {
              style: {
                fontSize: '12px',
              },
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
            plotOptions: {
              pie: {
                innerSize: '50%', // Thicker on desktop (was 70%)
                size: '100%',
                dataLabels: {
                  style: {
                    fontSize: '11px',
                  },
                  distance: 20,
                  connectorPadding: 20,
                },
              },
            },
          },
        },
      ],
    };
  }
}
