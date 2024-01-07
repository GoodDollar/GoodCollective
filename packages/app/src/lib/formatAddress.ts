export const formatAddress = (address: string, length = 5) => {
  if (!address) return '';
  return address.slice(0, length) + '...' + address.slice(-(length - 1));
};
