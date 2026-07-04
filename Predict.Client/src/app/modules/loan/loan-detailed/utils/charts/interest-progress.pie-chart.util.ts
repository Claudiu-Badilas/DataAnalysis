import { SeriesOptionsType } from 'highcharts';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Colors } from 'src/app/shared/styles/colors';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { MathUtil } from 'src/app/shared/utils/math.utils';
import { HistoricalInstalmentPayment } from '../../models/base-loan-rate.model';

export namespace InterestProgressChartPieUtils {
  export function getChart(
    rates: HistoricalInstalmentPayment[],
    selection: 'Credit' | 'Dobanda' | 'Total',
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

    // Build data dynamically based on selection
    const rawData: {
      name: string;
      nameShort: string;
      value: number;
      color: string;
    }[] = [];

    if (selection === 'Credit' || selection === 'Total') {
      rawData.push(
        {
          name: 'Principal Platit',
          nameShort: 'PP',
          value: paidPrincipal,
          color: Colors.TEAL_400,
        },
        {
          name: 'Principal Neplatit',
          nameShort: 'PN',
          value: unpaidPrincipal,
          color: Colors.BS_DANGER,
        },
      );
    }

    if (selection === 'Dobanda' || selection === 'Total') {
      rawData.push(
        {
          name: 'Dobanda Platita',
          nameShort: 'DP',
          value: paidInterest,
          color: Colors.BLUE_400,
        },
        {
          name: 'PAD Platita',
          nameShort: 'PAD',
          value: paidInsurance,
          color: Colors.YELLOW_400,
        },
        {
          name: 'Economii',
          nameShort: 'E',
          value: savedInterest,
          color: Colors.GREEN_400,
        },
        {
          name: 'Dobanda Neplatita',
          nameShort: 'DN',
          value: unpaidInterest,
          color: Colors.BS_ORANGE,
        },
      );
    }

    // Total based on filtered selection
    const total = Calculator.sum(rawData.map((d) => d.value));

    const percent = (value: number) =>
      total ? MathUtil.round(MathUtil.percent(value, total)) : 0;

    const pieChartData = rawData.map((d) => ({
      name: d.name,
      nameShort: d.nameShort,
      y: percent(d.value),
      amount: MathUtil.round(d.value),
      amountCompact: NumberFormatPipe.numberFormat(d.value),
      color: d.color,
    }));

    const isMobile = window.innerWidth < 768;

    return {
      chart: {
        type: 'pie',
        spacing: isMobile ? [10, 10, 10, 10] : [20, 20, 20, 20],
        height: isMobile ? 280 : undefined,
      },
      title: { text: null, align: 'left' },
      legend: { enabled: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        padding: isMobile ? 10 : 12,
        shadow: true,
        style: {
          fontSize: isMobile ? '13px' : '14px',
          fontWeight: 'normal',
        },
        pointFormat:
          '<span style="color:{point.color}">●</span> <b>{point.name}</b><br/>' +
          '<b style="font-size:{point.y > 0 ? 20 : 16}px">{point.y}%</b><br/>' +
          'Amount: <b>{point.amountCompact} RON</b>',
      },
      plotOptions: {
        pie: {
          innerSize: isMobile ? '40%' : '50%',
          size: isMobile ? '80%' : '100%',
          dataLabels: {
            enabled: true,
            format:
              '<b>{point.nameShort}</b> {point.amountCompact} ({point.y}%)',
            style: {
              fontSize: isMobile ? '9px' : '11px',
              textOutline: isMobile ? '1px contrast' : 'none',
              fontWeight: 'bold',
              color: '#333',
              textShadow: isMobile ? '0 0 3px rgba(255,255,255,0.8)' : 'none',
            },
            connectorWidth: 1,
            connectorPadding: isMobile ? 8 : 20,
            distance: isMobile ? 10 : 20,
            crop: false,
            overflow: 'allow',
          },
        },
      },
      series: [
        {
          type: 'pie',
          name: 'Mortgage Distribution (%)',
          data: pieChartData,
          showInLegend: false,
          animation: {
            duration: 1000,
          },
        },
      ] as SeriesOptionsType[],
    };
  }
}
