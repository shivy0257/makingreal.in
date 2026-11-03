import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { ApertureMarkNext } from "@/components/ApertureMarkNext";
import { CONTACT_EMAIL } from "@/lib/contact";

const processors = [
  ["Google Analytics", "Page views, approximate location, device and how the site is used. Served from Google servers.", "policies.google.com/privacy"],
  ["Microsoft Clarity", "Session recordings and heatmaps that show where people click and scroll. Text you type into form fields is masked before it is sent.", "privacy.microsoft.com"],
  ["Web3Forms", "The contents of the brief form you submit, which forwards them to us by email.", "web3forms.com/privacy"],
  ["WhatsApp", "When you tap a WhatsApp button you leave this site and WhatsApp's own terms apply.", "whatsapp.com/legal/privacy-policy"],
];

export default function Privacy() {
  return <div className="legal-page">
    <header className="legal-header">
      <Link to="/" className="wordmark" aria-label="MAKINGREAL home"><ApertureMarkNext />MAKINGREAL</Link>
      <Link to="/" className="legal-back"><ArrowLeft aria-hidden="true" />Back to site</Link>
    </header>

    <main className="legal-body">
      <p className="eyebrow">Plain language, no legalese</p>
      <h1>Privacy policy</h1>
      <p className="legal-updated">Last updated: 31 October 2026</p>

      <section>
        <h2>What we collect</h2>
        <p><strong>What you send us.</strong> If you fill in the brief form, we receive your name, business, city, contact detail, budget range, dates and message. If you message us on WhatsApp or email, we receive whatever you write there.</p>
        <p><strong>What is collected automatically.</strong> We use analytics to understand how the site is used. This includes pages visited, buttons clicked, approximate location (city level), device and browser. We do not use this data to identify you personally, and we never sell it.</p>
      </section>

      <section>
        <h2>How we use it</h2>
        <p>To reply to your brief, to improve the site, and to understand which content and features are useful. We do not send newsletters or marketing emails unless you explicitly ask for them.</p>
      </section>

      <section>
        <h2>Third-party services</h2>
        <p>Running the site relies on a few external services. Each processes data under its own policy:</p>
        <ul>
          {processors.map(([name, what, policy]) => <li key={name}><strong>{name}.</strong> {what} See <span className="legal-domain">{policy}</span>.</li>)}
        </ul>
      </section>

      <section>
        <h2>Cookies and opting out</h2>
        <p>Analytics services set cookies or use similar storage in your browser. You can block or delete cookies in your browser settings at any time — the site keeps working. You can also opt out of Google Analytics with the official browser add-on, and block Clarity with any tracker blocker. The brief form itself does not require cookies.</p>
      </section>

      <section>
        <h2>How long we keep it</h2>
        <p>Briefs and messages are kept only as long as needed to handle your request and follow up. Analytics data is kept according to each provider's defaults. Session recordings are not linked to your name unless you type it into a form, and form fields are masked in recordings.</p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>You can ask us what data we hold about you, ask us to correct it, or ask us to delete it. Just write to us. There is no account system, so "your data" is simply the messages and briefs you have sent.</p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>For any privacy question or request, email <a href={`mailto:${CONTACT_EMAIL}`} className="legal-mail"><Mail aria-hidden="true" />{CONTACT_EMAIL}</a>.</p>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>If the way we handle data changes, this page is updated first. The date at the top shows the latest revision.</p>
      </section>
    </main>
  </div>;
}
