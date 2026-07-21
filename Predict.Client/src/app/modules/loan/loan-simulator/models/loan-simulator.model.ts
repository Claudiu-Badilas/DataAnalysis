import { RepaymentSchedule } from '../../models/loan.model';

export type LoanSimulatorInstalment = {
  instalmentId: number | null;
  paymentDate: Date | null;
  newPaymentDate: Date | null;
  interestAmount: number | null;
  principalAmount: number | null;
  administrationFee: number | null;
  insuranceCost: number | null;
  managementFee: number | null;
  recalculatedInterest: number | null;
  totalInstalment: number | null;
  batchTotalInstalment?: number | null;
  batchTotalEarlyPayment?: number | null;
  remainingBalance: number | null;
  instalmentPayment: boolean;
  earlyPayment: boolean;
  disabled: boolean;
};

export type LoanSimulatorRepaymentSchedule = {
  name: string;
  loanSimulatorInstalments: LoanSimulatorInstalment[];
};

export class MonthlyInstalmentManager {
  public completed: boolean = false;
  public expanded: boolean = true;
  public id: number;
  public title: Date;

  constructor(
    public variableInterestStartingDate: Date,
    public instalments: LoanSimulatorInstalment[],
  ) {
    if (!instalments.length) return;

    this.completed = instalments.some((i) => i.instalmentPayment);
    this.id = instalments[0]?.instalmentId ?? 0;
    this.title = instalments[0].newPaymentDate ?? null;
  }

  getCalculatedInterestAmount(
    selectedRepaymentSchedule: RepaymentSchedule,
    instalment: LoanSimulatorInstalment,
  ) {
    if (instalment.instalmentId === 1) return instalment.interestAmount;

    const foundInstalment = selectedRepaymentSchedule.monthlyInstalments.find(
      (i) => i.instalmentId === instalment.instalmentId - 1,
    );
    if (!foundInstalment) return null;
    return (foundInstalment.remainingBalance * 5.79) / 100 / 12;
  }

  getCalculatedInsuranceCost(
    selectedRepaymentSchedule: RepaymentSchedule,
    instalment: LoanSimulatorInstalment,
  ) {
    if (instalment.instalmentId === 1) return instalment.insuranceCost;

    const foundInstalment = selectedRepaymentSchedule.monthlyInstalments.find(
      (i) => i.instalmentId === instalment.instalmentId - 1,
    );

    if (!foundInstalment) return null;

    return (0.026 / 100) * foundInstalment.remainingBalance;
  }

  getCalculatedPrincipalAmount(
    selectedRepaymentSchedule: RepaymentSchedule,
    instalment: LoanSimulatorInstalment,
  ) {
    if (instalment.instalmentId === 1) return instalment.principalAmount;

    const firstInstalment = selectedRepaymentSchedule.monthlyInstalments[1];

    return (
      firstInstalment.totalInstalment -
      firstInstalment.insuranceCost -
      this.getCalculatedInterestAmount(selectedRepaymentSchedule, instalment)
    );
  }
}
