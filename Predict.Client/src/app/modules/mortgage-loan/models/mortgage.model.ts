import { DateUtils } from 'src/app/shared/utils/date.utils';

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

  constructor(res: InstalmentDto) {
    Object.assign(this, res);

    this.paymentDate = DateUtils.fromSplittedStringToJsDate(res.paymentDate);
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

    this.name = `${res.name} - ${res.isBasePayment ? 'Initial' : res.isNormalPayment ? 'Rata' : 'Anticipat'}`;

    this.date = DateUtils.fromSplittedStringToJsDate(res.date);
    this.monthlyInstalments = res.monthlyInstalments.map(
      (r) => new Instalment(r),
    );
  }
}
