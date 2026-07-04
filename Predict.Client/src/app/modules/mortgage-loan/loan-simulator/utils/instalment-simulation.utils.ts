import { RepaymentSchedule } from '../../models/mortgage.model';

export function mapInstalementSimulation(
  base: RepaymentSchedule | null,
  {
    monthlyAmount = null,
    payments = null,
  }: { monthlyAmount?: number; payments?: number } = {},
): [number[], number[]] | null {
  if (!base || monthlyAmount === null || monthlyAmount <= 0) return [[], []];

  const selectedInstalmentPayments: number[] = [];
  const selectedEarlyPayments: number[] = [];

  let accAmount = 0;
  let accPayments = 1;

  for (let i = 0; i < base.monthlyInstalments.length; i++) {
    const instalment = base.monthlyInstalments[i];
    const tempAccAmount = accAmount + instalment.principalAmount;
    const maxAmountTrashhold = monthlyAmount + 100;

    if (i === 0) {
      selectedInstalmentPayments.push(instalment.instalmentId);
      accAmount = instalment.totalInstalment;
    } else if (
      tempAccAmount > maxAmountTrashhold ||
      accAmount > monthlyAmount
    ) {
      if (payments !== null && accPayments === payments) break;

      selectedInstalmentPayments.push(instalment.instalmentId);
      accAmount = instalment.totalInstalment;
      accPayments++;
    } else if (accAmount <= monthlyAmount) {
      selectedEarlyPayments.push(instalment.instalmentId);
      accAmount += instalment.principalAmount;
    }
  }

  return [selectedInstalmentPayments, selectedEarlyPayments];
}
