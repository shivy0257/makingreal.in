import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, Menu, X, Mail, Plus, Aperture, Search } from "lucide-react";
import { SlideWall, type GalleryImage } from "@/components/SlideWall";
import { HeroScene } from "@/components/HeroScene";
import { ThemePalette } from "@/components/ThemePalette";
import { ApertureMarkNext } from "@/components/ApertureMarkNext";
import { BriefForm } from "@/components/BriefForm";
import { track } from "@/lib/analytics";
import { CONTACT_EMAIL, DISPLAY_PHONE, whatsappLink } from "@/lib/contact";
import { isSupabaseConfigured } from "@/lib/supabaseConfig";
import filmmaker from "@/assets/glass/hero-filmmaker-1600.webp";
import filmmakerSmall from "@/assets/glass/hero-filmmaker-640.webp";
import product from "@/assets/glass/product-still-life-1200.webp";
import productSmall from "@/assets/glass/product-still-life-640.webp";
import creator from "@/assets/glass/creator-camera-1200.webp";
import creatorSmall from "@/assets/glass/creator-camera-640.webp";
import cafe from "@/assets/glass/cafe-interior-1200.webp";
import cafeSmall from "@/assets/glass/cafe-interior-640.webp";
import studio from "@/assets/glass/studio-environment-1200.webp";
import studioSmall from "@/assets/glass/studio-environment-640.webp";

const images: GalleryImage[] = [
  { src: filmmaker, smallSrc: filmmakerSmall, width: 1600, height: 1067, title: "Light. Camera. Intention.", description: "A reference for expressive lighting and considered film production.", alt: "Filmmaker operating a cinema camera amid blue and red studio light beams", credit: "Jakob Owens / Unsplash", sourceUrl: "https://unsplash.com/photos/kbd1oAf-9Ms" },
  { src: product, smallSrc: productSmall, width: 1200, height: 1800, title: "The smallest details.", description: "A reference for sculptural product composition, texture and natural light.", alt: "Two unlabelled glass bottles on a sculptural white pedestal", credit: "Marek Mucha / Unsplash", sourceUrl: "https://unsplash.com/photos/ykg6ILZf7Zk" },
  { src: creator, smallSrc: creatorSmall, width: 1200, height: 800, title: "Behind every frame.", description: "A closer look at the craft of camera operation and on-set production.", alt: "Camera operator adjusting a cinema rig and monitor on a red-lit set", credit: "Kyle Loftus / Unsplash", sourceUrl: "https://unsplash.com/photos/DqmXihYx5UE" },
  { src: cafe, smallSrc: cafeSmall, width: 1200, height: 1600, title: "Places with a point of view.", description: "A reference for capturing the light, atmosphere and character of a local business.", alt: "Daylit cafe with arched windows, a curved timber counter and pendant lights", credit: "Keghan Crossland / Unsplash", sourceUrl: "https://unsplash.com/photos/ZZxmc66SjfM" },
  { src: studio, smallSrc: studioSmall, width: 1200, height: 1200, title: "Room to make something.", description: "A reference for daylight studios and simple, thoughtfully prepared sets.", alt: "Sunlit photography studio with a white backdrop, wooden table and stool", credit: "Hannah Busing / Unsplash", sourceUrl: "https://unsplash.com/photos/nME9TubZtSo" },
];

type Service = { area: string; name: string; detail: string; image?: GalleryImage };

const services: Service[] = [
  { area: "prod", name: "Product content", detail: "Packshots, textures and motion that make a product worth picking up. Shot for ecommerce, launches and retail screens.", image: images[1] },
  { area: "photo", name: "Photography", detail: "Food, spaces and people, shot where your business actually happens." },
  { area: "reels", name: "Reels and short films", detail: "Vertical stories cut for the feed, the story and the ad set." },
  { area: "event", name: "Events", detail: "Launches, store openings and activations, covered from setup to last guest." },
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
  ["Can I join as a creator?", "Yes. Create a profile in the creator studio, upload your portfolio and set your city and skills. Every profile is reviewed by a person before it appears publicly."],
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
  if (isSupabaseConfigured) {
    return <Link to="/admin" className={`btn btn-ghost ${className}`} onClick={() => track("join_creator_click", { source })}>Join as a creator <ArrowUpRight aria-hidden="true" /></Link>;
  }
  return <a href={creatorLink} {...external} className={`btn btn-ghost ${className}`} onClick={() => track("join_creator_click", { source })}>Join as a creator <ArrowUpRight aria-hidden="true" /></a>;
}

