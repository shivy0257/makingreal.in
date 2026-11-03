import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, TriangleAlert } from "lucide-react";
import { track } from "@/lib/analytics";
import { CONTACT_EMAIL, DISPLAY_PHONE, whatsappLink } from "@/lib/contact";

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY ?? "";
const ENDPOINT = "https://api.web3forms.com/submit";
const external = { target: "_blank", rel: "noopener noreferrer" } as const;

const contentOptions = ["Photography", "Reels and short films", "UGC", "Product content", "Events", "Drone", "Editing", "Something else"];
const budgetOptions = ["Not sure yet", "Under ₹5k", "₹5k–₹15k", "₹15k–₹50k", "₹50k+"];

type Status = "idle" | "sending" | "success" | "error";

export function BriefForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject: "New brief — makingreal.in", from_name: "MAKINGREAL site", ...values }),
      });
      const data = (await response.json()) as { success?: boolean };
      if (data.success) {
        setStatus("success");
        track("brief_submit");
        form.reset();
      } else {
        setStatus("error");
        track("brief_submit_error");
      }
    } catch {
      setStatus("error");
      track("brief_submit_error");
    }
  }

  if (!WEB3FORMS_KEY) {
    return <div className="brief-form-fallback reveal">
      <p>Prefer to write it down? Send the brief on WhatsApp or email and a real person replies.</p>
      <div className="brief-form-fallback-actions">
        <a className="btn btn-primary" href={whatsappLink("Hi MAKINGREAL! I'd like to start a brief.\nBrand: \nLocations: \nContent needed: \nBudget: \nDates: ")} {...external}>Start on WhatsApp <ArrowUpRight aria-hidden="true" /></a>
        {CONTACT_EMAIL && <a className="btn btn-ghost" href={`mailto:${CONTACT_EMAIL}`}>Email us <ArrowUpRight aria-hidden="true" /></a>}
        {!CONTACT_EMAIL && DISPLAY_PHONE && <a className="btn btn-ghost" href={whatsappLink("Hi MAKINGREAL!")} {...external}>{DISPLAY_PHONE}</a>}
      </div>
    </div>;
  }

  if (status === "success") {
    return <div className="brief-form-done reveal" role="status">
      <Check aria-hidden="true" />
      <h3>Brief received.</h3>
      <p>We reply within a day, usually the same day. Want to add anything? Send it on WhatsApp.</p>
      <button type="button" className="chip" onClick={() => setStatus("idle")}>Send another brief</button>
    </div>;
  }

  return <form className="brief-form" onSubmit={onSubmit} noValidate={false}>
    <div className="bf-field">
      <label htmlFor="bf-name">Your name</label>
      <input id="bf-name" name="name" type="text" required autoComplete="name" placeholder="Full name" />
    </div>
    <div className="bf-field">
      <label htmlFor="bf-business">Business / brand</label>
      <input id="bf-business" name="business" type="text" autoComplete="organization" placeholder="Optional" />
    </div>
    <div className="bf-field">
      <label htmlFor="bf-city">City</label>
      <input id="bf-city" name="city" type="text" required placeholder="Where should we shoot?" />
    </div>
    <div className="bf-field">
      <label htmlFor="bf-contact">WhatsApp or email</label>
      <input id="bf-contact" name="contact" type="text" required autoComplete="tel" placeholder="How do we reach you?" />
    </div>
    <div className="bf-field">
      <label htmlFor="bf-content">Content needed</label>
      <select id="bf-content" name="content" defaultValue="">
        <option value="" disabled>Choose one</option>
        {contentOptions.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
    <div className="bf-field">
      <label htmlFor="bf-budget">Budget</label>
      <select id="bf-budget" name="budget" defaultValue="">
        <option value="" disabled>Choose a range</option>
        {budgetOptions.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
    <div className="bf-field">
      <label htmlFor="bf-dates">Dates</label>
      <input id="bf-dates" name="dates" type="text" placeholder="e.g. next two weeks" />
    </div>
    <div className="bf-field bf-wide">
      <label htmlFor="bf-message">Anything else</label>
      <textarea id="bf-message" name="message" rows={3} placeholder="Locations, references, must-haves…" />
    </div>
    <input type="checkbox" name="botcheck" className="bf-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />
    {status === "error" && <p className="bf-error" role="alert"><TriangleAlert aria-hidden="true" /> Could not send just now. Please try WhatsApp instead — the link is right below.</p>}
    <div className="bf-actions">
      <button type="submit" className="btn btn-primary" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send the brief"} <ArrowUpRight aria-hidden="true" /></button>
      <span className="bf-note">Data goes only to the MAKINGREAL team. No newsletters, no spam.</span>
    </div>
  </form>;
}
