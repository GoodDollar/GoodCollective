export function formatNftId(nftId: string, collectiveId: string, creationTimestamp?: number): string {
  const prefix = collectiveId.slice(0, 3).toUpperCase();
  const suffix = nftId.slice(-4);
  const year = creationTimestamp ? new Date(creationTimestamp * 1000).getFullYear() : new Date().getFullYear();
  return `#${prefix}-${year}-${suffix}`;
}
