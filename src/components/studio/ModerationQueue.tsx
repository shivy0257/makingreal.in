import { useEffect, useState } from "react";
import { Check, ExternalLink, ImageOff, ShieldCheck, TriangleAlert, X } from "lucide-react";
import {
  fetchApprovedCreators, fetchPendingItems, fetchPendingProfiles, friendlyError, instagramLink,
  safeWebsite, setItemStatus, setProfileStatus, withTimeout, type PortfolioItem, type Profile,
} from "@/lib/portfolio";
import { portfolioImageUrl } from "@/lib/supabase";

function SafeImage({ url, alt, className = "" }: { url: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return <span className={`${className} thumb-fallback`} role="img" aria-label={alt}><ImageOff aria-hidden="true" /></span>;
  }
  return <img className={className} src={url} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} />;
}

const dateLabel = (value: string) => new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export function ModerationQueue() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [creators, setCreators] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [tick, setTick] = useState(0);
  const [busy, setBusy] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    withTimeout(Promise.all([fetchPendingProfiles(), fetchPendingItems(), fetchApprovedCreators()]))
      .then(([nextProfiles, nextItems, nextCreators]) => {
        if (!alive) return;
        setProfiles(nextProfiles);
        setItems(nextItems);
        setCreators(nextCreators);
      })
      .catch(cause => { if (alive) setError(friendlyError(cause)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [tick]);

  const run = async (key: string, action: () => Promise<void>, done: string) => {
    setBusy(key);
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(done);
      setTick(value => value + 1);
    } catch (cause) {
      setError(friendlyError(cause));
    } finally {
      setBusy("");
      setConfirmId(null);
    }
  };

  const total = profiles.length + items.length;

  return <section className="studio-card" aria-labelledby="review-title">
    <div className="studio-card-head">
      <div>
        <h2 id="review-title">Review queue</h2>
        <p className="muted">Approve profiles and portfolio pieces before they appear publicly. Nothing here is visible to visitors yet.</p>
      </div>
      <span className="studio-count">{total} waiting</span>
    </div>

    {error && <p className="bf-error" role="alert"><TriangleAlert aria-hidden="true" />{error}</p>}
    {message && <p className="studio-success" role="status">{message}</p>}
    {loading && <div className="studio-inline-loading" role="status">Loading the review queue…</div>}

    {!loading && <>
      <div className="mod-section">
        <div className="mod-section-head">
          <h3>Profiles</h3>
          <span className="muted">{profiles.length} pending</span>
        </div>
        {profiles.length === 0 ? <p className="mod-empty">No profiles waiting for review.</p>
          : <ul className="mod-list">
            {profiles.map(profile => {
              const website = safeWebsite(profile.website);
              const instagram = instagramLink(profile.instagram);
              const working = busy === `profile-${profile.id}`;
              return <li key={profile.id} className="mod-card">
                <SafeImage className="mod-avatar" url={portfolioImageUrl(profile.avatar_url)} alt={profile.display_name} />
                <div className="mod-body">
                  <div className="mod-title-row">
                    <h4>{profile.display_name}</h4>
                    <span className="mod-meta">Joined {dateLabel(profile.created_at)}</span>
                  </div>
                  {profile.headline && <p className="mod-headline">{profile.headline}</p>}
                  <p className="mod-meta">{[profile.location, `/creators/${profile.slug}`].filter(Boolean).join(" · ")}</p>
                  {profile.bio && <p className="mod-bio">{profile.bio}</p>}
                  {profile.specialties.length > 0 && <ul className="specialty-chips">
                    {profile.specialties.map(specialty => <li key={specialty} className="specialty-chip">{specialty}</li>)}
                  </ul>}
                  <div className="mod-links">
                    {website && <a href={website} target="_blank" rel="noopener noreferrer">Website <ExternalLink aria-hidden="true" /></a>}
                    {instagram && <a href={instagram} target="_blank" rel="noopener noreferrer">Instagram <ExternalLink aria-hidden="true" /></a>}
                    {!website && !instagram && <span className="mod-meta">No links added.</span>}
                  </div>
                </div>
                <div className="mod-actions">
                  <button type="button" className="btn btn-primary btn-sm" disabled={working} onClick={() => { void run(`profile-${profile.id}`, () => setProfileStatus(profile.id, "approved"), `${profile.display_name} approved.`); }}>
                    <Check aria-hidden="true" />Approve
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" disabled={working} onClick={() => { void run(`profile-${profile.id}`, () => setProfileStatus(profile.id, "rejected"), `${profile.display_name} sent back.`); }}>
                    <X aria-hidden="true" />Reject
                  </button>
                </div>
              </li>;
            })}
          </ul>}
      </div>

      <div className="mod-section">
        <div className="mod-section-head">
          <h3>Portfolio pieces</h3>
          <span className="muted">{items.length} pending</span>
        </div>
        {items.length === 0 ? <p className="mod-empty">No uploads waiting for review.</p>
          : <ul className="mod-list">
            {items.map(item => {
              const working = busy === `item-${item.id}`;
              return <li key={item.id} className="mod-card mod-card-item">
                <SafeImage className="mod-thumb" url={portfolioImageUrl(item.image_url)} alt={item.title} />
                <div className="mod-body">
                  <div className="mod-title-row">
                    <h4>{item.title}</h4>
                    <span className="mod-meta">{dateLabel(item.created_at)}</span>
                  </div>
                  <p className="mod-meta">{[item.profiles?.display_name, item.category, item.year].filter(Boolean).join(" · ") || "Uncategorised"}</p>
                  {item.caption && <p className="mod-bio">{item.caption}</p>}
                </div>
                <div className="mod-actions">
                  <button type="button" className="btn btn-primary btn-sm" disabled={working} onClick={() => { void run(`item-${item.id}`, () => setItemStatus(item.id, "published"), `${item.title} published.`); }}>
                    <Check aria-hidden="true" />Publish
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" disabled={working} onClick={() => { void run(`item-${item.id}`, () => setItemStatus(item.id, "rejected"), `${item.title} rejected.`); }}>
                    <X aria-hidden="true" />Reject
                  </button>
                </div>
              </li>;
            })}
          </ul>}
      </div>

      <div className="mod-section">
        <div className="mod-section-head">
          <h3>Live creators</h3>
          <span className="muted">{creators.length} public</span>
        </div>
        {creators.length === 0 ? <p className="mod-empty">Nothing is public yet.</p>
          : <ul className="mod-approved">
            {creators.map(creator => {
              const working = busy === `creator-${creator.id}`;
              return <li key={creator.id} className="mod-approved-row">
                <SafeImage className="mod-avatar mod-avatar-sm" url={portfolioImageUrl(creator.avatar_url)} alt={creator.display_name} />
                <div className="mod-approved-copy">
                  <strong>{creator.display_name}</strong>
                  <span className="mod-meta">{creator.headline || `/${creator.slug}`}</span>
                </div>
                <div className="mod-actions">
                  <a href={`/creators/${creator.slug}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm"><ExternalLink aria-hidden="true" />View</a>
                  {confirmId === creator.id ? <>
                    <button type="button" className="btn btn-danger btn-sm" disabled={working} onClick={() => { void run(`creator-${creator.id}`, () => setProfileStatus(creator.id, "rejected"), `${creator.display_name} removed from public.`); }}>
                      {working ? "Removing…" : "Confirm"}
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" disabled={working} onClick={() => setConfirmId(null)}>Cancel</button>
                  </> : <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmId(creator.id)}>
                    <ShieldCheck aria-hidden="true" />Unpublish
                  </button>}
                </div>
              </li>;
            })}
          </ul>}
      </div>
    </>}
  </section>;
}
