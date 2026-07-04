import { createSelector } from '@ngrx/store';
import * as fromLoan from 'src/app/modules/loan/reducers/loan.reducer';
import { generateMonthlyInstalmentBatches } from '../utils/monthly-instalment-batches.utils';

export const getOverviewLoanState = createSelector(
  fromLoan.getLoanState,
  (state) => state.overview,
);

export const getSelectedRepaymentScheduleName = createSelector(
  fromLoan.getLoanState,
  getOverviewLoanState,
  (state, overview) =>
    overview.selectedRepaymentScheduleName ??
    state.repaymentSchedules[0]?.name ??
    null,
);

export const getSelectedRepaymentSchedule = createSelector(
  fromLoan.getLoanState,
  getSelectedRepaymentScheduleName,
  (state, selectedRepaymentScheduleName) =>
    state.repaymentSchedules?.find(
      (rs) => rs.name === selectedRepaymentScheduleName,
    ) ?? null,
);

export const selectedInstalmentPayments = createSelector(
  getOverviewLoanState,
  (state) => state.selectedInstalmentPayments,
);

export const selectedEarlyPayments = createSelector(
  getOverviewLoanState,
  (state) => state.selectedEarlyPayments,
);

export const getMonthlyInstalmentBatches = createSelector(
  getSelectedRepaymentSchedule,
  selectedInstalmentPayments,
  selectedEarlyPayments,
  generateMonthlyInstalmentBatches,
);
