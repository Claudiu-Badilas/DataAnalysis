import {
  Action,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
} from '@ngrx/store';
import * as LoanActions from 'src/app/modules/loan/actions/loan.actions';
import * as LoanDetailedActions from 'src/app/modules/loan/loan-detailed/actions/loan-detailed.actions';
import { LoanSimulatorRepaymentSchedule } from '../loan-simulator/models/loan-simulator.model';
import { RepaymentSchedule } from './../models/loan.model';

interface OverviewLoanState {
  repaymentSchedules: LoanSimulatorRepaymentSchedule[];
  selectedRepaymentScheduleName: string;
  selectedInstalmentPayments: number[];
  selectedEarlyPayments: number[];
}

interface DetailedLoanState {
  selectedRepaymentScheduleName: string;
}

export interface LoanState {
  calculateRepaymentSchedules: boolean;
  repaymentSchedules: RepaymentSchedule[];

  overview: OverviewLoanState;

  detiled: DetailedLoanState;
}

const initialState: LoanState = {
  calculateRepaymentSchedules: false,
  repaymentSchedules: [],

  overview: {
    repaymentSchedules: [],
    selectedRepaymentScheduleName: null,
    selectedInstalmentPayments: [],
    selectedEarlyPayments: [],
  },

  detiled: {
    selectedRepaymentScheduleName: null,
  },
};

const loanReducer = createReducer(
  initialState,
  on(
    LoanActions.calculateRepaymentSchedulesChanged,
    (state, { calculateRepaymentSchedules }) => ({
      ...state,
      calculateRepaymentSchedules,
    }),
  ),
  on(LoanActions.setLoansSuccess, (state, { repaymentSchedules }) => ({
    ...state,
    repaymentSchedules,
  })),
  on(LoanActions.selectedLoanChanged, (state, { selected }) => ({
    ...state,
    overview: { ...state.overview, selectedRepaymentScheduleName: selected },
  })),
  on(LoanActions.selectedInstalmentPaymentChanged, (state, { values }) => {
    const arr = [...state.overview.selectedInstalmentPayments];

    values.forEach((val) => {
      const index = arr.findIndex((r) => r === val);

      if (index !== -1) arr.splice(index, 1);
      else arr.push(val);
    });

    return {
      ...state,
      overview: { ...state.overview, selectedInstalmentPayments: [...arr] },
    };
  }),
  on(LoanActions.selectedEarlyPaymentChanged, (state, { values }) => {
    const arr = [...state.overview.selectedEarlyPayments];

    values.forEach((val) => {
      const index = arr.findIndex((r) => r === val);

      if (index !== -1) arr.splice(index, 1);
      else arr.push(val);
    });

    return {
      ...state,
      overview: { ...state.overview, selectedEarlyPayments: [...arr] },
    };
  }),
  on(
    LoanActions.simulateInstalmentPaymentsChanged,
    (state, { selectedInstalmentPayments, selectedEarlyPayments }) => ({
      ...state,
      overview: {
        ...state.overview,
        selectedInstalmentPayments: [...selectedInstalmentPayments],
        selectedEarlyPayments: [...selectedEarlyPayments],
      },
    }),
  ),

  //DETAILED
  on(LoanDetailedActions.selectedLoanChanged, (state, { selected }) => ({
    ...state,
    detiled: { ...state.detiled, selectedRepaymentScheduleName: selected },
  })),
);

export function reducer(state: LoanState, action: Action) {
  return loanReducer(state, action);
}

export const getLoanState = createFeatureSelector<LoanState>('LoanState');

export const getCalculateRepaymentSchedules = createSelector(
  getLoanState,
  (state) => state.calculateRepaymentSchedules,
);

export const getRepaymentSchedules = createSelector(
  getLoanState,
  (state) => state.repaymentSchedules,
);

export const getBaseRepaymentSchedule = createSelector(
  getRepaymentSchedules,
  (repaymentSchedules) =>
    repaymentSchedules.find((r) => r.isBasePayment) ?? null,
);

export const getLatestRepaymentSchedule = createSelector(
  getRepaymentSchedules,
  (repaymentSchedules) =>
    repaymentSchedules.length > 0
      ? repaymentSchedules
          .slice()
          .sort((a, b) => b.date.valueOf() - a.date.valueOf())
          .at(0)
      : null,
);
