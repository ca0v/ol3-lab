export function removeAuthority(projCode: string) {
  return parseInt(projCode.split(":", 2)?.pop() || "0");
}
