import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ImageOff, ImagePlus, Trash2, TriangleAlert } from "lucide-react";
import {
  ACCEPTED_IMAGE_TYPES, createPortfolioItem, deletePortfolioItem, fetchMyItems, friendlyError,
  MAX_UPLOAD_BYTES, removePortfolioImage, uploadPortfolioImage, withTimeout, type PortfolioItem, type Profile,
} from "@/lib/portfolio";
import { portfolioImageUrl } from "@/lib/supabase";

const MAX_ITEMS = 24;
const STATUS_LABEL: Record<PortfolioItem["status"], string> = { published: "Live", pending: "In review", rejected: "Not approved" };

function Thumb({ url, alt, className = "" }: { url: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return <span className={`${className} thumb-fallback`} role="img" aria-label={alt}><ImageOff aria-hidden="true" /></span>;
  }
  return <img className={className} src={url} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} />;
}

export function PortfolioManager({ profile }: { profile: Profile }) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [tick, setTick] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", caption: "", category: "", year: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setLoadError("");
    withTimeout(fetchMyItems(profile.id))
      .then(rows => { if (alive) setItems(rows); })
      .catch(cause => { if (alive) setLoadError(friendlyError(cause)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [profile.id, tick]);

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const update = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }));

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0] ?? null;
    setError("");
    setMessage("");
    if (!picked) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(picked.type)) { setError("Use a JPG, PNG or WebP image."); event.target.value = ""; return; }
    if (picked.size > MAX_UPLOAD_BYTES) { setError("Images must be under 8 MB."); event.target.value = ""; return; }
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    const title = form.title.trim();
    if (!file) { setError("Choose an image to upload."); return; }
    if (!title) { setError("Give the work a title."); return; }
    if (items.length >= MAX_ITEMS) { setError(`You can keep up to ${MAX_ITEMS} pieces in your portfolio. Delete one to add another.`); return; }
    let year: number | null = null;
    if (form.year.trim()) {
      const parsed = Number(form.year.trim());
      if (!Number.isInteger(parsed) || parsed < 1900 || parsed > new Date().getFullYear() + 1) { setError("Year should be a four-digit year, like 2026."); return; }
      year = parsed;
    }
    setSaving(true);
    setError("");
    setMessage("");
    let uploaded: { url: string; width: number | null; height: number | null } | null = null;
    try {
      uploaded = await uploadPortfolioImage(file, "work");
      const created = await createPortfolioItem({
        title,
        caption: form.caption,
        category: form.category,
        year,
        image_url: uploaded.url,
        width: uploaded.width,
        height: uploaded.height,
      });
      setItems(current => [created, ...current]);
      setMessage(created.status === "published" ? "Added to your public profile." : "Uploaded. It goes live once it is reviewed.");
      setForm({ title: "", caption: "", category: "", year: "" });
      clearFile();
    } catch (cause) {
      if (uploaded) void removePortfolioImage(uploaded.url);
      setError(friendlyError(cause));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (item: PortfolioItem) => {
    setBusyId(item.id);
    setError("");
    setMessage("");
    try {
      await deletePortfolioItem(item);
      setItems(current => current.filter(entry => entry.id !== item.id));
      setMessage("Removed from your portfolio.");
    } catch (cause) {
      setError(friendlyError(cause));
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  };

  return <section className="studio-card" aria-labelledby="portfolio-title">
    <div className="studio-card-head">
      <div>
        <h2 id="portfolio-title">Portfolio</h2>
        <p className="muted">Upload finished work. Approved profiles publish new pieces instantly; new profiles wait in review.</p>
      </div>
      <span className="studio-count">{items.length}/{MAX_ITEMS}</span>
    </div>

    <form className="portfolio-form" onSubmit={onSubmit} aria-busy={saving}>
      <div className="portfolio-upload">
        <label htmlFor="portfolio-file" className="portfolio-upload-zone">
          {preview ? <img src={preview} alt="Selected image preview" /> : <>
            <ImagePlus aria-hidden="true" />
            <span>{file ? "Change image" : "Choose an image"}</span>
            <small>JPG, PNG or WebP · up to 8 MB</small>
          </>}
        </label>
        <input ref={fileRef} id="portfolio-file" className="sr-only" type="file" accept={ACCEPTED_IMAGE_TYPES.join(",")} onChange={onFile} />
      </div>
      <div className="portfolio-fields">
        <div className="bf-field">
          <label htmlFor="portfolio-title-input">Title</label>
          <input id="portfolio-title-input" maxLength={80} value={form.title} onChange={event => update("title", event.target.value)} placeholder="e.g. Monsoon campaign" required />
        </div>
        <div className="portfolio-pair">
          <div className="bf-field">
            <label htmlFor="portfolio-category">Category</label>
            <input id="portfolio-category" maxLength={40} value={form.category} onChange={event => update("category", event.target.value)} placeholder="Product, Portrait…" />
          </div>
          <div className="bf-field">
            <label htmlFor="portfolio-year">Year</label>
            <input id="portfolio-year" inputMode="numeric" maxLength={4} value={form.year} onChange={event => update("year", event.target.value)} placeholder="2026" />
          </div>
        </div>
        <div className="bf-field">
          <label htmlFor="portfolio-caption">Caption</label>
          <textarea id="portfolio-caption" rows={2} maxLength={240} value={form.caption} onChange={event => update("caption", event.target.value)} placeholder="Who it was for and what you did." />
        </div>
      </div>
      {error && <p className="bf-error" role="alert"><TriangleAlert aria-hidden="true" />{error}</p>}
      {message && <p className="studio-success" role="status">{message}</p>}
      <div className="studio-form-actions">
        <button type="submit" className="btn btn-primary btn-sm" disabled={saving || !file}>
          {saving ? "Uploading…" : "Add to portfolio"}
        </button>
        {file && <button type="button" className="btn btn-ghost btn-sm" onClick={clearFile} disabled={saving}>Clear</button>}
      </div>
    </form>

    {loading ? <div className="studio-inline-loading" role="status">Loading your portfolio…</div>
      : loadError ? <div className="studio-inline-error" role="alert">
        <TriangleAlert aria-hidden="true" /><span>{loadError}</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTick(value => value + 1)}>Retry</button>
      </div>
      : items.length === 0 ? <div className="studio-empty">
        <ImagePlus aria-hidden="true" />
        <h3>No pieces yet</h3>
        <p className="muted">Your first upload is what brands see when they open your profile.</p>
      </div>
      : <ul className="portfolio-grid">
        {items.map(item => <li key={item.id} className="portfolio-card">
          <div className="portfolio-thumb"><Thumb url={portfolioImageUrl(item.image_url)} alt={item.caption ? `${item.title} — ${item.caption}` : item.title} /></div>
          <div className="portfolio-card-body">
            <div className="portfolio-card-top">
              <h3>{item.title}</h3>
              <span className="portfolio-badge" data-status={item.status}>{STATUS_LABEL[item.status]}</span>
            </div>
            {(item.category || item.year) && <p className="portfolio-meta">{[item.category, item.year].filter(Boolean).join(" · ")}</p>}
            {confirmId === item.id ? <div className="portfolio-confirm" role="group" aria-label={`Delete ${item.title}?`}>
              <span>Delete permanently?</span>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => { void onDelete(item); }} disabled={busyId === item.id}>{busyId === item.id ? "Deleting…" : "Delete"}</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmId(null)} disabled={busyId === item.id}>Cancel</button>
            </div> : <button type="button" className="studio-text-button" onClick={() => setConfirmId(item.id)}>
              <Trash2 aria-hidden="true" />Remove
            </button>}
          </div>
        </li>)}
      </ul>}
  </section>;
}
