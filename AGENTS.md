# Architecture rules
- Keep MAKINGREAL as a section-based React page with hash navigation; this early-access experience directs enquiries to external contact channels rather than pretending to provide automated matching.
- Define all visual colors, surfaces and shadows as HSL semantic tokens in global CSS and expose roles through Tailwind.
- Animate the photo wall through requestAnimationFrame and CSS variables, with pointer capability and reduced-motion guards; avoid React renders on every pointer movement.