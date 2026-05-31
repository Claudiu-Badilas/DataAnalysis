import { createAction, props } from '@ngrx/store';
import { TransactionDomain } from '../models/transactions.model';

export const loadTransactions = createAction(
  '[Transactions] Load Transactions',
);

export const loadTransactions2 = createAction(
  '[Transactions] Load Transactions2',
);

export const setTransactionsSuccess = createAction(
  '[Transactions] Set Transactions Success',
  props<{ transactions: TransactionDomain[] }>(),
);

export const dateRangeChanged = createAction(
  '[Transactions] Date Range Changed',
  props<{ startDate: Date; endDate: Date }>(),
);

export const selectedProviderChanged = createAction(
  '[Transactions] Selected Provider Changed',
  props<{ provider: string }>(),
);

export const selectedServiceProviderChanged = createAction(
  '[Transactions] Selected Service Provider Changed',
  props<{ serviceProvider: string }>(),
);

export const searchTermChanged = createAction(
  '[Transactions] Search Term Changed',
  props<{ searchTerm: string }>(),
);
