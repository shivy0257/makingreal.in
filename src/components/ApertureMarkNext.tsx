import { useId } from "react";

const C = 120;
const BLADE_OUTER = 92;
const BLADE_INNER = 52;

const polar = (radius: number, degrees: number) => {
  const angle = ((degrees - 90) * Math.PI) / 180;
  const x = C + radius * Math.cos(angle);
  const y = C + radius * Math.sin(angle);
  return `${x.toFixed(2)} ${y.toFixed(2)}`;
};

const arc = (radius: number, from: number, to: number) =>
  `M ${polar(radius, from)} A ${radius} ${radius} 0 0 ${to > from ? 1 : 0} ${polar(radius, to)}`;

// Each blade is the slice between two chords tangent to the wide-open aperture,
// so at rest the blades form a thin overlapping ring and the glass stays visible.
const BLADE = (() => {
  const apexRadius = BLADE_INNER / Math.cos(Math.PI / 9);
  const delta = (Math.acos(BLADE_INNER / BLADE_OUTER) * 180) / Math.PI;
  const apex = polar(apexRadius, -20);
  const outerA = polar(BLADE_OUTER, delta);
  const outerB = polar(BLADE_OUTER, delta - 68);
  // The trailing seam bows instead of running straight at the centre, which is
  // what separates an overlapped iris blade from a turbine spoke.
  const trail = `M ${outerB} Q 105.9 49 ${apex}`;
  return {
    shape: `M ${apex} L ${outerA} A ${BLADE_OUTER} ${BLADE_OUTER} 0 0 0 ${outerB} Q 105.9 49 ${apex} Z`,
    lead: `M ${apex} L ${outerA}`,
    trail,
  };
})();

const BLADE_ANGLES = Array.from({ length: 9 }, (_, index) => index * 40);

const KNURL = Array.from({ length: 120 }, (_, index) => index * 3).map(angle => {
  const major = angle % 30 === 0;
  return {
    angle,
    a: polar(105.5, angle),
    b: polar(major ? 114 : 112.2, angle),
    opacity: major ? 0.2 : 0.07,
    width: major ? 1.1 : 0.7,
  };
});

const SCREWS = [38, 158, 278];

