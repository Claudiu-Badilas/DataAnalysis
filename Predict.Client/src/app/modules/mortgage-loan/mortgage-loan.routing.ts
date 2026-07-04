import { Routes } from '@angular/router';
import { LoanCompareComponent } from './loan-compare/loan-compare.component';
import { LoanDetailedComponent } from './loan-detailed/loan-detailed.component';
import { LoanSimulatorComponent } from './loan-simulator/loan-simulator.component';
import { MortgageLoanComponent } from './mortgage-loan.component';

export const mortgageLoanRoutes: Routes = [
  {
    path: '',
    component: MortgageLoanComponent,
    children: [
      { path: 'overview', component: LoanSimulatorComponent },
      { path: 'compare', component: LoanCompareComponent },
      { path: 'detailed', component: LoanDetailedComponent },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
    ],
  },
];
