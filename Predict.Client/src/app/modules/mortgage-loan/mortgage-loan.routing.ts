import { Routes } from '@angular/router';
import { MortgageLoanCompareComponent } from './mortgage-loan-compare/mortgage-loan-compare.component';
import { MortgageLoanDetailedComponent } from './mortgage-loan-detailed/mortgage-loan-detailed.component';
import { LoanSimulatorComponent } from './loan-simulator/loan-simulator.component';
import { MortgageLoanComponent } from './mortgage-loan.component';

export const mortgageLoanRoutes: Routes = [
  {
    path: '',
    component: MortgageLoanComponent,
    children: [
      { path: 'overview', component: LoanSimulatorComponent },
      { path: 'compare', component: MortgageLoanCompareComponent },
      { path: 'detailed', component: MortgageLoanDetailedComponent },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
    ],
  },
];
