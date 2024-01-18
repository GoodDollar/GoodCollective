export function formatDecimalStringInput(value: string) {
  const float = parseFloat(value);
  if (isNaN(float)) {
    return 0;
  }
  return float;
}
