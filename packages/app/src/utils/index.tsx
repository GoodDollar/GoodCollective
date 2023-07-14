export function shortenAddress(address: string, length = 3) {
  if (!address) return '';
  const start = address.substring(0, length);
  const end = address.substring(address.length - length);
  return `${start}...${end}`;
}
