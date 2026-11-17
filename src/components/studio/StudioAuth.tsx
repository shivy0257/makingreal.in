import { useState, type FormEvent } from "react";
import { Check, Mail, TriangleAlert } from "lucide-react";
import { friendlyError, sendMagicLink, signInWithGoogle } from "@/lib/portfolio";

export function StudioAuth() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "google">("idle");
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      await sendMagicLink(email);
      setStatus("sent");
    } catch (cause) {
      setError(friendlyError(cause));
      setStatus("idle");
    }
  };

  const onGoogle = async () => {
    setStatus("google");
    setError("");
    try {
      await signInWithGoogle();
    } catch (cause) {
      setError(friendlyError(cause));
      setStatus("idle");
    }
  };

  return <main className="studio-auth">
    <section className="studio-auth-copy">
      <p className="eyebrow accent">Creator studio</p>
      <h1>Your work,<br /><span className="accent">on the record.</span></h1>
      <p className="studio-lead">Build a profile, upload your portfolio, and get considered for briefs from real businesses.</p>
      <ul className="studio-points">
        <li><Check aria-hidden="true" />A public profile at <code>/creators/your-name</code></li>
        <li><Check aria-hidden="true" />Portfolio uploads with captions and categories</li>
        <li><Check aria-hidden="true" />Reviewed by a human before anything goes live</li>
      </ul>
    </section>

    <section className="studio-card studio-auth-card" aria-labelledby="studio-signin-title">
      <h2 id="studio-signin-title">Sign in or create an account</h2>
      {status === "sent" ? <div className="studio-sent" role="status">
        <Mail aria-hidden="true" />
        <h3>Check your inbox</h3>
        <p>We sent a sign-in link to <strong>{email.trim()}</strong>. It opens this studio and expires shortly, so use it soon.</p>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setStatus("idle"); setError(""); }}>Use a different email</button>
      </div> : <form className="studio-form" onSubmit={onSubmit} noValidate>
        <div className="bf-field">
          <label htmlFor="studio-email">Email address</label>
          <input id="studio-email" type="email" name="email" autoComplete="email" inputMode="email" placeholder="you@studio.com" value={email} onChange={event => setEmail(event.target.value)} required />
        </div>
        {error && <p className="bf-error" role="alert"><TriangleAlert aria-hidden="true" />{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={status === "sending" || !email.trim()}>
          {status === "sending" ? "Sending link…" : "Email me a sign-in link"}
        </button>
      </form>}

      {status !== "sent" && <>
        <div className="studio-divider" aria-hidden="true"><span>or</span></div>
        <button type="button" className="btn btn-ghost" onClick={onGoogle} disabled={status === "google"}>
          {status === "google" ? "Opening Google…" : "Continue with Google"}
        </button>
      </>}

      <p className="studio-note">No password to remember. New profiles are reviewed before they appear publicly.</p>
    </section>
  </main>;
}
