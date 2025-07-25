export function formatNftId(nftId: string, collectiveId: string): string {
  const prefix = collectiveId.slice(0, 3).toUpperCase();
  const suffix = nftId.slice(-4);
  return `#${prefix}-${new Date().getFullYear()}-${suffix}`;
}
