import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import * as fromLoanDetailed from 'src/app/modules/loan/loan-detailed/selectors/loan-detailed.selectors';
import * as fromLoan from 'src/app/modules/loan/reducers/loan.reducer';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import { Colors } from 'src/app/shared/styles/colors';
import { InterestProgressChartBarUtils } from '../../utils/charts/interest-progress.bar-chart.util';
import { InterestProgressChartPieUtils } from '../../utils/charts/interest-progress.pie-chart.util';
import { LoanMonthlyPaymentsChartUtils } from '../../utils/charts/loan-monthly-payments.chart.util';
import { HistoricalInstalmentsTableComponent } from '../historical-instalments-table/historical-instalments-table.component';

@Component({
  selector: 'p-loan-detailed-body',
  imports: [
    CommonModule,
    HighchartWrapperComponent,
    HistoricalInstalmentsTableComponent,
    ToggleButtonComponent,
  ],
  templateUrl: './loan-detailed-body.component.html',
  styleUrl: './loan-detailed-body.component.scss',
})
export class LoanDetailedBodyComponent {
  historicalInstalments = toSignal(
    this.store.select(fromLoanDetailed.getHistoricalInstalmentPayments),
  );

  updatedBaseRepaymentScheduleBasedOnLatestStates$ = this.store.select(
    fromLoanDetailed.getHistoricalInstalmentPayments,
  );
  historicalInstalmentPaymentBatches = toSignal(
    this.store.select(fromLoanDetailed.getHistoricalInstalmentPaymentBatches),
  );

  interestProgressPieChart = computed(() =>
    InterestProgressChartPieUtils.getChart(
      this.historicalInstalments(),
      this.progressPaymentViewChange(),
    ),
  );

  interestProgressBarChart = computed(() =>
    InterestProgressChartBarUtils.getChart(this.historicalInstalments()),
  );

  loanMonthlyPaymentsChart = computed(() =>
    LoanMonthlyPaymentsChartUtils.getChart(
      this.historicalInstalments(),
      this.monthlyPaymentViewChange() === 'Prd. Fixa',
    ),
  );

  constructor(private store: Store<fromLoan.LoanState>) {}

  colors = Colors;
  chartBasePaymentChange = signal<'pie-chart' | 'bars-chart' | 'columns-chart'>(
    'pie-chart',
  );
  monthlyPaymentViewChange = signal<'Prd. Fixa' | 'Prd. Totala'>('Prd. Fixa');
  progressPaymentViewChange = signal<'Credit' | 'Dobanda' | 'Total'>('Credit');

  onChartBasePaymentChange($event: string) {
    this.chartBasePaymentChange.set(
      $event as 'pie-chart' | 'bars-chart' | 'columns-chart',
    );
  }

  onMonthlyPaymentViewChange($event: string) {
    this.monthlyPaymentViewChange.set($event as 'Prd. Fixa' | 'Prd. Totala');
  }

  onProgressPaymentViewChange($event: string) {
    this.progressPaymentViewChange.set(
      $event as 'Credit' | 'Dobanda' | 'Total',
    );
  }
}
