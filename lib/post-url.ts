export function postPath(id: string) {
  return `/p/${encodeURIComponent(id)}`;
}

export function postUrl(id: string) {
  return `https://lite.frostedblocks.com${postPath(id)}`;
}
