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
