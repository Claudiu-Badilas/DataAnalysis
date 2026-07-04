import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, tap } from 'rxjs/operators';

import * as LoanActions from 'src/app/modules/loan/actions/loan.actions';
import * as LayoutActions from 'src/app/store/actions/layout.actions';
import { LoanService } from '../services/loan.service';

@Injectable()
export class LoanEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly _loanService: LoanService,
  ) {}

  loadRepaymentSchedules$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoanActions.loadRepaymentSchedules),
      tap(() => LayoutActions.spinnerOn()),
      switchMap(() => this._loanService.getRepaymentSchedules()),
      switchMap((repaymentSchedules) => [
        LoanActions.setLoansSuccess({ repaymentSchedules }),
        LayoutActions.spinnerOff(),
      ]),
    ),
  );
}
