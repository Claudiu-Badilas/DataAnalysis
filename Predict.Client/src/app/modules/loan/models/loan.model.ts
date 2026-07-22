import { DateUtils } from 'src/app/shared/utils/date.utils';
import { JsDateUtils } from 'src/app/shared/utils/js-date.utils';

export type InstalmentDto = {
  instalmentId: number;
  paymentDate: string;
  interestAmount: number;
  principalAmount: number;
  administrationFee: number;
  insuranceCost: number;
  managementFee: number;
  recalculatedInterest: number;
  totalInstalment: number;
  remainingBalance: number;
};

export type RepaymentScheduleDto = {
  name: string;
  monthlyInstalments: InstalmentDto[];
  date: string;
  isBasePayment: boolean;
  isNormalPayment: boolean;
  isExtraPayment: boolean;
};

export class Instalment {
  instalmentId: number;
  paymentDate: Date;
  interestAmount: number;
  principalAmount: number;
  administrationFee: number;
  insuranceCost: number;
  managementFee: number;
  recalculatedInterest: number;
  totalInstalment: number;
  remainingBalance: number;

  recalculated: boolean;

  constructor(res: InstalmentDto) {
    Object.assign(this, res);
    this.paymentDate = DateUtils.fromSplittedStringToJsDate(res.paymentDate);

    this.recalculated = false;
  }

  calculateInstamlment(
    flexibleInterestDate: Date,
    repaymentSchedule: RepaymentSchedule,
  ) {
    if (JsDateUtils.isSameOrBefore(this.paymentDate, flexibleInterestDate))
      return;

    this.interestAmount = LoanRecalcualtionUtils.getCalculatedInterestAmount(
      repaymentSchedule,
      this,
    );

    this.insuranceCost = LoanRecalcualtionUtils.getCalculatedInsuranceCost(
      repaymentSchedule,
      this,
    );
    this.principalAmount = LoanRecalcualtionUtils.getCalculatedPrincipalAmount(
      repaymentSchedule,
      this,
    );
    this.recalculated = true;
  }
}

export class RepaymentSchedule {
  name: string;
  monthlyInstalments: Instalment[];
  date: Date;
  isBasePayment: boolean;
  isNormalPayment: boolean;
  isExtraPayment: boolean;

  constructor(res: RepaymentScheduleDto) {
    Object.assign(this, res);

    this.name = `${res.name} ${res.isBasePayment ? 'Initial' : res.isNormalPayment ? 'Rata' : 'Anticipat'}`;

    this.date = DateUtils.fromSplittedStringToJsDate(res.date);
    this.monthlyInstalments = res.monthlyInstalments.map(
      (r) => new Instalment(r),
    );

    this.monthlyInstalments = res.monthlyInstalments.map((r) => {
      const instalment = new Instalment(r);
      return instalment;
    });
  }
}

/**
 *  if (loadDefault) {
        instalment.interestAmount = LoanUtils.getCalculatedInterestAmount(
          loan,
          instalment,
        );
        instalment.insuranceCost = LoanUtils.getCalculatedInsuranceCost(
          loan,
          instalment,
        );
        instalment.principalAmount = LoanUtils.getCalculatedPrincipalAmount(
          loan,
          instalment,
        );
      }
 */

export namespace LoanRecalcualtionUtils {
  export function getCalculatedInterestAmount(
    repaymentSchedule: RepaymentSchedule,
    instalment: Instalment,
  ) {
    if (instalment.instalmentId === 1) return instalment.interestAmount;

    const foundInstalment = repaymentSchedule.monthlyInstalments.find(
      (i) => i.instalmentId === instalment.instalmentId - 1,
    );
    if (!foundInstalment) return null;
    return (foundInstalment.remainingBalance * 5.79) / 100 / 12;
  }

  export function getCalculatedInsuranceCost(
    repaymentSchedule: RepaymentSchedule,
    instalment: Instalment,
  ) {
    if (instalment.instalmentId === 1) return instalment.insuranceCost;

    const foundInstalment = repaymentSchedule.monthlyInstalments.find(
      (i) => i.instalmentId === instalment.instalmentId - 1,
    );

    if (!foundInstalment) return null;

    return (0.026 / 100) * foundInstalment.remainingBalance;
  }

  export function getCalculatedPrincipalAmount(
    repaymentSchedule: RepaymentSchedule,
    instalment: Instalment,
  ) {
    if (instalment.instalmentId === 1) return instalment.principalAmount;

    const firstInstalment = repaymentSchedule.monthlyInstalments[1];

    return (
      firstInstalment.totalInstalment -
      firstInstalment.insuranceCost -
      getCalculatedInterestAmount(repaymentSchedule, instalment)
    );
  }
}