export function ApertureMarkNext({ animated = false, closed = false, sweep = false, className = "" }: {
  animated?: boolean;
  closed?: boolean;
  sweep?: boolean;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `${uid}-${name}`;

  return <span className={`aperture-mark2 ${animated ? "is-animated" : ""} ${closed ? "is-closed" : ""} ${sweep ? "is-sweep" : ""} ${className}`.trim()} aria-hidden="true">
    <svg viewBox="0 0 240 240" focusable="false">
      <defs>
        <linearGradient id={id("barrel")} x1="0.12" y1="0" x2="0.88" y2="1">
          <stop offset="0" stopColor="#3b424a" />
          <stop offset=".16" stopColor="#1d2228" />
          <stop offset=".34" stopColor="#0d1013" />
          <stop offset=".52" stopColor="#191d22" />
          <stop offset=".7" stopColor="#080a0c" />
          <stop offset=".86" stopColor="#22272d" />
          <stop offset="1" stopColor="#0b0d10" />
        </linearGradient>
        <linearGradient id={id("boretone")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1a1e23" />
          <stop offset=".5" stopColor="#0b0d10" />
          <stop offset="1" stopColor="#15181c" />
        </linearGradient>
        <linearGradient id={id("blade")} x1="0.1" y1="1" x2="0.4" y2="0">
          <stop offset="0" stopColor="#222930" />
          <stop offset=".3" stopColor="#151a1f" />
          <stop offset=".7" stopColor="#0c1013" />
          <stop offset="1" stopColor="#080a0c" />
        </linearGradient>
        <linearGradient id={id("edgefade")} gradientUnits="userSpaceOnUse" x1="101" y1="68" x2="172" y2="67.9">
          <stop offset="0" stopColor="hsl(0 0% 100% / .34)" />
          <stop offset=".34" stopColor="hsl(0 0% 100% / .12)" />
          <stop offset="1" stopColor="hsl(0 0% 100% / 0)" />
        </linearGradient>
        <linearGradient id={id("shade")} gradientUnits="userSpaceOnUse" x1="44" y1="34" x2="198" y2="208">
          <stop offset="0" stopColor="hsl(0 0% 100% / .07)" />
          <stop offset=".4" stopColor="hsl(0 0% 100% / .02)" />
          <stop offset=".58" stopColor="hsl(0 0% 100% / 0)" />
          <stop offset="1" stopColor="hsl(0 0% 0% / .26)" />
        </linearGradient>
        <radialGradient id={id("sheen")} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="hsl(200 30% 88% / .11)" />
          <stop offset=".55" stopColor="hsl(200 25% 80% / .045)" />
          <stop offset="1" stopColor="hsl(200 25% 80% / 0)" />
        </radialGradient>
        <radialGradient id={id("glow")} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="hsl(188 55% 62% / .1)" />
          <stop offset=".55" stopColor="hsl(188 55% 62% / .035)" />
          <stop offset="1" stopColor="hsl(188 55% 62% / 0)" />
        </radialGradient>
        <radialGradient id={id("ringprofile")} gradientUnits="userSpaceOnUse" cx={C} cy={C} r="92.7">
          <stop offset=".74" stopColor="hsl(0 0% 0% / 0)" />
          <stop offset=".805" stopColor="hsl(0 0% 0% / .6)" />
          <stop offset=".838" stopColor="hsl(0 0% 100% / .08)" />
          <stop offset=".875" stopColor="hsl(0 0% 0% / 0)" />
          <stop offset=".93" stopColor="hsl(0 0% 0% / .2)" />
          <stop offset=".965" stopColor="hsl(0 0% 100% / .04)" />
          <stop offset="1" stopColor="hsl(0 0% 0% / .6)" />
        </radialGradient>
        <linearGradient id={id("ringtone")} gradientUnits="userSpaceOnUse" x1="52" y1="40" x2="196" y2="204">
          <stop offset="0" stopColor="#2b323a" />
          <stop offset=".22" stopColor="#161a1f" />
          <stop offset=".5" stopColor="#0c0f12" />
          <stop offset=".78" stopColor="#13171c" />
          <stop offset="1" stopColor="#080a0c" />
        </linearGradient>
        <pattern id={id("brush")} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(74)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="hsl(0 0% 100% / .4)" strokeWidth=".3" />
        </pattern>
        <radialGradient id={id("cavity")} cx="50%" cy="46%" r="60%">
          <stop offset="0" stopColor="#101317" />
          <stop offset=".6" stopColor="#070809" />
          <stop offset="1" stopColor="#020303" />
        </radialGradient>
        <radialGradient id={id("glass")} cx="36%" cy="27%" r="88%">
          <stop offset="0" stopColor="#5e7c8d" />
          <stop offset=".2" stopColor="#3f5d6c" />
          <stop offset=".42" stopColor="#27414e" />
          <stop offset=".66" stopColor="#142630" />
          <stop offset=".86" stopColor="#08131a" />
          <stop offset="1" stopColor="#040a0e" />
        </radialGradient>
        <radialGradient id={id("spec")} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="hsl(196 85% 98% / .95)" />
          <stop offset=".45" stopColor="hsl(200 60% 86% / .3)" />
          <stop offset="1" stopColor="hsl(200 60% 86% / 0)" />
        </radialGradient>
        <linearGradient id={id("sweep")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="hsl(0 0% 100% / 0)" />
          <stop offset=".45" stopColor="hsl(190 70% 92% / .32)" />
          <stop offset=".55" stopColor="hsl(0 0% 100% / .26)" />
          <stop offset="1" stopColor="hsl(0 0% 100% / 0)" />
        </linearGradient>
        <radialGradient id={id("rimlight")} cx="34%" cy="26%" r="72%">
          <stop offset="0" stopColor="hsl(0 0% 100% / .13)" />
          <stop offset=".55" stopColor="hsl(0 0% 100% / .04)" />
          <stop offset="1" stopColor="hsl(0 0% 100% / 0)" />
        </radialGradient>
        <clipPath id={id("glassclip")}>
          <circle cx={C} cy={C} r="52.4" />
        </clipPath>
      </defs>

      <circle cx={C} cy={C} r="118" fill={`url(#${id("barrel")})`} />
      <circle cx={C} cy={C} r="118" fill={`url(#${id("rimlight")})`} />

      <g className="barrel-knurl">
        {KNURL.map(tick => <line key={tick.angle}
          x1={tick.a.split(" ")[0]} y1={tick.a.split(" ")[1]}
          x2={tick.b.split(" ")[0]} y2={tick.b.split(" ")[1]}
          stroke="hsl(0 0% 100% / 1)" strokeOpacity={tick.opacity} strokeWidth={tick.width} />)}
      </g>

      <g className="barrel-engraving" fill="none">
        <circle cx={C} cy={C} r="116.4" stroke="hsl(0 0% 100% / .12)" strokeWidth="1.1" />
        <circle cx={C} cy={C} r="114.8" stroke="hsl(0 0% 0% / .55)" strokeWidth="1.2" />
        <circle cx={C} cy={C} r="107.8" stroke="hsl(0 0% 0% / .5)" strokeWidth="1.2" />
        <circle cx={C} cy={C} r="102.4" stroke="hsl(0 0% 100% / .07)" strokeWidth="1" />
        <circle cx={C} cy={C} r="101.2" stroke="hsl(0 0% 100% / .14)" strokeWidth=".9"
          strokeDasharray="1.4 6.4" />
      </g>

      <g className="barrel-lime" fill="none" stroke="hsl(76 92% 58%)" strokeLinecap="round">
        <circle cx={C} cy={C} r="116.2" strokeOpacity=".45" strokeWidth="1.4"
          strokeDasharray="20 712" transform={`rotate(192 ${C} ${C})`} />
        <circle cx={C} cy={C} r="110.8" strokeOpacity=".22" strokeWidth="1"
          strokeDasharray="8 743" transform={`rotate(300 ${C} ${C})`} />
        <circle cx={C} cy={C} r="100.4" strokeOpacity=".3" strokeWidth="1.1"
          strokeDasharray="14 614" transform={`rotate(36 ${C} ${C})`} />
      </g>

      <g className="barrel-spec" fill="none" pointerEvents="none">
        <circle cx={C} cy={C} r="108" stroke="hsl(0 0% 100% / .05)" strokeWidth="9"
          strokeDasharray="120 560" transform={`rotate(196 ${C} ${C})`} />
        <circle cx={C} cy={C} r="117" stroke="hsl(0 0% 100% / .2)" strokeWidth="1.6"
          strokeDasharray="140 600" transform={`rotate(196 ${C} ${C})`} />
        <circle cx={C} cy={C} r="117" stroke="hsl(0 0% 0% / .5)" strokeWidth="2.2"
          strokeDasharray="120 620" transform={`rotate(20 ${C} ${C})`} />
      </g>

      <g className="barrel-bevel">
        <circle cx={C} cy={C} r="100.2" fill="none" stroke="hsl(0 0% 100% / .18)" strokeWidth="1.5" />
        <circle cx={C} cy={C} r="98.9" fill="none" stroke="hsl(0 0% 0% / .6)" strokeWidth="1.2" />
        <circle cx={C} cy={C} r="99.8" fill="none" stroke="hsl(0 0% 100% / .12)" strokeWidth="2"
          strokeDasharray="80 550" transform={`rotate(198 ${C} ${C})`} />
        <circle cx={C} cy={C} r="99.8" fill="none" stroke="hsl(0 0% 0% / .45)" strokeWidth="2.4"
          strokeDasharray="90 540" transform={`rotate(22 ${C} ${C})`} />
      </g>

      <circle cx={C} cy={C} r="98.4" fill={`url(#${id("boretone")})`} />
      <g className="bore-engraving" fill="none">
        <circle cx={C} cy={C} r="96.4" stroke="hsl(0 0% 100% / .08)" strokeWidth="1" />
        <circle cx={C} cy={C} r="94.1" stroke="hsl(0 0% 0% / .5)" strokeWidth="1.3" />
      </g>
      <g className="bore-screws">
        {SCREWS.map(angle => {
          const [sx, sy] = polar(95.4, angle).split(" ").map(Number);
          return <g key={angle}>
            <circle cx={sx} cy={sy} r="2.2" fill="#0a0c0e" stroke="hsl(0 0% 100% / .2)" strokeWidth=".55" />
            <circle cx={sx - 0.6} cy={sy - 0.6} r="0.6" fill="hsl(0 0% 100% / .28)" />
          </g>;
        })}
      </g>

      <circle cx={C} cy={C} r="93.2" fill={`url(#${id("cavity")})`} />
      <circle cx={C} cy={C} r="92.4" fill="none" stroke="hsl(0 0% 0% / .7)" strokeWidth="1.6" />

      <g className="lens">
        <circle cx={C} cy={C} r="54.6" fill="#0a0d10" />
        <circle cx={C} cy={C} r="54.6" fill="none" stroke="hsl(0 0% 100% / .06)" strokeWidth=".9" />
        <circle cx={C} cy={C} r="52.4" fill={`url(#${id("glass")})`} />
        <circle cx={C} cy={C} r="50.9" fill="none" stroke="hsl(0 0% 0% / .55)" strokeWidth="2.6" />
        <circle cx={C} cy={C} r="48.4" fill="none" stroke="hsl(0 0% 0% / .3)" strokeWidth="5.4" />
        <path d={arc(51.2, 286, 350)} fill="none" stroke="hsl(0 0% 100% / .22)" strokeWidth=".8" strokeLinecap="round" />
        <path d={arc(49.4, 288, 352)} fill="none" stroke="hsl(0 0% 100% / .3)" strokeWidth="1.5" strokeLinecap="round" />
        <path d={arc(45.8, 298, 336)} fill="none" stroke="hsl(0 0% 100% / .1)" strokeWidth=".9" strokeLinecap="round" />
        <path d={arc(47.6, 14, 88)} fill="none" stroke="hsl(0 0% 0% / .42)" strokeWidth="2.4" strokeLinecap="round" />
        <path d={arc(46.4, 110, 164)} fill="none" stroke="hsl(158 70% 52% / .18)" strokeWidth="2.6" strokeLinecap="round" />
        <path d={arc(48.6, 126, 152)} fill="none" stroke="hsl(158 70% 58% / .1)" strokeWidth="1.4" strokeLinecap="round" />
        <path d={arc(45.6, 148, 206)} fill="none" stroke="hsl(0 0% 0% / .2)" strokeWidth="7" strokeLinecap="round" />
        <path d={arc(45.2, 160, 198)} fill="none" stroke="hsl(0 0% 0% / .22)" strokeWidth="4" strokeLinecap="round" />
        <path d={arc(47.8, 118, 156)} fill="none" stroke="hsl(0 0% 100% / .1)" strokeWidth="1.1" strokeLinecap="round" />
        <ellipse cx="100" cy="93" rx="6" ry="3.2" fill={`url(#${id("spec")})`} opacity=".95" transform="rotate(-32 100 93)" />
        <ellipse cx="99.4" cy="92.2" rx="2.1" ry="1.1" fill="hsl(196 90% 98% / .9)" transform="rotate(-32 99.4 92.2)" />
        <ellipse cx="111" cy="84" rx="1.9" ry="1" fill="hsl(196 80% 94% / .42)" transform="rotate(-24 111 84)" />
        <g className="glass-sweep" opacity="0" clipPath={`url(#${id("glassclip")})`}>
          <rect x="99" y="40" width="22" height="160" fill={`url(#${id("sweep")})`} transform="rotate(18 120 120)" />
        </g>
      </g>

      <g className="iris-backing">
        {BLADE_ANGLES.map(angle => <g key={angle} transform={`rotate(${angle} ${C} ${C})`}>
          <path d={BLADE.shape} fill="#0b0f12" />
          <path d={BLADE.shape} fill={`url(#${id("brush")})`} opacity=".07" />
          <path d={BLADE.lead} fill="none" stroke="hsl(0 0% 100% / .045)" strokeWidth=".9" />
        </g>)}
      </g>

      <g className="iris-blades2">
        {BLADE_ANGLES.map((angle, index) => <g key={angle} transform={`rotate(${angle} ${C} ${C})`}>
          <g className="iris-blade2">
            <path d={BLADE.shape} fill="hsl(0 0% 0% / .55)" transform="translate(0 3.4)" />
            <path d={BLADE.shape} fill={`url(#${id("blade")})`} />
            <path d={BLADE.shape} fill={`url(#${id("brush")})`} opacity={index % 2 === 0 ? 0.15 : 0.09} />
            <path d={BLADE.trail} fill="none" stroke="hsl(0 0% 0% / .55)" strokeWidth="2" transform="translate(-.9 -.2)" />
            <path d={BLADE.trail} fill="none" stroke="hsl(0 0% 100% / .08)" strokeWidth=".9" transform="translate(.9 .2)" />
            <path d={BLADE.lead} fill="none" stroke="hsl(0 0% 0% / .62)" strokeWidth="2.6" transform="translate(0 1.3)" />
            <path d={BLADE.lead} fill="none" stroke={`url(#${id("edgefade")})`} strokeWidth=".9" strokeLinecap="round" transform="translate(0 -.7)" />
            {index === 3 && <path d={BLADE.lead} fill="none" stroke="hsl(76 92% 58% / .26)" strokeWidth=".9" strokeLinecap="round"
              strokeDasharray="14 200" strokeDashoffset="-58" transform="translate(0 -.7)" />}
          </g>
        </g>)}
      </g>

      <circle cx={C} cy={C} r="64" fill={`url(#${id("glow")})`} pointerEvents="none" />
      <g className="iris-retainer">
        <circle cx={C} cy={C} r="74.4" fill="none" stroke="hsl(0 0% 0% / .22)" strokeWidth="10" />
        <circle cx={C} cy={C} r="75.3" fill="none" stroke="hsl(0 0% 0% / .55)" strokeWidth="4.6" />
        <circle cx={C} cy={C} r="84" fill="none" stroke={`url(#${id("ringtone")})`} strokeWidth="17.4" />
        <circle cx={C} cy={C} r="84" fill="none" stroke={`url(#${id("ringprofile")})`} strokeWidth="17.4" />
        <circle cx={C} cy={C} r="80.4" fill="none" stroke="hsl(0 0% 0% / .5)" strokeWidth=".9" />
        <circle cx={C} cy={C} r="86.6" fill="none" stroke="hsl(0 0% 100% / .09)" strokeWidth=".9" />
        <circle cx={C} cy={C} r="89.7" fill="none" stroke="hsl(0 0% 0% / .45)" strokeWidth="1.1" />
        <circle cx={C} cy={C} r="76.1" fill="none" stroke="hsl(0 0% 0% / .8)" strokeWidth="1.5" />
        <circle cx={C} cy={C} r="77.7" fill="none" stroke="hsl(0 0% 100% / .24)" strokeWidth="1"
          strokeDasharray="96 392" transform={`rotate(196 ${C} ${C})`} />
        <circle cx={C} cy={C} r="90.9" fill="none" stroke="hsl(0 0% 100% / .12)" strokeWidth="1"
          strokeDasharray="70 500" transform={`rotate(150 ${C} ${C})`} />
        <circle cx={C} cy={C} r="77.7" fill="none" stroke="hsl(76 92% 58%)" strokeOpacity=".4" strokeWidth="1.2"
          strokeLinecap="round" strokeDasharray="26 462" transform={`rotate(24 ${C} ${C})`} />
      </g>

      <ellipse cx="110" cy="66" rx="38" ry="15" fill={`url(#${id("sheen")})`} transform="rotate(-10 110 66)" pointerEvents="none" />
      <circle cx={C} cy={C} r="92.5" fill={`url(#${id("shade")})`} pointerEvents="none" />
    </svg>
  </span>;
}
