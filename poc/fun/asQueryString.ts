export function asQueryString(o: object) {
  return Object.keys(o)
    .map((v) => `${v}=${(<any>o)[v]}`)
    .join("&");
}
