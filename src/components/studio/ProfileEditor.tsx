import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ImagePlus, TriangleAlert } from "lucide-react";
import {
  ACCEPTED_IMAGE_TYPES, friendlyError, instagramLink, isValidSlug, MAX_UPLOAD_BYTES, removePortfolioImage,
  safeWebsite, saveProfile, toSlug, uploadPortfolioImage, type Profile,
} from "@/lib/portfolio";
import { portfolioImageUrl } from "@/lib/supabase";

type Props = { profile: Profile; onSaved: (profile: Profile) => void };

export function ProfileEditor({ profile, onSaved }: Props) {
  const [form, setForm] = useState({
    display_name: profile.display_name ?? "",
    slug: profile.slug ?? "",
    headline: profile.headline ?? "",
    bio: profile.bio ?? "",
    location: profile.location ?? "",
    availability: profile.availability ?? "",
    specialties: (profile.specialties ?? []).join(", "),
    website: profile.website ?? "",
    instagram: profile.instagram ?? "",
    avatar_url: profile.avatar_url,
    cover_url: profile.cover_url,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"avatar" | "cover" | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const saved = useRef({ avatar: profile.avatar_url, cover: profile.cover_url });

  const update = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }));

  const onUpload = async (file: File | undefined, folder: "avatar" | "cover") => {
    if (!file) return;
    setUploading(folder);
    setError("");
    setMessage("");
    try {
      const result = await uploadPortfolioImage(file, folder);
      setForm(current => ({ ...current, [folder === "avatar" ? "avatar_url" : "cover_url"]: result.url }));
    } catch (cause) {
      setError(friendlyError(cause));
    } finally {
      setUploading(null);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    const displayName = form.display_name.trim();
    if (!displayName) { setError("Add a name people will recognise."); return; }
    const slug = toSlug(form.slug.trim() || displayName);
    if (!isValidSlug(slug)) { setError("Profile URL must be 3–40 characters: letters, numbers and single hyphens."); return; }
    if (form.website.trim() && !safeWebsite(form.website)) { setError("Website must be a valid http or https link."); return; }
    if (form.instagram.trim() && !instagramLink(form.instagram)) { setError("Instagram handle can only contain letters, numbers, dots and underscores."); return; }
    const specialties = [...new Set(form.specialties.split(",").map(value => value.trim()).filter(Boolean))].slice(0, 8);
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const next = await saveProfile(profile.id, {
        display_name: displayName,
        slug,
        headline: form.headline,
        bio: form.bio,
        location: form.location,
        availability: form.availability,
        specialties,
        website: form.website,
        instagram: form.instagram,
        avatar_url: form.avatar_url,
        cover_url: form.cover_url,
      });
      if (saved.current.avatar && saved.current.avatar !== next.avatar_url) void removePortfolioImage(saved.current.avatar);
      if (saved.current.cover && saved.current.cover !== next.cover_url) void removePortfolioImage(saved.current.cover);
      saved.current = { avatar: next.avatar_url, cover: next.cover_url };
      setForm(current => ({ ...current, slug: next.slug }));
      setMessage(next.status === "approved" ? "Profile saved. Your changes are live." : "Profile saved. Changes go live after review.");
      onSaved(next);
    } catch (cause) {
      setError(friendlyError(cause));
    } finally {
      setSaving(false);
    }
  };

  const avatar = portfolioImageUrl(form.avatar_url);
  const cover = portfolioImageUrl(form.cover_url);
  const initials = form.display_name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join("") || "MR";

  return <form className="studio-form studio-profile-form" onSubmit={onSubmit} aria-busy={saving}>
    <div className="studio-media-row">
      <div className="studio-avatar-upload">
        <span className="studio-avatar-preview">{avatar ? <img src={avatar} alt="" /> : <span>{initials}</span>}</span>
        <div>
          <label htmlFor="studio-avatar-input" className="btn btn-ghost btn-sm studio-file-button">
            <ImagePlus aria-hidden="true" />{uploading === "avatar" ? "Uploading…" : "Profile photo"}
          </label>
          <input id="studio-avatar-input" className="sr-only" type="file" accept={ACCEPTED_IMAGE_TYPES.join(",")} onChange={event => { void onUpload(event.target.files?.[0], "avatar"); event.target.value = ""; }} />
          <p className="studio-hint">Square works best. JPG, PNG or WebP under 8 MB.</p>
        </div>
      </div>
      <div className="studio-cover-upload">
        <span className="studio-cover-preview">{cover ? <img src={cover} alt="" /> : <span>Cover image</span>}</span>
        <div>
          <label htmlFor="studio-cover-input" className="btn btn-ghost btn-sm studio-file-button">
            <ImagePlus aria-hidden="true" />{uploading === "cover" ? "Uploading…" : "Cover image"}
          </label>
          <input id="studio-cover-input" className="sr-only" type="file" accept={ACCEPTED_IMAGE_TYPES.join(",")} onChange={event => { void onUpload(event.target.files?.[0], "cover"); event.target.value = ""; }} />
          <p className="studio-hint">Wide crop, at least 1200px. Under {Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB.</p>
        </div>
      </div>
    </div>

    <div className="studio-form-grid">
      <div className="bf-field">
        <label htmlFor="studio-name">Display name</label>
        <input id="studio-name" maxLength={60} value={form.display_name} onChange={event => update("display_name", event.target.value)} placeholder="e.g. Ananya Rao" required />
      </div>
      <div className="bf-field">
        <label htmlFor="studio-slug">Profile URL</label>
        <input id="studio-slug" maxLength={40} value={form.slug} onChange={event => update("slug", event.target.value)} onBlur={() => { if (!form.slug.trim() && form.display_name.trim()) update("slug", toSlug(form.display_name)); }} placeholder="ananya-rao" aria-describedby="studio-slug-hint" />
        <span id="studio-slug-hint" className="studio-hint">/creators/{form.slug || toSlug(form.display_name) || "your-name"}</span>
      </div>
      <div className="bf-field bf-wide">
        <label htmlFor="studio-headline">Headline</label>
        <input id="studio-headline" maxLength={90} value={form.headline} onChange={event => update("headline", event.target.value)} placeholder="Photographer and director — natural light, real people" />
      </div>
      <div className="bf-field">
        <label htmlFor="studio-location">Based in</label>
        <input id="studio-location" maxLength={60} value={form.location} onChange={event => update("location", event.target.value)} placeholder="Mumbai, IN" />
      </div>
      <div className="bf-field">
        <label htmlFor="studio-availability">Availability</label>
        <input id="studio-availability" maxLength={60} value={form.availability} onChange={event => update("availability", event.target.value)} placeholder="Booking from December" />
      </div>
      <div className="bf-field bf-wide">
        <label htmlFor="studio-specialties">Specialties</label>
        <input id="studio-specialties" value={form.specialties} onChange={event => update("specialties", event.target.value)} placeholder="Brand photography, Product, Portraits" aria-describedby="studio-specialties-hint" />
        <span id="studio-specialties-hint" className="studio-hint">Comma separated, up to 8.</span>
      </div>
      <div className="bf-field">
        <label htmlFor="studio-website">Website</label>
        <input id="studio-website" maxLength={200} value={form.website} onChange={event => update("website", event.target.value)} placeholder="https://your-site.com" inputMode="url" />
      </div>
      <div className="bf-field">
        <label htmlFor="studio-instagram">Instagram</label>
        <input id="studio-instagram" maxLength={30} value={form.instagram} onChange={event => update("instagram", event.target.value)} placeholder="yourhandle" />
      </div>
      <div className="bf-field bf-wide">
        <label htmlFor="studio-bio">About you</label>
        <textarea id="studio-bio" rows={5} maxLength={600} value={form.bio} onChange={event => update("bio", event.target.value)} placeholder="How you work, who you work with, what you care about." />
        <span className="studio-hint">{form.bio.length}/600</span>
      </div>
    </div>

    {error && <p className="bf-error" role="alert"><TriangleAlert aria-hidden="true" />{error}</p>}
    {message && <p className="studio-success" role="status">{message}</p>}

    <div className="studio-form-actions">
      <button type="submit" className="btn btn-primary" disabled={saving || uploading !== null}>{saving ? "Saving…" : "Save profile"}</button>
      {profile.status === "approved" && <Link to={`/creators/${profile.slug}`} className="btn btn-ghost" target="_blank" rel="noreferrer">View public profile <ArrowUpRight aria-hidden="true" /></Link>}
    </div>
  </form>;
}
