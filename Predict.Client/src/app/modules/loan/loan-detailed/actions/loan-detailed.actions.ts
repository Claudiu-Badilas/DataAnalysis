import { createAction, props } from '@ngrx/store';

export const selectedLoanChanged = createAction(
  '[Loan Detailed] Selected Mortgages Loan Changed',
  props<{ selected: string }>(),
);
