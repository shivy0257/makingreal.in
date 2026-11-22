/* ==========================================================================
   PORTFOLIO - renderer + interactions
   All content comes from config.js. This file should not need editing.
   ========================================================================== */

(function () {
  "use strict";

  var C = window.PORTFOLIO || {};
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function get(path) {
    return path.split(".").reduce(function (obj, key) {
      return obj == null ? undefined : obj[key];
    }, C);
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function emphasis(value) {
    return esc(value).replace(/\*([^*]+)\*/g, "<em>$1</em>");
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function showToast(message) {
    var toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-on");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(function () {
      toast.classList.remove("is-on");
    }, 2600);
  }

  /* ---------------------------------------------------------------- theme + meta */

  if (C.theme && C.theme.accent) {
    document.documentElement.style.setProperty("--accent", C.theme.accent);
  }
  if (C.theme && C.theme.grain === false) {
    document.documentElement.classList.add("no-grain");
  }

  if (C.person) {
    if (C.person.siteTitle) document.title = C.person.siteTitle;
    var metaDesc = $('meta[name="description"]');
    if (metaDesc && C.person.siteDescription) {
      metaDesc.setAttribute("content", C.person.siteDescription);
    }
    var ogTitle = $('meta[property="og:title"]');
    if (ogTitle && C.person.siteTitle) ogTitle.setAttribute("content", C.person.siteTitle);
    var ogDesc = $('meta[property="og:description"]');
    if (ogDesc && C.person.siteDescription) ogDesc.setAttribute("content", C.person.siteDescription);
  }

  /* ---------------------------------------------------------------- static bindings */

  $$("[data-bind]").forEach(function (el) {
    var value = get(el.getAttribute("data-bind"));
    if (value != null) el.textContent = value;
  });

  $$("[data-bind-html]").forEach(function (el) {
    var value = get(el.getAttribute("data-bind-html"));
    if (value != null) el.innerHTML = emphasis(value);
  });

  $$("[data-bind-src]").forEach(function (el) {
    var value = get(el.getAttribute("data-bind-src"));
    if (value) el.setAttribute("src", value);
  });

  $$("[data-bind-alt]").forEach(function (el) {
    var value = get(el.getAttribute("data-bind-alt"));
    if (value) el.setAttribute("alt", value);
  });

  /* ---------------------------------------------------------------- hero CTAs */

  var heroCtas = $('[data-render="hero-ctas"]');
  if (heroCtas && C.hero && Array.isArray(C.hero.ctas)) {
    heroCtas.innerHTML = C.hero.ctas
      .map(function (cta) {
        return (
          '<a class="btn btn--' + esc(cta.variant || "solid") + '" href="' + esc(cta.href) + '">' +
          esc(cta.label) +
          '<span class="btn__arrow" aria-hidden="true">&rarr;</span></a>'
        );
      })
      .join("");
  }

  /* ---------------------------------------------------------------- hero board + flow */

  var proofMainEl = $('[data-render="hero-proof-main"]');
  if (proofMainEl && C.hero && C.hero.proof && C.hero.proof.main) {
    var proofMain = C.hero.proof.main;
    proofMainEl.innerHTML =
      '<figure class="shot">' +
      '<div class="shot__bar">' +
      '<span class="shot__dots"><i></i><i></i><i></i></span>' +
      '<span class="shot__url">' + esc(proofMain.url || "") + "</span>" +
      '<span class="shot__live"><i></i>live</span>' +
      "</div>" +
      '<img class="shot__img" src="' + esc(proofMain.src) + '" alt="' + esc(proofMain.alt) +
      '" width="' + (proofMain.width || 1600) + '" height="' + (proofMain.height || 818) +
      '" loading="eager" decoding="async">' +
      "</figure>";
  }

  var proofSubEl = $('[data-render="hero-proof-sub"]');
  if (proofSubEl && C.hero && C.hero.proof && C.hero.proof.sub) {
    var proofSub = C.hero.proof.sub;
    proofSubEl.innerHTML =
      '<figure class="shot shot--dark">' +
      '<div class="shot__bar shot__bar--dark">' +
      '<span class="shot__url">' + esc(proofSub.caption || "Workflow") + "</span>" +
      "</div>" +
      '<img class="shot__img" src="' + esc(proofSub.src) + '" alt="' + esc(proofSub.alt) +
      '" width="' + (proofSub.width || 1400) + '" height="' + (proofSub.height || 875) +
      '" loading="lazy" decoding="async">' +
      "</figure>";
  }

  /* ---------------------------------------------------------------- project art */

  function chartLine() {
    return (
      '<svg viewBox="0 0 320 130" preserveAspectRatio="none" aria-hidden="true">' +
      '<path class="art__grid" d="M0 28H320M0 62H320M0 96H320"/>' +
      '<path class="art__area" d="M0 104 L32 88 L64 96 L96 68 L128 76 L160 52 L192 62 L224 38 L256 48 L288 24 L320 34 L320 130 L0 130 Z"/>' +
      '<path class="art__line" d="M0 104 L32 88 L64 96 L96 68 L128 76 L160 52 L192 62 L224 38 L256 48 L288 24 L320 34"/>' +
      "</svg>"
    );
  }

  function candle(x, open, close, high, low, up) {
    var top = Math.min(open, close);
    var body = Math.abs(close - open);
    return (
      '<g class="' + (up ? "art__up" : "art__down") + '">' +
      '<line x1="' + x + '" y1="' + high + '" x2="' + x + '" y2="' + low + '"></line>' +
      '<rect x="' + (x - 4) + '" y="' + top + '" width="8" height="' + body + '" rx="1.5"></rect>' +
      "</g>"
    );
  }

  var artRenderers = {
    dashboard: function () {
      return (
        '<div class="art art--dashboard">' +
        '<div class="art__head"><span>Exploration</span><span class="art__chip">Power BI</span></div>' +
        '<div class="art__title">Amazon fashion reviews</div>' +
        '<div class="art__kpis">' +
        '<div><span class="art__kpi-label">Ratings</span><span class="art__bar" style="--w:76%"></span></div>' +
        '<div><span class="art__kpi-label">Reviews</span><span class="art__bar" style="--w:54%"></span></div>' +
        '<div><span class="art__kpi-label">Trends</span><span class="art__bar" style="--w:88%"></span></div>' +
        "</div>" +
        '<div class="art__chart">' + chartLine() + "</div>" +
        '<div class="art__foot"><span>Customer feedback patterns</span><span class="art__dot"></span></div>' +
        "</div>"
      );
    },
    pipeline: function () {
      var steps = [
        ["Listings", "Webhook"],
        ["Score", "Gemini"],
        ["Filter", "Sheets"],
        ["Digest", "Email"]
      ];
      return (
        '<div class="art art--pipeline">' +
        '<div class="art__head"><span>Workflow</span><span class="art__chip">n8n</span></div>' +
        '<div class="art__title">AI job tracking</div>' +
        '<ol class="art__flow">' +
        steps
          .map(function (step, i) {
            return (
              "<li><i>" + pad(i + 1) + "</i><span>" + step[0] + "</span><em>" + step[1] + "</em></li>"
            );
          })
          .join("") +
        "</ol>" +
        '<div class="art__foot"><span>Match score · duplicates · digest</span><span class="art__dot"></span></div>' +
        "</div>"
      );
    },
    store: function () {
      return (
        '<div class="art art--store">' +
        '<div class="art__head"><span>Storefront</span><span class="art__chip">Shopify</span></div>' +
        '<div class="art__browser"><span></span><span></span><span></span><em>shivyshop</em></div>' +
        '<div class="art__products">' +
        '<div class="art__product"><span class="art__thumb art__thumb--a"></span><span class="art__line-l"></span><span class="art__line-s"></span></div>' +
        '<div class="art__product"><span class="art__thumb art__thumb--b"></span><span class="art__line-l"></span><span class="art__line-s"></span></div>' +
        '<div class="art__product"><span class="art__thumb art__thumb--c"></span><span class="art__line-l"></span><span class="art__line-s"></span></div>' +
        "</div>" +
        '<div class="art__foot"><span>Branding · listing · dropshipping</span><span class="art__dot"></span></div>' +
        "</div>"
      );
    },
    chart: function () {
      return (
        '<div class="art art--chart">' +
        '<div class="art__head"><span>Independent research</span><span class="art__chip">TradingView</span></div>' +
        '<div class="art__title">Market structure</div>' +
        '<div class="art__candles">' +
        '<svg viewBox="0 0 320 150" preserveAspectRatio="none" aria-hidden="true">' +
        '<path class="art__grid" d="M0 30H320M0 70H320M0 110H320"/>' +
        candle(28, 78, 96, 66, 108, false) +
        candle(56, 94, 86, 80, 102, true) +
        candle(84, 86, 104, 76, 116, false) +
        candle(112, 102, 90, 82, 112, true) +
        candle(140, 90, 74, 62, 96, true) +
        candle(168, 74, 84, 66, 94, false) +
        candle(196, 84, 64, 54, 92, true) +
        candle(224, 64, 52, 40, 72, true) +
        candle(252, 52, 62, 46, 74, false) +
        candle(280, 62, 42, 30, 70, true) +
        '<path class="art__ema" d="M28 88 L56 90 L84 98 L112 96 L140 82 L168 80 L196 72 L224 60 L252 56 L280 50"/>' +
        '<path class="art__rsi" d="M0 142 L40 138 L80 141 L120 135 L160 139 L200 133 L240 137 L280 132 L320 135"/>' +
        "</svg>" +
        "</div>" +
        '<div class="art__legend"><span>EMA</span><span>RSI</span><span>IV</span><span>Strangles</span></div>' +
        '<div class="art__foot"><span>Research interest, not advisory</span><span class="art__dot"></span></div>' +
        "</div>"
      );
    },
    config: function () {
      var code = [
        '<span class="c-key">person</span>: { name, role, location },',
        '<span class="c-key">works</span>: [ projects… ],',
        '<span class="c-key">experience</span>: [ history… ],',
        '<span class="c-key">contact</span>: { email, linkedin }'
      ];
      return (
        '<div class="art art--config">' +
        '<div class="art__head"><span>Template</span><span class="art__chip">config.js</span></div>' +
        '<div class="art__code">' +
        '<span class="c-line"><span class="c-dim">const</span> <span class="c-var">PORTFOLIO</span> <span class="c-dim">=</span> {</span>' +
        code
          .map(function (line) {
            return '<span class="c-line c-indent">' + line + "</span>";
          })
          .join("") +
        '<span class="c-line"><span class="c-dim">};</span></span>' +
        "</div>" +
        '<div class="art__foot"><span>One file. Your story.</span><span class="art__dot"></span></div>' +
        "</div>"
      );
    }
  };

  function artHtml(type) {
    return artRenderers[type] ? artRenderers[type]() : "";
  }

  /* ---------------------------------------------------------------- marquee */

  var marquee = $('[data-render="marquee"]');
  if (marquee && Array.isArray(C.marquee) && C.marquee.length) {
    var marqueeGroup = C.marquee
      .map(function (word) {
        return (
          '<span class="marquee__item">' + esc(word) + "</span>" +
          '<span class="marquee__sep" aria-hidden="true"></span>'
        );
      })
      .join("");
    marquee.innerHTML =
      '<div class="marquee__group">' + marqueeGroup + "</div>" +
      '<div class="marquee__group" aria-hidden="true">' + marqueeGroup + "</div>";
  }

  /* ---------------------------------------------------------------- work grid */

  var works = Array.isArray(C.works) ? C.works : [];
  var workGrid = $('[data-render="works"]');

  if (workGrid && works.length) {
    workGrid.innerHTML = works
      .map(function (work, index) {
        var media = work.src
          ? '<img src="' + esc(work.src) + '" alt="' + esc(work.alt || work.title) + '" width="' +
            (work.width || 1440) + '" height="' + (work.height || 900) + '" ' +
            'loading="lazy" decoding="async">'
          : '<div class="work-card__art" aria-hidden="true">' + artHtml(work.art) + "</div>";

        return (
          '<button class="work-card reveal" type="button" data-work="' + index + '" ' +
          'aria-label="View project ' + esc(work.title) + " - " + esc(work.category) + '" ' +
          'style="--span:' + (work.span || 6) + ";--ratio:" + esc(work.ratio || "4/3") +
          ";--d:" + index * 70 + 'ms">' +
          media +
          '<span class="work-card__shade" aria-hidden="true"></span>' +
          '<span class="work-card__open" aria-hidden="true">Open</span>' +
          '<span class="work-card__meta">' +
          '<span class="work-card__cat">' + esc(work.category) +
          (work.year ? " · " + esc(work.year) : "") + "</span>" +
          '<span class="work-card__title">' + esc(work.title) + "</span>" +
          "</span></button>"
        );
      })
      .join("");
  }

  /* ---------------------------------------------------------------- lightbox */

  var lightbox = $("#lightbox");
  var lbImg = $(".lightbox__img");
  var lbArt = $(".lightbox__art");
  var lbCat = $(".lightbox__cat");
  var lbTitle = $(".lightbox__title");
  var lbCount = $(".lightbox__count");
  var lbDesc = $(".lightbox__desc");
  var lbNote = $(".lightbox__note");
  var lbStack = $(".lightbox__stack");
  var lbLink = $(".lightbox__link");
  var lbIndex = 0;

  function paintLightbox() {
    var work = works[lbIndex];
    if (!work) return;

    var isArt = !work.src && work.art;

    if (isArt) {
      if (lbImg) {
        lbImg.hidden = true;
        lbImg.removeAttribute("src");
      }
      if (lbArt) {
        lbArt.hidden = false;
        lbArt.innerHTML = artHtml(work.art);
      }
    } else {
      if (lbArt) {
        lbArt.hidden = true;
        lbArt.innerHTML = "";
      }
      if (lbImg) {
        lbImg.hidden = false;
        lbImg.classList.remove("is-ready");
        lbImg.onload = function () {
          lbImg.classList.add("is-ready");
        };
        lbImg.setAttribute("src", work.src);
        lbImg.setAttribute("alt", work.alt || work.title || "");
        if (lbImg.complete && lbImg.naturalWidth) lbImg.classList.add("is-ready");
      }
    }

    if (lbCat) lbCat.textContent = work.category || "";
    if (lbTitle) lbTitle.textContent = work.title || "";
    if (lbCount) lbCount.textContent = pad(lbIndex + 1) + " / " + pad(works.length);

    if (lbDesc) lbDesc.textContent = work.summary || "";
    if (lbNote) {
      lbNote.hidden = !work.note;
      lbNote.textContent = work.note || "";
    }
    if (lbStack) {
      lbStack.innerHTML = (work.stack || [])
        .map(function (item) { return "<li>" + esc(item) + "</li>"; })
        .join("");
    }
    if (lbLink) {
      lbLink.hidden = !work.link;
      if (work.link) {
        lbLink.href = work.link;
        lbLink.innerHTML = esc(work.linkLabel || "Visit project") + ' <span aria-hidden="true">↗</span>';
      }
    }
  }

  function openLightbox(index) {
    if (!lightbox || !works.length) return;
    lbIndex = index;
    paintLightbox();
    if (typeof lightbox.showModal === "function") lightbox.showModal();
    else lightbox.setAttribute("open", "");
    document.documentElement.classList.add("lb-open");
  }

  function closeLightbox() {
    if (!lightbox) return;
    if (typeof lightbox.close === "function") lightbox.close();
    else lightbox.removeAttribute("open");
  }

  function stepLightbox(direction) {
    if (!works.length) return;
    lbIndex = (lbIndex + direction + works.length) % works.length;
    paintLightbox();
  }

  if (workGrid) {
    workGrid.addEventListener("click", function (event) {
      var card = event.target.closest("[data-work]");
      if (!card) return;
      openLightbox(parseInt(card.getAttribute("data-work"), 10) || 0);
    });
  }

  if (lightbox) {
    var lbClose = $("[data-lb-close]", lightbox);
    var lbPrev = $("[data-lb-prev]", lightbox);
    var lbNext = $("[data-lb-next]", lightbox);

    if (lbClose) lbClose.addEventListener("click", closeLightbox);
    if (lbPrev) lbPrev.addEventListener("click", function () { stepLightbox(-1); });
    if (lbNext) lbNext.addEventListener("click", function () { stepLightbox(1); });

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });

    lightbox.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        stepLightbox(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepLightbox(-1);
      }
    });

    var touchStart = null;
    lightbox.addEventListener("touchstart", function (event) {
      if (event.touches.length !== 1) return;
      touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }, { passive: true });

    lightbox.addEventListener("touchend", function (event) {
      if (!touchStart) return;
      var touch = event.changedTouches[0];
      var dx = touch.clientX - touchStart.x;
      var dy = touch.clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        stepLightbox(dx < 0 ? 1 : -1);
      }
    }, { passive: true });

    lightbox.addEventListener("close", function () {
      document.documentElement.classList.remove("lb-open");
    });
  }

  /* ---------------------------------------------------------------- research */

  var researchEl = $('[data-render="research"]');
  if (researchEl && C.research && Array.isArray(C.research.items)) {
    researchEl.innerHTML = C.research.items
      .map(function (item, index) {
        return (
          '<article class="research-card reveal" style="--d:' + (index % 3) * 70 + 'ms">' +
          '<div class="research-card__top">' +
          '<span class="research-card__index" aria-hidden="true">' + pad(index + 1) + "</span>" +
          '<span class="research-card__cat">' + esc(item.category) + "</span>" +
          "</div>" +
          '<h3 class="research-card__title">' + esc(item.title) + "</h3>" +
          '<p class="research-card__desc">' + esc(item.summary) + "</p>" +
          '<div class="research-card__foot">' +
          '<span class="research-card__status">' + esc(item.status) + "</span>" +
          "</div></article>"
        );
      })
      .join("");
  }

  var researchSkillsEl = $('[data-render="research-skills"]');
  if (researchSkillsEl && C.research && Array.isArray(C.research.skills)) {
    researchSkillsEl.innerHTML =
      '<span class="research-skills__label">Methods practised</span>' +
      '<ul class="research-skills__list">' +
      C.research.skills
        .map(function (skill) { return '<li class="tag">' + esc(skill) + "</li>"; })
        .join("") +
      "</ul>";
  }

  /* ---------------------------------------------------------------- experience */

  var xpEl = $('[data-render="experience"]');
  if (xpEl && Array.isArray(C.experience)) {
    xpEl.innerHTML = C.experience
      .map(function (job, index) {
        return (
          '<article class="xp reveal" style="--d:' + index * 60 + 'ms">' +
          '<div class="xp__when">' + esc(job.period) +
          (job.current ? '<span class="xp__now">Current</span>' : "") + "</div>" +
          '<div class="xp__main">' +
          '<h3 class="xp__role">' + esc(job.role) + "</h3>" +
          '<p class="xp__org"><strong>' + esc(job.org) + "</strong>" +
          (job.place ? "<span> · " + esc(job.place) + "</span>" : "") + "</p>" +
          '<ul class="xp__points">' +
          (job.points || [])
            .map(function (point) { return "<li>" + esc(point) + "</li>"; })
            .join("") +
          "</ul></div>" +
          '<ul class="xp__tags">' +
          (job.tags || [])
            .map(function (tag) { return '<li class="tag">' + esc(tag) + "</li>"; })
            .join("") +
          "</ul></article>"
        );
      })
      .join("");
  }

  /* ---------------------------------------------------------------- about */

  var profileEl = $('[data-render="profile"]');
  if (profileEl && C.person) {
    var profile = (C.about && C.about.profile) || {};
    var word = "SHIVAM".split("").map(function (letter) { return "<b>" + letter + "</b>"; }).join("");
    profileEl.innerHTML =
      '<span class="profile__art" aria-hidden="true">' +
        '<img src="assets/img/portrait-snow.webp" alt="" loading="lazy" />' +
        '<span class="profile__word profile__word--outline">' + word + "</span>" +
        '<span class="profile__word profile__word--ink">' + word + "</span>" +
      "</span>" +
      '<div class="profile__id">' +
      '<span class="profile__name">' + esc(C.person.fullName) + "</span>" +
      '<span class="profile__role">' + esc(C.person.role) + "</span>" +
      "</div>" +
      '<div class="profile__rows">' +
      (profile.rows || [])
        .map(function (row) {
          return (
            '<div class="profile__row"><span>' + esc(row.label) + "</span>" +
            "<strong>" + esc(row.value) + "</strong></div>"
          );
        })
        .join("") +
      "</div>";
  }

  var aboutBody = $('[data-render="about-paragraphs"]');
  if (aboutBody && C.about && Array.isArray(C.about.paragraphs)) {
    aboutBody.innerHTML = C.about.paragraphs
      .map(function (paragraph) {
        return '<p class="about__p">' + emphasis(paragraph) + "</p>";
      })
      .join("");
  }

  var statsEl = $('[data-render="stats"]');
  if (statsEl && C.about && Array.isArray(C.about.stats)) {
    statsEl.innerHTML = C.about.stats
      .map(function (stat) {
        return (
          '<div class="stat">' +
          '<span class="stat__value">' + esc(stat.value) + "</span>" +
          '<span class="stat__label">' + esc(stat.label) + "</span>" +
          "</div>"
        );
      })
      .join("");
  }

  /* ---------------------------------------------------------------- capabilities */

  var servicesEl = $('[data-render="services"]');
  if (servicesEl && Array.isArray(C.services)) {
    servicesEl.innerHTML = C.services
      .map(function (service, index) {
        return (
          '<article class="service reveal">' +
          '<span class="service__index" aria-hidden="true">' + pad(index + 1) + "</span>" +
          '<div class="service__main">' +
          '<h3 class="service__title">' + esc(service.title) + "</h3>" +
          '<p class="service__desc">' + esc(service.description) + "</p>" +
          "</div>" +
          '<ul class="service__tags" aria-label="' + esc(service.title) + ' includes">' +
          (service.tags || [])
            .map(function (tag) { return '<li class="tag">' + esc(tag) + "</li>"; })
            .join("") +
          "</ul>" +
          '<span class="service__arrow" aria-hidden="true">&nearr;</span>' +
          "</article>"
        );
      })
      .join("");
  }

  /* ---------------------------------------------------------------- contact */

  var contactActions = $('[data-render="contact-actions"]');
  if (contactActions && C.contact) {
    var contact = C.contact;
    var actionHtml = "";

    if (contact.email) {
      actionHtml +=
        '<a class="btn btn--light" href="mailto:' + esc(contact.email) +
        "?subject=" + encodeURIComponent(contact.emailSubject || "Project enquiry") + '">Email me' +
        '<span class="btn__arrow" aria-hidden="true">&rarr;</span></a>';
    }

    if (contact.whatsapp) {
      var number = String(contact.whatsapp).replace(/[^0-9]/g, "");
      actionHtml +=
        '<a class="btn btn--ghost" href="https://wa.me/' + number +
        "?text=" + encodeURIComponent(contact.whatsappMessage || "") +
        '" target="_blank" rel="noopener">WhatsApp' +
        '<span class="btn__arrow" aria-hidden="true">&nearr;</span></a>';
    }

    contactActions.innerHTML = actionHtml;
  }

  var socialsEl = $('[data-render="socials"]');
  if (socialsEl && C.contact && Array.isArray(C.contact.socials)) {
    socialsEl.innerHTML = C.contact.socials
      .map(function (social) {
        return (
          '<a class="social" href="' + esc(social.href) +
          '" target="_blank" rel="noopener">' + esc(social.label) + "</a>"
        );
      })
      .join("");
  }

  var copyButton = $("[data-copy-email]");
  if (copyButton) {
    copyButton.addEventListener("click", function () {
      var email = C.contact && C.contact.email;
      if (!email) return;

      function fallbackCopy() {
        var textarea = document.createElement("textarea");
        textarea.value = email;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          showToast("Email copied - " + email);
        } catch (err) {
          showToast("Could not copy. Email: " + email);
        }
        document.body.removeChild(textarea);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function () {
          showToast("Email copied - " + email);
        }).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }
    });
  }

  /* ---------------------------------------------------------------- os shell */

  var THEMES = ["glass", "macos", "oneui"];
  var THEME_KEY = "portfolio-os";
  var HASH_APP = {
    main: "home",
    top: "home",
    work: "work",
    research: "research",
    experience: "experience",
    about: "about",
    services: "services",
    contact: "contact"
  };

  var SIZES = {
    macos: {
      home: [1010, 724],
      work: [930, 630],
      research: [900, 630],
      experience: [850, 610],
      about: [890, 630],
      services: [840, 600],
      contact: [830, 600],
      music: [940, 640],
      games: [880, 680],
      watch: [800, 640],
      "screen-time": [880, 630],
      settings: [860, 650],
      assistant: [880, 700]
    },
    oneui: {
      home: [1040, 728],
      work: [960, 640],
      research: [930, 640],
      experience: [880, 620],
      about: [920, 640],
      services: [880, 620],
      contact: [850, 610],
      music: [960, 650],
      games: [900, 680],
      watch: [820, 640],
      "screen-time": [900, 640],
      settings: [880, 660],
      assistant: [900, 720]
    }
  };

  SIZES.glass = Object.assign({}, SIZES.macos, { home: [1010, 570] });

  var phoneMq = window.matchMedia("(max-width: 899px)");
  var os = {
    theme: "macos",
    z: 120,
    phoneApp: null,
    startedAt: Date.now(),
    visits: {},
    timeById: {}
  };
  var osApps = (C.os && Array.isArray(C.os.apps)) ? C.os.apps : [];
  var appById = {};
  osApps.forEach(function (app) { appById[app.id] = app; });

  var wins = {};
  $$(".window[data-app]").forEach(function (el) {
    var id = el.getAttribute("data-app");
    var meta = appById[id] || {
      id: id,
      label: el.getAttribute("data-title") || id,
      short: (el.getAttribute("data-title") || id).charAt(0),
      tone: "#3468f5"
    };
    el.style.setProperty("--tone", meta.tone || "#3468f5");
    el.style.setProperty("--tone2", meta.tone2 || meta.tone || "#3468f5");
    wins[id] = {
      id: id,
      el: el,
      meta: meta,
      open: false,
      min: false,
      max: false,
      opened: false,
      prevRect: null,
      geo: {}
    };
  });

  function isPhone() {
    return phoneMq.matches;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function cssNumber(name, fallback) {
    var value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    return isNaN(value) ? fallback : value;
  }

  function workArea() {
    var top = cssNumber("--bar-h", 0) + 12;
    var bottom = cssNumber("--dock-space", 94) + 8;
    var inset = 14;
    return {
      left: inset,
      top: top,
      right: window.innerWidth - inset,
      bottom: window.innerHeight - bottom
    };
  }

  function currentRect(win) {
    var rect = win.el.getBoundingClientRect();
    return {
      left: Math.round(rect.left),
      top: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    };
  }

  function setRect(win, rect) {
    win.el.style.left = Math.round(rect.left) + "px";
    win.el.style.top = Math.round(rect.top) + "px";
    win.el.style.width = Math.round(rect.width) + "px";
    win.el.style.height = Math.round(rect.height) + "px";
  }

  function openWindows() {
    return Object.keys(wins).filter(function (id) {
      return wins[id].open && !wins[id].min;
    });
  }

  function defaultRect(id) {
    var area = workArea();
    var size = (SIZES[os.theme] || SIZES.macos)[id] || [900, 620];
    var availW = area.right - area.left;
    var availH = area.bottom - area.top;
    var width = Math.min(size[0], Math.max(360, availW - 36));
    var height = Math.min(size[1], Math.max(260, availH - 24));
    var step = (openWindows().length % 5) - 2;
    var left = area.left + (availW - width) / 2 + step * 22;
    var top = area.top + Math.max(0, (availH - height) / 2 - 10) + step * 16;

    return {
      left: clamp(left, area.left + 6, area.right - width - 6),
      top: clamp(top, area.top, Math.max(area.top, area.bottom - height - 6)),
      width: width,
      height: height
    };
  }

  function maxRect() {
    var area = workArea();
    var inset = 10;
    return {
      left: area.left + inset,
      top: area.top,
      width: area.right - area.left - inset * 2,
      height: area.bottom - area.top - inset
    };
  }

  function focusWin(win) {
    os.z += 1;
    win.el.style.zIndex = String(os.z);
  }

  function updateDock() {
    $$(".dock__item").forEach(function (item) {
      var win = wins[item.getAttribute("data-open-app")];
      item.classList.toggle("is-running", !!(win && (win.open || win.min)));
    });
  }

  function openApp(id) {
    var win = wins[id];
    if (!win) return;
    if (isPhone()) {
      openPhoneApp(id);
      return;
    }

    var wasVisible = win.open && !win.min && !win.el.hidden;
    os.visits[id] = (os.visits[id] || 0) + 1;
    win.open = true;
    win.min = false;
    win.el.hidden = false;

    if (!win.opened) {
      setRect(win, defaultRect(id));
      win.opened = true;
    }

    if (!wasVisible) {
      win.el.classList.remove("is-open");
      void win.el.offsetWidth;
    }
    win.el.classList.add("is-open");

    focusWin(win);
    initReveals(win.el);
    updateDock();

    if (id === "assistant" && !isPhone()) {
      checkAssistant();
      if (chatInput) {
        window.setTimeout(function () { chatInput.focus({ preventScroll: true }); }, 60);
      }
    }
  }

  function closeWin(win, hideDelay) {
    win.open = false;
    win.min = false;
    win.max = false;
    win.el.classList.remove("is-open", "is-max");
    var finish = function () {
      if (!win.open) win.el.hidden = true;
    };
    if (reduceMotion.matches) finish();
    else setTimeout(finish, hideDelay || 240);
    updateDock();
  }

  function minimizeWin(win) {
    win.min = true;
    win.el.classList.remove("is-open");
    var finish = function () {
      if (win.min) win.el.hidden = true;
    };
    if (reduceMotion.matches) finish();
    else setTimeout(finish, 240);
    updateDock();
  }

  function toggleMax(win) {
    if (isPhone()) return;
    if (win.max) {
      win.max = false;
      win.el.classList.remove("is-max");
      setRect(win, win.prevRect || defaultRect(win.id));
      win.prevRect = null;
      return;
    }
    win.prevRect = currentRect(win);
    win.max = true;
    win.el.classList.add("is-max");
    setRect(win, maxRect());
  }

  function topWindow() {
    var list = openWindows().filter(function (id) {
      return !wins[id].el.hidden;
    });
    if (!list.length) return null;
    return list.sort(function (a, b) {
      return parseInt(wins[b].el.style.zIndex || "0", 10) - parseInt(wins[a].el.style.zIndex || "0", 10);
    })[0];
  }

  function fitAll() {
    if (isPhone()) return;
    Object.keys(wins).forEach(function (id) {
      var win = wins[id];
      if (!win.open || win.el.hidden) return;
      if (win.max) {
        setRect(win, maxRect());
        return;
      }
      var area = workArea();
      var rect = currentRect(win);
      var width = Math.min(rect.width, area.right - area.left);
      var height = Math.min(rect.height, area.bottom - area.top);
      var left = clamp(rect.left, area.left - width + 140, area.right - 140);

      // Keep the window inside the viewport when the screen gets narrower.
      var rightLimit = area.right - 6;
      if (left + width > rightLimit) {
        var fitted = rightLimit - left;
        if (fitted >= 320) width = fitted;
      }

      setRect(win, {
        left: left,
        top: clamp(rect.top, area.top, Math.max(area.top, area.bottom - 44)),
        width: width,
        height: height
      });
    });
  }

  function scrollToTarget(win, id) {
    var scroller = $(".window__scroll", win.el);
    var target = win.el.querySelector("#" + id);
    if (!scroller || !target) return;
    var offset = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
    scroller.scrollTo({
      top: Math.max(0, offset - 14),
      behavior: reduceMotion.matches ? "auto" : "smooth"
    });
  }

  /* --- phone --- */

  function openPhoneApp(id) {
    var win = wins[id];
    if (!win) return;

    $$(".window.is-phone-open").forEach(function (el) {
      el.classList.remove("is-phone-open");
      var other = wins[el.getAttribute("data-app")];
      if (other && !other.open) el.hidden = true;
    });

    os.phoneApp = id;
    os.visits[id] = (os.visits[id] || 0) + 1;
    win.el.hidden = false;
    win.el.classList.add("is-phone-open");
    document.documentElement.classList.add("phone-app-open");

    var scroller = $(".window__scroll", win.el);
    if (scroller) scroller.scrollTop = 0;

    initReveals(win.el);

    var back = $("[data-win-action='close']", win.el);
    if (back) back.focus({ preventScroll: true });
  }

  function closePhoneApp() {
    $$(".window.is-phone-open").forEach(function (el) {
      el.classList.remove("is-phone-open");
      var win = wins[el.getAttribute("data-app")];
      if (win && !win.open) el.hidden = true;
    });
    os.phoneApp = null;
    document.documentElement.classList.remove("phone-app-open");
    var home = $('[data-render="phone-apps"] [data-open-app]');
    if (home) home.focus({ preventScroll: true });
  }

  /* --- theme --- */

  function applyTheme(theme, persist) {
    os.theme = THEMES.indexOf(theme) > -1 ? theme : ((C.os && C.os.defaultTheme) || "glass");
    document.documentElement.setAttribute("data-theme", os.theme);
    $$("[data-theme-set]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-theme-set") === os.theme));
    });
    if (persist) {
      try { localStorage.setItem(THEME_KEY, os.theme); } catch (err) {}
    }
    fitAll();
  }

  /* --- shell rendering --- */

  var ICONS = {
    house: '<path d="M224,120v96a8,8,0,0,1-8,8H160a8,8,0,0,1-8-8V164a4,4,0,0,0-4-4H108a4,4,0,0,0-4,4v52a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V120a16,16,0,0,1,4.69-11.31l80-80a16,16,0,0,1,22.62,0l80,80A16,16,0,0,1,224,120Z"/>',
    briefcase: '<path d="M152,112a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,112Zm80-40V200a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V72A16,16,0,0,1,40,56H80V48a24,24,0,0,1,24-24h48a24,24,0,0,1,24,24v8h40A16,16,0,0,1,232,72ZM96,56h64V48a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8Zm120,57.61V72H40v41.61A184,184,0,0,0,128,136,184,184,0,0,0,216,113.61Z"/>',
    "magnifying-glass": '<path d="M168,112a56,56,0,1,1-56-56A56,56,0,0,1,168,112Zm61.66,117.66a8,8,0,0,1-11.32,0l-50.06-50.07a88,88,0,1,1,11.32-11.31l50.06,50.06A8,8,0,0,1,229.66,229.66ZM112,184a72,72,0,1,0-72-72A72.08,72.08,0,0,0,112,184Z"/>',
    "chart-line-up": '<path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM200,192H56a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v76.69l34.34-34.35a8,8,0,0,1,11.32,0L128,132.69,172.69,88H144a8,8,0,0,1,0-16h48a8,8,0,0,1,8,8v48a8,8,0,0,1-16,0V99.31l-50.34,50.35a8,8,0,0,1-11.32,0L104,131.31l-40,40V176H200a8,8,0,0,1,0,16Z"/>',
    user: '<path d="M230.93,220a8,8,0,0,1-6.93,4H32a8,8,0,0,1-6.92-12c15.23-26.33,38.7-45.21,66.09-54.16a72,72,0,1,1,73.66,0c27.39,8.95,50.86,27.83,66.09,54.16A8,8,0,0,1,230.93,220Z"/>',
    wrench: '<path d="M232,96a72,72,0,0,1-100.94,66L79,222.22c-.12.14-.26.29-.39.42a32,32,0,0,1-45.26-45.26c.14-.13.28-.27.43-.39L94,124.94a72.07,72.07,0,0,1,83.54-98.78,8,8,0,0,1,3.93,13.19L144,80l5.66,26.35L176,112l40.65-37.52a8,8,0,0,1,13.19,3.93A72.6,72.6,0,0,1,232,96Z"/>',
    "envelope-simple": '<path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-8,144H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z"/>',
    "music-notes": '<path d="M212.92,17.71a7.89,7.89,0,0,0-6.86-1.46l-128,32A8,8,0,0,0,72,56V166.1A36,36,0,1,0,88,196V102.25l112-28V134.1A36,36,0,1,0,216,164V24A8,8,0,0,0,212.92,17.71Z"/>',
    "game-controller": '<path d="M247.44,173.75a.68.68,0,0,0,0-.14L231.05,89.44c0-.06,0-.12,0-.18A60.08,60.08,0,0,0,172,40H83.89a59.88,59.88,0,0,0-59,49.52L8.58,173.61a.68.68,0,0,0,0,.14,36,36,0,0,0,60.9,31.71l.35-.37L109.52,160h37l39.71,45.09c.11.13.23.25.35.37A36.08,36.08,0,0,0,212,216a36,36,0,0,0,35.43-42.25ZM104,112H96v8a8,8,0,0,1-16,0v-8H72a8,8,0,0,1,0-16h8V88a8,8,0,0,1,16,0v8h8a8,8,0,0,1,0,16Zm40-8a8,8,0,0,1,8-8h24a8,8,0,0,1,0,16H152A8,8,0,0,1,144,104Zm84.37,87.47a19.84,19.84,0,0,1-12.9,8.23A20.09,20.09,0,0,1,198,194.31L167.8,160H172a60,60,0,0,0,51-28.38l8.74,45A19.82,19.82,0,0,1,228.37,191.47Z"/>',
    watch: '<path d="M175.3,63.53l-6.24-34.38A16,16,0,0,0,153.32,16H102.68A16,16,0,0,0,86.94,29.15L80.7,63.53a79.9,79.9,0,0,0,0,128.94l6.24,34.38A16,16,0,0,0,102.68,240h50.64a16,16,0,0,0,15.74-13.15l6.24-34.38a79.9,79.9,0,0,0,0-128.94ZM102.68,32h50.64l3.91,21.55a79.75,79.75,0,0,0-58.46,0Zm50.64,192H102.68l-3.91-21.55a79.75,79.75,0,0,0,58.46,0ZM168,136H128a8,8,0,0,1-8-8V88a8,8,0,0,1,16,0v32h32a8,8,0,0,1,0,16Z"/>',
    timer: '<path d="M128,40a96,96,0,1,0,96,96A96.11,96.11,0,0,0,128,40Zm45.66,61.66-40,40a8,8,0,0,1-11.32-11.32l40-40a8,8,0,0,1,11.32,11.32ZM96,16a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,16Z"/>',
    "sliders-horizontal": '<path d="M32,80a8,8,0,0,1,8-8H77.17a28,28,0,0,1,53.66,0H216a8,8,0,0,1,0,16H130.83a28,28,0,0,1-53.66,0H40A8,8,0,0,1,32,80Zm184,88H194.83a28,28,0,0,0-53.66,0H40a8,8,0,0,0,0,16H141.17a28,28,0,0,0,53.66,0H216a8,8,0,0,0,0-16Z"/>',
    "ask-shivam": '<path d="M78 44h100c16.6 0 30 13.4 30 30v100c0 16.6-13.4 30-30 30h-38l-34 22.6c-7.4 4.9-17-.4-17-9.2V204H78c-16.6 0-30-13.4-30-30V74c0-16.6 13.4-30 30-30Z"/><path d="M64 60 46 6l46 22Z"/><path d="M192 60 210 6l-46 22Z"/><path d="M228 176l4.6 12.4 12.4 4.6-12.4 4.6-4.6 12.4-4.6-12.4-12.4-4.6 12.4-4.6Z"/>',
    "chat-circle-dots": '<path d="M128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24ZM84,140a12,12,0,1,1,12-12A12,12,0,0,1,84,140Zm44,0a12,12,0,1,1,12-12A12,12,0,0,1,128,140Zm44,0a12,12,0,1,1,12-12A12,12,0,0,1,172,140Z"/>'
  };

  /* One glyph family everywhere: Phosphor fill icons on the glass squircle. */
  function iconSvg(app) {
    var path = ICONS[app.icon];
    if (!path) return "";
    return '<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false">' + path + "</svg>";
  }

  function toneVars(app) {
    return "--tone:" + esc(app.tone || "#3468f5") +
      ";--tone2:" + esc(app.tone2 || app.tone || "#3468f5");
  }

  function folderIcon(app) {
    var svg = iconSvg(app);
    return '<span class="gfolder" aria-hidden="true">' +
      '<span class="gfolder__float">' +
        '<span class="gfolder__glow"></span>' +
        '<span class="gfolder__front">' +
          '<span class="gfolder__badge">' +
            (svg || esc(app.short || (app.label || "?").charAt(0))) +
          '</span>' +
        '</span>' +
      '</span>' +
    '</span>';
  }

  Object.keys(wins).forEach(function (id) {
    var ico = wins[id].el.querySelector(".window__icon");
    if (ico) ico.innerHTML = iconSvg(wins[id].meta);
  });

  var menuEl = $('[data-render="menu"]');
  if (menuEl) {
    // Menu bar lists only the core portfolio apps; utilities stay in the dock,
    // app menu and Spotlight so the bar never crowds the right-hand controls.
    menuEl.innerHTML = osApps.filter(function (app) {
      return !app.fun;
    }).map(function (app) {
      return '<button class="menubar__item" type="button" data-open-app="' + esc(app.id) + '">' +
        esc(app.menuLabel || app.label) + "</button>";
    }).join("");
  }

  var dockEl = $('[data-render="dock"]');
  if (dockEl) {
    dockEl.innerHTML = osApps.map(function (app) {
      return '<button class="dock__item" type="button" data-open-app="' + esc(app.id) +
        '" style="' + toneVars(app) + '" aria-label="Open ' + esc(app.label) + '">' +
        folderIcon(app) +
        '<span class="dock__label" data-label="' + esc(app.label) + '" aria-hidden="true">' +
          esc(app.label) + "</span>" +
        '<span class="dock__run" aria-hidden="true"></span></button>';
    }).join("");
  }

  var iconsEl = $('[data-render="desktop-icons"]');
  if (iconsEl) {
    iconsEl.innerHTML = osApps.filter(function (app) {
      return app.id !== "home" && !app.fun;
    }).map(function (app) {
      return '<button class="dicon" type="button" data-open-app="' + esc(app.id) +
        '" style="' + toneVars(app) + '">' +
        folderIcon(app) +
        '<span class="dicon__label" data-label="' + esc(app.label) + '">' + esc(app.label) + "</span></button>";
    }).join("");
  }

  var widgetAppsEl = $('[data-render="widget-apps"]');
  if (widgetAppsEl) {
    widgetAppsEl.innerHTML = ["work", "music", "games", "settings"].map(function (id) {
      var app = appById[id];
      if (!app) return "";
      return '<button class="quick__app" type="button" data-open-app="' + esc(id) +
        '" style="' + toneVars(app) + '" aria-label="Open ' + esc(app.label) + '">' +
        folderIcon(app) + "<span>" + esc(app.label) + "</span></button>";
    }).join("");
  }

  function phoneButton(app) {
    return '<button class="papp" type="button" data-open-app="' + esc(app.id) +
      '" style="' + toneVars(app) + '" aria-label="Open ' + esc(app.label) + '">' +
      folderIcon(app) + "<span>" + esc(app.label) + "</span></button>";
  }

  var phoneAppsEl = $('[data-render="phone-apps"]');
  if (phoneAppsEl) {
    phoneAppsEl.innerHTML = osApps.filter(function (app) {
      return app.id !== "home";
    }).map(phoneButton).join("");
  }

  var phoneDockEl = $('[data-render="phone-dock"]');
  if (phoneDockEl) {
    var dockIds = (C.os && Array.isArray(C.os.phoneDock)) ? C.os.phoneDock : [];
    phoneDockEl.innerHTML = dockIds.map(function (id) {
      return appById[id] ? phoneButton(appById[id]) : "";
    }).join("");
  }

  /* --- control center date --- */

  function renderCalendar() {
    var now = new Date();
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    $$("[data-cc-date]").forEach(function (el) {
      el.textContent = weekdays[now.getDay()] + " " + now.getDate() + " " + months[now.getMonth()];
    });

    var fullMonths = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    var fullWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var today = now.getDate();
    $$("[data-cal-month]").forEach(function (el) { el.textContent = fullMonths[now.getMonth()]; });
    $$("[data-cal-date]").forEach(function (el) { el.textContent = String(today); });
    $$("[data-cal-weekday]").forEach(function (el) { el.textContent = fullWeekdays[now.getDay()]; });

    var grid = $("[data-cal-grid]");
    if (!grid) return;
    var offset = (new Date(now.getFullYear(), now.getMonth(), 1).getDay() + 6) % 7;
    var totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    var cells = [];
    for (var i = 0; i < offset; i += 1) {
      cells.push('<span class="cal__cell cal__cell--empty"></span>');
    }
    for (var d = 1; d <= totalDays; d += 1) {
      cells.push('<span class="cal__cell' + (d === today ? " is-today" : "") + '">' + d + "</span>");
    }
    while (cells.length % 7 !== 0) {
      cells.push('<span class="cal__cell cal__cell--empty"></span>');
    }
    grid.innerHTML = cells.join("");
  }

  renderCalendar();
  window.setInterval(renderCalendar, 60000);

  /* --- control center --- */

  var ccButton = $("[data-control-center]");
  var ccPanel = $("[data-control-panel]");

  function setControlCenter(open) {
    if (!ccButton || !ccPanel) return;
    ccPanel.hidden = !open;
    ccButton.setAttribute("aria-expanded", String(!!open));
  }

  if (ccButton && ccPanel) {
    ccButton.addEventListener("click", function (event) {
      event.stopPropagation();
      setControlCenter(ccPanel.hidden);
    });
    var ccClose = $("[data-cc-close]");
    if (ccClose) {
      ccClose.addEventListener("click", function () { setControlCenter(false); });
    }
    document.addEventListener("click", function (event) {
      if (ccPanel.hidden) return;
      if (event.target.closest("[data-control-panel]") || event.target.closest("[data-control-center]")) return;
      setControlCenter(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !ccPanel.hidden) {
        event.stopImmediatePropagation();
        setControlCenter(false);
      }
    });
  }

  /* --- app menu --- */

  var appMenuButton = $("[data-appmenu-toggle]");
  var appMenu = $("[data-app-menu]");

  function setAppMenu(open) {
    if (!appMenuButton || !appMenu) return;
    appMenu.hidden = !open;
    appMenuButton.setAttribute("aria-expanded", String(!!open));
    if (open) {
      if (ccPanel && !ccPanel.hidden) setControlCenter(false);
      var first = appMenu.querySelector("button");
      if (first) first.focus();
    }
  }

  function minimizeAllWindows() {
    Object.keys(wins).forEach(function (id) {
      var win = wins[id];
      if (win.open && !win.min && !win.el.hidden) minimizeWin(win);
    });
  }

  function menuAction(action) {
    setAppMenu(false);
    if (action === "music") {
      openApp("music");
      playTrack(0);
    } else if (action === "customize") {
      openApp("settings");
    } else if (action === "desktop") {
      minimizeAllWindows();
    } else if (action === "spotlight") {
      openSpotlight();
    }
  }

  if (appMenuButton && appMenu) {
    appMenuButton.addEventListener("click", function (event) {
      event.stopPropagation();
      setAppMenu(appMenu.hidden);
    });

    appMenu.addEventListener("click", function (event) {
      var appItem = event.target.closest("[data-menu-app]");
      if (appItem) {
        setAppMenu(false);
        openApp(appItem.getAttribute("data-menu-app"));
        return;
      }
      var actionItem = event.target.closest("[data-menu-action]");
      if (actionItem) {
        event.stopPropagation();
        menuAction(actionItem.getAttribute("data-menu-action"));
      }
    });

    appMenu.addEventListener("keydown", function (event) {
      var buttons = $$("button", appMenu);
      var index = buttons.indexOf(document.activeElement);
      if (event.key === "ArrowDown") {
        event.preventDefault();
        buttons[(index + 1) % buttons.length].focus();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        buttons[(index - 1 + buttons.length) % buttons.length].focus();
      } else if (event.key === "Escape") {
        event.stopPropagation();
        setAppMenu(false);
        appMenuButton.focus();
      } else if (event.key === "Tab") {
        setAppMenu(false);
      }
    });

    document.addEventListener("click", function (event) {
      if (appMenu.hidden) return;
      if (event.target.closest("[data-app-menu]") || event.target.closest("[data-appmenu-toggle]")) return;
      setAppMenu(false);
    });
  }

  /* --- spotlight --- */

  var spotRoot = $("[data-spotlight]");
  var spotInput = $("[data-spot-input]");
  var spotList = $("[data-spot-list]");
  var spotItems = [];
  var spotResults = [];
  var spotIndex = 0;
  var spotReturnFocus = null;

  function buildSpotlight() {
    var apps = osApps.map(function (app) {
      return {
        label: app.label,
        kind: "App",
        icon: app.icon,
        run: function () {
          if (isPhone()) openPhoneApp(app.id);
          else openApp(app.id);
        }
      };
    });

    var actions = [
      { label: "Play devotional playlist", kind: "Music", icon: "music-notes", run: function () {
        openApp("music");
        playTrack(0);
      } },
      { label: "Ask Shivam anything", kind: "Assistant", icon: "ask-shivam", run: function () {
        openApp("assistant");
      } },
      { label: "Customize look", kind: "Action", icon: "sliders-horizontal", run: function () {
        openApp("settings");
      } },
      { label: "Show desktop", kind: "Action", icon: "house", run: minimizeAllWindows },
      { label: "Switch to Glass", kind: "Theme", icon: "sliders-horizontal", run: function () {
        applyTheme("glass", true);
      } },
      { label: "Switch to macOS", kind: "Theme", icon: "sliders-horizontal", run: function () {
        applyTheme("macos", true);
      } },
      { label: "Switch to One UI", kind: "Theme", icon: "sliders-horizontal", run: function () {
        applyTheme("oneui", true);
      } },
      { label: "Email Shivam", kind: "Contact", icon: "envelope-simple", run: function () {
        var email = (C.contact && C.contact.email) || "";
        if (email) window.location.href = "mailto:" + email;
      } }
    ];

    spotItems = apps.concat(actions);
  }

  function renderSpotlight() {
    if (!spotList) return;
    var query = spotInput.value.trim().toLowerCase();
    spotResults = spotItems.filter(function (item) {
      return !query || item.label.toLowerCase().indexOf(query) > -1 || item.kind.toLowerCase().indexOf(query) > -1;
    });
    if (spotIndex >= spotResults.length) spotIndex = 0;
    if (!spotResults.length) {
      spotList.innerHTML = '<li class="spotlight__empty">No matches for \u201c' + esc(spotInput.value.trim()) + '\u201d</li>';
      spotInput.removeAttribute("aria-activedescendant");
      return;
    }
    spotList.innerHTML = spotResults.map(function (item, index) {
      var active = index === spotIndex;
      return '<li class="spotlight__item' + (active ? " is-active" : "") + '" role="option" id="spot-opt-' + index +
        '" aria-selected="' + String(active) + '" data-spot-index="' + index + '">' +
        '<span class="spotlight__glyph" aria-hidden="true">' + iconSvg(item) + "</span>" +
        '<span class="spotlight__text">' + esc(item.label) + "</span>" +
        '<span class="spotlight__kind">' + esc(item.kind) + "</span></li>";
    }).join("");
    spotInput.setAttribute("aria-activedescendant", "spot-opt-" + spotIndex);
  }

  function moveSpot(delta) {
    if (!spotResults.length) return;
    spotIndex = (spotIndex + delta + spotResults.length) % spotResults.length;
    renderSpotlight();
    var active = spotList.querySelector(".spotlight__item.is-active");
    if (active) active.scrollIntoView({ block: "nearest" });
  }

  function runSpot(index) {
    var item = spotResults[index];
    if (!item) return;
    closeSpotlight();
    item.run();
  }

  function openSpotlight() {
    if (!spotRoot || isPhone()) return;
    setAppMenu(false);
    if (ccPanel && !ccPanel.hidden) setControlCenter(false);
    spotReturnFocus = document.activeElement;
    spotRoot.hidden = false;
    spotInput.value = "";
    spotIndex = 0;
    renderSpotlight();
    spotInput.focus();
  }

  function closeSpotlight() {
    if (!spotRoot || spotRoot.hidden) return;
    spotRoot.hidden = true;
    if (spotReturnFocus && typeof spotReturnFocus.focus === "function") {
      spotReturnFocus.focus({ preventScroll: true });
    }
    spotReturnFocus = null;
  }

  if (spotRoot && spotInput && spotList) {
    buildSpotlight();
    renderSpotlight();

    spotInput.addEventListener("input", function () {
      spotIndex = 0;
      renderSpotlight();
    });

    spotRoot.addEventListener("click", function (event) {
      if (event.target === spotRoot) closeSpotlight();
    });

    spotList.addEventListener("click", function (event) {
      var item = event.target.closest("[data-spot-index]");
      if (item) runSpot(Number(item.getAttribute("data-spot-index")));
    });

    var spotOpeners = $$("[data-spot-open]");
    spotOpeners.forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        openSpotlight();
      });
    });

    document.addEventListener("keydown", function (event) {
      var key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "k") {
        event.preventDefault();
        if (spotRoot.hidden) openSpotlight();
        else closeSpotlight();
        return;
      }
      if (spotRoot.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeSpotlight();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        moveSpot(1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        moveSpot(-1);
      } else if (event.key === "Enter") {
        event.preventDefault();
        runSpot(spotIndex);
      } else if (event.key === "Tab") {
        event.preventDefault();
      }
    }, true);
  }

  /* --- wiring --- */

  $$("[data-theme-set]").forEach(function (button) {
    button.addEventListener("click", function () {
      applyTheme(button.getAttribute("data-theme-set"), true);
    });
  });

  function enterJourneyFromHome(appId) {
    if (appId !== "home" || isPhone() || journey.on) return false;
    if (journey.started || tourCfg.enabled === false) return false;
    if (reduceMotion.matches || tourOrder.length < 2) return false;
    startJourney();
    return journey.on;
  }

  document.addEventListener("click", function (event) {
    var opener = event.target.closest("[data-open-app]");
    if (opener) {
      event.preventDefault();
      var openId = opener.getAttribute("data-open-app");
      if (!enterJourneyFromHome(openId)) openApp(openId);
      return;
    }

    var link = event.target.closest('a[href^="#"]');
    if (!link) return;
    var href = link.getAttribute("href");
    if (!href || href === "#") return;
    var appId = HASH_APP[href.slice(1)];
    if (!appId) return;
    event.preventDefault();
    if (isPhone()) {
      openPhoneApp(appId);
    } else if (enterJourneyFromHome(appId)) {
      return;
    } else {
      openApp(appId);
      scrollToTarget(wins[appId], href.slice(1));
    }
  });

  $$("[data-win-action]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      var shell = button.closest(".window");
      var win = shell ? wins[shell.getAttribute("data-app")] : null;
      if (!win) return;
      if (isPhone() && shell.classList.contains("is-phone-open")) {
        closePhoneApp();
        return;
      }
      var action = button.getAttribute("data-win-action");
      if (action === "close") closeWin(win);
      else if (action === "min") minimizeWin(win);
      else if (action === "max") toggleMax(win);
    });
  });

  Object.keys(wins).forEach(function (id) {
    wins[id].el.addEventListener("pointerdown", function () {
      if (!isPhone() && wins[id].open) focusWin(wins[id]);
    });
  });

  $$(".window__bar[data-drag]").forEach(function (bar) {
    var shell = bar.closest(".window");
    var win = shell ? wins[shell.getAttribute("data-app")] : null;
    var lastTap = { t: 0, x: 0, y: 0 };
    if (!win) return;

    bar.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (event.target.closest("button") || isPhone()) return;

      var now = Date.now();
      var doubleTap =
        now - lastTap.t < 320 &&
        Math.abs(event.clientX - lastTap.x) < 9 &&
        Math.abs(event.clientY - lastTap.y) < 9;
      lastTap.t = now;
      lastTap.x = event.clientX;
      lastTap.y = event.clientY;

      if (doubleTap) {
        toggleMax(win);
        return;
      }
      if (win.max) return;
      focusWin(win);

      var startX = event.clientX;
      var startY = event.clientY;
      var rect = currentRect(win);
      win.el.classList.add("is-dragging");
      try { bar.setPointerCapture(event.pointerId); } catch (err) {}

      function onMove(moveEvent) {
        var area = workArea();
        var left = clamp(rect.left + moveEvent.clientX - startX, area.left - rect.width + 220, area.right - 220);
        var top = clamp(rect.top + moveEvent.clientY - startY, area.top, Math.max(area.top, area.bottom - 40));
        win.el.style.left = Math.round(left) + "px";
        win.el.style.top = Math.round(top) + "px";
      }

      function onUp() {
        bar.removeEventListener("pointermove", onMove);
        bar.removeEventListener("pointerup", onUp);
        bar.removeEventListener("pointercancel", onUp);
        win.el.classList.remove("is-dragging");
        win.geo[os.theme] = currentRect(win);
      }

      bar.addEventListener("pointermove", onMove);
      bar.addEventListener("pointerup", onUp);
      bar.addEventListener("pointercancel", onUp);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (lightbox && lightbox.open) return;
    if (ccPanel && !ccPanel.hidden) return;
    if (journey.on) return;
    if (isPhone()) {
      if (os.phoneApp) {
        event.preventDefault();
        closePhoneApp();
      }
      return;
    }
    var id = topWindow();
    if (id && wins[id].open) closeWin(wins[id]);
  });

  var resizeQueued = false;
  window.addEventListener("resize", function () {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(function () {
      resizeQueued = false;
      if (isPhone()) return;
      fitAll();
    });
  });

  function onBreakpoint() {
    if (isPhone()) {
      $$(".window.is-phone-open").forEach(function (el) { el.classList.remove("is-phone-open"); });
      os.phoneApp = null;
      document.documentElement.classList.remove("phone-app-open");
      return;
    }
    $$(".window.is-phone-open").forEach(function (el) {
      el.classList.remove("is-phone-open");
      var win = wins[el.getAttribute("data-app")];
      if (win && !win.open) el.hidden = true;
    });
    os.phoneApp = null;
    document.documentElement.classList.remove("phone-app-open");
    fitAll();
  }

  if (phoneMq.addEventListener) phoneMq.addEventListener("change", onBreakpoint);
  else if (phoneMq.addListener) phoneMq.addListener(onBreakpoint);

  var savedTheme = null;
  try { savedTheme = localStorage.getItem(THEME_KEY); } catch (err) {}
  applyTheme(savedTheme || (C.os && C.os.defaultTheme) || "macos", false);

  function tickClock() {
    var now = new Date();
    var label = pad(now.getHours()) + ":" + pad(now.getMinutes());
    $$("[data-clock], [data-clock-secondary], [data-clock-phone]").forEach(function (el) {
      el.textContent = label;
    });
  }

  tickClock();
  window.setInterval(tickClock, 15000);

  if (!isPhone()) openApp("home");

  /* ---------------------------------------------------------------- intro splash */

  var splash = $("#splash");
  if (splash) {
    if (reduceMotion.matches) {
      splash.hidden = true;
    } else {
      var splashFinished = false;

      var onSplashKey = function (event) {
        if (splashFinished) return;
        if (event.key === "Escape" || event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
          event.preventDefault();
          event.stopPropagation();
          skipSplash();
        }
      };

      function finishSplash() {
        if (splashFinished) return;
        splashFinished = true;
        splash.hidden = true;
        document.removeEventListener("keydown", onSplashKey, true);
        startJourney();
      }

      function skipSplash() {
        if (splashFinished) return;
        splash.classList.add("is-skipped");
        window.setTimeout(finishSplash, 340);
      }

      splash.addEventListener("click", skipSplash);
      splash.addEventListener("animationend", function (event) {
        if (event.target === splash) finishSplash();
      });
      document.addEventListener("keydown", onSplashKey, true);
      window.setTimeout(finishSplash, 3200);
    }
  }

  /* ---------------------------------------------------------------- one-page journey */
  /* The portfolio plays as one long page: every chapter window is stacked
     full-bleed and the visitor simply scrolls the story top to bottom.
     Nothing auto-advances — scroll, clicks and esc never switch chapters.
     The only controls are the two HUD buttons; the cursor adds a soft
     parallax drift and a trail of warm ash embers. */

  var tourCfg = (C.os && C.os.tour) || {};
  var tourOrder = (tourCfg.order || []).filter(function (id) { return !!wins[id]; });
  var journey = {
    on: false,
    started: false,
    index: 0,
    motion: true
  };
  var tourbar = $("#tourbar");
  var tourLabelEl = $("[data-tour-label]");
  var tourCount = $("[data-tour-count]");
  var tourFill = tourbar && $(".tourbar__fill", tourbar);
  var prevBtn = tourbar && $("[data-journey='prev']", tourbar);
  var nextBtn = tourbar && $("[data-journey='next']", tourbar);
  var motionBtn = tourbar && $("[data-journey='motion']", tourbar);
  var ashLayer = $("#ash");
  var desktopEl = $("#main");
  var ambientTimer = null;
  var journeyEls = [];
  var lastPuff = 0;

  function paintJourney() {
    if (!tourbar) return;
    var activeId = tourOrder[journey.index];
    var activeWin = wins[activeId];
    if (tourLabelEl) {
      tourLabelEl.textContent = (activeWin && activeWin.meta && activeWin.meta.label) || activeId;
    }
    if (tourCount) tourCount.textContent = pad(journey.index + 1) + " / " + pad(tourOrder.length);
    if (prevBtn) prevBtn.disabled = journey.index <= 0;
    if (nextBtn) nextBtn.disabled = journey.index >= tourOrder.length - 1;
  }

  var ashWarm = ["rgba(255,190,110,0.95)", "rgba(255,150,100,0.95)", "rgba(255,232,190,0.9)"];
  var ashCool = ["rgba(170,200,255,0.9)", "rgba(210,225,255,0.95)"];
  var ashDrifts = ["ash-drift-l", "ash-drift-c", "ash-drift-r"];

  function ashSpeck(className, x, y, size, duration, delay, drift, color) {
    var p = document.createElement("span");
    p.className = "ash__p" + (className ? " " + className : "");
    p.style.left = Math.round(x) + "px";
    p.style.top = Math.round(y) + "px";
    p.style.setProperty("--c", color);
    p.style.setProperty("--s", size.toFixed(1) + "px");
    p.style.setProperty("--d", duration.toFixed(2) + "s");
    p.style.setProperty("--delay", delay.toFixed(2) + "s");
    p.style.animationName = drift;
    ashLayer.appendChild(p);
    return p;
  }

  function removeAshLater(node, ms) {
    window.setTimeout(function () {
      if (node.parentNode) node.parentNode.removeChild(node);
    }, ms);
  }

  // the journey opens with the whole screen burning to embers
  function ashBurst() {
    if (!ashLayer || reduceMotion.matches || !journey.motion) return;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var count = Math.round(Math.min(160, Math.max(90, (vw * vh) / 11000)));
    var spawned = [];
    for (var i = 0; i < count; i++) {
      var ember = i % 13 === 0;
      var color = i % 5 === 0 ? ashCool[i % ashCool.length] : ashWarm[i % ashWarm.length];
      spawned.push(ashSpeck(ember ? "ash__p--ember" : "",
        Math.random() * vw,
        vh * 0.08 + Math.random() * vh * 0.96,
        ember ? 9 + Math.random() * 5 : 3 + Math.random() * 5,
        1.5 + Math.random() * 1.3,
        Math.random() * 0.3,
        ashDrifts[i % 3],
        color
      ));
    }
    var veil = document.createElement("span");
    veil.className = "ash__veil";
    ashLayer.appendChild(veil);
    spawned.push(veil);
    window.setTimeout(function () {
      spawned.forEach(function (n) {
        if (n.parentNode) n.parentNode.removeChild(n);
      });
    }, 3200);
  }

  // drifting past a chapter boundary stirs up a small ember cloud
  function ashPuff() {
    if (!ashLayer || reduceMotion.matches || !journey.motion) return;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var count = Math.round(Math.min(64, Math.max(36, (vw * vh) / 26000)));
    for (var i = 0; i < count; i++) {
      var ember = i % 9 === 0;
      var p = ashSpeck(ember ? "ash__p--ember" : "",
        Math.random() * vw,
        vh * 0.15 + Math.random() * vh * 0.85,
        ember ? 7 + Math.random() * 4 : 2.5 + Math.random() * 4,
        1.4 + Math.random() * 1.2,
        Math.random() * 0.25,
        ashDrifts[i % 3],
        i % 5 === 0 ? ashCool[i % ashCool.length] : ashWarm[i % ashWarm.length]
      );
      removeAshLater(p, 3000);
    }
  }

  // faint embers keep drifting across the screen for the whole journey
  function ashAmbient() {
    if (!ashLayer || reduceMotion.matches || !journey.on || !journey.motion) return;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    for (var i = 0; i < 2; i++) {
      var p = ashSpeck("ash__p--ambient",
        Math.random() * vw,
        vh * 0.72 + Math.random() * vh * 0.3,
        1.6 + Math.random() * 2.2,
        2.6 + Math.random() * 1.4,
        0,
        "ash-ambient",
        i === 0 && Math.random() < 0.3 ? ashCool[0] : ashWarm[i % ashWarm.length]
      );
      removeAshLater(p, 4300);
    }
  }

  /* cursor: parallax vars + warm follower glow + ember trail */

  var plx = { tx: 0, ty: 0, cx: 0, cy: 0, raf: null };
  function plxLoop() {
    plx.cx += (plx.tx - plx.cx) * 0.07;
    plx.cy += (plx.ty - plx.cy) * 0.07;
    var rootStyle = document.documentElement.style;
    rootStyle.setProperty("--plx-x", plx.cx.toFixed(4));
    rootStyle.setProperty("--plx-y", plx.cy.toFixed(4));
    if (Math.abs(plx.tx - plx.cx) > 0.0008 || Math.abs(plx.ty - plx.cy) > 0.0008) {
      plx.raf = window.requestAnimationFrame(plxLoop);
    } else {
      plx.raf = null;
    }
  }

  var followEl = null;
  var follow = { x: 0, y: 0, tx: 0, ty: 0, on: false, raf: null };
  function followLoop() {
    follow.x += (follow.tx - follow.x) * 0.14;
    follow.y += (follow.ty - follow.y) * 0.14;
    if (followEl) {
      followEl.style.transform = "translate3d(" + follow.x.toFixed(1) + "px," + follow.y.toFixed(1) + "px,0)";
    }
    var settled = Math.abs(follow.tx - follow.x) < 0.4 && Math.abs(follow.ty - follow.y) < 0.4;
    if (follow.on || !settled) {
      follow.raf = window.requestAnimationFrame(followLoop);
    } else {
      follow.raf = null;
      if (followEl) followEl.classList.remove("is-on");
    }
  }

  var lastTrailAt = 0;
  document.addEventListener("mousemove", function (event) {
    if (!journey.on || !journey.motion || reduceMotion.matches) return;
    plx.tx = event.clientX / window.innerWidth - 0.5;
    plx.ty = event.clientY / window.innerHeight - 0.5;
    if (!plx.raf) plx.raf = window.requestAnimationFrame(plxLoop);

    follow.tx = event.clientX;
    follow.ty = event.clientY;
    if (!follow.on) {
      follow.on = true;
      follow.x = follow.tx;
      follow.y = follow.ty;
      if (followEl) followEl.classList.add("is-on");
    }
    if (!follow.raf) follow.raf = window.requestAnimationFrame(followLoop);

    var now = Date.now();
    if (now - lastTrailAt < 34) return;
    lastTrailAt = now;
    for (var s = 0; s < 2; s++) {
      var a = Math.random() * Math.PI * 2;
      var r = 3 + Math.random() * 18;
      var big = Math.random() < 0.3;
      var p = ashSpeck("ash__p--trail" + (big ? " ash__p--ember" : ""),
        event.clientX + Math.cos(a) * r,
        event.clientY + Math.sin(a) * r,
        big ? 5 + Math.random() * 4.5 : 2.4 + Math.random() * 3.6,
        1.1 + Math.random() * 1.1,
        s === 0 ? 0 : 0.08,
        "ash-cursor",
        Math.random() < 0.22 ? ashCool[0] : ashWarm[(Math.random() * ashWarm.length) | 0]
      );
      p.style.setProperty("--tx", (Math.random() * 56 - 28).toFixed(0) + "px");
      removeAshLater(p, 2600);
    }
  }, { passive: true });

  document.addEventListener("mouseout", function (event) {
    if (!event.relatedTarget) follow.on = false;
  });

  /* scrolling the page moves the story — chapters never move themselves */

  function chapterTop(i) {
    return journeyEls[i].getBoundingClientRect().top + (window.scrollY || 0);
  }

  function goJourney(i) {
    if (!journey.on || !journeyEls.length) return;
    i = Math.max(0, Math.min(tourOrder.length - 1, i));
    window.scrollTo({
      top: chapterTop(i),
      behavior: reduceMotion.matches ? "auto" : "smooth"
    });
  }

  var spyTicking = false;
  function journeySpy() {
    if (spyTicking) return;
    spyTicking = true;
    window.requestAnimationFrame(function () {
      spyTicking = false;
      if (!journey.on) return;
      var y = window.scrollY || 0;
      var probe = y + window.innerHeight * 0.5;
      var idx = 0;
      for (var i = 0; i < journeyEls.length; i++) {
        if (journeyEls[i].offsetTop <= probe) idx = i;
      }
      if (idx !== journey.index) {
        journey.index = idx;
        paintJourney();
        var now = Date.now();
        if (now - lastPuff > 1400) {
          lastPuff = now;
          ashPuff();
        }
      }
      if (tourFill) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
        tourFill.style.transform = "scaleX(" + progress.toFixed(4) + ")";
      }
    });
  }

  function startJourney() {
    if (tourCfg.enabled === false) return;
    if (journey.started || journey.on) return;
    if (isPhone() || reduceMotion.matches) return;
    if (tourOrder.length < 2) return;

    journey.started = true;
    journey.on = true;
    journey.index = 0;

    Object.keys(wins).forEach(function (id) {
      if (tourOrder.indexOf(id) === -1 && wins[id].open) closeWin(wins[id], 200);
    });

    journeyEls = tourOrder.map(function (id) { return wins[id].el; });

    tourOrder.forEach(function (id, i) {
      var win = wins[id];
      if (desktopEl) desktopEl.appendChild(win.el);
      window.setTimeout(function () {
        win.open = true;
        win.min = false;
        win.max = false;
        win.el.hidden = false;
        if (!win.opened) {
          setRect(win, defaultRect(id));
          win.opened = true;
        }
        win.el.classList.remove("is-open");
        void win.el.offsetWidth;
        win.el.classList.add("is-open");
        initReveals(win.el);
        updateDock();
      }, i * 110);
    });

    document.documentElement.classList.add("is-journey");
    if (tourbar) tourbar.hidden = false;

    if (ashLayer && !followEl) {
      followEl = document.createElement("span");
      followEl.className = "ash__follow";
      followEl.setAttribute("aria-hidden", "true");
      ashLayer.appendChild(followEl);
    }

    if (journey.motion) {
      ashBurst();
      clearInterval(ambientTimer);
      ambientTimer = window.setInterval(ashAmbient, 1500);
    }

    window.scrollTo(0, 0);
    paintJourney();
    journeySpy();
    // windows open on a stagger; re-measure once the stack has settled
    window.setTimeout(function () {
      if (!journey.on) return;
      paintJourney();
      journeySpy();
    }, tourOrder.length * 110 + 120);
    window.addEventListener("scroll", journeySpy, { passive: true });
    window.addEventListener("resize", journeySpy);
  }

  function stopJourney() {
    if (!journey.on) return;
    journey.on = false;
    clearInterval(ambientTimer);
    ambientTimer = null;
    document.documentElement.classList.remove("is-journey");
    document.documentElement.style.setProperty("--plx-x", "0");
    document.documentElement.style.setProperty("--plx-y", "0");
    if (tourbar) tourbar.hidden = true;
    window.removeEventListener("scroll", journeySpy);
    window.removeEventListener("resize", journeySpy);
  }

  function setJourneyMotion(on) {
    journey.motion = on;
    document.documentElement.classList.toggle("motion-off", !on);
    if (motionBtn) {
      motionBtn.setAttribute("aria-pressed", on ? "true" : "false");
      motionBtn.setAttribute("aria-label", on ? "Turn animation off" : "Turn animation on");
      motionBtn.title = on ? "Animation on" : "Animation off";
    }
    if (!on) {
      clearInterval(ambientTimer);
      ambientTimer = null;
      if (ashLayer) {
        Array.prototype.slice.call(ashLayer.children).forEach(function (node) {
          if (node !== followEl) ashLayer.removeChild(node);
        });
      }
      follow.on = false;
      if (followEl) followEl.classList.remove("is-on");
      plx.tx = plx.ty = plx.cx = plx.cy = 0;
      document.documentElement.style.setProperty("--plx-x", "0");
      document.documentElement.style.setProperty("--plx-y", "0");
    } else if (journey.on) {
      clearInterval(ambientTimer);
      ambientTimer = window.setInterval(ashAmbient, 1500);
    }
  }

  function exitJourney() {
    if (!journey.on) return;
    var els = journeyEls.slice();
    els.forEach(function (el) {
      var win = wins[el.getAttribute("data-app")];
      if (!win) return;
      win.open = false;
      win.min = false;
      win.max = false;
      win.el.classList.remove("is-open", "is-max");
      win.el.hidden = true;
    });
    stopJourney();
    journey.started = false;
    window.scrollTo(0, 0);
    updateDock();
  }

  if (tourbar) {
    tourbar.addEventListener("click", function (event) {
      if (!journey.on) return;
      if (event.target.closest("[data-journey='home']")) {
        window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
      } else if (event.target.closest("[data-journey='prev']")) goJourney(journey.index - 1);
      else if (event.target.closest("[data-journey='next']")) goJourney(journey.index + 1);
      else if (event.target.closest("[data-journey='motion']")) setJourneyMotion(!journey.motion);
      else if (event.target.closest("[data-journey='desktop']")) exitJourney();
    });
  }

  if (phoneMq.addEventListener) {
    phoneMq.addEventListener("change", function () {
      if (isPhone()) stopJourney();
    });
  }

  /* ---------------------------------------------------------------- look & feel */

  var LOOK_KEY = "portfolio-os-look";
  var look = { wall: "none", accent: "#3468f5", alpha: false };

  function loadLook() {
    try {
      var raw = localStorage.getItem(LOOK_KEY);
      if (!raw) return { wall: "none", accent: "#3468f5", alpha: false };
      var parsed = JSON.parse(raw) || {};
      return {
        wall: parsed.wall || "none",
        accent: parsed.accent || "#3468f5",
        alpha: !!parsed.alpha
      };
    } catch (err) {
      return { wall: "none", accent: "#3468f5", alpha: false };
    }
  }

  function applyLook(next, persist) {
    look = {
      wall: next.wall || "none",
      accent: next.accent || "#3468f5",
      alpha: !!next.alpha
    };
    var root = document.documentElement;
    root.setAttribute("data-wall", look.wall);
    root.setAttribute("data-alpha", look.alpha ? "reduced" : "full");
    root.style.setProperty("--accent", look.accent);

    $$("[data-custom-wall] [data-wall]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-wall") === look.wall));
    });
    $$("[data-custom-accent] [data-accent]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-accent") === look.accent));
    });
    $$("[data-custom-alpha]").forEach(function (alphaBtn) {
      alphaBtn.setAttribute("aria-checked", String(look.alpha));
    });

    if (persist) {
      try { localStorage.setItem(LOOK_KEY, JSON.stringify(look)); } catch (err) {}
    }
  }

  applyLook(loadLook(), false);

  /* ---------------------------------------------------------------- music */

  var musicData = (C.music && Array.isArray(C.music.tracks)) ? C.music : { artist: "Devotional", tracks: [] };
  var musicFrame = null;
  var AUDIO_OFF_KEY = "portfolio-audio-off";
  var musicVolume = 0.35;
  try {
    var savedVolume = parseFloat(localStorage.getItem("portfolio-volume"));
    if (savedVolume >= 0 && savedVolume <= 1) musicVolume = savedVolume;
  } catch (err) {}
  var musicAudio = new Audio();
  musicAudio.preload = "auto";
  musicAudio.volume = musicVolume;
  var musicPlaying = false;
  var musicCurrent = -1;
  var musicMuted = false;
  var musicAuto = { armed: true, gesture: false };
  var spotifyApi = null;
  var spotifyController = null;
  var spotifyRequested = false;
  var spotifyQueue = [];

  function audioIsOff() {
    try { return localStorage.getItem(AUDIO_OFF_KEY) === "1"; } catch (err) { return false; }
  }

  function markAudioOff() {
    try { localStorage.setItem(AUDIO_OFF_KEY, "1"); } catch (err) {}
  }

  function markAudioOn() {
    try { localStorage.removeItem(AUDIO_OFF_KEY); } catch (err) {}
  }

  function two(n) { return (n < 10 ? "0" : "") + n; }

  function withSpotify(fn) {
    if (spotifyApi) { fn(spotifyApi); return; }
    spotifyQueue.push(fn);
    if (spotifyRequested) return;
    spotifyRequested = true;
    window.onSpotifyIframeApiReady = function (api) {
      spotifyApi = api;
      var queue = spotifyQueue;
      spotifyQueue = [];
      queue.forEach(function (waiting) { waiting(api); });
    };
    var script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    document.head.appendChild(script);
  }

  function renderMusic() {
    var list = $('[data-render="music-tracks"]');
    if (!list) return;
    $$("[data-music-artist]").forEach(function (el) {
      el.textContent = musicData.artist || "Devotional";
    });
    $$("[data-music-name]").forEach(function (el) {
      el.textContent = musicData.artist || "Devotional";
    });
    $$("[data-music-sub]").forEach(function (el) {
      el.textContent = musicData.tracks.length + " MP3 tracks · plays in the background";
    });
    list.innerHTML = musicData.tracks.map(function (track, index) {
      return '<li class="music__track">' +
        '<button class="music__track-btn" type="button" data-track="' + index + '" aria-label="Play ' + esc(track.title) + '">' +
          '<span class="music__idx" aria-hidden="true">' + two(index + 1) + '</span>' +
          '<span class="music__track-title">' + esc(track.title) + '</span>' +
          '<span class="music__track-run" aria-hidden="true"></span>' +
        '</button></li>';
    }).join("");
  }

  function updateMusicUi(status) {
    if (status) {
      var statusEl = $("[data-music-status]");
      if (statusEl) statusEl.textContent = status;
    }
    $$("[data-music-toggle]").forEach(function (toggle) {
      var ambient = toggle.hasAttribute("data-ambient-toggle");
      var label = ambient
        ? (musicPlaying ? "Pause background sound" : "Play background sound")
        : (musicPlaying ? "Pause music" : "Play music");
      toggle.classList.toggle("is-playing", musicPlaying);
      toggle.setAttribute("aria-label", label);
      toggle.title = label;
    });
    var nowTitle = musicCurrent >= 0 && musicData.tracks[musicCurrent]
      ? musicData.tracks[musicCurrent].title
      : "Nothing playing";
    var nowSub = musicCurrent >= 0
      ? (musicPlaying ? "Playing" : "Paused") + " · " + musicData.artist
      : musicData.tracks.length + " tracks · tap play";
    $$("[data-now-title]").forEach(function (el) { el.textContent = nowTitle; });
    $$("[data-now-artist]").forEach(function (el) { el.textContent = nowSub; });
    $$("[data-music-toggle-label]").forEach(function (el) {
      el.textContent = musicPlaying ? "Pause" : "Play";
    });
    $$("[data-track]").forEach(function (button) {
      button.classList.toggle("is-active", Number(button.getAttribute("data-track")) === musicCurrent);
    });
  }

  function armMusicGesture() {
    if (musicAuto.gesture) return;
    musicAuto.gesture = true;
    var disarm = function () {
      window.removeEventListener("pointerdown", kick, true);
      window.removeEventListener("keydown", kick, true);
    };
    var kick = function (event) {
      var control = event.target && event.target.closest
        ? event.target.closest("[data-music-toggle],[data-track],[data-music-mute],[data-ambient-stop],[data-chat-fab]")
        : null;
      disarm();
      if (control || audioIsOff() || !musicAuto.armed) return;
      if (musicAudio.paused) playTrack(musicCurrent < 0 ? 0 : musicCurrent);
    };
    window.addEventListener("pointerdown", kick, true);
    window.addEventListener("keydown", kick, true);
  }

  function autostartMusic() {
    var first = musicData.tracks[0];
    if (!first || !first.src || !first.ambient) return;
    if (audioIsOff()) { updateMusicUi(); return; }
    playTrack(0);
  }

  function setMusicMuted(on) {
    musicMuted = on;
    var current = musicCurrent >= 0 ? musicData.tracks[musicCurrent] : null;
    if (current && current.src) {
      musicAudio.muted = on;
    } else if (spotifyController && typeof spotifyController.setVolume === "function") {
      spotifyController.setVolume(on ? 0 : musicVolume);
    } else {
      musicCommand(on ? "mute" : "unMute");
    }
    $$("[data-music-mute]").forEach(function (button) {
      button.classList.toggle("is-muted", on);
      button.setAttribute("aria-pressed", on ? "true" : "false");
      button.setAttribute("aria-label", on ? "Unmute music" : "Mute music");
      button.title = on ? "Unmute" : "Mute";
    });
  }

  function setMusicVolume(value) {
    musicVolume = Math.min(1, Math.max(0, value));
    musicAudio.volume = musicVolume;
    if (spotifyController && typeof spotifyController.setVolume === "function") {
      spotifyController.setVolume(musicVolume);
    } else if (musicFrame) {
      musicCommand("setVolume", [Math.round(musicVolume * 100)]);
    }
    if (musicMuted && musicVolume > 0) setMusicMuted(false);
    $$("[data-music-volume]").forEach(function (el) {
      el.value = String(Math.round(musicVolume * 100));
    });
    try { localStorage.setItem("portfolio-volume", String(musicVolume)); } catch (err) {}
  }

  function fmtTime(total) {
    total = Math.max(0, Math.floor(total || 0));
    return Math.floor(total / 60) + ":" + two(total % 60);
  }

  function updateSeekUi() {
    var duration = isFinite(musicAudio.duration) ? musicAudio.duration : 0;
    var current = musicAudio.currentTime || 0;
    $$("[data-music-time]").forEach(function (el) { el.textContent = fmtTime(current); });
    $$("[data-music-duration]").forEach(function (el) { el.textContent = fmtTime(duration); });
    $$("[data-music-seek]").forEach(function (el) {
      el.value = duration ? String(Math.round(current / duration * 1000)) : "0";
    });
  }

  function stepTrack(dir) {
    if (!musicData.tracks.length) return;
    musicAuto.armed = false;
    var current = musicCurrent >= 0 ? musicData.tracks[musicCurrent] : null;
    if (dir < 0 && current && current.src && musicAudio.currentTime > 3) {
      musicAudio.currentTime = 0;
      updateSeekUi();
      return;
    }
    var next = musicCurrent < 0 ? 0 : (musicCurrent + dir + musicData.tracks.length) % musicData.tracks.length;
    playTrack(next);
  }

  function playTrack(index) {
    var track = musicData.tracks[index];
    var stage = $("[data-music-stage]");
    if (!track || !stage) return;
    markAudioOn();
    musicCurrent = index;
    musicPlaying = true;
    if ("mediaSession" in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: musicData.artist,
          album: "Portfolio"
        });
      } catch (err) {}
    }

    if (track.src) {
      stage.hidden = true;
      stage.innerHTML = "";
      musicAudio.loop = !!track.ambient;
      musicAudio.src = track.src;
      $$("[data-music-seek]").forEach(function (el) { el.disabled = false; });
      updateSeekUi();
      var attempt = musicAudio.play();
      if (attempt && attempt.catch) {
        attempt.catch(function (err) {
          if (musicCurrent !== index) return;
          if (err && err.name === "AbortError") return;
          musicPlaying = false;
          if (musicAuto.armed) armMusicGesture();
          updateMusicUi("Tap play to start - " + track.title);
        });
      }
      updateMusicUi("Playing - " + track.title);
      return;
    }

    stage.hidden = false;
    musicAudio.loop = false;
    $$("[data-music-seek]").forEach(function (el) { el.disabled = true; });
    $$("[data-music-time], [data-music-duration]").forEach(function (el) { el.textContent = "0:00"; });

    if (!track.spotify) {
      stage.innerHTML = '<iframe class="music__frame" loading="lazy" allowfullscreen ' +
        'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
        'title="' + esc(track.title) + ' - ' + esc(musicData.artist) + '" ' +
        'src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(track.id) + '?autoplay=1&rel=0&modestbranding=1&enablejsapi=1"></iframe>';
      musicFrame = stage.querySelector("iframe");
      updateMusicUi("Playing - " + track.title);
      return;
    }

    updateMusicUi("Starting - " + track.title);
    var uri = "spotify:track:" + track.spotify;
    withSpotify(function (api) {
      if (musicCurrent !== index) return;
      if (!spotifyController) {
        stage.innerHTML = '<div class="music__mount"></div>';
        api.createController(stage.firstChild, { width: "100%", height: 152, uri: uri }, function (controller) {
          spotifyController = controller;
          controller.addListener("playback_update", function (event) {
            var data = (event && event.data) || {};
            if (typeof data.isPaused !== "boolean" || musicCurrent < 0) return;
            var current = musicData.tracks[musicCurrent];
            var playing = !data.isPaused;
            if (playing === musicPlaying) return;
            musicPlaying = playing;
            updateMusicUi((playing ? "Playing - " : "Paused - ") + (current ? current.title : ""));
          });
          controller.play();
          updateMusicUi("Playing - " + track.title);
        });
        return;
      }
      spotifyController.loadUri(uri);
      spotifyController.play();
      updateMusicUi("Playing - " + track.title);
    });
  }

  function musicCommand(func, args) {
    if (!musicFrame || !musicFrame.contentWindow) return;
    musicFrame.contentWindow.postMessage(JSON.stringify({ event: "command", func: func, args: args || [] }), "*");
  }

  function toggleMusic() {
    if (musicCurrent < 0) {
      playTrack(0);
      return;
    }
    var current = musicData.tracks[musicCurrent];
    if (current && current.src) {
      musicAuto.armed = false;
      musicPlaying = musicAudio.paused;
      if (musicPlaying) {
        var attempt = musicAudio.play();
        if (attempt && attempt.catch) attempt.catch(function () {});
      } else {
        musicAudio.pause();
      }
      updateMusicUi((musicPlaying ? "Playing - " : "Paused - ") + current.title);
      return;
    }
    musicPlaying = !musicPlaying;
    if (spotifyController) {
      if (musicPlaying) spotifyController.resume();
      else spotifyController.pause();
    } else {
      musicCommand(musicPlaying ? "playVideo" : "pauseVideo");
    }
    var title = musicData.tracks[musicCurrent] ? musicData.tracks[musicCurrent].title : "";
    updateMusicUi((musicPlaying ? "Playing - " : "Paused - ") + title);
  }

  function pauseMusic() {
    if (!musicPlaying) return;
    musicPlaying = false;
    var current = musicData.tracks[musicCurrent];
    if (current && current.src) musicAudio.pause();
    else if (spotifyController) spotifyController.pause();
    else musicCommand("pauseVideo");
    var title = musicData.tracks[musicCurrent] ? musicData.tracks[musicCurrent].title : "";
    updateMusicUi("Paused - " + title);
  }

  function stopMusic() {
    musicAuto.armed = false;
    musicPlaying = false;
    var current = musicCurrent >= 0 ? musicData.tracks[musicCurrent] : null;
    if (current && current.src) {
      musicAudio.pause();
      try { musicAudio.currentTime = 0; } catch (err) {}
    } else if (spotifyController) {
      spotifyController.pause();
    } else if (musicFrame) {
      musicCommand("stopVideo");
    }
    musicCurrent = -1;
    markAudioOff();
    updateMusicUi("Stopped");
    updateSeekUi();
  }

  musicAudio.addEventListener("ended", function () {
    if (musicCurrent < 0) return;
    var current = musicData.tracks[musicCurrent];
    if (!current || !current.src) return;
    playTrack((musicCurrent + 1) % musicData.tracks.length);
  });

  musicAudio.addEventListener("play", function () {
    musicAuto.armed = false;
    if (!musicPlaying && musicCurrent >= 0) {
      musicPlaying = true;
      updateMusicUi("Playing - " + musicData.tracks[musicCurrent].title);
    }
  });

  musicAudio.addEventListener("timeupdate", updateSeekUi);
  musicAudio.addEventListener("loadedmetadata", updateSeekUi);
  musicAudio.addEventListener("durationchange", updateSeekUi);

  musicAudio.addEventListener("error", function () {
    if (musicCurrent < 0) return;
    var current = musicData.tracks[musicCurrent];
    if (!current || !current.src) return;
    musicPlaying = false;
    updateMusicUi("Could not play - " + current.title);
  });

  renderMusic();
  $$("[data-music-volume]").forEach(function (el) {
    el.value = String(Math.round(musicVolume * 100));
  });
  updateSeekUi();
  autostartMusic();

  if ("mediaSession" in navigator) {
    try {
      navigator.mediaSession.setActionHandler("play", function () { if (!musicPlaying) toggleMusic(); });
      navigator.mediaSession.setActionHandler("pause", function () { if (musicPlaying) toggleMusic(); });
      navigator.mediaSession.setActionHandler("previoustrack", function () { stepTrack(-1); });
      navigator.mediaSession.setActionHandler("nexttrack", function () { stepTrack(1); });
    } catch (err) {}
  }

  document.addEventListener("input", function (event) {
    var slider = event.target.closest ? event.target.closest("[data-music-volume]") : null;
    if (slider) {
      musicAuto.armed = false;
      setMusicVolume(Number(slider.value) / 100);
      return;
    }
    var seek = event.target.closest ? event.target.closest("[data-music-seek]") : null;
    if (seek) {
      musicAuto.armed = false;
      var duration = musicAudio.duration;
      if (isFinite(duration) && duration > 0) {
        musicAudio.currentTime = (Number(seek.value) / 1000) * duration;
      }
    }
  });

  document.addEventListener("click", function (event) {
    var muteBtn = event.target.closest("[data-music-mute]");
    if (muteBtn) {
      event.preventDefault();
      musicAuto.armed = false;
      setMusicMuted(!musicMuted);
      return;
    }
    var prevBtn = event.target.closest("[data-music-prev]");
    if (prevBtn) {
      event.preventDefault();
      stepTrack(-1);
      return;
    }
    var nextBtn = event.target.closest("[data-music-next]");
    if (nextBtn) {
      event.preventDefault();
      stepTrack(1);
      return;
    }
    var stopBtn = event.target.closest("[data-ambient-stop]");
    if (stopBtn) {
      event.preventDefault();
      stopMusic();
      return;
    }
    var toggle = event.target.closest("[data-music-toggle]");
    if (toggle) {
      event.preventDefault();
      musicAuto.armed = false;
      toggleMusic();
      return;
    }
    var trackBtn = event.target.closest("[data-track]");
    if (trackBtn) {
      event.preventDefault();
      musicAuto.armed = false;
      var trackIndex = Number(trackBtn.getAttribute("data-track"));
      if (trackIndex === musicCurrent) toggleMusic();
      else playTrack(trackIndex);
    }
  });

  var chatFab = $("[data-chat-fab]");
  if (chatFab) {
    chatFab.addEventListener("click", function () {
      if (document.documentElement.classList.contains("is-journey")) exitJourney();
      if (isPhone()) {
        closePhoneApp();
        openPhoneApp("assistant");
      } else {
        openApp("assistant");
      }
    });
  }

  /* ---------------------------------------------------------------- ask shivam */

  var chatCfg = C.assistant || {};
  var chatLog = $("[data-chat-log]");
  var chatForm = $("[data-chat-form]");
  var chatInput = $("[data-chat-input]");
  var chatSend = $("[data-chat-send]");
  var chatChips = $("[data-chat-chips]");
  var chatHistory = [];
  var chatBusy = false;
  var chatHealthChecked = false;

  var CHAT_ERRORS = {
    not_configured: "The AI assistant isn't connected on this deployment yet.",
    rate_limited: "That's a lot of questions in a short time - give it a few minutes.",
    upstream: "The assistant hit a problem on the AI side.",
    network: "I couldn't reach the assistant."
  };

  function chatEmail() {
    return (C.contact && C.contact.email) || "";
  }

  function chatRich(text) {
    return esc(text).split(/\r?\n/).map(function (line) {
      return line
        .replace(/^\s*[-*]\s+/, "\u2022 ")
        .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
        .replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    }).join("<br>");
  }

  function chatScroll() {
    if (chatLog) chatLog.scrollTop = chatLog.scrollHeight;
  }

  function chatAdd(role, html) {
    if (!chatLog) return null;
    var row = document.createElement("div");
    row.className = "chat__msg chat__msg--" + (role === "user" ? "user" : "bot");
    row.innerHTML = '<span class="chat__avatar" aria-hidden="true">' + (role === "user" ? "You" : "AI") + "</span>" +
      '<div class="chat__bubble">' + html + "</div>";
    chatLog.appendChild(row);
    chatScroll();
    return row.querySelector(".chat__bubble");
  }

  function chatSetStatus(state) {
    var badge = $("[data-assistant-status]");
    var label = $("[data-assistant-status-text]");
    if (!badge || !label) return;
    badge.classList.toggle("is-busy", state === "busy");
    badge.classList.toggle("is-off", state === "off" || state === "setup");
    label.textContent = state === "busy" ? "Thinking…" :
      state === "setup" ? "Not set up" :
      state === "off" ? "Offline" : "Online";
  }

  function chatWithEmail(message) {
    var email = chatEmail();
    return email ? message + " Email Shivam - " + email + "." : message;
  }

  function checkAssistant() {
    if (chatHealthChecked) return;
    chatHealthChecked = true;
    var endpoint = chatCfg.endpoint || "/api/assistant";
    fetch(endpoint).then(function (response) {
      return response.json().catch(function () { return null; });
    }).then(function (info) {
      if (info && info.ok && info.configured === false) chatSetStatus("setup");
    }).catch(function () {});
  }

  /* süße - the ask shivam mascot */

  var buddyEl = $("[data-buddy]");
  var buddyCaption = $("[data-buddy-caption]");
  var buddyTimer = 0;
  var buddyPokes = [];
  var buddyGaze = { x: 0, y: 0 };

  var BUDDY_LINES = {
    idle: "your portfolio buddy",
    thinking: "hmm, checking…",
    happy: "hehe, hi!",
    groom: "…busy licking paw",
    angry: "hmph!",
    sad: "can't reach the AI right now"
  };

  var BUDDY_POSE = {
    idle: "grumpy",
    thinking: "grumpy",
    happy: "happy",
    groom: "groom",
    angry: "grumpy",
    sad: "grumpy"
  };

  var BUDDY_LOOK = {
    idle: [0, 0],
    thinking: [1.8, -1.6],
    happy: [0, -0.6],
    groom: [-1.6, 1.2],
    angry: [0, 1],
    sad: [0, 1.8]
  };

  function buddyPaintLook() {
    if (!buddyEl) return;
    var mood = buddyEl.getAttribute("data-mood") || "idle";
    var base = BUDDY_LOOK[mood] || BUDDY_LOOK.idle;
    buddyEl.style.setProperty("--look-x", (base[0] + buddyGaze.x).toFixed(2) + "px");
    buddyEl.style.setProperty("--look-y", (base[1] + buddyGaze.y).toFixed(2) + "px");
  }

  function buddySetMood(mood, hold) {
    if (!buddyEl) return;
    if (buddyTimer) { clearTimeout(buddyTimer); buddyTimer = 0; }
    buddyEl.setAttribute("data-mood", mood);
    buddyEl.setAttribute("data-pose", BUDDY_POSE[mood] || "grumpy");
    if (buddyCaption) buddyCaption.textContent = BUDDY_LINES[mood] || BUDDY_LINES.idle;
    buddyPaintLook();
    if (hold) {
      buddyTimer = setTimeout(function () { buddySetMood("idle"); }, hold);
    }
  }

  function buddyIsRude(text) {
    return /(stupid|idiot|hate|bakwas|useless|fool|pagal|bewakoof|gadha|chutiya|saala)/i.test(String(text || ""));
  }

  function buddyReactTo(text) {
    if (buddyIsRude(text)) {
      buddySetMood(Math.random() < 0.55 ? "groom" : "angry", 2400);
    } else {
      buddySetMood("thinking");
    }
  }

  if (buddyEl) {
    document.addEventListener("pointermove", function (event) {
      if (!buddyEl.offsetParent) return;
      var rect = buddyEl.getBoundingClientRect();
      var dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      var dy = (event.clientY - (rect.top + rect.height * 0.42)) / (rect.height / 2);
      buddyGaze.x = Math.max(-4, Math.min(4, dx * 4));
      buddyGaze.y = Math.max(-3, Math.min(3, dy * 3));
      buddyEl.style.setProperty("--look-tilt", Math.max(-3, Math.min(3, dx * 2.4)).toFixed(2) + "deg");
      buddyPaintLook();
    }, { passive: true });

    buddyEl.addEventListener("pointerdown", function () {
      var now = Date.now();
      buddyPokes = buddyPokes.filter(function (t) { return now - t < 1600; });
      buddyPokes.push(now);
      if (buddyPokes.length >= 3) {
        buddyPokes = [];
        buddySetMood("groom", 2600);
      } else if (buddyPokes.length === 2) {
        buddySetMood("angry", 1800);
      } else {
        buddySetMood("happy", 1700);
      }
    });
  }

  if (chatInput) {
    chatInput.addEventListener("input", function () {
      if (chatBusy) return;
      if (buddyTimer) { clearTimeout(buddyTimer); buddyTimer = 0; }
      buddySetMood(chatInput.value.trim() ? "happy" : "idle");
    });
  }

  buddySetMood("idle");

  function askShivam(question) {
    if (!chatLog || chatBusy) return;
    question = String(question || "").trim().slice(0, 600);
    if (!question) return;

    var rude = buddyIsRude(question);
    chatBusy = true;
    if (chatInput) { chatInput.value = ""; chatInput.disabled = true; }
    if (chatSend) chatSend.disabled = true;
    if (chatChips) chatChips.classList.add("is-hidden");
    chatSetStatus("busy");
    buddyReactTo(question);

    chatAdd("user", chatRich(question));
    chatHistory.push({ role: "user", content: question });

    var bubble = chatAdd("bot", '<span class="chat__typing" aria-label="Thinking"><i></i><i></i><i></i></span>');
    var answer = "";
    var endpoint = chatCfg.endpoint || "/api/assistant";

    function finish(code) {
      chatBusy = false;
      if (chatInput) chatInput.disabled = false;
      if (chatSend) chatSend.disabled = false;
      if (bubble) bubble.classList.remove("is-streaming");
      if (code) {
        chatHistory.pop();
        bubble.innerHTML = chatRich(chatWithEmail(CHAT_ERRORS[code] || CHAT_ERRORS.network));
        chatSetStatus(code === "not_configured" ? "setup" : "off");
        buddySetMood(code === "not_configured" ? "sad" : "angry", 3200);
      } else if (!answer.trim()) {
        bubble.innerHTML = chatRich("I can only help with questions about Shivam - his experience, projects, skills or contact details.");
        chatSetStatus("ready");
        buddySetMood("groom", 2400);
      } else {
        bubble.innerHTML = chatRich(answer);
        chatHistory.push({ role: "assistant", content: answer });
        if (chatHistory.length > 16) chatHistory = chatHistory.slice(-16);
        chatSetStatus("ready");
        buddySetMood(rude ? "groom" : "happy", rude ? 2800 : 3600);
      }
      chatScroll();
      if (chatInput && !isPhone()) chatInput.focus({ preventScroll: true });
    }

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatHistory.slice(-10) })
    }).then(function (response) {
      if (!response.ok) {
        return response.json().catch(function () { return {}; }).then(function (info) {
          throw new Error((info && info.error) || "upstream");
        });
      }
      if (!response.body || typeof response.body.getReader !== "function") {
        return response.text().then(function (text) { answer = text || ""; });
      }
      var reader = response.body.getReader();
      var decoder = new TextDecoder();
      function pump() {
        return reader.read().then(function (chunk) {
          if (chunk.done) return undefined;
          answer += decoder.decode(chunk.value, { stream: true });
          if (bubble) {
            bubble.classList.add("is-streaming");
            bubble.innerHTML = chatRich(answer);
          }
          chatScroll();
          return pump();
        });
      }
      return pump();
    }).then(function () {
      finish("");
    }).catch(function (err) {
      var code = err && err.message;
      finish(CHAT_ERRORS[code] ? code : "network");
    });
  }

  function renderChat() {
    if (!chatLog) return;
    $$("[data-chat-mail]").forEach(function (link) {
      var email = chatEmail();
      if (!email) return;
      link.setAttribute("href", "mailto:" + email);
      link.textContent = email;
    });
    chatLog.innerHTML = "";
    chatAdd("bot", chatRich(chatCfg.intro || "Ask me about Shivam's experience, projects, tools or how to reach him."));
    if (chatChips) {
      chatChips.innerHTML = (chatCfg.chips || []).map(function (q) {
        return '<button class="chat__chip" type="button" data-chat-ask="' + esc(q) + '">' + esc(q) + "</button>";
      }).join("");
    }
  }

  renderChat();
  chatSetStatus("ready");

  if (chatForm) {
    chatForm.addEventListener("submit", function (event) {
      event.preventDefault();
      askShivam(chatInput.value);
    });
  }

  document.addEventListener("click", function (event) {
    var chip = event.target.closest ? event.target.closest("[data-chat-ask]") : null;
    if (!chip) return;
    event.preventDefault();
    askShivam(chip.getAttribute("data-chat-ask"));
  });

  /* ---------------------------------------------------------------- snake */

  var gameCanvas = $("[data-game-canvas]");
  var gameCtx = gameCanvas ? gameCanvas.getContext("2d") : null;
  var gameBest = 0;
  try { gameBest = parseInt(localStorage.getItem("portfolio-snake-best") || "0", 10) || 0; } catch (err) {}

  var game = {
    size: 600,
    cell: 30,
    snake: [],
    dir: { x: 1, y: 0 },
    next: { x: 1, y: 0 },
    food: { x: 14, y: 10 },
    score: 0,
    best: gameBest,
    state: "ready",
    step: 130,
    acc: 0,
    last: 0
  };

  function gameSetScore(score, best) {
    $$("[data-game-score]").forEach(function (el) { el.textContent = String(score); });
    $$("[data-game-best]").forEach(function (el) { el.textContent = String(best); });
  }

  function gameVeil(message, action, show) {
    var veil = $("[data-game-veil]");
    if (!veil) return;
    veil.hidden = !show;
    if (message) {
      var msg = $("[data-game-msg]");
      if (msg) msg.textContent = message;
    }
    if (action) {
      var btn = $("[data-game-start]");
      if (btn) btn.textContent = action;
    }
  }

  function gameSpawnFood() {
    var cells = 600 / game.cell;
    var tries = 0;
    do {
      game.food = { x: Math.floor(Math.random() * cells), y: Math.floor(Math.random() * cells) };
      tries += 1;
    } while (tries < 200 && game.snake.some(function (seg) {
      return seg.x === game.food.x && seg.y === game.food.y;
    }));
  }

  function gameReset() {
    var mid = 10;
    game.snake = [{ x: mid, y: mid }, { x: mid - 1, y: mid }, { x: mid - 2, y: mid }];
    game.dir = { x: 1, y: 0 };
    game.next = { x: 1, y: 0 };
    game.score = 0;
    game.step = 130;
    game.acc = 0;
    gameSpawnFood();
    gameSetScore(0, game.best);
  }

  function gameStart() {
    gameReset();
    game.state = "run";
    game.last = 0;
    gameVeil("", "", false);
    drawGame();
    var board = $("[data-game-board]");
    if (board) board.focus({ preventScroll: true });
  }

  function gameOver() {
    game.state = "over";
    if (game.score > game.best) {
      game.best = game.score;
      try { localStorage.setItem("portfolio-snake-best", String(game.best)); } catch (err) {}
    }
    gameSetScore(game.score, game.best);
    gameVeil("Crashed - score " + game.score, "Play again", true);
  }

  function gameSetDir(x, y) {
    if (game.state === "ready" || game.state === "over") return;
    if (x === -game.dir.x && y === -game.dir.y) return;
    game.next = { x: x, y: y };
  }

  function gameStepLogic() {
    game.dir = game.next;
    var cells = 600 / game.cell;
    var head = { x: game.snake[0].x + game.dir.x, y: game.snake[0].y + game.dir.y };
    var hitWall = head.x < 0 || head.y < 0 || head.x >= cells || head.y >= cells;
    var hitSelf = game.snake.some(function (seg) { return seg.x === head.x && seg.y === head.y; });
    if (hitWall || hitSelf) {
      gameOver();
      return;
    }
    game.snake.unshift(head);
    if (head.x === game.food.x && head.y === game.food.y) {
      game.score += 1;
      game.step = Math.max(70, 130 - game.score * 3);
      gameSpawnFood();
      gameSetScore(game.score, game.best);
    } else {
      game.snake.pop();
    }
  }

  function drawGame() {
    if (!gameCtx) return;
    var ctx = gameCtx;
    var size = game.size;
    var cell = game.cell;
    ctx.clearRect(0, 0, size, size);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (var i = 1; i < size / cell; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * cell, 0);
      ctx.lineTo(i * cell, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cell);
      ctx.lineTo(size, i * cell);
      ctx.stroke();
    }

    ctx.fillStyle = "#ff5f57";
    ctx.beginPath();
    ctx.arc(game.food.x * cell + cell / 2, game.food.y * cell + cell / 2, cell * 0.28, 0, Math.PI * 2);
    ctx.fill();

    game.snake.forEach(function (seg, index) {
      ctx.fillStyle = index === 0 ? "#ffd166" : "rgba(245, 158, 11, 0.78)";
      var x = seg.x * cell + 2;
      var y = seg.y * cell + 2;
      var w = cell - 4;
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(x, y, w, w, index === 0 ? 9 : 7);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, w, w);
      }
    });
  }

  function gameFocused() {
    var win = wins.games;
    if (!win || !win.open || win.min || win.el.hidden) return false;
    return isPhone() ? os.phoneApp === "games" : topWindow() === "games";
  }

  function gameLoop(ts) {
    window.requestAnimationFrame(gameLoop);
    if (!gameCtx) return;
    if (game.state === "run" && !gameFocused()) {
      game.state = "paused";
      gameVeil("Paused", "Resume", true);
      return;
    }
    if (game.state !== "run") {
      game.last = ts;
      return;
    }
    if (!game.last) game.last = ts;
    game.acc += ts - game.last;
    game.last = ts;
    if (game.acc >= game.step) {
      game.acc = 0;
      gameStepLogic();
      drawGame();
    }
  }

  if (gameCanvas && gameCtx) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    gameCanvas.width = game.size * dpr;
    gameCanvas.height = game.size * dpr;
    gameCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gameReset();
    drawGame();
    window.requestAnimationFrame(gameLoop);
  }

  $$("[data-game-start]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (game.state === "paused") {
        game.state = "run";
        game.last = 0;
        gameVeil("", "", false);
        return;
      }
      gameStart();
    });
  });

  document.addEventListener("keydown", function (event) {
    if (!gameFocused()) return;
    var key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    var moves = {
      ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
      w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0]
    };
    if (moves[key]) {
      event.preventDefault();
      if (game.state === "ready") gameStart();
      else if (game.state === "paused") {
        game.state = "run";
        game.last = 0;
        gameVeil("", "", false);
      }
      gameSetDir(moves[key][0], moves[key][1]);
      return;
    }
    if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      if (game.state === "run") {
        game.state = "paused";
        gameVeil("Paused", "Resume", true);
      } else if (game.state === "paused") {
        game.state = "run";
        game.last = 0;
        gameVeil("", "", false);
      } else {
        gameStart();
      }
    }
  });

  var gameBoard = $("[data-game-board]");
  if (gameBoard) {
    var swipe = null;
    gameBoard.addEventListener("pointerdown", function (event) {
      swipe = { x: event.clientX, y: event.clientY };
    });
    gameBoard.addEventListener("pointerup", function (event) {
      if (!swipe) return;
      var dx = event.clientX - swipe.x;
      var dy = event.clientY - swipe.y;
      swipe = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
      if (game.state === "ready") gameStart();
      if (Math.abs(dx) > Math.abs(dy)) gameSetDir(dx > 0 ? 1 : -1, 0);
      else gameSetDir(0, dy > 0 ? 1 : -1);
    });
  }

  /* ---------------------------------------------------------------- watch */

  function setHand(selector, deg) {
    var hand = $(selector);
    if (hand) hand.style.transform = "rotate(" + deg + "deg)";
  }

  function updateWatch() {
    var now = new Date();
    var sec = now.getSeconds();
    var min = now.getMinutes();
    var hour = now.getHours();

    setHand("[data-watch-h]", (hour % 12 + min / 60) * 30);
    setHand("[data-watch-m]", (min + sec / 60) * 6);
    setHand("[data-watch-s]", sec * 6);

    var digital = $("[data-watch-digital]");
    if (digital) digital.textContent = two(hour) + ":" + two(min) + ":" + two(sec);
    var dateEl = $("[data-watch-date]");
    if (dateEl) {
      try {
        dateEl.textContent = now.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
      } catch (err) { dateEl.textContent = now.toDateString(); }
    }

    $$("[data-watch-city]").forEach(function (el) {
      var zone = el.getAttribute("data-watch-city");
      try {
        el.textContent = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", timeZone: zone }).format(now);
      } catch (err) {}
    });
  }

  /* ---------------------------------------------------------------- screen time */

  function fmtDuration(sec) {
    if (sec < 60) return Math.max(0, Math.round(sec)) + "s";
    var mins = Math.floor(sec / 60);
    if (mins < 60) return mins + "m " + two(sec % 60) + "s";
    return Math.floor(mins / 60) + "h " + two(mins % 60) + "m";
  }

  function screenTimeVisible() {
    var win = wins["screen-time"];
    if (!win) return false;
    if (os.phoneApp === "screen-time") return true;
    return win.open && !win.min && !win.el.hidden;
  }

  function renderScreenTime() {
    var total = Math.floor((Date.now() - os.startedAt) / 1000);
    $$("[data-screen-total], [data-screen-phone]").forEach(function (el) {
      el.textContent = fmtDuration(total);
    });
    if (!screenTimeVisible()) return;

    var entries = Object.keys(os.timeById).map(function (id) {
      return { id: id, app: appById[id], sec: os.timeById[id] };
    }).filter(function (entry) {
      return entry.app && entry.sec > 0;
    }).sort(function (a, b) {
      return b.sec - a.sec;
    });

    var bar = $("[data-screen-bar]");
    if (bar) {
      var used = entries.reduce(function (sum, entry) { return sum + entry.sec; }, 0);
      var parts = entries.map(function (entry) {
        return '<span class="screen__seg" style="width:' + (entry.sec / Math.max(total, 1) * 100).toFixed(2) + '%;background:' + esc(entry.app.tone) + '"></span>';
      });
      if (used < total) {
        parts.push('<span class="screen__seg screen__seg--idle" style="width:' + ((total - used) / Math.max(total, 1) * 100).toFixed(2) + '%"></span>');
      }
      bar.innerHTML = parts.join("");
    }

    var list = $("[data-screen-list]");
    if (!list) return;
    if (!entries.length) {
      list.innerHTML = '<li class="screen__empty">No app time yet - open a window and it starts counting.</li>';
      return;
    }
    list.innerHTML = entries.map(function (entry) {
      var pct = Math.round(entry.sec / Math.max(total, 1) * 100);
      var opens = os.visits[entry.id] || 0;
      return '<li class="screen__row">' +
        '<span class="screen__dot" style="--tone:' + esc(entry.app.tone) + '"></span>' +
        '<span class="screen__name">' + esc(entry.app.label) + '</span>' +
        '<span class="screen__meta">' + fmtDuration(entry.sec) + ' · ' + opens + (opens === 1 ? ' open' : ' opens') + '</span>' +
        '<span class="screen__meter"><i style="width:' + Math.max(pct, 2) + '%;background:' + esc(entry.app.tone) + '"></i></span>' +
        '</li>';
    }).join("");
  }

  window.setInterval(function () {
    if (document.visibilityState === "hidden") return;
    var id = isPhone() ? os.phoneApp : topWindow();
    var win = id ? wins[id] : null;
    if (win && (isPhone() || (win.open && !win.min && !win.el.hidden))) {
      os.timeById[id] = (os.timeById[id] || 0) + 1;
    }
    renderScreenTime();
  }, 1000);

  window.setInterval(function () {
    updateWatch();
  }, 1000);
  updateWatch();
  renderScreenTime();

  /* ---------------------------------------------------------------- customize */

  $$("[data-custom-wall] [data-wall]").forEach(function (button) {
    button.addEventListener("click", function () {
      applyLook({ wall: button.getAttribute("data-wall"), accent: look.accent, alpha: look.alpha }, true);
    });
  });

  $$("[data-custom-accent] [data-accent]").forEach(function (button) {
    button.addEventListener("click", function () {
      applyLook({ wall: look.wall, accent: button.getAttribute("data-accent"), alpha: look.alpha }, true);
    });
  });

  $$("[data-custom-alpha]").forEach(function (alphaToggle) {
    alphaToggle.addEventListener("click", function () {
      applyLook({ wall: look.wall, accent: look.accent, alpha: !look.alpha }, true);
    });
  });

  var resetLook = $("[data-custom-reset]");
  if (resetLook) {
    resetLook.addEventListener("click", function () {
      applyLook({ wall: "none", accent: "#3468f5", alpha: false }, true);
    });
  }

  /* ---------------------------------------------------------------- year */

  var year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------- reveal on scroll */

  var revealObserver = null;

  function initReveals(root) {
    var els = $$(".reveal:not(.is-in)", root);
    if (!els.length) return;
    if (!("IntersectionObserver" in window) || reduceMotion.matches) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -2% 0px" }
      );
    }
    els.forEach(function (el) { revealObserver.observe(el); });
  }

  initReveals(document);

  /* ---------------------------------------------------------------- hero tilt */

  var tiltEl = $("[data-tilt]");
  var heroEl = $(".hero");

  if (
    tiltEl &&
    heroEl &&
    window.matchMedia("(pointer: fine)").matches &&
    !reduceMotion.matches
  ) {
    heroEl.addEventListener("pointermove", function (event) {
      var rect = tiltEl.getBoundingClientRect();
      var px = (event.clientX - rect.left) / rect.width - 0.5;
      var py = (event.clientY - rect.top) / rect.height - 0.5;
      px = Math.max(-0.5, Math.min(0.5, px));
      py = Math.max(-0.5, Math.min(0.5, py));
      tiltEl.style.setProperty("--ry", (px * 6).toFixed(2) + "deg");
      tiltEl.style.setProperty("--rx", (-py * 4.5).toFixed(2) + "deg");
    });

    heroEl.addEventListener("pointerleave", function () {
      tiltEl.style.setProperty("--rx", "0deg");
      tiltEl.style.setProperty("--ry", "0deg");
    });
  }
})();
