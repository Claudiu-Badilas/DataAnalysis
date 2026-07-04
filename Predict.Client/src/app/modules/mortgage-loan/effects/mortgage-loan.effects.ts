import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, tap } from 'rxjs/operators';

import * as MortgageLoanActions from 'src/app/modules/mortgage-loan/actions/mortgage-loan.actions';
import * as LayoutActions from 'src/app/store/actions/layout.actions';
import { MortgageLoanService } from '../services/mortgage-loan.service';

@Injectable()
export class MortgageLoanEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly _mortgageService: MortgageLoanService,
  ) {}

  loadRepaymentSchedules$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MortgageLoanActions.loadRepaymentSchedules),
      tap(() => LayoutActions.spinnerOn()),
      switchMap(() => this._mortgageService.getRepaymentSchedules()),
      switchMap((repaymentSchedules) => [
        MortgageLoanActions.setMortgagesSuccess({ repaymentSchedules }),
        LayoutActions.spinnerOff(),
      ]),
    ),
  );
}
