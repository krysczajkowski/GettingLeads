# GettingLeads Design System

> Built from the ground up — no Figma, codebase, or screenshots were attached. Everything below is an opinionated direction proposed by the design agent. Flag anything that doesn't match your vision and we'll iterate.

## Product context

**GettingLeads** is a B2B SaaS that helps businesses find potential customers by automatically monitoring public Facebook groups. It uses AI to identify posts that look like buying intent or relevant opportunities, then surfaces them in a dashboard with a relevance score and surrounding context so sales/marketing teams can quickly decide where to follow up.

Two surfaces shipped in this system:
1. **Marketing site** — the public landing page (the immediate brief).
2. **Product dashboard** — the in-app experience where leads are reviewed.

Both share one visual language but pull different levers — the marketing site leans editorial and motion-heavy; the dashboard leans dense, calm, and information-first.

### Source materials
- _No assets were attached to this project._ Brand identity, palette, type, voice and components were defined from scratch and should be reviewed against the founder's vision before being treated as canon.

### The metaphor: signal
The product listens. Across noisy public groups it picks out the few posts that matter. Everything in the brand — the name, the voice, the radar motif, the animated "scanning" states — leans into that idea: **GettingLeads converts noise into signal.**

---

## Index

| File / folder | What's in it |
|---|---|
| `README.md` | This file — brand context, tone, visuals, iconography. |
| `colors_and_type.css` | All design tokens (color, type, spacing, radius, shadow, motion) as CSS custom properties. Import this anywhere. |
| `SKILL.md` | Agent-skill entrypoint. |
| `assets/` | Logos, icons, illustrations. |
| `fonts/` | Font face declarations. (Web fonts loaded from Google Fonts CDN.) |
| `preview/` | Design-system cards rendered for the review tab. Source of truth for what each token + component looks like in isolation. |
| `ui_kits/marketing/` | Landing-page UI kit — hero, feature blocks, social proof, pricing, footer. |
| `ui_kits/dashboard/` | Product dashboard UI kit — lead inbox, score detail, sidebar, filters. |

---

## Content fundamentals

### Voice
GettingLeads talks like a sharp colleague who's already done the work for you. **Confident, direct, slightly understated.** Never breathless. Never "revolutionary." The product does the bragging — copy stays out of the way.

- **Second person.** "You" and "your team." Never "we provide" or "our solution."
- **Active verbs.** "Find," "monitor," "score," "reach." Avoid "leverage," "empower," "unlock."
- **Concrete over abstract.** "37 new leads in the Shopify Founders group this week" beats "Powerful insights at your fingertips."
- **Numbers earn their place.** Show counts, scores, times. Don't pad slides with stats that mean nothing.

### Casing
- **Sentence case for everything.** Headlines, buttons, nav, section titles. "Start free trial," not "Start Free Trial."
- Acronyms keep their caps (AI, CRM, SaaS).
- Brand name is always **GettingLeads** — one word, two capitals. Never "Getting Leads," never "Gettingleads."

### Tone examples
| Don't | Do |
|---|---|
| Revolutionize your lead generation with AI-powered insights! | Find leads in Facebook groups while you sleep. |
| Our platform leverages cutting-edge ML to surface opportunities. | We read every post so you don't have to. |
| Unlock unprecedented sales velocity. | New leads, scored and ready, every morning. |
| Get started today! 🚀 | Try it free for 14 days. |

### Vibe
Calm, capable, a little dry. The product is doing serious work in the background; copy reflects that confidence by saying less. Think Linear's release notes more than HubSpot's homepage.

### Emoji
**No.** Not in product, not on the marketing site, not in error messages. Unicode arrows (→, ↗) and bullets (·) are fine and used frequently.

### Numbers, scores, times
- Scores are written as `87/100` or `87` with a small `/100` muted next to it — never as percentages.
- Time deltas are short and lowercase: `4m ago`, `2h ago`, `3d ago`.
- Currency is always rendered with the symbol, no decimals for round numbers: `$49`, `$1,200`.

---

## Visual foundations

