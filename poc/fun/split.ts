export function split<T>(list: Array<T>, splitter: (item: T) => boolean) {
  const yesno = [[], []] as Array<Array<T>>;
  list.forEach((item) => yesno[splitter(item) ? 0 : 1].push(item));
  return yesno;
}
