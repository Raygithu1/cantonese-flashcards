# Gong Gong 講講

Playful Cantonese flash cards for toddlers — big tap targets, friendly type, and a great big listen button.

**Live site:** https://raygithu1.github.io/cantonese-flashcards/

## What's inside

- **Landing page** — a bright playroom-style introduction with the deck picker.
- **Numbers 零–十** — eleven counting cards with chunky count-along friends.
- **Animals 動物** — twelve friendly animals, from 貓 (cat) to 象 (elephant).
- **Vehicles 交通工具** — twelve things that go, including cars, trucks, fire engines and ambulances.
- Every card includes:
  - a big Chinese character and a cheerful illustration
  - the Jyutping and a “sounds like” hint
  - a large **Say it** button that plays the word in Cantonese
- Swipe, arrow-key and dot navigation, plus an optional auto-say toggle.
- Remembers the auto-say preference and supports deep links such as `#3`, `#cat` or `?word=fire-truck`.
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
index.html              landing page
numbers.html            numbers deck
animals.html            animals deck
vehicles.html           vehicles deck
assets/styles.css       all styles
assets/app.js           landing page interactions
assets/deck.js          shared card engine (rendering, speech, navigation)
assets/decks/           per-deck data (numbers, animals, vehicles)
assets/animals/         animal artwork (Twemoji SVG)
assets/vehicles/        vehicle artwork (Twemoji SVG)
assets/audio/           bundled Cantonese recordings (fallback when no device voice)
assets/audio/animals/   animal recordings
assets/audio/vehicles/  vehicle recordings
```

## Credits

Animal and vehicle artwork comes from [Twemoji](https://github.com/jdecked/twemoji), licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Jyutping and “sounds like” hints are friendly approximations for grown-ups, not a formal romanisation guide.

Made with love for little Cantonese voices. 一齊講廣東話！
