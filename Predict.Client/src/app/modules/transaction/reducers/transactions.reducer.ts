import {
  Action,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
} from '@ngrx/store';
import * as TransactionsActions from 'src/app/modules/transaction/actions/transactions.actions';
import { TransactionDomain } from '../models/transactions.model';
import { DailyTransactionChartUtils } from '../transaction-overview/utils/daily-transactions.chart.util';
import { MonthlyTransactionChartUtils } from '../transaction-overview/utils/monthly-transactions.chart.util';

export interface State {
  transactions: TransactionDomain[];
  startDate: Date;
  endDate: Date;
  selectedProvider: string;
  selectedServiceProvider: string;
  searchTerm: string;
  viewMode: 'salary' | 'all' | 'monthly' | 'yearly';
}

const initialState: State = {
  transactions: [],
  startDate: new Date('2017-12-10'),
  endDate: new Date(),
  selectedProvider: 'RAIFFEISEN',
  selectedServiceProvider: 'No Selection',
  searchTerm: null,
  viewMode: 'monthly',
};

const transactionsReducer = createReducer(
  initialState,
  on(TransactionsActions.setTransactionsSuccess, (state, { transactions }) => ({
    ...state,
    transactions,
  })),
  on(TransactionsActions.dateRangeChanged, (state, { startDate, endDate }) => ({
    ...state,
    startDate,
    endDate,
  })),
  on(TransactionsActions.selectedProviderChanged, (state, { provider }) => ({
    ...state,
    selectedProvider: provider,
  })),
  on(
    TransactionsActions.selectedServiceProviderChanged,
    (state, { serviceProvider }) => ({
      ...state,
      selectedServiceProvider: serviceProvider,
    }),
  ),
  on(TransactionsActions.searchTermChanged, (state, { searchTerm }) => ({
    ...state,
    searchTerm,
  })),
  on(TransactionsActions.viewModeChanged, (state, { viewMode }) => ({
    ...state,
    viewMode,
  })),
);

export function reducer(state: State, action: Action) {
  return transactionsReducer(state, action);
}

const getTransactionsState = createFeatureSelector<State>('TransactionsState');

export const getStartDate = createSelector(
  getTransactionsState,
  (state) => state.startDate,
);

export const getEndDate = createSelector(
  getTransactionsState,
  (state) => state.endDate,
);

export const getTransactions = createSelector(getTransactionsState, (state) =>
  state.transactions.filter((t) => !t.ignored),
);

export const getSelectedProvider = createSelector(
  getTransactionsState,
  (state) => state.selectedProvider,
);

export const getSelectedServiceProvider = createSelector(
  getTransactionsState,
  (state) => state.selectedServiceProvider,
);

export const getSearchTerm = createSelector(
  getTransactionsState,
  (state) => state.searchTerm,
);

export const getAvailableTransactionsByProvider = createSelector(
  getTransactions,
  getSelectedProvider,
  (transactions, selectedProvider) =>
    transactions.filter(
      (t) =>
        selectedProvider === 'No Selection' || t.provider === selectedProvider,
    ),
);

export const getAvailableTransactionsByServiceProvider = createSelector(
  getAvailableTransactionsByProvider,
  getSelectedServiceProvider,
  (transactions, selectedServiceProvider) =>
    transactions.filter(
      (t) =>
        selectedServiceProvider === 'No Selection' ||
        t.serviceProvider === selectedServiceProvider,
    ),
);

export const getAvailableTransactionsBySearchTerm = createSelector(
  getAvailableTransactionsByServiceProvider,
  getSearchTerm,
  (transactions, searchTerm) =>
    transactions.filter((t) =>
      !!searchTerm
        ? searchTerm
            .toLowerCase()
            .split(',')
            .map((t) => t.trim())
            .filter((t) => !!t && t !== '')
            .some((term) => t.description.toLowerCase().includes(term))
        : transactions,
    ),
);

export const getAvailableTransactions = createSelector(
  getAvailableTransactionsBySearchTerm,
  (transactions) => {
    const seen = new Set<string>();
    return transactions.filter((tx) => {
      const sig = JSON.stringify(tx);
      if (seen.has(sig)) return false;
      seen.add(sig);
      return true;
    });
  },
);

export const getDailyTransactionsChart = createSelector(
  getStartDate,
  getEndDate,
  getAvailableTransactionsBySearchTerm,
  DailyTransactionChartUtils.getChart,
);

export const getMonthlyTransactionsChart = createSelector(
  getStartDate,
  getEndDate,
  getAvailableTransactionsBySearchTerm,
  MonthlyTransactionChartUtils.getChart,
);

export const getViewMode = createSelector(
  getTransactionsState,
  (state) => state.viewMode,
);
