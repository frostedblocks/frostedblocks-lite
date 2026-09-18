/** CORS for ICE Network origins reading Lite public APIs. */

const ALLOWED = new Set([
  "https://www.frostedblocks.com",
  "https://frostedblocks.com",
  "https://6hhqv-baaaa-aaaan-q6mxq-cai.icp0.io",
  "https://6hhqv-baaaa-aaaan-q6mxq-cai.raw.icp0.io",
]);

export function iceCorsHeaders(req: Request, cacheSeconds = 30) {
  const origin = req.headers.get("origin") || "";
  const allow = ALLOWED.has(origin) ? origin : "";
  const headers: Record<string, string> = {
    "Cross-Origin-Resource-Policy": "cross-origin",
    "Cache-Control": `public, max-age=${cacheSeconds}`,
  };
  if (allow) {
    headers["Access-Control-Allow-Origin"] = allow;
    headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
    headers["Vary"] = "Origin";
  }
  return headers;
}
