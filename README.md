# Gong Gong 講講

Playful Cantonese flash cards for toddlers — big tap targets, friendly type, and a great big listen button.

**Live site:** https://raygithu1.github.io/cantonese-flashcards/

## What's inside

- **Landing page** — opens straight onto the card picker, with a bright playroom feel.
- **Numbers 一–十** — ten counting cards with chunky count-along friends.
- **Animals 動物** — twelve friendly animals, from 貓 (cat) to 象 (elephant).
- **Vehicles 交通工具** — twelve things that go, including cars, trucks, fire engines and ambulances.
- **Food 食物** — fourteen first foods, from 蘋果 (apple) to 牛奶 (milk), including bread, fruit and vegetables.
- **Colours 顏色** — twelve bright colours, from 紅色 (red) to 金色 (gold).
- **My body 身體** — twelve first body words, from 頭 (head) to 腦 (brain).
- **Family 家人** — twelve first family words, from 媽媽 (mum) to 姨姨 (auntie).
- **Actions 動作** — twelve everyday actions, from 食 (eat) to 刷牙 (brush teeth).
- **Listen & pick 聽一聽** — a no-score listening game. Choose a **deck** (Numbers by default, any Part 1 picture deck, or Mixed) and **2, 3, 4 or 5 cards** (2 by default). All cards in a round come from the same deck, each showing its Chinese character and English word. The app says one Cantonese word, and the child taps the card that matches. Once the card is picked, each card's speaker button unlocks so either word can be heard again. Includes deck and card-count pickers, **Hear it again**, **New cards**, and friendly reveal feedback.
- **Part 2 — Feelings 情緒** — twelve first feelings, from 開心 (happy) to 愛 (love).
- **Part 2 — Clothes 衫褲** — twelve clothing words, from 衫 (top) to 眼鏡 (glasses).
- **Part 2 — Weather 天氣** — twelve weather words, from 太陽 (sun) to 冰 (ice).
- **Part 2 — Bedtime 睡前** — twelve bedtime words, from 床 (bed) to 燈 (lamp).
- **Part 2 — Sea animals 海洋動物** — twelve sea creatures, from 鯨魚 (whale) to 海浪 (wave).
- **Part 2 — Shapes 形狀** — twelve shapes, from 圓形 (circle) to 圓點 (dots).
- **Two separate sets** — Part 2 has its own section below the original eight decks, so the two sets never mix. **Listen & pick** draws from the eight Part 1 decks only, one deck per round (or Mixed).
- **Surprise card 隨機卡** — the last card in the Part 1 grid. Pulls one shuffled card from any of the eight Part 1 decks, with an **Another card** button for endless mix-ups.
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
feelings.html           Part 2: feelings deck
clothes.html            Part 2: clothes deck
weather.html            Part 2: weather deck
bedtime.html            Part 2: bedtime deck
sea.html                Part 2: sea animals deck
shapes.html             Part 2: shapes deck
random.html             surprise card (shuffled across the eight Part 1 decks)
pick.html               listen & pick game
assets/styles.css       all styles
assets/app.js           landing page interactions
assets/deck.js          shared card engine (rendering, speech, navigation)
assets/random.js        merges every deck and shuffles the surprise cards
assets/pick.js          listen & pick game (2-5 cards from one Part 1 deck, or Mixed)
assets/decks/           per-deck data (Part 1: numbers, animals, vehicles, food, colours, body, family, actions;
                        Part 2: feelings, clothes, weather, bedtime, sea, shapes)
assets/numbers/         number dot artwork for Listen & pick (drawn in the deck's token style)
assets/animals/         animal artwork (Twemoji SVG)
assets/vehicles/        vehicle artwork (Twemoji SVG)
assets/food/            food artwork (Twemoji SVG)
assets/colours/         colour artwork (hearts adapted from Twemoji)
assets/body/            body-part artwork (Twemoji plus original drawings)
assets/family/          family artwork (Twemoji SVG)
assets/actions/         action artwork (Twemoji SVG)
assets/feelings/        Part 2: feelings artwork (Twemoji SVG)
assets/clothes/         Part 2: clothes artwork (Twemoji SVG)
assets/weather/         Part 2: weather artwork (Twemoji SVG)
assets/bedtime/         Part 2: bedtime artwork (Twemoji SVG)
assets/sea/             Part 2: sea animal artwork (Twemoji SVG)
assets/shapes/          Part 2: shape artwork (original drawings)
assets/audio/           bundled Cantonese recordings (fallback when no device voice)
assets/audio/animals/   animal recordings
assets/audio/vehicles/  vehicle recordings
assets/audio/food/      food recordings
assets/audio/colours/   colour recordings
assets/audio/body/      body-part recordings
assets/audio/family/    family recordings
assets/audio/actions/   action recordings
assets/audio/feelings/  Part 2: feeling recordings
assets/audio/clothes/   Part 2: clothing recordings
assets/audio/weather/   Part 2: weather recordings
assets/audio/bedtime/   Part 2: bedtime recordings
assets/audio/sea/       Part 2: sea animal recordings
assets/audio/shapes/    Part 2: shape recordings
```

## Credits

Card artwork is adapted from [Twemoji](https://github.com/jdecked/twemoji), licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The head, hair and tummy drawings, and
the Part 2 shape drawings, are original illustrations in the same flat style.

Jyutping and “sounds like” hints are friendly approximations for grown-ups, not a formal romanisation guide.

Made with love for little Cantonese voices. 一齊講廣東話！
