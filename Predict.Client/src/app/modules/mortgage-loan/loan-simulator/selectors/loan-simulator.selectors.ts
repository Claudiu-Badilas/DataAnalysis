import { createSelector } from '@ngrx/store';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import { generateMonthlyInstalmentBatches } from '../utils/monthly-instalment-batches.utils';

export const getOverviewMortgageLoanState = createSelector(
  fromMortgageLoan.getMortgageLoanState,
  (state) => state.overview,
);

export const getSelectedRepaymentScheduleName = createSelector(
  fromMortgageLoan.getMortgageLoanState,
  getOverviewMortgageLoanState,
  (state, overview) =>
    overview.selectedRepaymentScheduleName ??
    state.repaymentSchedules[0]?.name ??
    null,
);

export const getSelectedRepaymentSchedule = createSelector(
  fromMortgageLoan.getMortgageLoanState,
  getSelectedRepaymentScheduleName,
  (state, selectedRepaymentScheduleName) =>
    state.repaymentSchedules?.find(
      (rs) => rs.name === selectedRepaymentScheduleName,
    ) ?? null,
);

export const selectedInstalmentPayments = createSelector(
  getOverviewMortgageLoanState,
  (state) => state.selectedInstalmentPayments,
);

export const selectedEarlyPayments = createSelector(
  getOverviewMortgageLoanState,
  (state) => state.selectedEarlyPayments,
);

export const getMonthlyInstalmentBatches = createSelector(
  getSelectedRepaymentSchedule,
  selectedInstalmentPayments,
  selectedEarlyPayments,
  generateMonthlyInstalmentBatches,
);
