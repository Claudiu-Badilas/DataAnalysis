import { createAction, props } from '@ngrx/store';
import { RepaymentSchedule } from '../models/loan.model';

export const loadRepaymentSchedules = createAction(
  '[Loan] Load Repayment Schedule',
);

export const setLoansSuccess = createAction(
  '[Loan] Set Loans Success',
  props<{ repaymentSchedules: RepaymentSchedule[] }>(),
);

export const selectedLoanChanged = createAction(
  '[Loan] Selected Loan Changed',
  props<{ selected: string }>(),
);

export const selectedInstalmentPaymentChanged = createAction(
  '[Overview Loan] Selected Instalment Payment Changed',
  props<{ values: number[] }>(),
);

export const selectedEarlyPaymentChanged = createAction(
  '[Overview Loan] Selected Early Payment Changed',
  props<{ values: number[] }>(),
);

export const simulateInstalmentPaymentsChanged = createAction(
  '[Overview Loan] Simulate Instalment Payments Changed',
  props<{
    selectedInstalmentPayments: number[];
    selectedEarlyPayments: number[];
  }>(),
);
