/* ==========================================================================
   PORTFOLIO CONFIG - edit this file only.
   --------------------------------------------------------------------------
   Everything on the page is driven by this object. No build step, no coding.

   1. person     → your name, role, location
   2. hero       → first screen: kicker, tagline, dashboard art, CTAs
   3. marquee    → scrolling words between sections
   4. works      → project cards (add, remove or reorder freely)
   5. research   → research cards + skill chips
   6. experience → work history timeline
   7. about      → profile card, paragraphs, numbers
   8. manifesto  → one strong line in your own voice
   9. services   → capabilities / what you do
   10. contact   → email, WhatsApp, social links
   11. theme     → accent colour + grain toggle

   Research items are exploratory by nature - keep the `status` line honest.

   Tips
   • Wrap *words* in asterisks to italicise them.
   • Project art types: "dashboard", "pipeline", "store", "chart", "config".
     Add `src` to a project instead to show a real screenshot.
   • span = how many of 12 columns a card takes on desktop (7 is wide, 5 is narrow).
   • ratio = the crop of a card, e.g. "4/3", "4/5", "1/1", "16/10".
   ========================================================================== */

const PORTFOLIO = {
  person: {
    firstName: "Shivam",
    lastName: "Singh",
    fullName: "Shivam Singh",
    monogram: "SS",
    role: "Operations · Analytics · Automation",
    location: "Delhi NCR, India",
    availability: "Open to operations, MIS & analytics roles",
    siteTitle: "Shivam Singh - Operations, Analytics & Automation",
    siteDescription:
      "Operations and MIS professional in Delhi NCR with 5+ years across reporting, coordination and system support, plus hands-on analytics, automation and web projects."
  },

  theme: {
    accent: "#3468f5", // used for small details only: dots, links, focus
    grain: true        // film grain over the whole page
  },

  // Desktop shell. Windows are built from these apps; ids must match the
  // data-app attributes in index.html (home, work, research, experience,
  // about, services, contact).
  os: {
    defaultTheme: "glass", // "glass" | "macos" | "oneui"
    phoneDock: ["work", "research", "services", "contact"],
    // Auto tour: plays the portfolio like a short film after the splash.
    tour: {
      enabled: true,
      seconds: 9,
      order: ["home", "work", "research", "experience", "about", "services", "contact"]
    },
    apps: [
      { id: "home", label: "Home", short: "SS", icon: "house", tone: "#151a24", tone2: "#4d5668" },
      { id: "work", label: "Work", short: "W", icon: "briefcase", tone: "#2f56c8", tone2: "#6f96e8" },
      { id: "research", label: "Research", short: "R", icon: "magnifying-glass", tone: "#6a4fd0", tone2: "#a793ea" },
      { id: "experience", label: "Experience", short: "E", icon: "chart-line-up", tone: "#0f7a5f", tone2: "#43b493" },
      { id: "about", label: "About", short: "A", icon: "user", tone: "#a85f2c", tone2: "#dda06b" },
      { id: "services", label: "Services", short: "S", icon: "wrench", tone: "#247a9c", tone2: "#62b8d2" },
      { id: "contact", label: "Contact", short: "C", icon: "envelope-simple", tone: "#232936", tone2: "#5f6a7d" },
      { id: "assistant", label: "Ask Shivam", short: "AI", icon: "ask-shivam", tone: "#0b6e63", tone2: "#4fcbb0", menuLabel: "Ask" },
      { id: "music", label: "Music", short: "M", icon: "music-notes", tone: "#c9405a", tone2: "#ec8298", fun: true },
      { id: "games", label: "Game", short: "G", icon: "game-controller", tone: "#c1861f", tone2: "#e5b458", fun: true },
      { id: "watch", label: "Watch", short: "T", icon: "watch", tone: "#0f6377", tone2: "#4fb2c6", fun: true },
      { id: "screen-time", label: "Screen Time", short: "ST", icon: "timer", tone: "#5454c0", tone2: "#9296de", fun: true },
      { id: "settings", label: "Customize", short: "CU", icon: "sliders-horizontal", tone: "#59616e", tone2: "#8b93a3", fun: true }
    ]
  },

  // Local MP3 playlist. The first track starts on the desktop and keeps
  // playing in the background; change, mute or stop it from the Music window
  // or the Now Playing widget.
  music: {
    artist: "Shivam's mix",
    tracks: [
      { title: "Autumn Nature", src: "assets/audio/autumn-nature.mp3", ambient: true },
      { title: "Shree Hari Stotram", src: "assets/audio/shree-hari-stotram.mp3" },
      { title: "Anadi Ananta - Kailash Kher", src: "assets/audio/anadi-ananta.mp3" },
      { title: "Hare Krishna Hare Rama - Lofi", src: "assets/audio/hare-krishna-lofi.mp3" }
    ]
  },

  // AI assistant window. The endpoint is a serverless function that talks to
  // Gemini with the API key kept server-side. Answers are grounded in this
  // portfolio only.
  assistant: {
    endpoint: "/api/assistant",
    intro: "Hi, I'm Shivy - Shivam's portfolio buddy. Ask about his work, projects or trading style.",
    chips: [
      "What does Shivam do?",
      "Show his strongest projects",
      "How does he trade?",
      "How do I contact him?"
    ]
  },

  hero: {
    kicker: "Operations · analytics · automation",
    tagline:
      "Five-plus years in operations, MIS and reporting, currently in garment exports. I build the dashboards and automations that make daily work *faster, clearer and repeatable*.",
    ctas: [
      { label: "Selected projects", href: "#work", variant: "solid" },
      { label: "Start a conversation", href: "#contact", variant: "glass" }
    ],
    proof: {
      main: {
        src: "assets/img/work-makingreal-web.webp",
        alt: "The MAKINGREAL homepage - “Make things real.” with the brief, match, create process.",
        url: "makingreal.in",
        caption: "Live site - a creator network for real businesses.",
        width: 1600,
        height: 818
      },
      sub: {
        src: "assets/img/work-job-automation.webp",
        alt: "The n8n canvas for the job research automation, showing scoring, filtering and email digest nodes.",
        caption: "n8n - job research workflow",
        width: 1400,
        height: 875
      }
    }
  },

  marquee: [
    "Operations",
    "MIS & reporting",
    "Data analytics",
    "Workflow automation",
    "E-commerce",
    "Team coordination",
    "Business intelligence",
    "Web development",
    "Financial markets"
  ],

  works: [
    {
      src: "assets/img/work-makingreal-web.webp",
      alt: "The MAKINGREAL homepage - “Make things real.” with a brief, match, create process.",
      title: "MAKINGREAL",
      category: "Creator platform",
      year: "2026",
      span: 7,
      ratio: "2/1",
      width: 1600,
      height: 818,
      summary:
        "A live platform connecting local businesses with photographers, filmmakers and creators. Built and iterated in React and TypeScript, deployed on Vercel with Search Console, GA4 and lead tracking wired in.",
      stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Lovable", "Vercel"],
      link: "https://makingreal.in",
      linkLabel: "Visit live site"
    },
    {
      src: "assets/img/work-job-automation.webp",
      alt: "The n8n workflow canvas for the job research automation, showing scoring, filtering and email digest nodes.",
      title: "Job research automation",
      category: "Automation",
      year: "2026",
      span: 5,
      ratio: "16/10",
      width: 1400,
      height: 875,
      summary:
        "An n8n workflow that runs twice daily: pulls job listings, normalizes them, scores each against salary, distance and skill criteria with Gemini, filters duplicates against a Sheets tracker and emails a digest of matches scoring 7+.",
      stack: ["n8n", "Gemini", "Google Sheets", "Gmail", "Webhooks", "JavaScript"],
      note: "Working prototype - tested with sample listings, not yet run at scale."
    },
    {
      src: "assets/img/work-makingreal-analytics.webp",
      alt: "Analytics overview for makingreal.in combining Google Search Console, Web3Forms and Google Analytics 4 panels.",
      title: "MAKINGREAL analytics",
      category: "Analytics · SEO",
      year: "2026",
      span: 12,
      ratio: "3/1",
      width: 2000,
      height: 667,
      summary:
        "Search Console, GA4 and Web3Forms connected for makingreal.in - indexing, engagement and contact-form tracking, with 42 form submissions in the latest month.",
      stack: ["Google Search Console", "GA4", "Web3Forms", "Vercel"],
      note: "3-month search view and a 28-day analytics window."
    }
  ],

  research: {
    eyebrow: "Research",
    title: "Questions I've researched and tested.",
    note:
      "Independent research across markets, data and technology. Exploratory by design: findings are labelled honestly, and no result is claimed before it exists.",
    items: [
      {
        category: "Market research · Customer discovery",
        title: "Pet care market & business validation",
        summary:
          "Explored recurring pet-care categories - grooming, oral care, coat care and parasite protection - with separate English and Hindi surveys for dog and cat owners.",
        status: "Validation framework built"
      },
      {
        category: "Creator economy · Competitive intelligence",
        title: "MAKINGREAL - UGC market research",
        summary:
          "Studied the UGC and short-form video market and compared a managed production model against a creator marketplace, benchmarking INFLENO, Kalinq and ADURA.",
        status: "Demand not yet validated"
      },
      {
        category: "Financial markets · Derivatives",
        title: "Options & technical strategy research",
        summary:
          "Technical analysis and options exploration - EMA, RSI, ATR, implied volatility and strangle strategies - worked through on TradingView and Delta Exchange.",
        status: "Ongoing research"
      },
      {
        category: "Data analytics · Consumer insight",
        title: "Amazon fashion reviews analytics",
        summary:
          "Turned Amazon fashion reviews into an exploratory Power BI dashboard covering ratings, sentiment and product-level feedback patterns.",
        status: "Portfolio project"
      },
      {
        category: "Digital analytics · SEO",
        title: "MAKINGREAL website analytics",
        summary:
          "Search Console, GA4 and contact-form data for makingreal.in - indexing, engagement and conversion tracking for an early-stage site.",
        status: "Early real data only"
      },
      {
        category: "E-commerce · Operations",
        title: "Shopify & dropshipping research",
        summary:
          "Store experiments - ShivyShop and ShivyDrop - covering product selection, listings, store branding and fulfilment workflows.",
        status: "Exploration only"
      },
      {
        category: "Industry research · Company analysis",
        title: "Textile & apparel industry research",
        summary:
          "Studied Shahi Exports, KAS Pty Limited and Radhamani Textiles, pairing desk research with hands-on textile operations exposure.",
        status: "Exploratory"
      },
      {
        category: "Labour market · Automation",
        title: "Job market & matching workflow",
        summary:
          "Mapped Delhi NCR roles and built an n8n workflow that scores listings on salary, distance and skill fit, then emails a daily digest.",
        status: "Workflow implemented"
      },
      {
        category: "Content strategy · Personal branding",
        title: "Digital marketing & audience research",
        summary:
          "Tested LinkedIn formats, storytelling and AI-assisted short-form video to understand what actually engages a professional audience.",
        status: "Continuous testing"
      },
      {
        category: "Technology research · APIs",
        title: "Technical investigation & debugging",
        summary:
          "Browser network inspection, API request analysis and production-readiness checks across Vercel deployments and internal tools.",
        status: "Practical exploration"
      },
      {
        category: "Business intelligence · Reporting",
        title: "Dashboard & BI research",
        summary:
          "Studied how GA4, Search Console and Sheets metrics can become dashboards with consistent definitions, honest labels and real decision value.",
        status: "Mockups only"
      },
      {
        category: "Web development · Systems",
        title: "Portfolio & content system",
        summary:
          "A config-driven one-page portfolio where every section renders from a single content file - no framework, no build step, with keyboard, touch and reduced-motion support.",
        status: "Completed build"
      }
    ],
    skills: [
      "Market research",
      "Customer discovery",
      "Business validation",
      "Technical analysis",
      "Data analytics",
      "Digital analytics",
      "SEO",
      "Automation",
      "E-commerce",
      "Content strategy",
      "Industry research"
    ]
  },

  experience: [
    {
      period: "Dec 2020 - Present",
      current: true,
      role: "Senior Executive / Computer Analyst",
      org: "Shahi Exports Pvt Ltd",
      place: "Textile & garment export",
      points: [
        "Own computer-based operations and business records for a garment-export unit, keeping MIS reporting accurate and on time.",
        "Coordinate across departments and with IT so internal systems and daily workflows keep moving.",
        "Work daily in Excel, Word and the Spandan intranet to keep information consistent and easy to retrieve."
      ],
      tags: ["MIS", "Excel", "Spandan", "Coordination"]
    },
    {
      period: "Oct 2019 - Nov 2020",
      role: "Channel Distribution Sales Executive",
      org: "Theme Venture Loyalty Firm",
      place: "Channel sales",
      points: [
        "Managed channel distribution and day-to-day sales operations.",
        "Owned partner communication, follow-ups and sales records.",
        "Supported business development across the channel."
      ],
      tags: ["Channel distribution", "Sales ops", "Follow-ups"]
    },
    {
      period: "Apr 2019 - Aug 2019",
      role: "Office Administrator / Workforce Coordinator",
      org: "D.L. Group",
      place: "Administration",
      points: [
        "Managed office administration, documentation and daily operations.",
        "Coordinated manpower, attendance records and internal communication."
      ],
      tags: ["Office admin", "Manpower", "Attendance"]
    },
    {
      period: "Feb 2019 - Mar 2019",
      role: "Field Sales Executive",
      org: "BSES Rajdhani Power Ltd",
      place: "Field sales",
      points: [
        "Field sales and door-to-door customer interaction.",
        "Lead generation, promotions and customer enquiry handling."
      ],
      tags: ["Field sales", "Lead generation", "Customer enquiries"]
    }
  ],

  about: {
    eyebrow: "About",
    title: "Operations first. Technology always.",
    badge: "Since 2019",
    profile: {
      rows: [
        { label: "Based in", value: "Delhi NCR, India" },
        { label: "Focus", value: "Operations, MIS & automation" },
        { label: "Status", value: "Open to new roles" }
      ]
    },
    paragraphs: [
      "I'm Shivam, an operations and MIS professional based in Delhi NCR. My work sits where business process meets technology: records, reporting, coordination and the systems that keep a company running.",
      "Over five-plus years across garment exports, channel distribution, administration and field sales, I've learned how teams actually operate, where reporting breaks down and what it takes to keep information accurate.",
      "Outside my day job I build the tools I want to use: a live creator platform, a Power BI dashboard, an AI-assisted job-tracking workflow and Shopify store experiments. Repetitive work should be *automatic*, not a daily chore."
    ],
    stats: [
      { value: "5+", label: "years in operations" },
      { value: "4", label: "organisations" },
      { value: "6", label: "independent projects" },
      { value: "15+", label: "tools & platforms" }
    ]
  },

  manifesto: {
    quote: "Good operations are invisible. The outcome isn't.",
    body:
      "I care about clean records, honest reporting and systems people can actually use. The goal is simple: less chasing, fewer errors, and more time for the work that matters.",
    attribution: "Shivam Singh"
  },

  services: [
    {
      title: "Operations & administration",
      description:
        "Reliable day-to-day operations: coordination, documentation, workforce planning and the follow-through that keeps commitments on track.",
      tags: ["Workflow coordination", "Documentation", "Manpower planning", "Reporting"]
    },
    {
      title: "MIS & data analysis",
      description:
        "Structured MIS, spreadsheet systems and Power BI dashboards that turn raw records into decisions you can defend.",
      tags: ["Excel", "Power BI", "Reporting", "Data accuracy"]
    },
    {
      title: "Automation & AI",
      description:
        "n8n, Gemini and Sheets connected so repetitive work runs itself: job pipelines, email digests and scheduled updates.",
      tags: ["n8n", "Gemini", "Webhooks", "Sheets automation"]
    },
    {
      title: "Digital & web",
      description:
        "Fast, maintainable websites and storefronts, from a config-driven portfolio to a live React product site.",
      tags: ["React", "TypeScript", "Tailwind", "Shopify"]
    }
  ],

  contact: {
    eyebrow: "Contact",
    headline: "Let's make your operations *run smoother*.",
    body:
      "Hiring for operations, MIS or analytics, or need a workflow automated? Share what is slowing the team down and I will reply with a practical plan, usually within a day.",
    email: "singhshivy257@gmail.com",
    emailSubject: "Opportunity - operations / analytics",
    whatsapp: "919711807323",
    whatsappMessage: "Hi Shivam, I found your portfolio and I'd like to talk about a role or project.",
    note: "Based in Delhi NCR · Open to operations, MIS & analytics roles",
    socials: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/singhshivam257/" },
      { label: "MAKINGREAL", href: "https://www.makingreal.in/" }
    ]
  },

  footer: {
    note: "Operations · Analytics · Automation · Delhi NCR."
  }
};

/* Expose for main.js and the browser console. */
window.PORTFOLIO = PORTFOLIO;
