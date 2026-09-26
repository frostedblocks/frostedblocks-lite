export function handleOf(id: number | string) {
  return `u${id}`;
}

export function looksLikeEmail(value: string) {
  return String(value || "").includes("@");
}

export function publicName(name?: string | null, fallback = "Lite user") {
  const n = String(name || "").trim();
  if (!n || looksLikeEmail(n)) return fallback;
  return n;
}

/** Lite public handles look like u4, u12, … */
export function isLiteHandle(value: string) {
  return /^u\d+$/i.test(String(value || "").trim());
}

export function profilePath(handle: string) {
  return `/u/${String(handle || "").trim()}`;
}
