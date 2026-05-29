import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import * as fromMortgageLoanDetailed from 'src/app/modules/mortgage-loan/mortgage-loan-detailed/selectors/mortgage-loan-detailed.selectors';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import { Colors } from 'src/app/shared/styles/colors';
import { MortgageInterestProgressChartUtils } from '../../utils/charts/mortgage-interest-progress.chart.util';
import { MortgageLoanMonthlyPaymentsChartUtils } from '../../utils/charts/mortgage-loan-monthly-payments.chart.util';
import { HistoricalInstalmentsTableComponent } from '../historical-instalments-table/historical-instalments-table.component';

@Component({
  selector: 'p-mortgage-loan-detailed-body',
  imports: [
    CommonModule,
    HighchartWrapperComponent,
    HistoricalInstalmentsTableComponent,
    ToggleButtonComponent,
  ],
  templateUrl: './mortgage-loan-detailed-body.component.html',
  styleUrl: './mortgage-loan-detailed-body.component.scss',
})
export class MortgageLoanDetailedBodyComponent {
  mortgageLoanAmountChart$ = this.store.select(
    fromMortgageLoanDetailed.getMortgageLoanAmountChart,
  );

  historicalInstalments = toSignal(
    this.store.select(fromMortgageLoanDetailed.getHistoricalInstalmentPayments),
  );

  updatedBaseRepaymentScheduleBasedOnLatestStates$ = this.store.select(
    fromMortgageLoanDetailed.getHistoricalInstalmentPayments,
  );
  historicalInstalmentPaymentBatches = toSignal(
    this.store.select(
      fromMortgageLoanDetailed.getHistoricalInstalmentPaymentBatches,
    ),
  );

  mortgageInterestProgressChart = computed(() =>
    MortgageInterestProgressChartUtils.getChart(
      this.historicalInstalments(),
      this.progressPaymentViewChange(),
      this.progressPaymentChartTypeChange(),
    ),
  );

  mortgageLoanMonthlyPaymentsChart = computed(() =>
    MortgageLoanMonthlyPaymentsChartUtils.getChart(
      this.historicalInstalments(),
      this.monthlyPaymentViewChange() === 'Prd. Fixa',
    ),
  );

  constructor(private store: Store<fromMortgageLoan.MortgageLoanState>) {}

  colors = Colors;
  monthlyPaymentViewChange = signal<'Prd. Fixa' | 'Prd. Totala'>('Prd. Fixa');
  progressPaymentViewChange = signal<'Credit' | 'Dobanda' | 'Total'>('Credit');
  progressPaymentChartTypeChange = signal<'Pie' | 'Bar'>('Pie');

  onMonthlyPaymentViewChange($event: string) {
    this.monthlyPaymentViewChange.set($event as 'Prd. Fixa' | 'Prd. Totala');
  }

  onProgressPaymentViewChange($event: string) {
    this.progressPaymentViewChange.set(
      $event as 'Credit' | 'Dobanda' | 'Total',
    );
  }

  onProgressPaymentChartTypeChange($event: string) {
    this.progressPaymentChartTypeChange.set($event as 'Pie' | 'Bar');
  }
}
