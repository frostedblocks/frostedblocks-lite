/**
 * In-feed promo for ICE Network referral program (II-only dashboard).
 * Links off Lite → frostedblocks.com/referral
 */
export function ReferralPromoAd() {
  return (
    <aside className="referral-promo" aria-label="ICE referral program advertisement">
      <div className="referral-promo-frost" aria-hidden="true" />
      <div className="referral-promo-accent" aria-hidden="true" />
      <div className="referral-promo-kicker">
        <span className="referral-promo-badge">Sponsored</span>
        <span className="referral-promo-brand">ICE Network</span>
      </div>
      <h3 className="referral-promo-title">
        Get in free — invite <span className="referral-promo-ice">15 users</span>
      </h3>
      <p className="referral-promo-body">
        Register with Internet Identity only — no ICE account needed to start. Share your invite
        link; when 15 users Join and get canister sites, you unlock free Join + your own site.
      </p>
      <div className="referral-promo-actions">
        <a
          className="referral-promo-cta"
          href="https://frostedblocks.com/referral"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open referral dashboard
        </a>
        <span className="referral-promo-meta">frostedblocks.com/referral · II only</span>
      </div>
    </aside>
  );
}
