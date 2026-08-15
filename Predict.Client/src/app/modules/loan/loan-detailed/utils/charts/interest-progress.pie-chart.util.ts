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

    // Helper function to create sticky note label
    const createStickyNoteLabel = (
      point: any,
      isComparison: boolean = false,
    ) => {
      const color = point.color || '#333';
      const bgColor = isComparison
        ? 'rgba(255,255,255,0.9)'
        : 'rgba(255,255,255,0.95)';
      const borderWidth = isComparison ? '2px' : '1px';

      return `<div style="background: ${bgColor}; padding: 6px 10px; border-radius: 6px; border: ${borderWidth} solid ${color}; box-shadow: 0 2px 8px rgba(0,0,0,0.12); font-size: ${isMobile ? '9px' : '11px'}; font-weight: bold; color: #333; max-width: 180px; text-align: center; pointer-events: none;">
                ${isComparison ? `<div style="font-size: ${isMobile ? '7px' : '9px'}; color: #666; margin-bottom: 3px;"></div>` : `<div style="font-size: ${isMobile ? '7px' : '9px'}; color: #666; margin-bottom: 3px;"></div>`}
                <div style="font-size: ${isMobile ? '9px' : '11px'}; font-weight: 700; color: ${color};">${point.nameShort}: ${point.amountCompact} (${point.y}%) </div>

              </div>`;
    };

    const series: SeriesOptionsType[] = [
      {
        type: 'pie',
        name: 'Credit',
        data: mainChartData.map((point) => ({
          ...point,
          dataLabels: {
            enabled: true,
            useHTML: true,
            formatter: function (this: any) {
              return createStickyNoteLabel(this, false);
            },
            style: {
              fontSize: isMobile ? '10px' : '12px',
              fontWeight: 'bold',
              color: '#333',
              textShadow: '0 0 3px rgba(255,255,255,0.8)',
            },
            connectorWidth: 0,
            distance: hasComparison ? 15 : 20,
            crop: false,
            overflow: 'allow',
          },
        })),
        showInLegend: false,
        size: hasComparison ? '80%' : '100%',
        innerSize: hasComparison ? '55%' : '50%',
        animation: { duration: 1000 },
        states: { hover: { enabled: false }, inactive: { enabled: false } },
        allowPointSelect: false,
      } as SeriesOptionsType,
    ];

    if (hasComparison && comparisonChartData.length > 0) {
      series.push({
        type: 'pie',
        name: 'Referinta',
        data: comparisonChartData.map((point) => ({
          ...point,
          dataLabels: {
            enabled: false, // Disabled sticky notes for comparison
          },
        })),
        showInLegend: false,
        size: '100%',
        innerSize: '80%',
        animation: { duration: 800 },
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
        opacity: 0.5,
        states: { hover: { enabled: false }, inactive: { enabled: false } },
        allowPointSelect: false,
      } as SeriesOptionsType);
    }

    return {
      chart: {
        type: 'pie',
        spacing: isMobile ? [10, 10, 10, 10] : [20, 20, 20, 20],
        height: isMobile ? 280 : undefined,
        style: { fontFamily: 'inherit' },
        events: {
          load: function () {
            this.update({
              plotOptions: {
                series: {
                  states: {
                    hover: { enabled: false },
                    inactive: { enabled: false },
                  },
                },
              },
            });
          },
        },
      },
      title: { text: null },
      legend: { enabled: false },
      tooltip: { enabled: false },
      plotOptions: {
        pie: {
          allowPointSelect: false,
          cursor: 'default',
          showInLegend: false,
          borderWidth: 2,
          borderColor: '#fff',
          states: {
            hover: { enabled: false },
            inactive: { enabled: false },
            select: { enabled: false },
          },
          point: { events: { mouseOver: undefined, mouseOut: undefined } },
        },
      },
      series: series,
    };
  }
}
