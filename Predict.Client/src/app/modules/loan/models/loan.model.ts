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

  calculateInstalment(prevInstalment: Instalment, fixedMonthlyPayment: number) {
    this.interestAmount = LoanRecalcualtionUtils.round(
      LoanRecalcualtionUtils.getCalculatedInterestAmount(prevInstalment),
    );

    this.insuranceCost = LoanRecalcualtionUtils.round(
      LoanRecalcualtionUtils.getCalculatedInsuranceCost(prevInstalment),
    );

    this.totalInstalment = LoanRecalcualtionUtils.round(fixedMonthlyPayment);

    this.principalAmount = LoanRecalcualtionUtils.round(
      LoanRecalcualtionUtils.getCalculatedPrincipalAmount(
        this.totalInstalment,
        this.interestAmount,
        this.insuranceCost,
      ),
    );

    this.remainingBalance = LoanRecalcualtionUtils.round(
      prevInstalment.remainingBalance - this.principalAmount,
    );

    if (this.remainingBalance < 0) {
      this.principalAmount += this.remainingBalance;
      this.remainingBalance = 0;

      this.totalInstalment = LoanRecalcualtionUtils.round(
        this.principalAmount + this.interestAmount + this.insuranceCost,
      );
    }

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

  recalculateFixedRate(
    variableInterestStartDate: Date,
    annualInterest = LoanRecalcualtionUtils.ANNUAL_INTEREST,
  ) {
    const startIndex = this.monthlyInstalments.findIndex((i) =>
      JsDateUtils.isAfter(i.paymentDate, variableInterestStartDate),
    );

    if (startIndex <= 0) {
      return;
    }

    const remainingMonths = this.monthlyInstalments.length - startIndex;

    const previous = this.monthlyInstalments[startIndex - 1];

    const fixedPayment = LoanRecalcualtionUtils.calculateFixedMonthlyPayment(
      previous.remainingBalance,
      annualInterest,
      remainingMonths,
    );

    for (let i = startIndex; i < this.monthlyInstalments.length; i++) {
      this.monthlyInstalments[i].calculateInstalment(
        this.monthlyInstalments[i - 1],
        fixedPayment,
      );
    }
  }
}

export namespace LoanRecalcualtionUtils {
  export const ANNUAL_INTEREST = 5.79;

  export function calculateFixedMonthlyPayment(
    balance: number,
    annualInterest: number,
    months: number,
  ): number {
    const monthlyRate = annualInterest / 100 / 12;

    return (
      (balance * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)
    );
  }

  export function getCalculatedInterestAmount(prevInstalment: Instalment) {
    return (prevInstalment.remainingBalance * ANNUAL_INTEREST) / 100 / 12;
  }

  export function getCalculatedInsuranceCost(prevInstalment: Instalment) {
    return (prevInstalment.remainingBalance * 0.026) / 100;
  }

  export function getCalculatedPrincipalAmount(
    fixedPayment: number,
    interest: number,
    insurance: number,
  ) {
    return fixedPayment - interest - insurance;
  }

  export function round(value: number) {
    return Math.round(value * 100) / 100;
  }
}
