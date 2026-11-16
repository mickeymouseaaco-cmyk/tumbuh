# Tumbuh design system — "night nursery"

Tumbuh is opened by a tired parent, often at night, phone in one hand. So: a calm dark room, one warm
character, big tap targets, few words. A children's learning app in warmth, a healthcare product in clarity.

All tokens live in `src/theme.ts`. Browser-drawn parts (focus ring, selection, scrollbars) use the matching
CSS variables in `public/index.html`.

## Colour

| Role | Token | Value | Use |
|---|---|---|---|
| Background | `bg` | `#0B0A1A` | every screen, with the aurora on top |
| Glass card | `surface` / `surfaceAlt` | white 6% / 9% | cards / tiles inside cards |
| Solid card | `surfaceSolid`, `surfaceRaised` | `#17152E`, `#1E1B3A` | tab bar, stacks / sheets |
| Border | `border`, `borderStrong` | white 11% / 22% | card edge / unchecked controls |
| Text | `text`, `textMuted`, `textSubtle` | `#F4F1FF`, `#ADA7CC`, `#8F89B3` | 16.0 : 1, 7.8 : 1, 5.4 : 1 on `surfaceSolid` |
| Brand (violet) | `brand`, `brandSoft`, `onBrandSoft` | `#7C6CFF` | atmosphere, mascot stage, **selections** (language, boy/girl) |
| Action (pink) | `accent`, `accentText`, `accentSoft`, `accentBorder` | `#FF7AB0` | the one action colour: primary buttons, "due now", teeth progress |
| Success | `tone(c,'success')` → mint `#7FF0DC` | | done, understood, tooth is in |
| Warning | `tone(c,'warning')` → butter `#FDE68A` | | take care, get checked, tips |
| Danger | `tone(c,'danger')` → rose `#FFB4BE` | | urgent, overdue, delete |
| Info | `tone(c,'info')` → sky `#A5E1FD` | | neutral help |
| Disabled | `disabledBg`, `disabledText` | | controls that can't be used yet |

Rules
- One action colour. Pink means "tap this" or "this is happening now". Violet means "this is chosen".
- Meaning colours never swap: mint is always good/done, butter always caution, rose always urgent.
- **Glow budget:** only the primary button, a tooth that is due now, and the "now" line on the chart glow.
  Everything else gets depth from `elevation.*` (offset + blur) and 1px glass borders.
- No raw hex in screens. Text on a bright fill uses `ink`; on photos use `scrim` behind white.
- Dark theme only. A light theme was considered and left out: every illustration, the mouth view and the
  mascot cut-outs are tuned for the dark stage, and the app is mostly used in dim rooms.

## Type

Outfit (round, friendly) for titles and numbers; Plus Jakarta Sans for reading. Tokens: `typo.*`.

| Token | Size / line | Use |
|---|---|---|
| `display` | 32 / 38 | screen title (one per screen) |
| `title` | 24 / 30 | sheet titles |
| `heading` | 19 / 24 | section and card titles |
| `number` | 44 / 48 | the big count |
| `body` | 15 / 22 | reading text |
| `bodySm` | 14 / 20 | supporting text |
| `label` | 14 / 18 semibold | buttons-in-cards, list rows |
| `caption` | 12 / 16 | helper text. Nothing smaller than 12. |
| `button` | 16 / 20 semibold | primary buttons |

No uppercase kickers above titles. `Eyebrow` is a sentence-case field label only.

## Space & shape

4-point grid (`space`). Inside a group 4–12, between groups 16–20, between sections 24–32.
Actions are pills. Cards 28, tiles and chips 18, small marks 10 (`radius`). Tap targets ≥ 44.
Content column max 560, centred, so phones, tablets and desktop share one layout.

## Motion (`motion` in theme.ts)

Two voices.
- **Premium** — navigation, cards, sheets, progress. `motion.ease` (strong ease-out), no overshoot.
  Press 110 ms → 0.97, release 200 ms. Cards enter once, staggered 45 ms. Progress bars fill in 700 ms.
  Tabs never slide; the active tab's pill grows in.
- **Playful** — mascot, tooth pop, ticks, celebrations. `motion.pop` (small overshoot).
  The mascot breathes (1.2%, 3.6 s) and floats 4 px; hops once when a tooth is marked; changes to the
  happy pose when today's routine is done or a lesson is completed.
- **Ambient** — the aurora drifts over 26 s; the orbit turns once in 40 s.

Everything loops/enters only when Reduce Motion is off. Nothing moves near text being read.

## Illustration

The mascot (Kenji / Yuki) is the only character. Always the approved artwork through `TumbuhBaby`
(`src/components/tumbuh-baby.tsx`); never redrawn, recoloured, mirrored or stretched.
Missing artwork is listed in `docs/ART-NEEDED.md`.
