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
  var hearBtn = document.getElementById("hearBtn");
  var feedback = document.getElementById("pickFeedback");
  var newPairBtn = document.getElementById("newPairBtn");
  var voiceNote = document.getElementById("voiceNote");

  var bag = [];
  var cards = [];
  var targetIndex = 0;
  var lastPairKey = "";
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
    window.clearTimeout(speakingTimer);
    hearBtn.classList.remove("is-speaking");

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

  function beginSpeaking() {
    hearBtn.classList.add("is-speaking");
    window.clearTimeout(speakingTimer);
    speakingTimer = window.setTimeout(function () {
      hearBtn.classList.remove("is-speaking");
    }, 3000);
  }

  function endSpeaking() {
    window.clearTimeout(speakingTimer);
    hearBtn.classList.remove("is-speaking");
  }

  function speakWithVoice(voice, item, hadRecordingError) {
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
      beginSpeaking();
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

  function playRecording(item) {
    if (!recording) {
      var fallback = bestVoice || chooseVoice(window.speechSynthesis ? window.speechSynthesis.getVoices() || [] : []);
      if (fallback) {
        speakWithVoice(fallback, item, true);
      } else if (window.speechSynthesis) {
        speakWithVoice(null, item, true);
      }
      return;
    }

    var token = ++recordingToken;
    var settled = false;

    recording.onplaying = function () {
      if (token !== recordingToken) return;
      heard = true;
      beginSpeaking();
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
        speakWithVoice(fallback, item, true);
      } else if (window.speechSynthesis) {
        speakWithVoice(null, item, true);
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

  function speakTarget() {
    var item = cards[targetIndex];
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
      speakWithVoice(voice, item, false);
    } else {
      playRecording(item);
    }
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

  function drawPair() {
    if (bag.length < 2) bag = shuffled(pool);
    return [bag.shift(), bag.shift()];
  }

  function pairKey(pair) {
    return pair
      .map(function (item) {
        return item.char;
      })
      .sort()
      .join("|");
  }

  function pickPair() {
    var pair = drawPair();
    var tries = 0;
    /* Avoid repeating the previous pair, and avoid two cards with the same
       English word (food 橙 and colour 橙色 are both “orange”). */
    while ((pairKey(pair) === lastPairKey || pair[0].english === pair[1].english) && tries < 12) {
      pair = drawPair();
      tries += 1;
    }
    lastPairKey = pairKey(pair);
    return pair;
  }

  function buildCard(item, slot) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pick-card";
    btn.setAttribute("data-slot", String(slot));
    btn.setAttribute("aria-label", "Picture " + (slot + 1));

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

    tile.appendChild(art);
    tile.appendChild(mark);

    var caption = document.createElement("span");
    caption.className = "pick-card__caption";
    caption.setAttribute("aria-hidden", "true");

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

    return btn;
  }

  function renderRound() {
    window.clearTimeout(announceTimer);
    stopAudio();
    answered = false;
    heard = false;
    trialTapUsed = false;

    cards = pickPair();
    targetIndex = Math.random() < 0.5 ? 0 : 1;

    board.innerHTML = "";
    board.appendChild(buildCard(cards[0], 0));
    board.appendChild(buildCard(cards[1], 1));
    board.setAttribute("data-target", String(targetIndex));

    feedback.className = "pick-feedback";
    feedback.textContent = "Listen, then tap the picture that matches.";

    hearBtn.disabled = false;
    hearBtn.querySelector(".say-btn__text small").textContent = "tap to hear the word";

    announceTimer = window.setTimeout(speakTarget, 420);
  }

  function revealCard(btn, item, correct) {
    btn.classList.add("is-revealed");
    var caption = btn.querySelector(".pick-card__caption");
    caption.setAttribute("aria-hidden", "false");

    btn.setAttribute("aria-label", item.char + " — " + item.english + (correct ? ". Correct!" : ". Not the word you heard."));
  }

  function choose(slot) {
    if (answered) return;
    if (!cards.length) return;

    /* Some browsers block speech until the page is tapped. If the very first
       tap lands on a card before any audio has started, play the word instead
       of judging an answer the child has not heard yet. */
    if (!heard && !trialTapUsed) {
      trialTapUsed = true;
      speakTarget();
      feedback.className = "pick-feedback is-try";
      feedback.textContent = "Have a listen first — then tap the picture.";
      return;
    }

    answered = true;

    var target = cards[targetIndex];
    var chosen = cards[slot];
    var isRight = slot === targetIndex;
    var targetBtn = board.children[targetIndex];
    var chosenBtn = board.children[slot];

    Array.prototype.forEach.call(board.children, function (btn, i) {
      var item = cards[i];
      revealCard(btn, item, i === targetIndex);
      btn.setAttribute("aria-disabled", "true");
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

  newPairBtn.addEventListener("click", renderRound);

  hearBtn.addEventListener("click", function () {
    speakTarget();
  });

  document.addEventListener("keydown", function (event) {
    var tag = (event.target && event.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    if (event.key === "1" || event.key === "2") {
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

  renderRound();
})();
