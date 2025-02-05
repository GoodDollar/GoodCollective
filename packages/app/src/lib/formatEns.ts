export const formatEns = (ensName: string, targetLength = 12) => {
  if (!ensName) return '';
  const [name, extension] = ensName.split('.');
  const extensionFull = extension ? `.${extension}` : '';
  const availableLength = targetLength - extensionFull.length;
  const truncatedName = name.slice(0, availableLength / 2) + '...' + name.slice(-(availableLength / 2 - 3));
  return truncatedName + extensionFull;
};
