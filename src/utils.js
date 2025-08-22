import crypto from 'crypto';
export function now() { return Date.now(); }
export function uid() { return crypto.randomUUID(); }
export function dailyRateForTier(tier){
  const map = { T1: 0.006, T2: 0.008, T3: 0.010, T4: 0.012 };
  return map[tier] ?? 0.006;
}
export function minMaxForTier(tier){
  const map = {
    T1: {min: 50, max: 499},
    T2: {min: 500, max: 2999},
    T3: {min: 3000, max: 9999},
    T4: {min: 10000, max: 50000}
  };
  return map[tier] ?? {min: 50, max: 50000};
}
export function trc20AddressForEmail(email){
  const h = crypto.createHash('sha256').update(email).digest('hex').slice(0, 34).toUpperCase();
  return 'T' + h.replace(/[^A-Z0-9]/g, 'X');
}
