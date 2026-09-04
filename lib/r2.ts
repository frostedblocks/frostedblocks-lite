import { createHash, createHmac } from "crypto";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing on Vercel`);
  return value;
}

function sha256Hex(data: Buffer | string) {
  return createHash("sha256").update(data).digest("hex");
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function bucketName() {
  return process.env.R2_BUCKET || "ice-lite";
}

function publicBase() {
  return (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");
}

async function signed(method: "PUT" | "DELETE", key: string, body: Buffer, contentType?: string) {
  const accountId = required("R2_ACCOUNT_ID");
  const accessKey = required("R2_ACCESS_KEY_ID");
  const secretKey = required("R2_SECRET_ACCESS_KEY");
  const bucket = bucketName();
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const path = `/${bucket}/${key}`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256Hex(body);
  const region = "auto";
  const service = "s3";

  const extra = contentType ? `content-type:${contentType}\n` : "";
  const signedHeaders = contentType
    ? "content-type;host;x-amz-content-sha256;x-amz-date"
    : "host;x-amz-content-sha256;x-amz-date";
  const canonicalHeaders =
    extra + `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const canonicalRequest = [method, path, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, sha256Hex(canonicalRequest)].join("\n");
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${secretKey}`, dateStamp), region), service), "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  const headers: Record<string, string> = {
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    Authorization: `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
  if (contentType) headers["Content-Type"] = contentType;

  const res = await fetch(`https://${host}${path}`, {
    method,
    headers,
    body: method === "PUT" ? body : undefined,
  });
  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`R2 ${method} failed (${res.status}). ${text.slice(0, 180)}`);
  }
}

export async function putAvatar(key: string, body: Buffer, contentType: string) {
  await signed("PUT", key, body, contentType);
  const base = publicBase();
  if (!base) throw new Error("R2_PUBLIC_URL is missing on Vercel");
  return `${base}/${key}`;
}

export async function deleteAvatar(key: string) {
  await signed("DELETE", key, Buffer.alloc(0));
}

export function avatarKeys(login: string) {
  const safe = login.replace(/[^a-zA-Z0-9]+/g, "-").slice(0, 40);
  return ["jpg", "png", "webp"].map((ext) => `avatars/${safe}.${ext}`);
}
