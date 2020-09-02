export function flatten<T>(values: Array<Array<T>>): Array<T> {
  const result = [] as Array<T>;
  return result.concat(...values);
}
