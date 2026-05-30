import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';

import * as MortgageLoanCompareActions from 'src/app/modules/mortgage-loan/mortgage-loan-compare/actions/mortgage-loan-compare.actions';
import * as fromMortgageLoanCompare from 'src/app/modules/mortgage-loan/mortgage-loan-compare/selectors/mortgage-loan-compare.selectors';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import * as fromAppStore from 'src/app/store/app-state.reducer';

import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';

import { ToggleButtonActionsComponent } from 'src/app/shared/components/toggle-button-actions/toggle-button-actions.component';
import { TopBarComponent } from 'src/app/shared/components/top-bar/top-bar.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import { MortgageLoanCompareBodyComponent } from './components/mortgage-loan-compare-body/mortgage-loan-compare-body.component';
import { CompareRatesTrendChartUtils } from './utils/compare-loan-rates-trend.chart.util';

@Component({
  selector: 'p-mortgage-loan-compare',
  imports: [
    CommonModule,
    ToggleButtonComponent,
    DropdownSelectComponent,
    HighchartWrapperComponent,
    MortgageLoanCompareBodyComponent,
    TopBarComponent,
    ToggleButtonActionsComponent,
  ],
  templateUrl: './mortgage-loan-compare.component.html',
  styleUrls: ['./mortgage-loan-compare.component.scss'],
})
export class MortgageLoanCompareComponent {
  repaymentSchedules = toSignal(
    this.store.select(fromMortgageLoan.getRepaymentSchedules),
    { initialValue: [] },
  );

  baseRepaymentSchedule = toSignal(
    this.store.select(fromMortgageLoan.getBaseRepaymentSchedule),
  );

  selectedLeftValue = toSignal(
    this.store.select(
      fromMortgageLoanCompare.getLeftSelectedRepaymentScheduleName,
    ),
  );

  selectedRightValue = toSignal(
    this.store.select(
      fromMortgageLoanCompare.getRightSelectedRepaymentScheduleName,
    ),
  );

  repaymentSchedulesOptions = computed(() => {
    const rs = this.repaymentSchedules();
    return rs.length
      ? ['No Selection', ...rs.map((r) => r.name)]
      : ['No Selection'];
  });

  leftRepaymentSchedule = computed(() => {
    const rs = this.repaymentSchedules();
    const selected = this.selectedLeftValue();
    return rs.find((r) => r.name === selected);
  });

  rightRepaymentSchedule = computed(() => {
    const rs = this.repaymentSchedules();
    const selected = this.selectedRightValue();
    return rs.find((r) => r.name === selected);
  });

  chartView = signal<'Rata' | 'Dobanda' | 'Principal'>('Rata');

  compareRatesTrendChart = computed(() =>
    CompareRatesTrendChartUtils.getChart(
      this.leftRepaymentSchedule(),
      this.rightRepaymentSchedule(),
      this.chartView(),
    ),
  );

  constructor(private store: Store<fromAppStore.AppState>) {
    this.initLeftSelectionEffect();
    this.initRightSelectionEffect();
  }

  private initLeftSelectionEffect() {
    effect(() => {
      const rs = this.repaymentSchedules();
      if (!rs.length) return;

      const first = rs.find((r) => !r.isBasePayment);
      if (!first) return;

      const selectedLeft = this.selectedLeftValue();

      if (!selectedLeft) {
        this.store.dispatch(
          MortgageLoanCompareActions.selectedLeftMortgageLoanChanged({
            selected: first.name,
          }),
        );
      }
    });
  }

  private initRightSelectionEffect() {
    effect(() => {
      const rs = this.repaymentSchedules();
      if (!rs.length) return;

      const base = rs.find((r) => r.isBasePayment);
      if (!base) return;

      const selectedRight = this.selectedRightValue();

      if (!selectedRight) {
        this.store.dispatch(
          MortgageLoanCompareActions.selectedRightMortgageLoanChanged({
            selected: base.name,
          }),
        );
      }
    });
  }

  onLeftDropdownSelected(value: string) {
    this.store.dispatch(
      MortgageLoanCompareActions.selectedLeftMortgageLoanChanged({
        selected: value,
      }),
    );
  }

  onRightDropdownSelected(value: string) {
    this.store.dispatch(
      MortgageLoanCompareActions.selectedRightMortgageLoanChanged({
        selected: value,
      }),
    );
  }

  onChartViewChange(view: string) {
    this.chartView.set(view as 'Rata' | 'Dobanda' | 'Principal');
  }

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/mortgage-loan/${module.toLowerCase()}`,
      }),
    );
  }
}
