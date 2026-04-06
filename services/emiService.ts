export interface EmiInput {
  loanAmount: number;
  interestRate: number;
  tenureYears: number;
}

export interface EmiResult {
  emi: number;
  totalInterest: number;
  totalPayment: number;
}

const roundTo2 = (value: number): number => Math.round(value * 100) / 100;

export const calculateEmi = ({
  loanAmount,
  interestRate,
  tenureYears,
}: EmiInput): EmiResult => {
  const monthlyRate = interestRate / (12 * 100);
  const tenureMonths = tenureYears * 12;

  const emi =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - loanAmount;

  return {
    emi: roundTo2(emi),
    totalInterest: roundTo2(totalInterest),
    totalPayment: roundTo2(totalPayment),
  };
};
