import { CommonModule } from '@angular/common';
import { Component, computed, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';

import * as LoanCompareActions from 'src/app/modules/loan/loan-compare/actions/loan-compare.actions';
import * as fromLoanCompare from 'src/app/modules/loan/loan-compare/selectors/loan-compare.selectors';
import * as fromLoan from 'src/app/modules/loan/reducers/loan.reducer';
import * as fromAppStore from 'src/app/store/app-state.reducer';

import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';

import { ToggleButtonActionsComponent } from 'src/app/shared/components/toggle-button-actions/toggle-button-actions.component';
import { TopBarComponent } from 'src/app/shared/components/top-bar/top-bar.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import { LoanCompareBodyComponent } from './components/loan-compare-body/loan-compare-body.component';
import { CompareRatesTrendChartUtils } from './utils/compare-loan-rates-trend.chart.util';

@Component({
  selector: 'p-loan-compare',
  imports: [
    CommonModule,
    DropdownSelectComponent,
    HighchartWrapperComponent,
    LoanCompareBodyComponent,
    TopBarComponent,
    ToggleButtonActionsComponent,
  ],
  templateUrl: './loan-compare.component.html',
  styleUrls: ['./loan-compare.component.scss'],
})
export class LoanCompareComponent {
  repaymentSchedules = toSignal(
    this.store.select(fromLoan.getRepaymentSchedules),
    { initialValue: [] },
  );

  baseRepaymentSchedule = toSignal(
    this.store.select(fromLoan.getBaseRepaymentSchedule),
  );

  selectedLeftValue = toSignal(
    this.store.select(
      fromLoanCompare.getLeftSelectedRepaymentScheduleName,
    ),
  );

  selectedRightValue = toSignal(
    this.store.select(
      fromLoanCompare.getRightSelectedRepaymentScheduleName,
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

  compareRatesTrendChart = computed(() =>
    CompareRatesTrendChartUtils.getChart(
      this.leftRepaymentSchedule(),
      this.rightRepaymentSchedule(),
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
          LoanCompareActions.selectedLeftLoanChanged({
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
          LoanCompareActions.selectedRightLoanChanged({
            selected: base.name,
          }),
        );
      }
    });
  }

  onLeftDropdownSelected(value: string) {
    this.store.dispatch(
      LoanCompareActions.selectedLeftLoanChanged({
        selected: value,
      }),
    );
  }

  onRightDropdownSelected(value: string) {
    this.store.dispatch(
      LoanCompareActions.selectedRightLoanChanged({
        selected: value,
      }),
    );
  }

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/loan/${module.toLowerCase()}`,
      }),
    );
  }
}
