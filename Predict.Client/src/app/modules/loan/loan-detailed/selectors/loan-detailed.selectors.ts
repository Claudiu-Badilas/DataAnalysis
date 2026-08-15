import { createSelector } from '@ngrx/store';
import * as fromLoan from 'src/app/modules/loan/reducers/loan.reducer';
import { JsDateUtils } from 'src/app/shared/utils/js-date.utils';
import { HistoricalInstalmentPaymentBatchesUtils } from '../utils/historical-instalment-payment-batches.utils';
import { HistoricalInstalmentPaymentsUtils } from '../utils/historical-instalment-payments.utils';

export const getDetailedLoanState = createSelector(
  fromLoan.getLoanState,
  (state) => state.detiled,
);

export const getDetailedSelectedRepaymentScheduleName = createSelector(
  getDetailedLoanState,
  fromLoan.getRepaymentSchedules,
  (detailed, repaymentSchedules) =>
    detailed.selectedRepaymentScheduleName || repaymentSchedules[0]?.name,
);

export const getDetailedSelectedRepaymentSchedule = createSelector(
  fromLoan.getRepaymentSchedules,
  getDetailedSelectedRepaymentScheduleName,
  (repaymentSchedules, selectedRepaymentScheduleName) =>
    repaymentSchedules.find((r) => r.name === selectedRepaymentScheduleName),
);

export const getDetailedCompareToRepaymentSchedule = createSelector(
  fromLoan.getBaseRepaymentSchedule,
  fromLoan.getRepaymentSchedules,
  getDetailedSelectedRepaymentSchedule,
  (baseRepaymentSchedule, repaymentSchedules, selectedRepaymentSchedule) => {
    const date = JsDateUtils.addMonths(selectedRepaymentSchedule?.date, -1);
    const targetDate = new Date(
      `01-${date.getMonth() + 1}-${date.getFullYear()}`,
    );
    const foundTarget = repaymentSchedules
      .filter((rs) => rs.isNormalPayment)
      .find((rs) => {
        const rsDate = new Date(
          `01-${rs?.date.getMonth() + 1}-${rs?.date.getFullYear()}`,
        );
        return JsDateUtils.isSame(rsDate, targetDate);
      });
    return foundTarget || baseRepaymentSchedule;
  },
);

export const getDetailedRepaymentSchedules = createSelector(
  fromLoan.getRepaymentSchedules,
  getDetailedSelectedRepaymentSchedule,
  (repaymentSchedules, selectedRepaymentSchedule) =>
    repaymentSchedules.filter(
      (r) =>
        !selectedRepaymentSchedule ||
        JsDateUtils.isSameOrBefore(r.date, selectedRepaymentSchedule.date),
    ),
);

export const getDetailedCompareToRepaymentSchedules = createSelector(
  fromLoan.getRepaymentSchedules,
  getDetailedCompareToRepaymentSchedule,
  (repaymentSchedules, selectedRepaymentSchedule) =>
    repaymentSchedules.filter(
      (r) =>
        !selectedRepaymentSchedule ||
        JsDateUtils.isSameOrBefore(r.date, selectedRepaymentSchedule.date),
    ),
);

export const getHistoricalInstalmentPayments = createSelector(
  fromLoan.getBaseRepaymentSchedule,
  getDetailedRepaymentSchedules,
  HistoricalInstalmentPaymentsUtils.getHistoricalInstalmentPayments,
);

export const getHistoricalCompareToInstalmentPayments = createSelector(
  fromLoan.getBaseRepaymentSchedule,
  getDetailedCompareToRepaymentSchedules,
  HistoricalInstalmentPaymentsUtils.getHistoricalInstalmentPayments,
);

export const getHistoricalInstalmentPaymentBatches = createSelector(
  getHistoricalInstalmentPayments,
  HistoricalInstalmentPaymentBatchesUtils.getHistoricalInstalmentPaymentBatches,
);
