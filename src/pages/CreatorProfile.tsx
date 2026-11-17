import { useEffect, useState, type KeyboardEvent } from "react";
import { Link, useParams } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, Calendar, Globe, ImageOff, Instagram, MapPin, TriangleAlert, UserRound, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import {
  fetchCreatorBySlug, friendlyError, instagramLink, safeWebsite, withTimeout, type PortfolioItem, type Profile,
} from "@/lib/portfolio";
import { usePageMeta } from "@/lib/seo";
import { isSupabaseConfigured, portfolioImageUrl } from "@/lib/supabase";

function Picture({ url, alt, className = "" }: { url: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) return <span className={`${className} thumb-fallback`} role="img" aria-label={alt}><ImageOff aria-hidden="true" /></span>;
  return <img className={className} src={url} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} />;
}

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join("") || "MR";

function LightboxImage({ item }: { item: PortfolioItem }) {
  const [failed, setFailed] = useState(false);
  const url = portfolioImageUrl(item.image_url);
  if (!url || failed) return <div className="lightbox-fallback" role="img" aria-label={item.title}>
    <ImageOff aria-hidden="true" />
    <p>{failed ? "This image could not load." : "Image unavailable."}</p>
  </div>;
  return <img className="lightbox-img" src={url} alt={item.title} onError={() => setFailed(true)} />;
}

