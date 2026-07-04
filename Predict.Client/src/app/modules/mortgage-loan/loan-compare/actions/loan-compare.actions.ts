import { createAction, props } from '@ngrx/store';

export const selectedLeftMortgageLoanChanged = createAction(
  '[Mortgage Loan Compare] Selected Left Mortgages Loan Changed',
  props<{ selected: string }>(),
);

export const selectedRightMortgageLoanChanged = createAction(
  '[Mortgage Loan Compare] Selected Right Mortgages Loan Changed',
  props<{ selected: string }>(),
);
