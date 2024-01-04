const displayAddress = (address: string, length = 4) => {
  if (!address) return '';
  return `${address.substring(0, length)}•••${address.substring(address.length - length, address.length)}`;
};

export default displayAddress;
