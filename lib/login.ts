export function normalizeLogin(raw: string) {
  const value = String(raw || "").trim();
  if (!value) return "";
  if (value.includes("@")) return value.toLowerCase();
  return normalizePhone(value) || "";
}

export function isEmail(value: string) {
  return value.includes("@") && value.includes(".");
}

export function normalizePhone(raw: string) {
  const trimmed = String(raw || "").trim();
  if (!trimmed || trimmed.includes("@")) return null;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  return null;
}

export function isPhone(value: string) {
  return Boolean(normalizePhone(value));
}

export function phoneKeys(raw: string) {
  const e164 = normalizePhone(raw);
  if (!e164) return [];
  const digits = e164.slice(1);
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return Array.from(new Set([e164, digits, national, `+${digits}`]));
}
