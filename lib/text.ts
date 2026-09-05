export function cleanText(raw: string) {
  return String(raw || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&/g, "&")
    .trim();
}

export function splitLinks(text: string) {
  return text.split(/(https?:\/\/[^\s<]+)/g);
}
