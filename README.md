# Tumbuh

A simple, calm companion for first-time parents to follow their baby's teeth coming in, in **Bahasa Melayu (everyday words)** or **English**.

Built with **Expo SDK 58 (React Native, Expo Router)**, the same setup as KiTA. It runs on iPhone, Android and the web, and is deployed to **Vercel** as a website you can add to your Home Screen.

## Look & feel

- "Night nursery" futurism: deep midnight base with soft aurora glows, frosted-glass cards, one glowing rose accent, Space Grotesk headings with Plus Jakarta Sans body text
- "Si Kecil": a softly shaded baby head floating in a slowly turning orbit of 20 beads (one per baby tooth); its smile shows the front teeth you've marked
- **Tap the baby's head → the camera flies into the mouth** and lands on a realistic inside-the-mouth view
- Inside the mouth: upper arch with palate and ridges, lower arch with tongue, glossy gums, and true-to-shape crowns (thin curved incisors, pointed canines, grooved molars). Due teeth show as swollen, glowing gum with a sliver of tooth breaking through; marked teeth rise out of the gum
- Floating glass tab bar with a glowing bubble, press feedback everywhere, haptics on phones; Reduce Motion turns the flights and loops into simple fades

## What's inside

| Screen | What it does |
|---|---|
| Welcome | 3 steps: language, baby's name, baby's age (change language any time from the BM / EN switch) |
| Home (Utama) | Baby's age, teeth in (out of 20), teeth that might be coming in now and next, a daily routine checklist, a tip for this age, first dental visit reminder |
| Teeth (Gigi) | Chart of all 20 baby teeth. Tap a tooth to see its usual age and mark it as in. Usual order list and key facts |
| Learn (Belajar) | "Did you know?" card and 5 colourful topics, each opening its own page: daily cleaning, toothpaste & fluoride, food & drink, teething, dentist visits |
| Problems (Masalah) | When to get help quickly, and 12 common conditions (what it looks like, what to do), filterable by Usually fine / Get checked / Urgent |

Everything is saved on the phone only (AsyncStorage). There is no account, no server and no Firebase.

Content is general information only, not a substitute for advice from a doctor or dentist. Have a dentist review it before sharing widely.

## Run it on your computer

```bash
npm install
npm run web      # opens in the browser
npm start        # scan the QR code with Expo Go on your phone
```

## Put it online

See [`docs/DEPLOY.md`](docs/DEPLOY.md).

## Where things are

- `src/app/` — screens (Expo Router): `welcome.tsx`, `(tabs)/index.tsx` (Home), `teeth.tsx`, `learn.tsx`, `problems.tsx`
- `src/lib/content.ts` — **all the words, in BM and EN** (edit here to change any text)
- `src/lib/store.tsx` — what the app remembers on the phone
- `src/lib/teeth.ts` — tooth timing logic
- `src/theme.ts` — colours (light + dark), fonts, corner sizes, animation timing
- `src/components/` — shared pieces, mascot, floating tab bar
- `public/` — web app files: `index.html`, `manifest.json` (Home Screen install), `sw.js` (offline start-up), icons
- `vercel.json` — how Vercel builds the site (same as KiTA)
