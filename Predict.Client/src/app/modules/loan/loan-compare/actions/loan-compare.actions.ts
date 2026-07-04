import { createAction, props } from '@ngrx/store';

export const selectedLeftLoanChanged = createAction(
  '[Loan Compare] Selected Left Mortgages Loan Changed',
  props<{ selected: string }>(),
);

export const selectedRightLoanChanged = createAction(
  '[Loan Compare] Selected Right Mortgages Loan Changed',
  props<{ selected: string }>(),
);
