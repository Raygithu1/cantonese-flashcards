# Gong Gong 講講

Playful Cantonese flash cards for toddlers — big tap targets, friendly type, and a great big listen button.

**Live site:** https://raygithu1.github.io/cantonese-flashcards/

## What's inside

- **Landing page** — opens straight onto the card picker, with a bright playroom feel.
- **Numbers 一–十** — ten counting cards with chunky count-along friends.
- **Animals 動物** — twelve friendly animals, from 貓 (cat) to 象 (elephant).
- **Vehicles 交通工具** — twelve things that go, including cars, trucks, fire engines and ambulances.
- **Food 食物** — twelve fruits and vegetables, from 蘋果 (apple) to 薯仔 (potato).
- **Colours 顏色** — twelve bright colours, from 紅色 (red) to 金色 (gold).
- **My body 身體** — twelve first body words, from 頭 (head) to 腦 (brain).
- **Family 家人** — twelve first family words, from 媽媽 (mum) to 姨姨 (auntie).
- **Actions 動作** — twelve everyday actions, from 食 (eat) to 刷牙 (brush teeth).
- **Coming soon** — Feelings, Clothes, Weather, Bedtime, Sea animals and Shapes are shown on the landing page as coming-soon cards.
- **Surprise card 隨機卡** — the last card on the landing page. Pulls one shuffled card from any of the eight decks, with an **Another card** button for endless mix-ups.
- Every card includes:
  - a big Chinese character and a cheerful illustration
  - the Jyutping and a “sounds like” hint
  - a large **Say it** button that plays the word in Cantonese
- Swipe, arrow-key and dot navigation, plus an optional auto-say toggle.
- Designed for little fingers: large tap targets, no double-tap zoom delay, and safe-area padding on phones and tablets.
- Remembers the auto-say preference and supports deep links such as `#3`, `#cat` or `?word=strawberry`.
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
food.html               food deck
colours.html            colours deck
body.html               my body deck
family.html             family deck
actions.html            actions deck
random.html             surprise card (shuffled across all decks)
assets/styles.css       all styles
assets/app.js           landing page interactions
assets/deck.js          shared card engine (rendering, speech, navigation)
assets/random.js        merges every deck and shuffles the surprise cards
assets/decks/           per-deck data (numbers, animals, vehicles, food, colours, body, family, actions)
assets/animals/         animal artwork (Twemoji SVG)
assets/vehicles/        vehicle artwork (Twemoji SVG)
assets/food/            food artwork (Twemoji SVG)
assets/colours/         colour artwork (hearts adapted from Twemoji)
assets/body/            body-part artwork (Twemoji plus original drawings)
assets/family/          family artwork (Twemoji SVG)
assets/actions/         action artwork (Twemoji SVG)
assets/audio/           bundled Cantonese recordings (fallback when no device voice)
assets/audio/animals/   animal recordings
assets/audio/vehicles/  vehicle recordings
assets/audio/food/      food recordings
assets/audio/colours/   colour recordings
assets/audio/body/      body-part recordings
assets/audio/family/    family recordings
assets/audio/actions/   action recordings
```

## Credits

Card artwork is adapted from [Twemoji](https://github.com/jdecked/twemoji), licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The head, hair and tummy drawings are
original illustrations in the same flat style.

Jyutping and “sounds like” hints are friendly approximations for grown-ups, not a formal romanisation guide.

Made with love for little Cantonese voices. 一齊講廣東話！
