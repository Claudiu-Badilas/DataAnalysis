import { createSelector } from '@ngrx/store';
import * as fromLoanCompare from 'src/app/modules/loan/loan-compare/reducers/loan-compare.reducer';
import * as fromLoan from 'src/app/modules/loan/reducers/loan.reducer';
import { JsDateUtils } from 'src/app/shared/utils/js-date.utils';
import { HistoricalInstalmentPaymentBatchesManager } from '../../loan-detailed/models/base-loan-rate.model';

export const getDetailedLoanState = createSelector(
  fromLoan.getLoanState,
  (state) => state.detiled,
);

export const getLeftSelectedRepaymentScheduleName = createSelector(
  fromLoanCompare.getLoanStateCompare,
  (state) => state.leftSelectedRepaymentScheduleName,
);

export const getRightSelectedRepaymentScheduleName = createSelector(
  fromLoanCompare.getLoanStateCompare,
  (state) => state.rightSelectedRepaymentScheduleName,
);

export const getLeftHistoricalInstalmentPaymentBatchesManager = createSelector(
  getLeftSelectedRepaymentScheduleName,
  fromLoan.getBaseRepaymentSchedule,
  fromLoan.getRepaymentSchedules,
  (repaymentScheduleName, base, repaymentSchedules) => {
    const selected = repaymentSchedules.find(
      (r) => r.name === repaymentScheduleName,
    );

    const filtered =
      repaymentSchedules.filter((r) =>
        JsDateUtils.isSameOrBefore(r.date, selected?.date ?? null),
      ) ?? [];

    return new HistoricalInstalmentPaymentBatchesManager(
      base,
      selected,
      filtered,
    );
  },
);

export const getRightHistoricalInstalmentPaymentBatchesManager = createSelector(
  getRightSelectedRepaymentScheduleName,
  fromLoan.getBaseRepaymentSchedule,
  fromLoan.getRepaymentSchedules,
  (repaymentScheduleName, base, repaymentSchedules) => {
    const selected = repaymentSchedules.find(
      (r) => r.name === repaymentScheduleName,
    );

    const filtered =
      repaymentSchedules.filter((r) =>
        JsDateUtils.isSameOrBefore(r.date, selected?.date ?? null),
      ) ?? [];

    return new HistoricalInstalmentPaymentBatchesManager(
      base,
      selected,
      filtered,
    );
  },
);
