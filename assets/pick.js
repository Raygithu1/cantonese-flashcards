/* Gong Gong 講講 — listen-and-pick game */
(function () {
  "use strict";

  var decks = window.__GONG_GONG_DECKS || [];
  var FALLBACK_TILES = ["#ff6b5b", "#ffb020", "#28b5a6", "#9b7ede", "#e2557f", "#4f8fe8"];
  var pool = [];

  decks.forEach(function (deck) {
    (deck.items || []).forEach(function (item, i) {
      if (!item.img || !item.char || !item.english) return;

      var slug = item.slug !== undefined && item.slug !== null ? String(item.slug) : String(i);
      pool.push({
        char: item.char,
        english: item.english,
        img: item.img,
        audioSrc: item.audio || (deck.audioBase || "assets/audio/") + slug + ".m4a",
        tile: deck.palette ? deck.palette[i % deck.palette.length] : FALLBACK_TILES[i % FALLBACK_TILES.length]
      });
    });
  });

  if (pool.length < 2) return;

  var board = document.getElementById("pickBoard");
  var main = document.querySelector(".pick-main");
  var hearBtn = document.getElementById("hearBtn");
  var feedback = document.getElementById("pickFeedback");
  var newPairBtn = document.getElementById("newPairBtn");
  var voiceNote = document.getElementById("voiceNote");
  var countBtns = document.querySelectorAll(".pick-count__btn");

  var CARD_COUNTS = [2, 3, 4, 5];
  var cardCount = 2;
  var bag = [];
  var cards = [];
  var targetIndex = 0;
  var lastRoundKey = "";
  var answered = false;
  var heard = false;
  var trialTapUsed = false;
  var announceTimer = null;

  /* ---------- Speech ---------- */

  var voices = [];
  var bestVoice = null;
  var warned = false;
  var speakingTimer = null;
  var recording = window.Audio ? new Audio() : null;
  var recordingToken = 0;

  if (recording) recording.preload = "auto";

  function loadVoices() {
    if (!window.speechSynthesis) return;
    voices = window.speechSynthesis.getVoices() || [];
    bestVoice = chooseVoice(voices);
  }

  function scoreVoice(voice) {
    var lang = String(voice.lang || "").toLowerCase().replace("_", "-");
    var name = String(voice.name || "").toLowerCase();

    if (lang.indexOf("yue") === 0 || name.indexOf("cantonese") !== -1 || name.indexOf("粵") !== -1) {
      return 4;
    }
    if (lang === "zh-hk" || lang === "zh-hant-hk") return 3;
    if (lang.indexOf("zh-tw") === 0 || lang.indexOf("zh-hant") === 0) return 2;
    if (lang.indexOf("zh") === 0) return 1;
    return 0;
  }

  function chooseVoice(list) {
    var best = null;
    var bestScore = 0;
    list.forEach(function (voice) {
      var score = scoreVoice(voice);
      if (score > bestScore) {
        bestScore = score;
        best = voice;
      }
    });
    return best;
  }

  function stopAudio() {
    recordingToken += 1;
    endSpeaking();

    if (recording) {
      recording.onended = null;
      recording.onerror = null;
      recording.onplaying = null;
      try {
        recording.pause();
        recording.currentTime = 0;
      } catch (e) {
        /* ignore */
      }
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  var activeSpeaker = hearBtn;

  function beginSpeaking(speaker) {
    window.clearTimeout(speakingTimer);
    if (activeSpeaker) activeSpeaker.classList.remove("is-speaking");
    activeSpeaker = speaker || hearBtn;
    activeSpeaker.classList.add("is-speaking");
    speakingTimer = window.setTimeout(function () {
      if (activeSpeaker) activeSpeaker.classList.remove("is-speaking");
    }, 3000);
  }

  function endSpeaking() {
    window.clearTimeout(speakingTimer);
    if (activeSpeaker) activeSpeaker.classList.remove("is-speaking");
    activeSpeaker = hearBtn;
  }

  function speakWithVoice(voice, item, hadRecordingError, speaker) {
    var utterance = new SpeechSynthesisUtterance(item.char);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || "yue-HK";
    } else {
      utterance.lang = "yue-HK";
    }
    utterance.rate = 0.62;
    utterance.pitch = 1.02;
    utterance.volume = 1;

    var finished = false;
    function done() {
      if (finished) return;
      finished = true;
      endSpeaking();
    }

    utterance.onstart = function () {
      heard = true;
      beginSpeaking(speaker);
    };
    utterance.onend = done;
    utterance.onerror = done;

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      done();
    }

    if ((!voice || scoreVoice(voice) < 3) && !warned) {
      warned = true;
      voiceNote.hidden = false;
      voiceNote.textContent =
        (hadRecordingError ? "The recorded audio could not play, so the closest Chinese voice is being used instead. " : "") +
        "Add a Cantonese (粵語) voice in your device settings for the most accurate sound.";
    }
  }

  function playRecording(item, speaker) {
    if (!recording) {
      var fallback = bestVoice || chooseVoice(window.speechSynthesis ? window.speechSynthesis.getVoices() || [] : []);
      if (fallback) {
        speakWithVoice(fallback, item, true, speaker);
      } else if (window.speechSynthesis) {
        speakWithVoice(null, item, true, speaker);
      }
      return;
    }

    var token = ++recordingToken;
    var settled = false;

    recording.onplaying = function () {
      if (token !== recordingToken) return;
      heard = true;
      beginSpeaking(speaker);
    };

    recording.onended = function () {
      if (settled || token !== recordingToken) return;
      settled = true;
      endSpeaking();
    };

    recording.onerror = function () {
      failed();
    };

    function failed() {
      if (settled || token !== recordingToken) return;
      settled = true;
      endSpeaking();
      var fallback = bestVoice || chooseVoice(window.speechSynthesis ? window.speechSynthesis.getVoices() || [] : []);
      if (fallback) {
        speakWithVoice(fallback, item, true, speaker);
      } else if (window.speechSynthesis) {
        speakWithVoice(null, item, true, speaker);
      }
    }

    try {
      recording.pause();
      recording.currentTime = 0;
      recording.src = item.audioSrc;
      var attempt = recording.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(failed);
      }
    } catch (e) {
      failed();
    }
  }

  function speakItem(item, speaker) {
    if (!item) return;

    if (!window.speechSynthesis && !recording) {
      voiceNote.hidden = false;
      voiceNote.textContent = "This browser can’t play audio yet. Try Chrome, Safari or Edge.";
      return;
    }

    stopAudio();

    if (!voices.length) loadVoices();
    var voice = bestVoice || chooseVoice(window.speechSynthesis ? window.speechSynthesis.getVoices() || [] : []);

    if (voice && scoreVoice(voice) >= 3) {
      speakWithVoice(voice, item, false, speaker);
    } else {
      playRecording(item, speaker);
    }
  }

  function speakTarget() {
    speakItem(cards[targetIndex], hearBtn);
  }

  if (window.speechSynthesis) {
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
  }

  /* ---------- Rounds ---------- */

  function shuffled(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var swap = copy[i];
      copy[i] = copy[j];
      copy[j] = swap;
    }
    return copy;
  }

  function drawCards(count) {
    var picked = [];
    var usedEnglish = {};
    var guard = 0;

    while (picked.length < count && guard < pool.length * 8) {
      if (!bag.length) bag = shuffled(pool);
      var item = bag.shift();
      guard += 1;

      /* Never put the same English word on two cards in one round
         (food 橙 and colour 橙色 are both “orange”). */
      if (usedEnglish[item.english]) continue;
      usedEnglish[item.english] = true;
      picked.push(item);
    }

    return picked;
  }

  function roundKey(list) {
    return list
      .map(function (item) {
        return item.char;
      })
      .sort()
      .join("|");
  }

  function pickRound(count) {
    var round = drawCards(count);
    var tries = 0;

    /* Avoid repeating the exact previous round. */
    while (round.length === count && roundKey(round) === lastRoundKey && tries < 12) {
      round = drawCards(count);
      tries += 1;
    }

    lastRoundKey = roundKey(round);
    return round;
  }

  function buildCard(item, slot) {
    /* A div with role="button" so the little speaker button can sit inside
       without nesting one button inside another. */
    var btn = document.createElement("div");
    btn.className = "pick-card";
    btn.setAttribute("data-slot", String(slot));
    btn.setAttribute("role", "button");
    btn.setAttribute("tabindex", "0");
    btn.setAttribute("aria-label", item.char + " — " + item.english);

    var tile = document.createElement("span");
    tile.className = "pick-card__tile";
    tile.style.setProperty("--tile", item.tile);

    var art = document.createElement("img");
    art.className = "pick-card__art";
    art.src = item.img;
    art.alt = "";
    art.width = 200;
    art.height = 200;
    art.decoding = "async";

    var mark = document.createElement("span");
    mark.className = "pick-card__mark";
    mark.setAttribute("aria-hidden", "true");

    var say = document.createElement("button");
    say.type = "button";
    say.className = "pick-card__say";
    say.setAttribute("aria-label", "Hear " + item.char + " — " + item.english);
    say.innerHTML =
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" stroke="none"/>' +
      '<path d="M15.5 8.5a5 5 0 0 1 0 7"/>' +
      '<path d="M18.5 6a9 9 0 0 1 0 12"/>' +
      "</svg>";
    /* Both words stay visible, but the speakers stay locked until the child
       has picked a card. After the answer both can be replayed freely. */
    say.disabled = !answered;
    say.classList.toggle("is-locked", !answered);
    if (!answered) say.title = "Pick a card first";
    say.addEventListener("click", function (event) {
      event.stopPropagation();
      if (!answered) return;
      speakItem(item, say);
    });

    tile.appendChild(art);
    tile.appendChild(say);
    tile.appendChild(mark);

    var caption = document.createElement("span");
    caption.className = "pick-card__caption";

    var charEl = document.createElement("span");
    charEl.className = "pick-card__char";
    charEl.lang = "yue";
    charEl.textContent = item.char;

    var englishEl = document.createElement("span");
    englishEl.className = "pick-card__english";
    englishEl.textContent = item.english;

    caption.appendChild(charEl);
    caption.appendChild(englishEl);

    btn.appendChild(tile);
    btn.appendChild(caption);

    btn.addEventListener("click", function () {
      choose(slot);
    });

    btn.addEventListener("keydown", function (event) {
      if (event.target !== btn) return;
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        choose(slot);
      }
    });

    return btn;
  }

  function renderRound() {
    window.clearTimeout(announceTimer);
    stopAudio();
    answered = false;
    heard = false;
    trialTapUsed = false;

    cards = pickRound(cardCount);
    targetIndex = Math.floor(Math.random() * cards.length);

    board.innerHTML = "";
    cards.forEach(function (item, i) {
      board.appendChild(buildCard(item, i));
    });
    board.setAttribute("data-count", String(cards.length));
    board.setAttribute("data-target", String(targetIndex));
    if (main) main.setAttribute("data-count", String(cards.length));

    feedback.className = "pick-feedback";
    feedback.textContent = "Listen, then tap the word that matches.";

    hearBtn.disabled = false;
    hearBtn.querySelector(".say-btn__text small").textContent = "tap to hear the word";

    announceTimer = window.setTimeout(speakTarget, 420);
  }

  function revealCard(btn, item, correct) {
    btn.classList.add("is-revealed");
    btn.setAttribute("aria-label", item.char + " — " + item.english + (correct ? ". Correct!" : ". Not the word you heard."));
  }

  function choose(slot) {
    if (!cards.length || slot < 0 || slot >= cards.length) return;

    /* After the round is answered, tapping a card replays that card's word,
       so the child can compare both. */
    if (answered) {
      var settledCard = board.children[slot];
      speakItem(cards[slot], settledCard ? settledCard.querySelector(".pick-card__say") : hearBtn);
      return;
    }

    /* Some browsers block speech until the page is tapped. If the very first
       tap lands on a card before any audio has started, play the word instead
       of judging an answer the child has not heard yet. */
    if (!heard && !trialTapUsed) {
      trialTapUsed = true;
      speakTarget();
      feedback.className = "pick-feedback is-try";
      feedback.textContent = "Have a listen first — then tap the word.";
      return;
    }

    answered = true;
    window.clearTimeout(announceTimer);

    /* Now that the round is answered, let either word be heard again. */
    Array.prototype.forEach.call(board.children, function (btn) {
      var speaker = btn.querySelector(".pick-card__say");
      if (!speaker) return;
      speaker.disabled = false;
      speaker.classList.remove("is-locked");
      speaker.removeAttribute("title");
    });

    var target = cards[targetIndex];
    var chosen = cards[slot];
    var isRight = slot === targetIndex;
    var targetBtn = board.children[targetIndex];
    var chosenBtn = board.children[slot];

    Array.prototype.forEach.call(board.children, function (btn, i) {
      var item = cards[i];
      revealCard(btn, item, i === targetIndex);
    });

    targetBtn.classList.add("is-correct");

    if (isRight) {
      feedback.className = "pick-feedback is-yes";
      feedback.textContent = "Yes! That’s " + target.char + " — " + target.english + ".";
    } else {
      chosenBtn.classList.add("is-wrong");
      feedback.className = "pick-feedback is-try";
      feedback.textContent = "That’s " + chosen.char + " — " + chosen.english + ". The word was " + target.char + " — " + target.english + ".";
    }
  }

  /* ---------- Interaction ---------- */

  function paintCount() {
    Array.prototype.forEach.call(countBtns, function (btn) {
      var n = Number(btn.getAttribute("data-count"));
      btn.setAttribute("aria-pressed", n === cardCount ? "true" : "false");
    });
  }

  function setCardCount(next) {
    if (CARD_COUNTS.indexOf(next) === -1 || next === cardCount) return;
    cardCount = next;
    paintCount();
    renderRound();
  }

  Array.prototype.forEach.call(countBtns, function (btn) {
    btn.addEventListener("click", function () {
      setCardCount(Number(btn.getAttribute("data-count")));
    });
  });

  newPairBtn.addEventListener("click", renderRound);

  hearBtn.addEventListener("click", function () {
    speakTarget();
  });

  document.addEventListener("keydown", function (event) {
    var tag = (event.target && event.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    /* The focused card already handled Enter/Space to pick an answer. */
    if (event.defaultPrevented) return;

    if (/^[1-5]$/.test(event.key) && Number(event.key) <= cards.length) {
      event.preventDefault();
      choose(Number(event.key) - 1);
    } else if (event.key === "h" || event.key === "H") {
      event.preventDefault();
      speakTarget();
    } else if (event.key === "n" || event.key === "N") {
      event.preventDefault();
      renderRound();
    } else if (event.key === " " || event.key === "Spacebar") {
      if (tag === "BUTTON" || tag === "A") return;
      event.preventDefault();
      speakTarget();
    }
  });

  document.addEventListener(
    "pointerdown",
    function prime() {
      if (window.speechSynthesis) loadVoices();
      document.removeEventListener("pointerdown", prime);
    },
    { once: true }
  );

  paintCount();
  renderRound();
})();
