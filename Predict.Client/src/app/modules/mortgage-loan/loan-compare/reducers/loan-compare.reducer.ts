import { Action, createFeatureSelector, createReducer, on } from '@ngrx/store';
import * as MortgageLoanCompareActions from 'src/app/modules/mortgage-loan/loan-compare/actions/loan-compare.actions';

export interface MortgageLoanStateCompare {
  leftSelectedRepaymentScheduleName: string;
  rightSelectedRepaymentScheduleName: string;
}

const initialState: MortgageLoanStateCompare = {
  leftSelectedRepaymentScheduleName: null,
  rightSelectedRepaymentScheduleName: null,
};

const mortgageReducer = createReducer(
  initialState,
  on(
    MortgageLoanCompareActions.selectedLeftMortgageLoanChanged,
    (state, { selected }) => ({
      ...state,
      leftSelectedRepaymentScheduleName: selected,
    }),
  ),
  on(
    MortgageLoanCompareActions.selectedRightMortgageLoanChanged,
    (state, { selected }) => ({
      ...state,
      rightSelectedRepaymentScheduleName: selected,
    }),
  ),
);

export function reducer(state: MortgageLoanStateCompare, action: Action) {
  return mortgageReducer(state, action);
}

export const getMortgageLoanStateCompare =
  createFeatureSelector<MortgageLoanStateCompare>('MortgageLoanStateCompare');
