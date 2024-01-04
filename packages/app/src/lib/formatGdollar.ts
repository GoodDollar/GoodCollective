export const formatGdollar = (gDollar: any): any => {
  if (!gDollar) return '0';
  const parsed = (gDollar / 10 ** 18) as any;
  const parsed1 = parsed?.split('.') as any;
  const beforeDecimal = parsed1[0];
  let formatted;
  const afterDecimal = parsed1[1];

  if (beforeDecimal === '0' && afterDecimal !== '0') {
    return (formatted = `0.${afterDecimal?.slice(0, 4) || 0}`);
  } else if (beforeDecimal && afterDecimal > 0) {
    return (formatted = `${beforeDecimal}.${afterDecimal?.slice(0, 4) || 0}`);
  }
  return formatted;
};
