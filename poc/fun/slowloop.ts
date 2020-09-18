export async function slowloop<T>(
  functions: Array<() => T>,
  interval = 1000,
  cycles = 1,
  progress?: (data: { index: number; cycle: number }) => void
) {
  let index = 0;
  let cycle = 0;
  const results: Array<T> = [];

  return new Promise<Array<T>>((good, bad) => {
    if (!functions || 0 >= cycles) {
      good();
    }

    const h = setInterval(() => {
      if (index === functions.length) {
        index = 0;
        if (++cycle === cycles) {
          good(results);
          clearInterval(h);
          return;
        }
      }
      try {
        progress && progress({ index, cycle });
        results[index] = functions[index]();
        index++;
      } catch (ex) {
        clearInterval(h);
        bad(ex);
      }
    }, interval);
  });
}
