import type { CSSProperties } from "react";
import brandShoot from "@/assets/brand-shoot.webp";
import brandShootBg from "@/assets/brand-shoot-bg.webp";
import creatorLocation from "@/assets/creator-location.webp";
import creatorLocationBg from "@/assets/creator-location-bg.webp";
import eventNight from "@/assets/event-night.webp";
import eventNightBg from "@/assets/event-night-bg.webp";
import productStill from "@/assets/product-still.webp";
import productStillBg from "@/assets/product-still-bg.webp";
import crewCity from "@/assets/crew-city.webp";
import crewCityBg from "@/assets/crew-city-bg.webp";
import catWedding from "@/assets/cat-wedding.webp";
import catWeddingBg from "@/assets/cat-wedding-bg.webp";
import catReligious from "@/assets/cat-religious.webp";
import catReligiousBg from "@/assets/cat-religious-bg.webp";
import catProposal from "@/assets/cat-proposal.webp";
import catProposalBg from "@/assets/cat-proposal-bg.webp";
import catBabyshower from "@/assets/cat-babyshower.webp";
import catBabyshowerBg from "@/assets/cat-babyshower-bg.webp";
import catGym from "@/assets/cat-gym.webp";
import catGymBg from "@/assets/cat-gym-bg.webp";
import catOffice from "@/assets/cat-office.webp";
import catOfficeBg from "@/assets/cat-office-bg.webp";
import catFashion from "@/assets/cat-fashion.webp";
import catFashionBg from "@/assets/cat-fashion-bg.webp";
import catCafe from "@/assets/cat-cafe.webp";
import catCafeBg from "@/assets/cat-cafe-bg.webp";

export type Slide = { src: string; bg: string; w: number; h: number; label: string };

const S = (src: string, bg: string, w: number, h: number, label: string): Slide => ({ src, bg, w, h, label });

export const SLIDE_WEDDING = S(catWedding, catWeddingBg, 800, 1071, "Weddings");
export const SLIDE_GYM = S(catGym, catGymBg, 1000, 750, "Fitness");
export const SLIDE_PROPOSAL = S(catProposal, catProposalBg, 800, 1071, "Proposals");

const ROW_A: Slide[] = [
  S(catBabyshower, catBabyshowerBg, 800, 1071, "Baby showers"),
  S(catCafe, catCafeBg, 1000, 747, "Food and cafes"),
  S(catReligious, catReligiousBg, 800, 1071, "Religious"),
  S(catFashion, catFashionBg, 1000, 747, "Fashion"),
  S(eventNight, eventNightBg, 1000, 1250, "Events"),
];
const ROW_B: Slide[] = [
  S(brandShoot, brandShootBg, 1536, 1024, "Brand films"),
  S(creatorLocation, creatorLocationBg, 1000, 1250, "Portraits"),
  S(catOffice, catOfficeBg, 1000, 747, "Corporate"),
  S(productStill, productStillBg, 1000, 1000, "Products"),
  S(crewCity, crewCityBg, 1792, 1024, "Aerial and city"),
];
const BACKDROP_A: Slide[] = [SLIDE_WEDDING, S(brandShoot, brandShootBg, 1536, 1024, ""), SLIDE_PROPOSAL, SLIDE_GYM, S(catReligious, catReligiousBg, 800, 1071, ""), S(catOffice, catOfficeBg, 1000, 747, ""), S(catBabyshower, catBabyshowerBg, 800, 1071, "")];
const BACKDROP_B: Slide[] = [S(catCafe, catCafeBg, 1000, 747, ""), S(creatorLocation, creatorLocationBg, 1000, 1250, ""), S(catFashion, catFashionBg, 1000, 747, ""), S(eventNight, eventNightBg, 1000, 1250, ""), S(productStill, productStillBg, 1000, 1000, ""), S(crewCity, crewCityBg, 1792, 1024, "")];

const HALVES = [0, 1, 2, 3, 4, 5];

function Row({ slides, backdrop, reverse, duration }: { slides: Slide[]; backdrop: boolean; reverse: boolean; duration: number }) {
  const group = slides.map(slide => (
    <figure className="slide-tile" key={slide.label || slide.src}>
      <img src={backdrop ? slide.bg : slide.src} alt="" width={backdrop ? 360 : slide.w} height={backdrop ? undefined : slide.h} loading={backdrop ? "eager" : "lazy"} decoding="async" />
      {!backdrop && <figcaption>{slide.label}</figcaption>}
    </figure>
  ));
  return (
    <div className={`slide-row ${reverse ? "slide-row-reverse" : ""}`} style={{ "--dur": `${duration}s` } as CSSProperties}>
      {HALVES.map(half => <div className="slide-half" key={half} aria-hidden={half > 0 || undefined}>{group}</div>)}
    </div>
  );
}

export function SlideWall({ variant }: { variant: "backdrop" | "strip" }) {
  const backdrop = variant === "backdrop";
  return (
    <div className={`slidewall ${backdrop ? "slidewall-backdrop" : "slidewall-strip"}`} aria-hidden={backdrop || undefined}>
      <Row slides={backdrop ? BACKDROP_A : ROW_A} backdrop={backdrop} reverse={false} duration={backdrop ? 95 : 70} />
      <Row slides={backdrop ? BACKDROP_B : ROW_B} backdrop={backdrop} reverse duration={backdrop ? 130 : 95} />
    </div>
  );
}
