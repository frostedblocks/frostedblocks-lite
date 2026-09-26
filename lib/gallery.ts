/** Max photos per Lite user gallery. */
export const GALLERY_CAP = 18;

export const GALLERY_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function looksLikeImage(buf: Buffer, type: string) {
  if (type === "image/jpeg") return buf[0] === 0xff && buf[1] === 0xd8;
  if (type === "image/png") return buf[0] === 0x89 && buf[1] === 0x50;
  if (type === "image/webp") return buf.slice(0, 4).toString() === "RIFF";
  return false;
}
