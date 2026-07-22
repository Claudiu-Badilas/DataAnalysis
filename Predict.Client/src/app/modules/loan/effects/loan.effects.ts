import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import * as LoanActions from 'src/app/modules/loan/actions/loan.actions';
import * as fromLoan from 'src/app/modules/loan/reducers/loan.reducer';
import * as LayoutActions from 'src/app/store/actions/layout.actions';
import { LoanService } from '../services/loan.service';

@Injectable()
export class LoanEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly _loanService: LoanService,
    private readonly store: Store<fromLoan.LoanState>,
  ) {}

  loadRepaymentSchedules$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoanActions.loadRepaymentSchedules),
      tap(() => LayoutActions.spinnerOn()),
      switchMap(() => this._loanService.getRepaymentSchedules()),
      withLatestFrom(
        this.store.select(fromLoan.getCalculateRepaymentSchedules),
      ),
      switchMap(([loans, calculateRepaymentSchedules]) => {
        const base = loans.find((loan) => loan.isBasePayment);
        const repaymentSchedules = loans.map((loan) => {
          if (calculateRepaymentSchedules) {
            loan.monthlyInstalments.forEach((instalment) =>
              instalment.calculateInstamlment(
                base.monthlyInstalments[5 * 12 - 1].paymentDate,
                loan,
              ),
            );
          }
          return loan;
        });

        return [
          LoanActions.setLoansSuccess({ repaymentSchedules }),
          LayoutActions.spinnerOff(),
        ];
      }),
    ),
  );
}
