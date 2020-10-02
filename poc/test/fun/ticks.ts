export async function ticks(n: number) {
  return new Promise((good, bad) => {
    setTimeout(good, n);
  });
}
