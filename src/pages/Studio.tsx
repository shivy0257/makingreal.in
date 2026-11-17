import { useEffect, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CircleAlert, CircleCheck, Clock, LogOut, ShieldCheck, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StudioAuth } from "@/components/studio/StudioAuth";
import { ProfileEditor } from "@/components/studio/ProfileEditor";
import { PortfolioManager } from "@/components/studio/PortfolioManager";
import { ModerationQueue } from "@/components/studio/ModerationQueue";
import { AuthProvider, useAuth } from "@/lib/auth";
import { usePageMeta } from "@/lib/seo";
import { isSupabaseConfigured } from "@/lib/supabaseConfig";
import type { Profile } from "@/lib/portfolio";

type Tab = "profile" | "portfolio" | "review";

const STATUS_BANNER = {
  pending: { icon: Clock, title: "Your profile is in review.", body: "Keep editing and uploading. Nothing is public until a founder approves it, and new uploads join the same review." },
  rejected: { icon: CircleAlert, title: "Your profile was sent back.", body: "Update your details and save the form. Saving resubmits your profile for review." },
  approved: { icon: CircleCheck, title: "Your profile is live.", body: "New portfolio pieces are published immediately. Keep your availability and details current." },
} as const;

function SetupPanel() {
  return <main className="studio-main">
    <div className="studio-shell">
      <div className="studio-notice">
        <ShieldCheck aria-hidden="true" />
        <h1>Creator studio is not connected yet</h1>
        <p className="muted">The studio needs a Supabase project before accounts and uploads can work. Nothing is faked here: until these steps are done, the panel stays off.</p>
        <ol className="setup-list">
          <li>Create a project at supabase.com.</li>
          <li>Open the SQL editor and run <code>supabase/schema.sql</code> from this repository.</li>
          <li>In Authentication, enable email magic links and the Google provider.</li>
          <li>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env</code>, then restart the dev server.</li>
          <li>Sign in once, then promote your account with the SQL note at the bottom of <code>schema.sql</code>.</li>
        </ol>
        <Link to="/" className="btn btn-ghost">Back to site</Link>
      </div>
    </div>
  </main>;
}

export default function Studio() {
  return <AuthProvider><StudioPanel /></AuthProvider>;
}

function StudioPanel() {
  const { session, profile, loading, refresh, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");
  const [current, setCurrent] = useState<Profile | null>(null);
  const [retrying, setRetrying] = useState(false);

  usePageMeta({ title: "Creator studio — MAKINGREAL", path: "/admin", noindex: true });

  useEffect(() => {
    setCurrent(profile);
  }, [profile]);

  const active = current ?? profile;
  const isAdmin = active?.role === "admin";
  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "portfolio", label: "Portfolio" },
    ...(isAdmin ? [{ id: "review" as Tab, label: "Review" }] : []),
  ];

  const modelTab = tab === "review" && !isAdmin ? "profile" : tab;

  const onTabKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = tabs.findIndex(item => item.id === modelTab);
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    setTab(tabs[next].id);
    document.getElementById(`studio-tab-${tabs[next].id}`)?.focus();
  };

  if (!isSupabaseConfigured) return <div className="studio-page">
    <PageHeader />
    <SetupPanel />
  </div>;

  if (loading) return <div className="studio-page">
    <PageHeader />
    <main className="studio-main">
      <div className="studio-loading" role="status"><span className="studio-spinner" aria-hidden="true" />Checking your session…</div>
    </main>
  </div>;

  if (!session) return <div className="studio-page">
    <PageHeader />
    <StudioAuth />
  </div>;

  if (!active) return <div className="studio-page">
    <PageHeader>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => { void signOut(); }}><LogOut aria-hidden="true" />Sign out</button>
    </PageHeader>
    <main className="studio-main">
      <div className="studio-shell">
        <div className="studio-notice">
          <Clock aria-hidden="true" />
          <h1>Setting up your profile</h1>
          <p className="muted">Your account exists but the profile row has not appeared yet. This usually takes a moment right after the first sign-in.</p>
          <div className="studio-form-actions">
            <button type="button" className="btn btn-primary" disabled={retrying} onClick={() => {
              setRetrying(true);
              void refresh().finally(() => setRetrying(false));
            }}>{retrying ? "Checking…" : "Check again"}</button>
            <button type="button" className="btn btn-ghost" onClick={() => { void signOut(); }}>Use another account</button>
          </div>
        </div>
      </div>
    </main>
  </div>;

  const banner = STATUS_BANNER[active.status];
  const Icon = banner.icon;

  return <div className="studio-page">
    <PageHeader>
      <span className="studio-chip" data-role={active.role}>{active.role === "admin" ? "Admin" : "Creator"}</span>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => { void signOut(); }}><LogOut aria-hidden="true" />Sign out</button>
    </PageHeader>

    <main className="studio-main">
      <div className="studio-shell">
        <header className="studio-head">
          <p className="eyebrow accent">Creator studio</p>
          <h1>{active.display_name}</h1>
          <p className="muted">Your portfolio, profile and review status in one place.</p>
        </header>

        <div className="studio-banner" data-status={active.status}>
          <Icon aria-hidden="true" />
          <div>
            <strong>{banner.title}</strong>
            <p>{banner.body}</p>
          </div>
          {active.status === "approved" && <Link to={`/creators/${active.slug}`} className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer">
            Public profile <ArrowUpRight aria-hidden="true" />
          </Link>}
        </div>

        <div className="studio-tabbar" role="tablist" aria-label="Creator studio sections" onKeyDown={onTabKey}>
          {tabs.map(item => <button key={item.id} type="button" role="tab" id={`studio-tab-${item.id}`} aria-selected={modelTab === item.id} aria-controls={`studio-panel-${item.id}`} tabIndex={modelTab === item.id ? 0 : -1} className="studio-tab" onClick={() => setTab(item.id)}>
            {item.label}
          </button>)}
        </div>

        <div className="studio-panel" role="tabpanel" id={`studio-panel-${modelTab}`} aria-labelledby={`studio-tab-${modelTab}`} tabIndex={0}>
          {modelTab === "profile" && <ProfileEditor profile={active} onSaved={next => { setCurrent(next); void refresh(); }} />}
          {modelTab === "portfolio" && <PortfolioManager profile={active} />}
          {modelTab === "review" && isAdmin && <ModerationQueue />}
        </div>

        <p className="studio-foot-note"><TriangleAlert aria-hidden="true" />Images and profile details are stored with Supabase and only appear publicly after approval.</p>
      </div>
    </main>
  </div>;
}
