import {
  Action,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
} from '@ngrx/store';
import * as MortgageLoanActions from 'src/app/modules/mortgage-loan/actions/mortgage-loan.actions';
import * as MortgageLoanDetailedActions from 'src/app/modules/mortgage-loan/loan-detailed/actions/loan-detailed.actions';
import { LoanSimulatorRepaymentSchedule } from '../loan-simulator/models/loan-simulator.model';
import { RepaymentSchedule } from './../models/mortgage.model';

interface OverviewMortgageLoanState {
  repaymentSchedules: LoanSimulatorRepaymentSchedule[];
  selectedRepaymentScheduleName: string;
  selectedInstalmentPayments: number[];
  selectedEarlyPayments: number[];
}

interface DetailedMortgageLoanState {
  selectedRepaymentScheduleName: string;
}

export interface MortgageLoanState {
  repaymentSchedules: RepaymentSchedule[];

  overview: OverviewMortgageLoanState;

  detiled: DetailedMortgageLoanState;
}

const initialState: MortgageLoanState = {
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

const mortgageReducer = createReducer(
  initialState,
  on(
    MortgageLoanActions.setMortgagesSuccess,
    (state, { repaymentSchedules }) => ({
      ...state,
      repaymentSchedules,
    }),
  ),
  on(
    MortgageLoanActions.selectedMortgageLoanChanged,
    (state, { selected }) => ({
      ...state,
      overview: { ...state.overview, selectedRepaymentScheduleName: selected },
    }),
  ),
  on(
    MortgageLoanActions.selectedInstalmentPaymentChanged,
    (state, { values }) => {
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
    },
  ),
  on(MortgageLoanActions.selectedEarlyPaymentChanged, (state, { values }) => {
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
    MortgageLoanActions.simulateInstalmentPaymentsChanged,
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
  on(
    MortgageLoanDetailedActions.selectedMortgageLoanChanged,
    (state, { selected }) => ({
      ...state,
      detiled: { ...state.detiled, selectedRepaymentScheduleName: selected },
    }),
  ),
);

export function reducer(state: MortgageLoanState, action: Action) {
  return mortgageReducer(state, action);
}

export const getMortgageLoanState =
  createFeatureSelector<MortgageLoanState>('MortgageLoanState');

export const getRepaymentSchedules = createSelector(
  getMortgageLoanState,
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
