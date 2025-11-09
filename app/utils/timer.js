// utils/timer.js
export const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export const waitFor = async (fn, { timeout = 3000, interval = 80 } = {}) => 
{
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const v = fn();
    if (v) return v;
    await sleep(interval);
  }
  return null;
};