export default function CreatorProfile() {
  const { slug = "" } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState("");
  const [missing, setMissing] = useState(false);
  const [tick, setTick] = useState(0);
  const [viewing, setViewing] = useState<number | null>(null);

  usePageMeta({
    title: profile ? `${profile.display_name} — MAKINGREAL` : "Creator profile — MAKINGREAL",
    path: `/creators/${slug}`,
    description: profile?.headline || profile?.bio.slice(0, 160) || "A reviewed creator on the MAKINGREAL network.",
    image: profile ? portfolioImageUrl(profile.cover_url) ?? undefined : undefined,
    noindex: missing,
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let alive = true;
    setLoading(true);
    setError("");
    setMissing(false);
    setViewing(null);
    withTimeout(fetchCreatorBySlug(slug))
      .then(result => {
        if (!alive) return;
        if (!result) { setMissing(true); return; }
        setProfile(result.profile);
        setItems(result.items);
      })
      .catch(cause => { if (alive) setError(friendlyError(cause)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug, tick]);

  const closeViewer = () => setViewing(null);
  const step = (direction: 1 | -1) => setViewing(current => current === null ? current : (current + direction + items.length) % items.length);
  const onViewerKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
  };

  if (!isSupabaseConfigured) return <div className="creator-page">
    <PageHeader back />
    <main className="creator-main">
      <div className="studio-notice">
        <UserRound aria-hidden="true" />
        <h1>Creator profiles are not connected yet</h1>
        <p className="muted">Once the creator studio is connected, approved profiles appear at this address. Nothing is shown until then.</p>
        <Link to="/" className="btn btn-ghost">Back to site</Link>
      </div>
    </main>
  </div>;

  if (loading) return <div className="creator-page">
    <PageHeader back />
    <main className="creator-main">
      <div className="studio-loading" role="status"><span className="studio-spinner" aria-hidden="true" />Loading profile…</div>
    </main>
  </div>;

  if (missing) return <div className="creator-page">
    <PageHeader back />
    <main className="creator-main">
      <div className="studio-notice">
        <UserRound aria-hidden="true" />
        <h1>This profile is not public</h1>
        <p className="muted">It may not exist, or it may still be in review. Only approved profiles are visible.</p>
        <Link to="/creators" className="btn btn-primary btn-sm">Browse creators</Link>
      </div>
    </main>
  </div>;

  if (error || !profile) return <div className="creator-page">
    <PageHeader back />
    <main className="creator-main">
      <div className="studio-inline-error" role="alert">
        <TriangleAlert aria-hidden="true" /><span>{error || "This profile could not be loaded."}</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTick(value => value + 1)}>Retry</button>
      </div>
    </main>
  </div>;

  const cover = portfolioImageUrl(profile.cover_url);
  const avatar = portfolioImageUrl(profile.avatar_url);
  const website = safeWebsite(profile.website);
  const instagram = instagramLink(profile.instagram);
  const siteLabel = website ? new URL(website).hostname.replace(/^www\./, "") : "";
  const active = viewing === null ? null : items[viewing];

  return <div className="creator-page">
    <PageHeader back />

    <main className="creator-main">
      <div className="profile-cover">
        {cover ? <Picture url={cover} alt={`${profile.display_name} cover image`} className="profile-cover-img" /> : <span className="profile-cover-fallback" aria-hidden="true">{initials(profile.display_name)}</span>}
      </div>

      <header className="profile-head">
        <span className="profile-avatar">{avatar ? <Picture url={avatar} alt={`${profile.display_name} portrait`} /> : initials(profile.display_name)}</span>
        <div className="profile-ident">
          <p className="eyebrow accent">MAKINGREAL creator</p>
          <h1>{profile.display_name}</h1>
          {profile.headline && <p className="profile-headline">{profile.headline}</p>}
          <div className="profile-meta">
            {profile.location && <span><MapPin aria-hidden="true" />{profile.location}</span>}
            {profile.availability && <span><Calendar aria-hidden="true" />{profile.availability}</span>}
          </div>
        </div>
        {(website || instagram) && <div className="profile-links">
          {website && <a href={website} className="btn btn-ghost btn-sm" target="_blank" rel="noopener noreferrer"><Globe aria-hidden="true" />{siteLabel}</a>}
          {instagram && <a href={instagram} className="btn btn-ghost btn-sm" target="_blank" rel="noopener noreferrer"><Instagram aria-hidden="true" />@{profile.instagram?.replace(/^@/, "")}</a>}
        </div>}
      </header>

      {(profile.bio || profile.specialties.length > 0) && <section className="profile-about" aria-label="About this creator">
        {profile.bio && <p className="profile-bio">{profile.bio}</p>}
        {profile.specialties.length > 0 && <ul className="specialty-chips">
          {profile.specialties.map(specialty => <li key={specialty} className="specialty-chip">{specialty}</li>)}
        </ul>}
      </section>}

      <section className="profile-work" aria-labelledby="profile-work-title">
        <div className="profile-work-head">
          <h2 id="profile-work-title">Selected work</h2>
          <span className="muted">{items.length} {items.length === 1 ? "piece" : "pieces"}</span>
        </div>
        {items.length === 0 ? <div className="studio-empty">
          <ImageOff aria-hidden="true" />
          <h3>No published work yet</h3>
          <p className="muted">This creator has not published portfolio pieces so far.</p>
        </div>
        : <ul className="profile-gallery">
          {items.map((item, index) => <li key={item.id}>
            <button type="button" className="profile-tile" onClick={() => setViewing(index)} aria-label={`Open ${item.title}${items.length > 1 ? `, image ${index + 1} of ${items.length}` : ""}`}>
              <Picture url={portfolioImageUrl(item.image_url)} alt={item.title} />
              <span className="profile-tile-caption">
                <span>{item.title}</span>
                {item.category && <small>{item.category}</small>}
              </span>
            </button>
          </li>)}
        </ul>}
      </section>
    </main>

    <Dialog.Root open={viewing !== null} onOpenChange={next => { if (!next) closeViewer(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="mobile-backdrop" />
        <Dialog.Content className="gallery-dialog creator-lightbox" onKeyDown={onViewerKey} aria-describedby="creator-lightbox-caption">
          <div className="lightbox-media">{active && <LightboxImage key={active.id} item={active} />}</div>
          <div className="lightbox-bar">
            <button type="button" className="icon-button" onClick={() => step(-1)} aria-label="Previous image" disabled={items.length < 2}>
              <ArrowLeft aria-hidden="true" />
            </button>
            <div className="lightbox-copy">
              <Dialog.Title className="lightbox-title">{active?.title ?? ""}</Dialog.Title>
              <Dialog.Description id="creator-lightbox-caption" className="lightbox-caption">
                {[active?.caption, active?.category, active?.year].filter(Boolean).join(" · ") || "Selected work"}
              </Dialog.Description>
              <p className="lightbox-count" aria-live="polite">{viewing === null ? "" : `${viewing + 1} / ${items.length}`}</p>
            </div>
            <div className="lightbox-nav">
              <button type="button" className="icon-button" onClick={() => step(1)} aria-label="Next image" disabled={items.length < 2}>
                <ArrowRight aria-hidden="true" />
              </button>
              <Dialog.Close className="icon-button" aria-label="Close image viewer"><X aria-hidden="true" /></Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </div>;
}
