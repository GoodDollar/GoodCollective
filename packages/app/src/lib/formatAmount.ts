export const formatAmount = (eth: any): any => {
  if (!eth) return '0';

  const parsed = eth?.split('.');
  const beforeDecimal = parsed[0];
  let formatted;
  const afterDecimal = parsed[1];

  if (beforeDecimal === '0' && afterDecimal !== '0') {
    return (formatted = `0.${afterDecimal?.slice(0, 4) || 0}`);
  } else if (beforeDecimal && afterDecimal > 0) {
    return (formatted = `${beforeDecimal}.${afterDecimal?.slice(0, 4) || 0}`);
  }
  return formatted;
};