function Wordmark({ animated = false }: { animated?: boolean }) {
  return <a href="#top" className="wordmark" aria-label="MAKINGREAL home"><ApertureMarkNext animated={animated} />MAKINGREAL</a>;
}

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("revealed"); observer.unobserve(entry.target); }
    }), { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(node => {
      node.classList.add("reveal-pending");
      observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const desktop = matchMedia("(min-width: 1160px)");
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const searchLink = whatsappLink(query.trim()
    ? `Hi MAKINGREAL! I need: ${query.trim()}\nLocations: \nBudget: \nDates: `
    : "Hi MAKINGREAL! I need content for my business.\nLocations: \nBudget: \nDates: ");

  return <div className="makingreal-site">
    <a href="#main" className="skip-link">Skip to content</a>

    <header className="site-header">
      <Wordmark animated />
      <nav className="desktop-nav" aria-label="Main navigation">
        {nav.map(item => <a href={`#${item.id}`} key={item.id}>{item.title}</a>)}
        <a href="/portfolio/" target="_blank" rel="noopener noreferrer" aria-label="Shivam Singh portfolio (opens in a new tab)">Portfolio</a>
        {isSupabaseConfigured && <Link to="/creators">Creators</Link>}
      </nav>
      <div className="header-actions">
        <ThemePalette />
        <BriefButton className="btn-sm header-cta" source="header" />
        <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <Dialog.Trigger asChild>
            <button type="button" className="mobile-toggle icon-button" aria-label="Open menu"><Menu aria-hidden="true" /></button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="mobile-backdrop" />
            <Dialog.Content className="mobile-nav glass" aria-describedby={undefined}>
              <div className="mobile-nav-head">
                <Dialog.Title className="mobile-nav-title">Explore MAKINGREAL</Dialog.Title>
                <Dialog.Close className="icon-button" aria-label="Close menu"><X aria-hidden="true" /></Dialog.Close>
              </div>
              <nav aria-label="Mobile navigation">
                {nav.map(item => <a href={`#${item.id}`} key={item.id} onClick={() => setMenuOpen(false)}>{item.title}</a>)}
                <a href="/portfolio/" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>Portfolio</a>
                {isSupabaseConfigured && <Link to="/creators" onClick={() => setMenuOpen(false)}>Creators</Link>}
                <BriefButton className="mobile-cta" source="mobile_menu" />
              </nav>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>

    <main id="main">
      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="hero-tag">A creator network for real businesses</p>
          <h1 className="hero-title"><span>Make things</span><span className="accent">real.</span></h1>
          <p className="hero-lead">Local talent. A shared vision. We connect your business with photographers, filmmakers and creators who turn a good brief into something worth seeing.</p>
          <div className="hero-actions"><BriefButton source="hero" /><CreatorButton source="hero" /></div>
          <div className="hero-stats">
            <div><b>01</b><small>Brief</small></div>
            <div><b>02</b><small>Match</small></div>
            <div><b>03</b><small>Create</small></div>
          </div>
        </div>
        <HeroScene primary={{ ...images[0], smallSrc: filmmakerSmall }} detail={{ ...images[1], smallSrc: productSmall }} />
      </section>

      <nav className="capability-strip" aria-label="Content capabilities">
        {marqueeItems.map(item => <a href="#services" key={item}><Aperture aria-hidden="true" />{item}</a>)}
      </nav>

      <section className="section audience" id="audience">
        <div className="audience-head reveal">
          <h2>Your next shoot.<br /><span className="muted">Someone nearby.</span></h2>
          <p>The café on the corner, the store in the next city, the creator down the road. Good content happens when the right people are close by.</p>
        </div>
        <div className="audience-grid">
          <article className="audience-card audience-brands reveal">
            <figure className="media"><img src={cafe} srcSet={`${cafeSmall} 640w, ${cafe} 1200w`} sizes="(max-width: 767px) 90vw, 48vw" alt={images[3].alt} width={1200} height={1600} loading="lazy" decoding="async" /></figure>
            <div className="audience-copy">
              <h3>For brands and businesses</h3>
              <p>Share the brief, the locations and the budget. We find creators who can be there and keep every shoot on track.</p>
              <BriefButton className="btn-sm" source="audience" />
            </div>
          </article>
          <article className="audience-card audience-creators reveal">
            <figure className="media"><img src={creator} srcSet={`${creatorSmall} 640w, ${creator} 1200w`} sizes="(max-width: 767px) 90vw, 40vw" alt={images[2].alt} width={1200} height={800} loading="lazy" decoding="async" /></figure>
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
        <p className="gallery-disclosure muted">An inspiration library, not a client portfolio. Photography credited in each image viewer.</p>
        <SlideWall images={images} />
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
          <img src={studio} srcSet={`${studioSmall} 640w, ${studio} 1200w`} sizes="100vw" alt={images[4].alt} width={1200} height={1200} loading="lazy" decoding="async" />
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
              <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="faq-answer" hidden={openFaq !== i}><div><p>{answer}</p></div></div>
            </div>)}
          </div>
        </div>
      </section>

      <section className="closer" id="contact">
        <div className="closer-inner">
          <div className="closer-copy reveal">
            <h2>Let's make<br /><span className="accent">it real.</span></h2>
            <p>Send a brief for one location or several. A real person replies.</p>
            <div className="closer-actions"><BriefButton source="contact" /><CreatorButton source="contact" /></div>
            {(CONTACT_EMAIL || DISPLAY_PHONE) && <div className="closer-direct">
              {CONTACT_EMAIL && <a href={`mailto:${CONTACT_EMAIL}`} onClick={() => track("email_click")}><Mail aria-hidden="true" />{CONTACT_EMAIL}</a>}
              {DISPLAY_PHONE && <a href={whatsappLink("Hi MAKINGREAL!")} {...external}>{DISPLAY_PHONE}</a>}
            </div>}
          </div>
          <div className="brief-surface"><BriefForm /></div>
        </div>
      </section>
    </main>

    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <Wordmark />
          <p>Local creators for brands and businesses, city by city.</p>
          <p>Photography on this site is licensed visual inspiration, not a representation of our clients, team or premises.</p>
        </div>
        <nav aria-label="Footer navigation">
          {nav.map(item => <a href={`#${item.id}`} key={item.id}>{item.title}</a>)}
          <a href="/portfolio/" target="_blank" rel="noopener noreferrer">Portfolio</a>
          <a href="#contact">Contact</a>
          {isSupabaseConfigured && <Link to="/creators">Creators</Link>}
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} MAKINGREAL</span>
        <span className="footer-bottom-links">
          <Link to="/privacy">Privacy</Link>
          {isSupabaseConfigured && <Link to="/admin">Creator studio</Link>}
          <a href="#top">Back to top</a>
        </span>
      </div>
    </footer>
  </div>;
}
