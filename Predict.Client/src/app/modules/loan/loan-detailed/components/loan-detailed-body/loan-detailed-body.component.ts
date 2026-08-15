import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import * as fromLoanDetailed from 'src/app/modules/loan/loan-detailed/selectors/loan-detailed.selectors';
import * as fromLoan from 'src/app/modules/loan/reducers/loan.reducer';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import { Colors } from 'src/app/shared/styles/colors';
import { CompareRatesTrendChartUtils } from '../../utils/charts/compare-loan-rates-trend.chart.util';
import { InterestProgressChartBarUtils } from '../../utils/charts/interest-progress.bar-chart.util';
import { InterestProgressChartPieUtils } from '../../utils/charts/interest-progress.pie-chart.util';
import { LoanMonthlyPaymentsChartUtils } from '../../utils/charts/loan-monthly-payments.chart.util';
import { HistoricalInstalmentsTableComponent } from '../historical-instalments-table/historical-instalments-table.component';
import { LoanDetailedCompareBodyComponent } from '../loan-detailed-compare-body/loan-detailed-compare-body.component';
import { RepaymentSchedule } from '../../../models/loan.model';

@Component({
  selector: 'p-loan-detailed-body',
  imports: [
    CommonModule,
    HighchartWrapperComponent,
    HistoricalInstalmentsTableComponent,
    LoanDetailedCompareBodyComponent,
    ToggleButtonComponent,
  ],
  templateUrl: './loan-detailed-body.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './loan-detailed-body.component.scss',
})
export class LoanDetailedBodyComponent {
  historicalCompareToInstalmentPayments = toSignal(
    this.store.select(
      fromLoanDetailed.getHistoricalCompareToInstalmentPayments,
    ),
  );
  detailedCompareToRepaymentSchedule = toSignal(
    this.store.select(fromLoanDetailed.getDetailedCompareToRepaymentSchedule),
  );
  historicalInstalments = toSignal(
    this.store.select(fromLoanDetailed.getHistoricalInstalmentPayments),
  );

  updatedBaseRepaymentScheduleBasedOnLatestStates$ = this.store.select(
    fromLoanDetailed.getHistoricalInstalmentPayments,
  );
  historicalInstalmentPaymentBatches = toSignal(
    this.store.select(fromLoanDetailed.getHistoricalInstalmentPaymentBatches),
  );

  baseRepaymentSchedule = toSignal(
    this.store.select(fromLoan.getBaseRepaymentSchedule),
  );
  selectedRepaymentSchedule = toSignal(
    this.store.select(fromLoanDetailed.getDetailedSelectedRepaymentSchedule),
  );

  interestProgressPieChart = computed(() =>
    InterestProgressChartPieUtils.getChart(
      this.historicalInstalments(),
      this.historicalCompareToInstalmentPayments(),
      this.progressPaymentViewChange(),
    ),
  );

  interestProgressBarChart = computed(() =>
    InterestProgressChartBarUtils.getChart(
      this.historicalInstalments(),
      this.historicalCompareToInstalmentPayments(),
    ),
  );

  dotBarChart = computed(() => {
    const left =
      this.selectedRepaymentSchedule() ?? this.baseRepaymentSchedule();
    const right =
      this.detailedCompareToRepaymentSchedule() ??
      this.selectedRepaymentSchedule();

    if (!left || !right) {
      return { series: [] } as any;
    }

    return CompareRatesTrendChartUtils.getChart(left, right);
  });

  dotBarChartCompareRepaymentSchedules = computed(() => {
    const base = this.baseRepaymentSchedule();
    const selected = this.selectedRepaymentSchedule();

    if (!base && !selected) {
      return [];
    }

    const schedules = [base, selected].filter(Boolean) as RepaymentSchedule[];
    return schedules.length > 1 ? schedules : [];
  });

  loanMonthlyPaymentsChart = computed(() =>
    LoanMonthlyPaymentsChartUtils.getChart(
      this.historicalInstalments(),
      this.monthlyPaymentViewChange() === 'Prd. Fixa',
    ),
  );

  constructor(private store: Store<fromLoan.LoanState>) {}

  colors = Colors;
  chartBasePaymentChange = signal<
    'pie-chart' | 'bars-chart' | 'columns-chart' | 'dot-bar-chart'
  >('pie-chart');
  dotBarChartMode = signal<'chart' | 'compare'>('chart');
  monthlyPaymentViewChange = signal<'Prd. Fixa' | 'Prd. Totala'>('Prd. Fixa');
  progressPaymentViewChange = signal<'Credit' | 'Dobanda' | 'Total'>('Total');

  onChartBasePaymentChange($event: string) {
    this.chartBasePaymentChange.set(
      $event as 'pie-chart' | 'bars-chart' | 'columns-chart' | 'dot-bar-chart',
    );
  }

  onDotBarChartModeChange($event: string) {
    this.dotBarChartMode.set($event as 'chart' | 'compare');
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