### Overall vibe
Bright, white, technical, motion-rich. Heavy use of negative space. Type does most of the heavy lifting; color is reserved for the brand's single signal color and a small set of semantic states. The result should feel closer to **Linear / Vercel / Cal.com / Resend** than to **HubSpot / Salesforce / Mailchimp**.

### Color
- **Base:** pure white background (`#FFFFFF`). All surfaces sit on white or near-white. No dark mode in v1.
- **Ink:** a near-black warm slate (`#0B0F0E`) for primary text. Body copy gets a touch lighter (`#3A4441`).
- **Signal green** — the one brand color. Used for primary CTAs, the logo mark, score chips, sparklines, and any "live / matched / new" state. Restraint matters: green only where you want the eye.
- **Semantic** colors (warn / danger / info) are muted and used only in product chrome — toasts, validation, score bands.
- **Backgrounds & strokes** are a warm-neutral scale (`bg-1` … `bg-3`, `line-1` … `line-3`). All borders are 1px and `line-1`.

### Type
Two free families do everything:
- **Geist Sans** — UI, body, headlines, marketing display. Tracked tight on big sizes (`-0.02em`), normal at body.
- **Geist Mono** — labels, scores, metadata, code, kbd shortcuts. Slightly muted by default.
- **Instrument Serif (italic)** — used _sparingly_ for one editorial moment per page (e.g. a single italicized word in a hero headline). Optional, decorative only.

Type scale is fluid for display (`clamp()`), fixed for UI. Headlines get tight tracking (`-0.025em`) and tight leading (`1.05`). Body copy is `1.55` leading. No all-caps except for one micro-label style (`eyebrow`).

### Spacing
4px base unit. Tokens go `--s-1` (4px) through `--s-12` (96px), plus a few jumbo values for marketing layouts. Use multiples of 4 everywhere; never invent in-between values.

### Radii
Conservative. `--r-sm: 6px` for chips and inputs. `--r-md: 10px` for cards and buttons. `--r-lg: 16px` for large surfaces like the lead-detail panel. `--r-pill: 999px` for status pills. Never softer than 16px on cards — we are not a kids' app.

### Cards
Cards are a 1px `line-1` border on white, with `--r-md` corners and a barely-there shadow (`--shadow-card`). On hover they get `--shadow-card-hover` and lift `1px` (translateY). No colored left-border accents, ever. No emoji headers.

### Shadows
Soft, tight, low-opacity. Two-layer stack: a 1px contact shadow plus a wider ambient blur. Tokens: `--shadow-card`, `--shadow-card-hover`, `--shadow-pop` (menus / popovers), `--shadow-modal`. Nothing dramatic.

### Backgrounds
**Mostly white.** A few permitted exceptions:
- Hero and section dividers use a faint dotted grid (`--bg-grid`) at very low opacity to add texture without color.
- Section bands occasionally use `--bg-2` (warm off-white) — never gradients.
- A single signature backdrop pattern, the **radar sweep**, appears once per page as an SVG behind the hero. Subtle, slow, animated.

### Borders & dividers
1px, `line-1`. Section dividers are dashed and `line-2`. Tables use bottom-borders only, never grid lines.

### Hover states
- **Buttons (primary):** background darkens 8%, subtle 1px lift.
- **Buttons (secondary):** background goes `bg-2`.
- **Cards:** shadow upgrade + 1px lift.
- **Links:** underline appears with a `200ms` ease.
- **Icons:** opacity goes `0.6 → 1`.

### Press states
- Primary buttons compress `scale(0.985)` and shadow collapses to flat for `80ms`.
- Cards do _not_ compress on click — they navigate.

### Transparency & blur
Used very sparingly. Modal scrims use `rgba(11,15,14,0.4)`. The sticky nav uses `backdrop-filter: blur(12px)` over `rgba(255,255,255,0.72)`. No frosted glass on cards.

### Imagery
Imagery is _not_ a major part of the brand. When real product UI is shown, it's shown directly (no mockup frames). Stock photography is avoided. If a hero ever needs an image, it's a desaturated screenshot of the actual dashboard. No people, no abstract gradients, no AI-generated illustrations.

