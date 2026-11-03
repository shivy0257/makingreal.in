import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Menu, X, Mail, Plus, Aperture, Search } from "lucide-react";
import { PhotoWall } from "@/components/PhotoWall";
import { SlideWall, SLIDE_GYM, SLIDE_PROPOSAL } from "@/components/SlideWall";
import { HeroCharacter } from "@/components/HeroCharacter";
import { ThemePalette } from "@/components/ThemePalette";
import { ApertureMarkNext } from "@/components/ApertureMarkNext";
import { BriefForm } from "@/components/BriefForm";
import { track } from "@/lib/analytics";
import { CONTACT_EMAIL, DISPLAY_PHONE, whatsappLink } from "@/lib/contact";
import crewCity from "@/assets/crew-city.webp";
import productStill from "@/assets/product-still.webp";
import eventNight from "@/assets/event-night.webp";
import stickerLighter from "@/assets/sticker-lighter.webp";

type Service = { area: string; name: string; detail: string; image?: { src: string; width: number; height: number } };

const services: Service[] = [
  { area: "prod", name: "Product content", detail: "Packshots, textures and motion that make a product worth picking up. Shot for ecommerce, launches and retail screens.", image: { src: productStill, width: 1000, height: 1000 } },
  { area: "photo", name: "Photography", detail: "Food, spaces and people, shot where your business actually happens." },
  { area: "reels", name: "Reels and short films", detail: "Vertical stories cut for the feed, the story and the ad set." },
  { area: "event", name: "Events", detail: "Launches, store openings and activations, covered from setup to last guest.", image: { src: eventNight, width: 1000, height: 1250 } },
  { area: "ugc", name: "UGC", detail: "Real voices from real locals. Content that reads like a recommendation." },
  { area: "drone", name: "Drone", detail: "Sites, venues and campuses from the angle nobody else has." },
  { area: "edit", name: "Editing", detail: "Raw footage turned into cut-downs, formats and versions for every channel." },
];

const faqs = [
  ["Where is MAKINGREAL available?", "We are building city by city. Share your locations and what you need, and we will tell you honestly whether we can cover them."],
  ["Can you cover several cities at once?", "Yes, where we have reviewed creators. Send us your list of locations and we will confirm coverage city by city before you commit."],
  ["How do you find the right creator?", "A real person reads your brief. We weigh location, content type, style and budget, then recommend creators who fit."],
  ["Who owns the content?", "Usage rights are agreed in writing before production begins, so you know exactly where and for how long you can use the work."],
  ["How much does a project cost?", "It depends on scope, locations and turnaround. Share your brief and budget, and we will set out the options before you commit."],
  ["Can I join as a creator?", "Yes. Send your portfolio, city, skills and kit on WhatsApp. Every application is reviewed, and we reach out when a relevant brief comes in."],
];

const commitments = [
  ["Local creators, not flown-in crews", "People who live where your locations are, so shoots happen without travel days."],
  ["Every creator reviewed", "Portfolio, skills and equipment are checked before anyone is recommended to you."],
  ["One point of contact", "One person coordinates your brief across creators and cities, from first message to final files."],
  ["Matched to the brief", "Location, content type and budget decide who we recommend. Not simply who is free."],
];

const process = [
  ["Brief us", "Tell us what you need, where, your budget and your dates. WhatsApp or email, whichever suits your team."],
  ["Meet your creators", "We review local talent for each location and recommend the right fit, with portfolios to compare."],
  ["Make it real", "Your creators shoot, you review, and we stay on the thread until the work is signed off."],
];

const marqueeItems = ["Photography", "Reels", "UGC", "Product content", "Events", "Drone", "Editing"];
const nav = [{ title: "Services", id: "services" }, { title: "Work", id: "work" }, { title: "How it works", id: "how" }, { title: "Why us", id: "why" }, { title: "FAQ", id: "faq" }];
const chips = ["Wedding", "Religious", "Proposal", "Baby shower", "Gym", "Office", "Fashion", "Food and cafe", "Product", "Event", "Drone", "Reels or UGC"];

