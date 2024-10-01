export const formatFiatCurrency = (
  number: number,
  currencyCode: string = 'USD',
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    ...options,
  }).format(number);
};

export const formatNumberWithCommas = (num: string): string => {
  const number = parseFloat(num);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  })
    .format(number)
    .substring(1);
};
