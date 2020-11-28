export const isNil = (x) => [undefined, null].includes(x);

export function omit(keys, obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !keys.includes(k))
  );
}

export function pick(keys, obj) {
  return Object.fromEntries(keys.map((k) => [k, obj[k]]));
}