const businessLink = whatsappLink("Hi MAKINGREAL! I'd like to start a brief.\nBrand: \nLocations: \nContent needed: \nBudget: \nDates: ");
const creatorLink = whatsappLink("Hi MAKINGREAL! I'd like to join as a creator.\nCity: \nSkills: \nPortfolio link: ");
const external = { target: "_blank", rel: "noopener noreferrer" } as const;

function BriefButton({ className = "", source = "cta" }: { className?: string; source?: string }) {
  return <a href={businessLink} {...external} className={`btn btn-primary ${className}`} onClick={() => track("start_brief_click", { source })}>Start a brief <ArrowUpRight aria-hidden="true" /></a>;
}

function CreatorButton({ className = "", source = "cta" }: { className?: string; source?: string }) {
  return <a href={creatorLink} {...external} className={`btn btn-ghost ${className}`} onClick={() => track("join_creator_click", { source })}>Join as a creator <ArrowUpRight aria-hidden="true" /></a>;
}

function Wordmark({ animated = false }: { animated?: boolean }) {
  return <a href="#top" className="wordmark" aria-label="MAKINGREAL home"><ApertureMarkNext animated={animated} />MAKINGREAL</a>;
}

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [query, setQuery] = useState("");
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("revealed"); observer.unobserve(entry.target); }
    }), { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setSolid(!entry.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const searchLink = whatsappLink(query.trim()
    ? `Hi MAKINGREAL! I need: ${query.trim()}\nLocations: \nBudget: \nDates: `
    : "Hi MAKINGREAL! I need content for my business.\nLocations: \nBudget: \nDates: ");

  return <div className="makingreal-site">
    <a href="#main" className="skip-link">Skip to content</a>

    <header className={`site-header ${solid || menuOpen ? "is-solid" : ""}`}>
      <Wordmark animated />
      <nav className="desktop-nav" aria-label="Main navigation">
        {nav.map(item => <a href={`#${item.id}`} key={item.id}>{item.title}</a>)}
      </nav>
      <div className="header-actions">
        <ThemePalette />
        <BriefButton className="btn-sm header-cta" source="header" />
        <button type="button" className="mobile-toggle" aria-expanded={menuOpen} aria-controls="mobile-nav" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
      {menuOpen && <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation">
        {nav.map(item => <a href={`#${item.id}`} key={item.id} onClick={() => setMenuOpen(false)}>{item.title}</a>)}
        <BriefButton className="mobile-cta" source="mobile_menu" />
      </nav>}
    </header>

    <main id="main">
      <section className="hero" id="top">
        <div ref={sentinel} className="hero-sentinel" aria-hidden="true" />
        <HeroCharacter />
        <div className="hero-scrim" aria-hidden="true" />
        <div className="hero-smoke" aria-hidden="true">
          <span className="smoke s-1" />
          <span className="smoke s-2" />
          <span className="smoke s-3" />
        </div>
        <div className="grain" aria-hidden="true" />
        <div className="hero-copy">
          <p className="hero-tag fade-up">A creator network for real businesses</p>
          <h1 className="hero-title" aria-label="Make things real.">
            <span className="line" aria-hidden="true"><i>Make</i></span>
            <span className="line" aria-hidden="true"><i>Things</i></span>
            <span className="line line-accent" aria-hidden="true"><i>Real.</i></span>
          </h1>
          <p className="hero-lead fade-up fd-1">We connect ambitious local businesses with photographers, filmmakers, reel creators, UGC creators, drone operators and editors who make brands impossible to ignore.</p>
          <div className="hero-actions fade-up fd-2"><BriefButton source="hero" /><CreatorButton source="hero" /></div>
          <div className="hero-stats fade-up fd-3">
            <div><b>01</b><small>Brief</small></div>
            <div><b>02</b><small>Match</small></div>
            <div><b>03</b><small>Create</small></div>
          </div>
        </div>
        <span className="sparkle sp-1" aria-hidden="true" />
        <span className="sparkle sp-2" aria-hidden="true" />
        <span className="sparkle sp-3" aria-hidden="true" />
        <span className="sparkle sp-4" aria-hidden="true" />
        <span className="sparkle sp-5" aria-hidden="true" />
      </section>

      <div className="marquee" role="presentation">
        <p className="sr-only">Photography, reels, UGC, product content, events, drone and editing.</p>
        <div className="marquee-track" aria-hidden="true">
          {[0, 1].map(half => <div className="marquee-half" key={half}>
            {marqueeItems.map(item => <span key={item}>{item}<Aperture className="marquee-mark" aria-hidden="true" /></span>)}
          </div>)}
        </div>
      </div>

      <section className="section audience" id="audience">
        <div className="audience-head reveal">
          <h2>Your next shoot.<br /><span className="muted">Someone nearby.</span></h2>
          <p>The café on the corner, the store in the next city, the creator down the road. Good content happens when the right people are close by.</p>
        </div>
        <div className="audience-grid">
          <article className="audience-card audience-brands reveal">
            <figure className="media"><img src={SLIDE_PROPOSAL.src} alt="A photographer capturing a rooftop proposal at dusk" width={SLIDE_PROPOSAL.w} height={SLIDE_PROPOSAL.h} loading="lazy" decoding="async" /></figure>
            <div className="audience-copy">
              <h3>For brands and businesses</h3>
              <p>Share the brief, the locations and the budget. We find creators who can be there and keep every shoot on track.</p>
              <BriefButton className="btn-sm" source="audience" />
            </div>
          </article>
          <article className="audience-card audience-creators reveal">
            <figure className="media"><img src={SLIDE_GYM.src} alt="A photographer shooting an athlete mid-workout in a gym" width={SLIDE_GYM.w} height={SLIDE_GYM.h} loading="lazy" decoding="async" /></figure>
            <div className="audience-copy">
              <h3>For creators</h3>
              <p>You make things worth seeing. Share your work to be considered for briefs from brands near you.</p>
              <CreatorButton source="audience" />
            </div>
          </article>
        </div>
      </section>

      <section className="section services" id="services">
        <div className="section-head reveal">
          <h2>Content that moves at the speed of your business.</h2>
          <p>From one scroll-stopping reel to an entire visual identity, get the right creator for the job.</p>
        </div>
        <div className="bento reveal">
          {services.map(service => <a key={service.name} className={`tile ${service.image ? "tile-image" : ""}`} style={{ gridArea: service.area }} href={whatsappLink(`Hi MAKINGREAL! I'm interested in ${service.name.toLowerCase()}.\nLocations: `)} {...external} onClick={() => track("service_click", { service: service.name })}>
            {service.image && <figure className="media"><img src={service.image.src} alt="" width={service.image.width} height={service.image.height} loading="lazy" decoding="async" /></figure>}
            <div className="tile-copy">
              <h3>{service.name}<ArrowUpRight className="tile-arrow" aria-hidden="true" /></h3>
              <p>{service.detail}</p>
            </div>
          </a>)}
          <a className="tile tile-idea" style={{ gridArea: "idea" }} href={whatsappLink("Hi MAKINGREAL! I have an idea I'd like to discuss: ")} {...external} onClick={() => track("service_click", { service: "Something else" })}>
            <div className="tile-copy">
              <h3>Something else?<ArrowUpRight className="tile-arrow" aria-hidden="true" /></h3>
              <p>Start with the goal. We will work out the format together.</p>
            </div>
          </a>
        </div>
      </section>

      <section className="strip-section" id="work">
        <div className="strip-head section-head reveal">
          <p className="eyebrow">Selected visual direction</p>
          <h2>Make people stop.<br />Then make them care.</h2>
        </div>
        <SlideWall variant="strip" />
      </section>

      <section className="section search-section" id="search">
        <div className="search-panel reveal">
          <h2>What do you need?</h2>
          <p>Search your shoot, add your city, and send the brief on WhatsApp. A real person replies.</p>
          <div className="search-row">
            <label className="search-input">
              <Search aria-hidden="true" />
              <input type="text" value={query} maxLength={140} onChange={event => setQuery(event.target.value)} placeholder='Try "wedding reel in Delhi" or "gym photo shoot"' aria-label="Describe the content you need" />
            </label>
            <a className="btn btn-primary" href={searchLink} {...external} onClick={() => track("whatsapp_search", { has_query: Boolean(query.trim()) })}>Send on WhatsApp <ArrowUpRight aria-hidden="true" /></a>
          </div>
          <div className="search-chips">
            {chips.map(chip => <button type="button" className="chip" key={chip} onClick={() => { setQuery(current => current ? `${current}, ${chip.toLowerCase()}` : `${chip.toLowerCase()} shoot`); track("chip_click", { chip }); }}>{chip}</button>)}
          </div>
        </div>
        <img className="floater fl-4" src={stickerLighter} alt="" width={480} height={480} loading="lazy" decoding="async" />
      </section>

      <section className="section how" id="how">
        <div className="section-head reveal">
          <p className="eyebrow">Simple by design</p>
          <h2>From "we need content"<br />to "this is exactly it."</h2>
        </div>
        <ol className="process">
          {process.map(([title, text]) => <li className="process-step reveal" key={title}>
            <span className="process-mark" aria-hidden="true" />
            <h3>{title}</h3>
            <p>{text}</p>
          </li>)}
        </ol>
      </section>

      <section className="why" id="why">
        <div className="why-banner">
          <img src={crewCity} alt="A film crew on a rooftop at blue hour, the city skyline lit up behind them" width={1792} height={1024} loading="lazy" decoding="async" />
          <div className="why-banner-copy reveal">
            <p className="eyebrow">For multi-location brands</p>
            <h2>One brief.<br />Local crews, city by city.</h2>
          </div>
        </div>
        <div className="why-grid">
          {commitments.map(([title, detail]) => <div className="commitment reveal" key={title}>
            <h3>{title}</h3>
            <p>{detail}</p>
          </div>)}
        </div>
      </section>

      <section className="section faq" id="faq">
        <div className="faq-layout">
          <div className="faq-side reveal">
            <h2>Questions,<br />answered<span className="accent">.</span></h2>
            <p>Something not covered here? Ask us directly. A person replies, usually the same day.</p>
          </div>
          <div className="faq-list reveal">
            {faqs.map(([question, answer], i) => <div className={`faq-item ${openFaq === i ? "is-open" : ""}`} key={question}>
              <h3>
                <button type="button" className="faq-question" id={`faq-q-${i}`} aria-expanded={openFaq === i} aria-controls={`faq-a-${i}`} onClick={() => { if (openFaq !== i) track("faq_open", { question }); setOpenFaq(openFaq === i ? null : i); }}>
                  {question}<Plus className="faq-icon" aria-hidden="true" />
                </button>
              </h3>
              <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="faq-answer"><div><p>{answer}</p></div></div>
            </div>)}
          </div>
        </div>
      </section>

      <section className="closer" id="contact">
        <PhotoWall contact />
        <div className="closer-inner reveal">
          <h2>Let's make<br /><span className="accent">it real.</span></h2>
          <p>Send a brief for one location or several. A real person replies.</p>
          <div className="closer-actions"><BriefButton source="contact" /><CreatorButton source="contact" /></div>
          <BriefForm />
          {(CONTACT_EMAIL || DISPLAY_PHONE) && <div className="closer-direct">
            {CONTACT_EMAIL && <a href={`mailto:${CONTACT_EMAIL}`} onClick={() => track("email_click")}><Mail aria-hidden="true" />{CONTACT_EMAIL}</a>}
            {DISPLAY_PHONE && <a href={whatsappLink("Hi MAKINGREAL!")} {...external}>{DISPLAY_PHONE}</a>}
          </div>}
        </div>
        <span className="sparkle sp-6" aria-hidden="true" />
        <span className="sparkle sp-7" aria-hidden="true" />
      </section>
    </main>

    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <Wordmark />
          <p>Local creators for brands and businesses, city by city.</p>
        </div>
        <nav aria-label="Footer navigation">
          {nav.map(item => <a href={`#${item.id}`} key={item.id}>{item.title}</a>)}
          <a href="#contact">Contact</a>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} MAKINGREAL</span>
        <span className="footer-bottom-links">
          <Link to="/privacy">Privacy</Link>
          <a href="#top">Back to top</a>
        </span>
      </div>
    </footer>
  </div>;
}
