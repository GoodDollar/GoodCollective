const ACTIVITY: Record<string, string> = {
  Climate: 'Silvi Proof of Planting',
  DirectPayments: 'Environmental Action Proof',
  UBI: 'UBI Claim',
};
const COLLECTIVE: Record<string, string> = {
  Climate: 'Restoring the Kakamega Forest',
  DirectPayments: 'Environmental Collective',
  UBI: 'UBI Collective',
};
export function getActivityName(type: string) {
  return ACTIVITY[type] || 'Environmental Action';
}
export function getCollectiveName(id: string, type: string) {
  // if you eventually have a map of custom names, merge here:
  return COLLECTIVE[type] || 'Manuel Collective';
}
