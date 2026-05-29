import { SeriesOptionsType } from 'highcharts';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import { Colors } from 'src/app/shared/styles/colors';
import { Calculator } from 'src/app/shared/utils/calculator.utils';
import { MathUtil } from 'src/app/shared/utils/math.utils';
import { HistoricalInstalmentPayment } from '../../models/base-loan-rate.model';

export namespace MortgageInterestProgressChartUtils {
  export function getChart(
    rates: HistoricalInstalmentPayment[],
    selection: 'Credit' | 'Dobanda' | 'Total',
    chartType: 'Pie' | 'Bar' = 'Pie',
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

    // 🔹 Build data dynamically based on selection
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

    // 🔹 Total based on filtered selection
    const total = Calculator.sum(rawData.map((d) => d.value));

    const percent = (value: number) =>
      total ? MathUtil.round(MathUtil.percent(value, total)) : 0;

    // 🔹 Prepare data based on chart type
    if (chartType === 'Pie') {
      // Pie chart data (percentages)
      const pieChartData = rawData.map((d) => ({
        name: d.name,
        nameShort: d.nameShort,
        y: percent(d.value),
        amount: MathUtil.round(d.value),
        amountCompact: NumberFormatPipe.numberFormat(d.value),
        color: d.color,
      }));

      return {
        chart: { type: 'pie', spacing: [20, 20, 20, 20] },
        title: { text: null, align: 'left' },
        legend: { enabled: false },
        tooltip: {
          pointFormat:
            '<span style="color:{point.color}">●</span> <b>{point.name}</b><br/>' +
            '<b>{point.y}%</b><br/>' +
            'Amount: <b>{point.amountCompact} RON</b>',
        },
        plotOptions: {
          pie: {
            innerSize: '70%',
            dataLabels: {
              enabled: true,
              format:
                '<b>{point.nameShort}</b> {point.amountCompact} ({point.y}%)',
              style: {
                fontSize: '11px',
                textOutline: 'none',
                fontWeight: 'normal',
              },
              connectorWidth: 1,
              connectorPadding: 5,
              distance: 20,
            },
          },
        },
        series: [
          {
            type: 'pie',
            name: 'Mortgage Distribution (%)',
            data: pieChartData,
            showInLegend: false,
          },
        ] as SeriesOptionsType[],
      };
    } else {
      // Bar chart data (actual values, sorted descending)
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
        chart: { type: 'bar', spacing: [20, 20, 20, 20] },
        title: { text: null, align: 'left' },
        legend: { enabled: false },
        tooltip: {
          pointFormat:
            '<span style="color:{point.color}">●</span> <b>{point.name}</b><br/>' +
            'Amount: <b>{point.amountCompact} RON</b>',
        },
        xAxis: {
          type: 'category',
          categories: barChartData.map((d) => d.name),
          title: { text: null },
          labels: { style: { fontSize: '11px', fontWeight: 'bold' } },
          lineColor: '#E0E0E0',
          tickColor: '#E0E0E0',
        },
        yAxis: {
          title: { text: 'Amount (RON)' },
          labels: { format: '{value} RON', style: { fontSize: '11px' } },
          gridLineColor: '#F0F0F0',
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true,
              format: '{point.amountCompact} RON',
              style: { fontSize: '11px', fontWeight: 'bold', color: '#333333' },
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
          },
        ] as SeriesOptionsType[],
      };
    }
  }
}
