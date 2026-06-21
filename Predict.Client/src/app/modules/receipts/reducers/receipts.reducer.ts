import {
  Action,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
} from '@ngrx/store';
import * as ReceiptsActions from 'src/app/modules/receipts/actions/receipts.actions';
import { DateUtils } from 'src/app/shared/utils/date.utils';
import { ReceiptDomain } from '../models/receipts-domain.model';
import { ReceiptsProductDomain } from '../receipts-products/models/receipts-products.model';
import { ProductPriceTrendChartUtils } from '../receipts-products/utils/products-price-trend.chart.util';

interface ReceiptsProductsState {
  searchTerm: string;
}

export interface State {
  receipts: ReceiptDomain[];
  startDate: Date;
  endDate: Date;

  receiptsProducts: ReceiptsProductsState;
}

const initialState: State = {
  receipts: [],
  startDate: DateUtils.getStartOfTheYear({ subtractYears: 1 }),
  endDate: new Date(),

  receiptsProducts: {
    searchTerm: null,
  },
};

const receiptsReducer = createReducer(
  initialState,
  on(ReceiptsActions.setReceiptsSuccess, (state, { receipts }) => ({
    ...state,
    receipts,
  })),
  on(ReceiptsActions.dateRangeChanged, (state, { startDate, endDate }) => ({
    ...state,
    startDate,
    endDate,
  })),

  // Receipts Products
  on(ReceiptsActions.searchTermChanged, (state, { searchTerm }) => ({
    ...state,
    receiptsProducts: {
      ...state.receiptsProducts,
      searchTerm,
    },
  })),
);

export function reducer(state: State, action: Action) {
  return receiptsReducer(state, action);
}

const getReceiptsState = createFeatureSelector<State>('ReceiptsState');

export const getStartDate = createSelector(
  getReceiptsState,
  (state) => state.startDate,
);

export const getEndDate = createSelector(
  getReceiptsState,
  (state) => state.endDate,
);

export const getReceipts = createSelector(
  getReceiptsState,
  (state) => state.receipts,
);

// Receipts Products selectors
export const getReceiptsProducts = createSelector(
  getReceiptsState,
  (state) => state.receiptsProducts,
);

export const getReceiptsProductDomain = createSelector(
  getReceiptsState,
  (state) =>
    state.receipts.flatMap((receipt) =>
      receipt.products.map(
        (product) => new ReceiptsProductDomain(receipt, product),
      ),
    ),
);

export const getProductsSearchTerm = createSelector(
  getReceiptsProducts,
  (state) => state.searchTerm,
);

export const getAvailableReceiptsProductBySearchTerm = createSelector(
  getReceiptsProductDomain,
  getProductsSearchTerm,
  (receiptsProduct, searchTerm) =>
    receiptsProduct.filter((p) =>
      !!searchTerm
        ? searchTerm
            .toLowerCase()
            .split(',')
            .map((t) => t.trim())
            .filter((t) => !!t && t !== '')
            .some((term) => p.name.toLowerCase().includes(term))
        : receiptsProduct,
    ),
);

export const getProductPriceTrendChartUtils = createSelector(
  getAvailableReceiptsProductBySearchTerm,
  ProductPriceTrendChartUtils.getChart,
);
