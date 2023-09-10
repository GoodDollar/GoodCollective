export const formatAmount = (
  number: number,
  currencyCode: string = 'USD',
  options?: Intl.NumberFormatOptions
): string => {
  const formattedNumber = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
    ...options,
  }).format(number);

  return formattedNumber;
};
