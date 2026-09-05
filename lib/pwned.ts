import { createHash } from "crypto";

export async function isPwnedPassword(password: string) {
  try {
    const sha = createHash("sha1").update(password).digest("hex").toUpperCase();
    const prefix = sha.slice(0, 5);
    const rest = sha.slice(5);
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true" },
    });
    if (!res.ok) return false;
    const body = await res.text();
    return body.split("\n").some((line) => line.split(":")[0] === rest);
  } catch {
    return false;
  }
}
