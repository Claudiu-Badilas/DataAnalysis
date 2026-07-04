import { Action, createFeatureSelector, createReducer, on } from '@ngrx/store';
import * as LoanCompareActions from 'src/app/modules/loan/loan-compare/actions/loan-compare.actions';

export interface LoanStateCompare {
  leftSelectedRepaymentScheduleName: string;
  rightSelectedRepaymentScheduleName: string;
}

const initialState: LoanStateCompare = {
  leftSelectedRepaymentScheduleName: null,
  rightSelectedRepaymentScheduleName: null,
};

const loanReducer = createReducer(
  initialState,
  on(LoanCompareActions.selectedLeftLoanChanged, (state, { selected }) => ({
    ...state,
    leftSelectedRepaymentScheduleName: selected,
  })),
  on(LoanCompareActions.selectedRightLoanChanged, (state, { selected }) => ({
    ...state,
    rightSelectedRepaymentScheduleName: selected,
  })),
);

export function reducer(state: LoanStateCompare, action: Action) {
  return loanReducer(state, action);
}

export const getLoanStateCompare =
  createFeatureSelector<LoanStateCompare>('LoanStateCompare');
