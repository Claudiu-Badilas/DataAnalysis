import { SeriesOptionsType } from 'highcharts';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Colors } from 'src/app/shared/styles/colors';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { MathUtil } from 'src/app/shared/utils/math.utils';
import { HistoricalInstalmentPayment } from '../../models/base-loan-rate.model';

export namespace InterestProgressChartBarUtils {
  export function getChart(
    rates: HistoricalInstalmentPayment[],
  ): Highcharts.Options {
    if (!rates.length) return null;

    const paidRates = rates.filter(
      (r) => r.instalmentPayment || r.earlyPayment,
    );
    const unpaidRates = rates.filter(
      (r) => !r.instalmentPayment && !r.earlyPayment,
    );

    const paidPrincipal = Calculator.sum(
      paidRates.map((r) => r.principalAmount),
    );
    const unpaidPrincipal = Calculator.sum(
      unpaidRates.map((r) => r.principalAmount),
    );

    const paidInterestRates = rates.filter((r) => r.instalmentPayment);
    const paidInterest = Calculator.sum(
      paidInterestRates.map((r) => r.interestAmount),
    );

    const paidInsurance = Calculator.sum(
      paidInterestRates.map((r) => r.insuranceCost),
    );

    const savedInterestRates = rates.filter((r) => r.earlyPayment);
    const savedInterest = Calculator.sum(
      savedInterestRates.map((r) => r.interestAmount),
    );

    const unpaidInterest = Calculator.sum(
      unpaidRates.map((r) => r.interestAmount),
    );
    const isMobile = window.innerWidth < 768;

    const rawData: {
      name: string;
      nameShort: string;
      value: number;
      color: string;
    }[] = [
      {
        name: !isMobile ? 'Principal Platit' : 'PP',
        nameShort: 'PP',
        value: paidPrincipal,
        color: Colors.TEAL_400,
      },
      {
        name: !isMobile ? 'Principal Neplatit' : 'PN',
        nameShort: 'PN',
        value: unpaidPrincipal,
        color: Colors.BS_DANGER,
      },
      {
        name: !isMobile ? 'Dobanda Platita' : 'DP',
        nameShort: 'DP',
        value: paidInterest,
        color: Colors.BLUE_400,
      },
      {
        name: !isMobile ? 'PAD Platita' : 'PAD',
        nameShort: 'PAD',
        value: paidInsurance,
        color: Colors.YELLOW_400,
      },
      {
        name: !isMobile ? 'Economii' : 'E',
        nameShort: 'E',
        value: savedInterest,
        color: Colors.GREEN_400,
      },
      {
        name: !isMobile ? 'Dobanda Neplatita' : 'DN',
        nameShort: 'DN',
        value: unpaidInterest,
        color: Colors.BS_ORANGE,
      },
    ];

    const barChartData = rawData
      .map((d) => ({
        name: d.name,
        nameShort: d.nameShort,
        y: MathUtil.round(d.value),
        amount: MathUtil.round(d.value),
        amountCompact: NumberFormatPipe.numberFormat(d.value),
        color: d.color,
      }))
      .sort((a, b) => b.y - a.y);

    return {
      chart: {
        type: 'bar',
        spacing: [20, 20, 20, 20],
        height: Math.max(400, barChartData.length * 50 + 100),
      },
      title: { text: null, align: 'left' },
      legend: { enabled: false },
      tooltip: { enabled: false },
      xAxis: {
        type: 'category',
        categories: barChartData.map((d) => d.name),
        title: { text: null },
        labels: { style: { fontSize: '9px' } },
        lineColor: '#E0E0E0',
        tickColor: '#E0E0E0',
      },
      yAxis: {
        title: { text: null },
        labels: { enabled: false },
        min: 0,
        max: Math.max(...barChartData.map((d) => d.y)) * 1.15,
      },
      plotOptions: {
        bar: {
          pointWidth: isMobile ? 20 : 30,
          pointPadding: 0.3,
          groupPadding: 0.1,
          borderRadius: 4,
          dataLabels: {
            enabled: true,
            format: '{point.amountCompact} RON',
            style: { fontSize: '9px', fontWeight: 'bold', color: '#333333' },
            position: 'right',
          },
        },
      },
      series: [
        {
          type: 'bar',
          name: 'Mortgage Amounts (RON)',
          data: barChartData,
          colorByPoint: true,
          colors: barChartData.map((d) => d.color),
          showInLegend: false,
          pointWidth: isMobile ? 18 : 25,
        },
      ] as SeriesOptionsType[],
    };
  }
}
