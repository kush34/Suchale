// ponytail: user input must never reach RegExp/Mongo unescaped (issue #16).
export const MAX_SEARCH_LEN = 100;

export const escapeRegExp = (s: string) =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const searchRegex = (query: string, prefix = "") =>
  new RegExp(prefix + escapeRegExp(query.slice(0, MAX_SEARCH_LEN)), "i");

export const clampInt = (value: unknown, def: number, min: number, max: number) => {
  const n =
    typeof value === "string" || typeof value === "number"
      ? parseInt(String(value), 10)
      : NaN;
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, n));
};

// query/body flags arrive as true, "true", 1, or "1" — never truthy-strings
export const isTruthy = (value: unknown) =>
  value === true || value === 1 || value === "true" || value === "1";
