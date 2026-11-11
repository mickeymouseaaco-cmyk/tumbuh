# Tumbuh

A simple, calm companion for first-time parents to follow their baby's teeth coming in, in **Bahasa Melayu (everyday words)** or **English**.

Built with **Expo SDK 58 (React Native, Expo Router)**, the same setup as KiTA. It runs on iPhone, Android and the web, and is deployed to **Vercel** as a website you can add to your Home Screen.

## What's inside

| Screen | What it does |
|---|---|
| Welcome | Pick BM or EN (change any time from the BM / EN switch at the top) |
| Home (Utama) | Baby's age, teeth in (out of 20), teeth that might be coming in now and next, a daily routine checklist, a tip for this age, first dental visit reminder |
| Teeth (Gigi) | Chart of all 20 baby teeth. Tap a tooth to see its usual age and mark it as in. Usual order list and key facts |
| Learn (Belajar) | Daily cleaning, toothpaste & fluoride, food & drink, teething, dentist visits |
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
- `src/components/ui.tsx` — colours, fonts and shared pieces
- `public/` — web app files: `index.html`, `manifest.json` (Home Screen install), `sw.js` (offline start-up), icons
- `vercel.json` — how Vercel builds the site (same as KiTA)
