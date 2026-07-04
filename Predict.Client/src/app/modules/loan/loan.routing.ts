import { Routes } from '@angular/router';
import { LoanCompareComponent } from './loan-compare/loan-compare.component';
import { LoanDetailedComponent } from './loan-detailed/loan-detailed.component';
import { LoanSimulatorComponent } from './loan-simulator/loan-simulator.component';
import { LoanComponent } from './loan.component';

export const loanRoutes: Routes = [
  {
    path: '',
    component: LoanComponent,
    children: [
      { path: 'overview', component: LoanSimulatorComponent },
      { path: 'compare', component: LoanCompareComponent },
      { path: 'detailed', component: LoanDetailedComponent },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
    ],
  },
];
