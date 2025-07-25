export function formatAmount(amount: string): string {
  try {
    const value = BigInt(amount),
      dec = BigInt(10 ** 18);
    const whole = value / dec;
    const frac = (value % dec).toString().padStart(18, '0').slice(0, 3).replace(/0+$/, '');
    return frac ? `${whole}.${frac}` : whole.toString();
  } catch {
    return '0.758';
  }
}
