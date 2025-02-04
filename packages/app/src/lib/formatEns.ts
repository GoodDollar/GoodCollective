export const formatEns = (ensName: string) => {
  if (!ensName) return '';
  const [name, extension] = ensName.split('.');
  const targetLength = 12;
  const extensionFull = extension ? `.${extension}` : '';
  const availableLength = targetLength - extensionFull.length;
  const truncatedName = name.slice(0, availableLength / 2) + '...' + name.slice(-(availableLength / 2 - 3));
  return truncatedName + extensionFull;
};
