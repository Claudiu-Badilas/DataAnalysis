import { createAction, props } from '@ngrx/store';

export const selectedMortgageLoanChanged = createAction(
  '[Mortgage Loan Detailed] Selected Mortgages Loan Changed',
  props<{ selected: string }>(),
);
