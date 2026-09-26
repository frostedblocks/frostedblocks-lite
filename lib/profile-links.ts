/** Max shared links per Lite profile. */
export const PROFILE_LINKS_CAP = 12;

export const PROFILE_LINK_LABEL_MAX = 48;
export const PROFILE_LINK_URL_MAX = 500;

export type ProfileLinkRow = {
  id: string;
  label: string;
  url: string;
  sortOrder: number;
};

const BLOCKED_SCHEMES = /^(javascript|data|vbscript|file|blob|about):/i;

/** Normalize and validate a profile link URL. Prefers https; allows http. */
export function normalizeProfileLinkUrl(
  raw: string,
): { ok: true; url: string } | { ok: false; error: string } {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return { ok: false, error: "Enter a URL." };
  if (trimmed.length > PROFILE_LINK_URL_MAX) {
    return { ok: false, error: "URL is too long." };
  }
  if (BLOCKED_SCHEMES.test(trimmed)) {
    return { ok: false, error: "That URL scheme is not allowed." };
  }

  let candidate = trimmed;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return { ok: false, error: "Enter a valid URL." };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { ok: false, error: "Use an http or https link." };
  }
  if (!parsed.hostname || parsed.hostname.includes(" ")) {
    return { ok: false, error: "Enter a valid URL." };
  }

  return { ok: true, url: parsed.toString() };
}

export function sanitizeProfileLinkLabel(raw: unknown): string {
  return String(raw ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, PROFILE_LINK_LABEL_MAX);
}

/** Label for display: custom label, else hostname, else "Link". */
export function profileLinkDisplayLabel(label: string | null | undefined, url: string): string {
  const custom = String(label || "").trim();
  if (custom) return custom.slice(0, PROFILE_LINK_LABEL_MAX);
  try {
    const host = new URL(url).hostname.replace(/^www\./i, "");
    return host || "Link";
  } catch {
    return "Link";
  }
}

export function mapProfileLinkRow(row: {
  id: unknown;
  label?: unknown;
  url: unknown;
  sort_order?: unknown;
}): ProfileLinkRow {
  const url = String(row.url || "");
  const label = sanitizeProfileLinkLabel(row.label);
  return {
    id: String(row.id),
    label,
    url,
    sortOrder: Number(row.sort_order) || 0,
  };
}
