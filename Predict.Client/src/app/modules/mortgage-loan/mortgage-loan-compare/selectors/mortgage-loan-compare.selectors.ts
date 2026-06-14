import { createSelector } from '@ngrx/store';
import * as fromMortgageLoanCompare from 'src/app/modules/mortgage-loan/mortgage-loan-compare/reducers/mortgage-loan-compare.reducer';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import { JsDateUtils } from 'src/app/shared/utils/js-date.utils';
import { HistoricalInstalmentPaymentBatchesManager } from '../../mortgage-loan-detailed/models/base-loan-rate.model';

export const getDetailedMortgageLoanState = createSelector(
  fromMortgageLoan.getMortgageLoanState,
  (state) => state.detiled,
);

export const getLeftSelectedRepaymentScheduleName = createSelector(
  fromMortgageLoanCompare.getMortgageLoanStateCompare,
  (state) => state.leftSelectedRepaymentScheduleName,
);

export const getRightSelectedRepaymentScheduleName = createSelector(
  fromMortgageLoanCompare.getMortgageLoanStateCompare,
  (state) => state.rightSelectedRepaymentScheduleName,
);

export const getLeftHistoricalInstalmentPaymentBatchesManager = createSelector(
  getLeftSelectedRepaymentScheduleName,
  fromMortgageLoan.getBaseRepaymentSchedule,
  fromMortgageLoan.getRepaymentSchedules,
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
  fromMortgageLoan.getBaseRepaymentSchedule,
  fromMortgageLoan.getRepaymentSchedules,
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
