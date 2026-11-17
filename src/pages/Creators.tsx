import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ImageOff, TriangleAlert, UserRound } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { fetchPublicCreators, friendlyError, withTimeout, type Profile } from "@/lib/portfolio";
import { usePageMeta } from "@/lib/seo";
import { isSupabaseConfigured, portfolioImageUrl } from "@/lib/supabase";

function Picture({ url, alt, className = "" }: { url: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) return <span className={`${className} thumb-fallback`} role="img" aria-label={alt}><ImageOff aria-hidden="true" /></span>;
  return <img className={className} src={url} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} />;
}

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join("") || "MR";

export default function Creators() {
  const [creators, setCreators] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  usePageMeta({
    title: "Creators — MAKINGREAL",
    path: "/creators",
    description: "Photographers, filmmakers and content creators reviewed by MAKINGREAL. Every profile here has been checked by a person.",
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let alive = true;
    setLoading(true);
    setError("");
    withTimeout(fetchPublicCreators())
      .then(rows => { if (alive) setCreators(rows); })
      .catch(cause => { if (alive) setError(friendlyError(cause)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [tick]);

  return <div className="creators-page">
    <PageHeader />

    <main className="creators-main">
      <header className="creators-head">
        <p className="eyebrow accent">The network</p>
        <h1>Creators<br /><span className="muted">on the record.</span></h1>
        <p className="creators-lead">Photographers, filmmakers and content creators reviewed by MAKINGREAL. Every profile here has been checked by a person.</p>
        <Link to="/admin" className="btn btn-ghost btn-sm">Open creator studio <ArrowUpRight aria-hidden="true" /></Link>
      </header>

      {!isSupabaseConfigured ? <div className="studio-notice" role="status">
        <UserRound aria-hidden="true" />
        <h2>The creator directory is not connected yet</h2>
        <p className="muted">Profiles appear here once the creator studio is connected to a Supabase project. Nothing is shown until then.</p>
        <Link to="/" className="btn btn-ghost">Back to site</Link>
      </div>
        : loading ? <div className="creators-grid" aria-busy="true" aria-label="Loading creators">
          {[0, 1, 2, 3, 4, 5].map(index => <div key={index} className="creator-card creator-card-skeleton" aria-hidden="true">
            <div className="skeleton-cover" />
            <div className="creator-card-body"><span className="skeleton-line" /><span className="skeleton-line skeleton-line-short" /></div>
          </div>)}
        </div>
        : error ? <div className="studio-inline-error" role="alert">
          <TriangleAlert aria-hidden="true" /><span>{error}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTick(value => value + 1)}>Retry</button>
        </div>
        : creators.length === 0 ? <div className="studio-empty">
          <UserRound aria-hidden="true" />
          <h2>No creators published yet</h2>
          <p className="muted">Profiles appear after review. If you are a creator, start with the studio.</p>
          <Link to="/admin" className="btn btn-primary btn-sm">Open creator studio</Link>
        </div>
        : <ul className="creators-grid">
          {creators.map(creator => {
            const cover = portfolioImageUrl(creator.cover_url);
            const avatar = portfolioImageUrl(creator.avatar_url);
            return <li key={creator.id}>
              <Link to={`/creators/${creator.slug}`} className="creator-card">
                <div className="creator-cover">
                  {cover ? <Picture url={cover} alt="" className="creator-cover-img" /> : <span className="creator-cover-fallback" aria-hidden="true">{initials(creator.display_name)}</span>}
                </div>
                <div className="creator-card-body">
                  <span className="creator-avatar">{avatar ? <Picture url={avatar} alt="" /> : initials(creator.display_name)}</span>
                  <h2>{creator.display_name}</h2>
                  {creator.headline && <p className="creator-headline">{creator.headline}</p>}
                  <p className="creator-loc">{[creator.location, creator.availability].filter(Boolean).join(" · ") || "Location on request"}</p>
                  {creator.specialties.length > 0 && <ul className="specialty-chips">
                    {creator.specialties.slice(0, 3).map(specialty => <li key={specialty} className="specialty-chip">{specialty}</li>)}
                  </ul>}
                  <span className="creator-card-foot">View portfolio <ArrowUpRight aria-hidden="true" /></span>
                </div>
              </Link>
            </li>;
          })}
        </ul>}
    </main>
  </div>;
}
