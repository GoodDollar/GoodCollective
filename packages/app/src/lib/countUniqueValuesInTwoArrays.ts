export function countUniqueValuesInTwoArrays<T>(a1: Array<T>, a2: Array<T>): number {
  const uniqueValues = new Set<T>();
  a1.forEach((value) => uniqueValues.add(value));
  a2.forEach((value) => uniqueValues.add(value));
  return uniqueValues.size;
}
