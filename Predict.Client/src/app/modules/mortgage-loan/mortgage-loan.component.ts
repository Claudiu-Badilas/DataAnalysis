import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import * as MortgageLoanActions from 'src/app/modules/mortgage-loan/actions/mortgage-loan.actions';
import * as fromMortgageLoan from 'src/app/modules/mortgage-loan/reducers/mortgage-loan.reducer';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';

@Component({
  selector: 'p-mortgage-loan',
  imports: [CommonModule, RouterModule],
  templateUrl: './mortgage-loan.component.html',
  styleUrls: ['./mortgage-loan.component.scss'],
})
export class MortgageLoanComponent {
  constructor(
    private readonly store: Store<fromMortgageLoan.MortgageLoanState>,
  ) {
    this.store.dispatch(MortgageLoanActions.loadRepaymentSchedules());
  }

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/mortgage-loan/${module.toLowerCase()}`,
      }),
    );
  }
}
