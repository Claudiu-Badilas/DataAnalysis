import { SeriesOptionsType } from 'highcharts';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Colors } from 'src/app/shared/styles/colors';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { MathUtil } from 'src/app/shared/utils/math.utils';
import { HistoricalInstalmentPayment } from '../../models/base-loan-rate.model';

export namespace InterestProgressChartPieUtils {
  export function getChart(
    rates: HistoricalInstalmentPayment[],
    comparedToRates: HistoricalInstalmentPayment[],
    selection: 'Credit' | 'Dobanda' | 'Total',
  ): Highcharts.Options | null {
    if (!rates?.length) return null;

    const hasAnyData = rates.some((r) => r.instalmentPayment || r.earlyPayment);
    if (!hasAnyData) return null;

    const paidRates = rates.filter(
      (r) => r.instalmentPayment || r.earlyPayment,
    );
    const unpaidRates = rates.filter(
      (r) => !r.instalmentPayment && !r.earlyPayment,
    );

    const paidPrincipal = Calculator.sum(
      paidRates.map((r) => r.principalAmount || 0),
    );
    const unpaidPrincipal = Calculator.sum(
      unpaidRates.map((r) => r.principalAmount || 0),
    );

    const paidInterestRates = rates.filter((r) => r.instalmentPayment);
    const paidInterest = Calculator.sum(
      paidInterestRates.map((r) => r.interestAmount || 0),
    );

    const paidInsurance = Calculator.sum(
      paidInterestRates.map((r) => r.insuranceCost || 0),
    );

    const savedInterestRates = rates.filter((r) => r.earlyPayment);
    const savedInterest = Calculator.sum(
      savedInterestRates.map((r) => r.interestAmount || 0),
    );

    const unpaidInterest = Calculator.sum(
      unpaidRates.map((r) => r.interestAmount || 0),
    );

    let comparedPaidPrincipal = 0;
    let comparedUnpaidPrincipal = 0;
    let comparedPaidInterest = 0;
    let comparedPaidInsurance = 0;
    let comparedSavedInterest = 0;
    let comparedUnpaidInterest = 0;

    const hasComparison = comparedToRates?.length > 0;

    if (hasComparison) {
      const comparedPaidRates = comparedToRates.filter(
        (r) => r.instalmentPayment || r.earlyPayment,
      );
      const comparedUnpaidRates = comparedToRates.filter(
        (r) => !r.instalmentPayment && !r.earlyPayment,
      );

      comparedPaidPrincipal = Calculator.sum(
        comparedPaidRates.map((r) => r.principalAmount || 0),
      );
      comparedUnpaidPrincipal = Calculator.sum(
        comparedUnpaidRates.map((r) => r.principalAmount || 0),
      );

      const comparedPaidInterestRates = comparedToRates.filter(
        (r) => r.instalmentPayment,
      );
      comparedPaidInterest = Calculator.sum(
        comparedPaidInterestRates.map((r) => r.interestAmount || 0),
      );
      comparedPaidInsurance = Calculator.sum(
        comparedPaidInterestRates.map((r) => r.insuranceCost || 0),
      );

      const comparedSavedInterestRates = comparedToRates.filter(
        (r) => r.earlyPayment,
      );
      comparedSavedInterest = Calculator.sum(
        comparedSavedInterestRates.map((r) => r.interestAmount || 0),
      );

      comparedUnpaidInterest = Calculator.sum(
        comparedUnpaidRates.map((r) => r.interestAmount || 0),
      );
    }

    const rawData: {
      name: string;
      nameShort: string;
      value: number;
      comparedValue: number;
      color: string;
      category: string;
    }[] = [];

    if (selection === 'Credit' || selection === 'Total') {
      if (paidPrincipal > 0 || comparedPaidPrincipal > 0) {
        rawData.push({
          name: 'Principal Platit',
          nameShort: 'PP',
          value: paidPrincipal,
          comparedValue: comparedPaidPrincipal,
          color: Colors.TEAL_400,
          category: 'Principal',
        });
      }
      if (unpaidPrincipal > 0 || comparedUnpaidPrincipal > 0) {
        rawData.push({
          name: 'Principal Neplatit',
          nameShort: 'PN',
          value: unpaidPrincipal,
          comparedValue: comparedUnpaidPrincipal,
          color: Colors.BS_DANGER,
          category: 'Principal',
        });
      }
    }

    if (selection === 'Dobanda' || selection === 'Total') {
      if (paidInterest > 0 || comparedPaidInterest > 0) {
        rawData.push({
          name: 'Dobanda Platita',
          nameShort: 'DP',
          value: paidInterest,
          comparedValue: comparedPaidInterest,
          color: Colors.BLUE_400,
          category: 'Dobanda',
        });
      }
      if (paidInsurance > 0 || comparedPaidInsurance > 0) {
        rawData.push({
          name: 'Asig. Platita',
          nameShort: 'Asig.',
          value: paidInsurance,
          comparedValue: comparedPaidInsurance,
          color: Colors.YELLOW_400,
          category: 'Asigurare',
        });
      }
      if (savedInterest > 0 || comparedSavedInterest > 0) {
        rawData.push({
          name: 'Economii',
          nameShort: 'E',
          value: savedInterest,
          comparedValue: comparedSavedInterest,
          color: Colors.GREEN_400,
          category: 'Economii',
        });
      }
      if (unpaidInterest > 0 || comparedUnpaidInterest > 0) {
        rawData.push({
          name: 'Dobanda Neplatita',
          nameShort: 'DN',
          value: unpaidInterest,
          comparedValue: comparedUnpaidInterest,
          color: Colors.BS_ORANGE,
          category: 'Dobanda',
        });
      }
    }

    if (!rawData.length) return null;

    const total = Calculator.sum(rawData.map((d) => d.value));
    const comparedTotal = Calculator.sum(rawData.map((d) => d.comparedValue));

    const percent = (value: number) =>
      total > 0 ? MathUtil.round(MathUtil.percent(value, total)) : 0;

    const comparedPercent = (value: number) =>
      comparedTotal > 0
        ? MathUtil.round(MathUtil.percent(value, comparedTotal))
        : 0;

    const mainChartData = rawData.map((d) => ({
      name: d.name,
      nameShort: d.nameShort,
      y: percent(d.value),
      amount: MathUtil.round(d.value),
      amountCompact: NumberFormatPipe.numberFormat(d.value),
      color: d.color,
      category: d.category,
      comparedAmount: MathUtil.round(d.comparedValue),
      comparedAmountCompact: NumberFormatPipe.numberFormat(d.comparedValue),
      comparedPercent: comparedPercent(d.comparedValue),
      diff: MathUtil.round(d.value - d.comparedValue),
      diffFormatted: NumberFormatPipe.numberFormat(
        Math.abs(d.value - d.comparedValue),
      ),
      diffPercent:
        d.comparedValue > 0
          ? MathUtil.round(
              ((d.value - d.comparedValue) / d.comparedValue) * 100,
            )
          : 0,
      hasComparison: hasComparison && d.comparedValue > 0,
    }));

    const comparisonChartData = hasComparison
      ? rawData.map((d) => ({
          name: d.name,
          nameShort: d.nameShort,
          y: comparedPercent(d.comparedValue),
          amount: MathUtil.round(d.comparedValue),
          amountCompact: NumberFormatPipe.numberFormat(d.comparedValue),
          color: d.color,
          category: d.category,
          opacity: 0.5,
          borderColor: 'rgba(255,255,255,0.8)',
          borderWidth: 2,
        }))
      : [];

    const isMobile =
      typeof window !== 'undefined' ? window.innerWidth < 768 : false;

    interface TooltipPoint {
      name: string;
      amount: number;
      amountCompact: string;
      y: number;
      color: string;
      category: string;
      series?: {
        name: string;
      };
      comparedAmount?: number;
      comparedAmountCompact?: string;
      comparedPercent?: number;
      diff?: number;
      diffFormatted?: string;
      diffPercent?: number;
      hasComparison?: boolean;
    }

    const tooltipFormatter = function (this: any): string {
      const point = this.point as TooltipPoint;
      const amount =
        point.amountCompact || NumberFormatPipe.numberFormat(point.amount || 0);
      const percentage = point.y || 0;
      const isComparisonRing = point.series?.name === 'Referinta';

      const allPoints: TooltipPoint[] = this.series.chart.series
        .flatMap((s: any) => s.points || [])
        .filter((p: TooltipPoint) => p.category === point.category);

      let html = `
        <div style="padding:4px 0; min-width:240px; max-width:320px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; border-bottom:1px solid #eee; padding-bottom:6px;">
            <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background-color:${point.color};"></span>
            <span style="font-weight:600; font-size:14px;">${point.name}</span>
            ${isComparisonRing ? '<span style="font-size:11px; color:#666; margin-left:4px;">(Referinta)</span>' : ''}
          </div>
      `;

      if (allPoints.length > 1) {
        const sortedPoints = allPoints.sort(
          (a: TooltipPoint, b: TooltipPoint) => {
            if (a.series?.name === 'Credit') return -1;
            if (b.series?.name === 'Credit') return 1;
            return 0;
          },
        );

        sortedPoints.forEach((p: TooltipPoint) => {
          const pAmount =
            p.amountCompact || NumberFormatPipe.numberFormat(p.amount || 0);
          const pPercent = p.y || 0;
          const isRef = p.series?.name === 'Referinta';

          html += `
            <div style="display:flex; justify-content:space-between; gap:20px; font-size:13px; ${isRef ? 'margin-top:6px; padding-top:6px; border-top:1px solid #eee;' : ''}">
              <span ${isRef ? 'style="color:#666;"' : ''}>${isRef ? 'Referinta' : 'Principal'}:</span>
              <span style="font-weight:bold; ${isRef ? 'color:#666;' : ''}">${pAmount} RON (${pPercent}%)</span>
            </div>
          `;
        });

        const mainPoint = allPoints.find(
          (p: TooltipPoint) => p.series?.name === 'Credit',
        );
        const refPoint = allPoints.find(
          (p: TooltipPoint) => p.series?.name === 'Referinta',
        );

        if (
          mainPoint &&
          refPoint &&
          mainPoint.amount !== undefined &&
          refPoint.amount !== undefined
        ) {
          const diff = mainPoint.amount - refPoint.amount;
          const diffFormatted = NumberFormatPipe.numberFormat(Math.abs(diff));
          const diffPercent =
            refPoint.amount > 0
              ? MathUtil.round((diff / refPoint.amount) * 100)
              : 0;
          const sign = diff >= 0 ? '+' : '';
          const color = diff < 0 ? '#F44336' : '#4CAF50';
          const arrow = diff < 0 ? '▼' : '▲';

          if (diff !== 0) {
            html += `
              <div style="display:flex; justify-content:space-between; gap:20px; font-size:13px; margin-top:8px; padding-top:8px; border-top:2px solid #eee;">
                <span style="font-weight:600;">Diferenta:</span>
                <span style="color:${color};font-weight:bold;">${arrow} ${sign}${diffFormatted} RON (${sign}${diffPercent}%)</span>
              </div>
            `;
          }
        }
      } else {
        html += `
          <div style="display:flex; justify-content:space-between; gap:20px; font-size:13px;">
            <span>Procent:</span>
            <span style="font-weight:bold; font-size:${percentage > 0 ? 20 : 16}px;">${percentage}%</span>
          </div>
          <div style="display:flex; justify-content:space-between; gap:20px; font-size:13px; margin-top:4px;">
            <span>Suma:</span>
            <span style="font-weight:bold;">${amount} RON</span>
          </div>
        `;
      }

      html += `</div>`;
      return html;
    };

    const series: SeriesOptionsType[] = [
      {
        type: 'pie',
        name: 'Credit',
        data: mainChartData,
        showInLegend: false,
        size: hasComparison ? '80%' : '100%',
        innerSize: hasComparison ? '55%' : '50%',
        animation: {
          duration: 1000,
        },
        dataLabels: {
          enabled: true,
          format: '<b>{point.nameShort}</b> {point.amountCompact} ({point.y}%)',
          style: {
            fontSize: isMobile ? '8px' : '10px',
            textOutline: isMobile ? '1px contrast' : 'none',
            fontWeight: 'bold',
            color: '#333',
            textShadow: isMobile ? '0 0 3px rgba(255,255,255,0.8)' : 'none',
          },
          connectorWidth: 1,
          connectorPadding: isMobile ? 6 : 15,
          distance: hasComparison ? 15 : 20,
          crop: false,
          overflow: 'allow',
        },
        states: {
          hover: {
            enabled: false,
          },
          inactive: {
            enabled: false,
          },
        },
        allowPointSelect: false,
      } as SeriesOptionsType,
    ];

    if (hasComparison && comparisonChartData.length > 0) {
      series.push({
        type: 'pie',
        name: 'Referinta',
        data: comparisonChartData,
        showInLegend: false,
        size: '100%',
        innerSize: '80%',
        animation: {
          duration: 800,
        },
        dataLabels: {
          enabled: false,
        },
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
        opacity: 0.5,
        states: {
          hover: {
            enabled: false,
          },
          inactive: {
            enabled: false,
          },
        },
        allowPointSelect: false,
      } as SeriesOptionsType);
    }

    return {
      chart: {
        type: 'pie',
        spacing: isMobile ? [10, 10, 10, 10] : [20, 20, 20, 20],
        height: isMobile ? 280 : undefined,
        style: {
          fontFamily: 'inherit',
        },
        events: {
          load: function () {
            this.update({
              plotOptions: {
                series: {
                  states: {
                    hover: {
                      enabled: false,
                    },
                    inactive: {
                      enabled: false,
                    },
                  },
                },
              },
            });
          },
        },
      },
      title: { text: null },
      legend: {
        enabled: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        padding: isMobile ? 10 : 12,
        shadow: true,
        useHTML: true,
        style: {
          fontSize: isMobile ? '13px' : '14px',
          fontWeight: 'normal',
        },
        formatter: tooltipFormatter,
        shared: true,
        followPointer: false,
        followTouchMove: false,
      },
      plotOptions: {
        pie: {
          allowPointSelect: false,
          cursor: 'default',
          showInLegend: false,
          borderWidth: 2,
          borderColor: '#fff',
          states: {
            hover: {
              enabled: false,
            },
            inactive: {
              enabled: false,
            },
            select: {
              enabled: false,
            },
          },
          point: {
            events: {
              mouseOver: undefined,
              mouseOut: undefined,
            },
          },
        },
      },
      series: series,
    };
  }
}
