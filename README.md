# Gong Gong 講講

Playful Cantonese flash cards for toddlers — big tap targets, friendly type, and a great big listen button.

**Live site:** https://raygithu1.github.io/cantonese-flashcards/

## What's inside

- **Landing page** — a bright playroom-style introduction with the deck picker.
- **Numbers 零–十** — eleven flash cards, each with:
  - a big Chinese numeral graphic with count-along friends
  - the Chinese character, Jyutping and a “sounds like” hint
  - a large **Say it** button that plays the number in Cantonese
- Swipe, arrow-key and dot navigation, plus an optional auto-say toggle.
- Remembers the auto-say preference and supports deep links such as `#3` or `?n=3`.
- No build step, no tracking, no accounts.

## Audio

Every card tries the device's Cantonese voice first (`yue-HK` / `zh-HK`) through the browser's
`speechSynthesis`. If the device has no Cantonese voice, the app plays the bundled Cantonese
recordings in `assets/audio/` (made with the macOS `Sinji` voice), so little learners still hear
the right sounds. The closest Chinese voice is only used as a final fallback.

On macOS/iOS you can add a Cantonese voice under **System Settings → Accessibility → Spoken Content → System Voice → Manage Voices**.

## Run locally

It is a fully static site — just open `index.html` in a browser. No server or build step required.

## Publish

The site is served by GitHub Pages from the root of the `main` branch. Every push to `main` redeploys it.

## Project layout

```
index.html          landing page
numbers.html        numbers deck
assets/styles.css   all styles
assets/app.js       landing page interactions
assets/numbers.js   number data, card rendering, speech
assets/audio/       bundled Cantonese recordings (fallback when no device voice)
```

Jyutping and “sounds like” hints are friendly approximations for grown-ups, not a formal romanisation guide.

Made with love for little Cantonese voices. 一齊講廣東話！