### Animation
Motion is a first-class brand element. Everything in motion uses one of three eases and stays under 400ms unless it's a deliberate ambient loop.

- **Easing:** `--ease-out` (cubic-bezier(0.22, 1, 0.36, 1)) for entrances, `--ease-in-out` (cubic-bezier(0.65, 0, 0.35, 1)) for state changes, `--ease-spring` (cubic-bezier(0.34, 1.56, 0.64, 1)) for emphasis (rare).
- **Durations:** `--dur-fast` 120ms (micro), `--dur` 200ms (default), `--dur-slow` 400ms (entrances), `--dur-ambient` 6s+ (radar sweep, marquees).

Signature motions:
1. **Radar sweep** behind hero — rotates slowly, infinitely.
2. **Number ticker** — score and counter values count up on mount.
3. **Scan line** — a thin signal-green line sweeps across "live monitoring" UI to indicate activity.
4. **Marquee of groups** — the names of public groups being monitored scroll horizontally in the social-proof section.
5. **Card hover** — 1px lift + shadow upgrade, 200ms.
6. **Stagger fades** — list items fade and translateY(8px → 0) with a 30ms stagger.

No bounces on entrances. No big springs. Motion is _confident_, not playful.

### Layout rules
- Marketing site grid: 12 column, 1280px max, 24px gutters.
- Section vertical rhythm: `120px` desktop / `64px` mobile between sections.
- Sticky nav: 64px tall, white with blur.
- Dashboard grid: collapsible 240px sidebar + content; 1px line-1 dividers everywhere.
- All marketing hero copy aligned left. Centered marketing copy is reserved for short transitional sections (testimonial, CTA).

---

## Iconography

**Library:** [Lucide](https://lucide.dev) icons throughout. Loaded from the unpkg CDN via `<script src="https://unpkg.com/lucide@latest"></script>` — see usage notes in `ui_kits/*/README.md`. This was a substitution chosen by the design agent — flag and swap if you have a preferred set.

**Style rules:**
- 1.5px stroke weight, monoline, no fills (Lucide default).
- Standard sizes: `14px` (inline with body), `16px` (UI default), `20px` (buttons & nav), `24px` (feature blocks).
- Default opacity: `0.7` against ink color. Hover/active: `1.0`.
- Icons are always paired with text in product chrome — no icon-only toolbar buttons except in the dashboard's filter rail.

**Where icons live:**
- Nav, buttons, list rows, form field affordances, status indicators.
- Feature blocks on the marketing site get larger (32px) icons inside a `--r-md` square with `bg-2` background.

**No emoji.** No unicode pictographs as icons. The only unicode glyphs permitted are arrows (→, ↗, ↘) and the middot (·) as a separator.

**Logo:** see `assets/logo.svg`. The wordmark is "GettingLeads" set in Geist Sans, weight 600, tracking `-0.025em`, with a custom radar mark to the left. The mark alone (`assets/logo-mark.svg`) is used in the favicon, the sticky nav at small sizes, and the dashboard's collapsed sidebar.

---

## Caveats & open questions

1. **The shipping product uses blue for primary actions; the brand system uses signal green.** Per your direction, the dashboard UI kit was modernized to align with the brand (green primary, Geist type, soft cards, mono labels, subtle motion). The screens themselves still match the real product's information architecture (Dashboard / Settings / Billing) and data shapes — only the visual treatment was upgraded. If you re-skin the production app to match, you'll have one consistent design system end-to-end.
2. **Brand was invented from scratch** before screenshots arrived. The radar metaphor, voice rules, type pairing, and motion vocabulary are proposals — none have been signed off against existing product copy.
3. **Geist & Instrument Serif** are loaded from Google Fonts. If you have licensed brand fonts, swap them in `fonts/` and update `colors_and_type.css`.
4. **Lucide icons** are a stand-in. The real product was mostly icon-free — the modernized dashboard adds Lucide icons for the sidebar nav and group rows. Tell me if you'd rather strip icons back out.
5. **Only Dashboard / Settings / Billing screens** were provided. Other surfaces (onboarding, account, team, post detail) would need to be invented.
