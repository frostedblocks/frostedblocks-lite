export function AdSlot({ label = "Ad" }: { label?: string }) {
  return <div className="glass ad">{label} slot — set NEXT_PUBLIC_ADSENSE_CLIENT later</div>;
}
