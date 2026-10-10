export const FEED_PREVIEW_CHARS = 215;

/**
 * Truncate plain text to at most `max` characters (code points, so emoji are
 * never split). Cuts at the last space at or before `max` when possible.
 */
export function truncateText(text: string, max = FEED_PREVIEW_CHARS): { text: string; truncated: boolean } {
  const chars = Array.from(text || "");
  if (chars.length <= max) return { text: text || "", truncated: false };
  const head = chars.slice(0, max);
  let cut = -1;
  for (let i = head.length - 1; i >= 0; i--) {
    if (/\s/.test(head[i])) { cut = i; break; }
  }
  const out = (cut > 0 ? head.slice(0, cut) : head).join("").trimEnd();
  return { text: out, truncated: true };
}
