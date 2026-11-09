/* Gong Gong 講講 — shared flash-card deck engine */
(function () {
  "use strict";

  var deck = window.GONG_GONG_DECK;
  if (!deck || !deck.items || !deck.items.length) return;

  var ITEMS = deck.items;
  var THEMES = deck.palette || ["#28b5a6", "#ff6b5b", "#9b7ede", "#3d8fe8", "#e2557f", "#4fae8b"];
  var TOKEN_COLORS = ["#ffd166", "#ff9bc2", "#8ed1fc", "#fff3cf", "#ffffff", "#c7f0e9"];
  var isCount = deck.kind === "count";
  var isRandom = deck.mode === "random";

  var card = document.getElementById("flashcard");
  var tile = document.getElementById("cardTile");
  var art = document.getElementById("cardArt");
  var badge = document.getElementById("cardBadge");
  var bgChar = document.getElementById("cardBgChar");
  var charEl = document.getElementById("cardChar");
  var englishEl = document.getElementById("cardEnglish");
  var jyutpingEl = document.getElementById("cardJyutping");
  var soundsEl = document.getElementById("cardSounds");
  var sayBtn = document.getElementById("sayBtn");
  var sayHint = document.getElementById("sayHint");
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  var dotsEl = document.getElementById("dots");
  var progressFill = document.getElementById("progressFill");
  var progressLabel = document.getElementById("progressLabel");
  var autoSayBtn = document.getElementById("autoSay");
  var voiceNote = document.getElementById("voiceNote");

  var index = 0;
  var autoSay = true;
  var voices = [];
  var bestVoice = null;
  var warned = false;
  var speakingTimer = null;
  var recording = window.Audio ? new Audio() : null;
  var recordingToken = 0;

  if (recording) {
    recording.preload = "auto";
  }

  function slugOf(item, i) {
    if (item.slug !== undefined && item.slug !== null) return String(item.slug);
    if (item.n !== undefined && item.n !== null) return String(item.n);
    return String(i);
  }

  /* ---------- Preferences ---------- */

  try {
    var saved = window.localStorage.getItem("gonggong:autosay");
    if (saved === "off") autoSay = false;
  } catch (e) {
    /* storage can be unavailable in private modes */
  }

  function paintToggle() {
    autoSayBtn.setAttribute("aria-pressed", autoSay ? "true" : "false");
  }

  autoSayBtn.addEventListener("click", function () {
    autoSay = !autoSay;
    paintToggle();
    try {
      window.localStorage.setItem("gonggong:autosay", autoSay ? "on" : "off");
    } catch (e) {
      /* ignore */
    }
    if (autoSay) speakCurrent();
  });

  /* ---------- Speech ---------- */

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

  if (window.speechSynthesis) {
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
  }

  function speakCurrent() {
    if (!window.speechSynthesis && !recording) {
      voiceNote.hidden = false;
      voiceNote.textContent = "This browser can’t play audio yet. Try Chrome, Safari or Edge.";
      return;
    }

    stopAudio();

    if (!voices.length) loadVoices();
    var voice = bestVoice || chooseVoice(window.speechSynthesis ? window.speechSynthesis.getVoices() || [] : []);

    /* Prefer a real Cantonese voice, then the bundled Cantonese recordings,
       then the closest Chinese voice as a last resort. */
    if (voice && scoreVoice(voice) >= 3) {
      speakWithVoice(voice, false);
    } else {
      playRecording();
    }
  }

  function stopAudio() {
    recordingToken += 1;
    window.clearTimeout(speakingTimer);
    sayBtn.classList.remove("is-speaking");

    if (recording) {
      recording.onended = null;
      recording.onerror = null;
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
    sayBtn.classList.add("is-speaking");
    window.clearTimeout(speakingTimer);
    speakingTimer = window.setTimeout(function () {
      sayBtn.classList.remove("is-speaking");
    }, 2800);
  }

  function endSpeaking() {
    window.clearTimeout(speakingTimer);
    sayBtn.classList.remove("is-speaking");
  }

  function speakWithVoice(voice, hadRecordingError) {
    var utterance = new SpeechSynthesisUtterance(ITEMS[index].char);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || "yue-HK";
    } else {
      utterance.lang = "yue-HK";
    }
    utterance.rate = 0.62;
    utterance.pitch = 1.02;
    utterance.volume = 1;

    beginSpeaking();

    var finished = false;
    function done() {
      if (finished) return;
      finished = true;
      endSpeaking();
    }

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

  function playRecording() {
    if (!recording) {
      var fallback = bestVoice || chooseVoice(window.speechSynthesis ? window.speechSynthesis.getVoices() || [] : []);
      if (fallback) {
        speakWithVoice(fallback, true);
      } else if (window.speechSynthesis) {
        speakWithVoice(null, true);
      }
      return;
    }

    var item = ITEMS[index];
    var token = ++recordingToken;
    var settled = false;
    var file = item.audio || slugOf(item, index) + ".m4a";

    beginSpeaking();

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
        speakWithVoice(fallback, true);
      } else if (window.speechSynthesis) {
        speakWithVoice(null, true);
      }
    }

    try {
      recording.pause();
      recording.currentTime = 0;
      recording.src = item.audioSrc || (deck.audioBase || "assets/audio/") + file;
      var attempt = recording.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(failed);
      }
    } catch (e) {
      failed();
    }
  }

  /* ---------- Card rendering ---------- */

  function tokenSvg(color, shape, i) {
    var faceY = shape === "circle" ? 26 : 27;
    var mouth = "M24.5 " + (faceY + 10) + "c2.8 3.6 12.2 3.6 15 0";
    var body =
      shape === "circle"
        ? '<circle cx="32" cy="32" r="27" fill="' + color + '" stroke="#2d2a32" stroke-width="3"/>'
        : '<rect x="5" y="5" width="54" height="54" rx="18" fill="' + color + '" stroke="#2d2a32" stroke-width="3"/>';

    return (
      '<span class="count-item" style="--delay:' + i * 45 + 'ms">' +
      '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
      body +
      '<circle cx="23" cy="' + faceY + '" r="3.4" fill="#2d2a32"/>' +
      '<circle cx="41" cy="' + faceY + '" r="3.4" fill="#2d2a32"/>' +
      '<path d="' + mouth + '" fill="none" stroke="#2d2a32" stroke-width="3" stroke-linecap="round"/>' +
      "</svg></span>"
    );
  }

  function renderArt(item) {
    var html = "";

    if (item.img) {
      html =
        '<span class="picture-frame">' +
        '<img class="picture-art" src="' + item.img + '" alt="" width="36" height="36" decoding="async">' +
        "</span>";
    } else if (item.n === 0) {
      html =
        '<div class="empty-zero">' +
        '<span class="empty-zero__ring" aria-hidden="true"></span>' +
        '<span class="empty-zero__text">nothing here yet</span>' +
        "</div>";
    } else {
      for (var i = 0; i < item.n; i++) {
        var shape = i % 2 === 0 ? "squircle" : "circle";
        var color = TOKEN_COLORS[i % TOKEN_COLORS.length];
        html += tokenSvg(color, shape, i);
      }
    }

    art.innerHTML = html;
    art.classList.toggle("flashcard__art--picture", !!item.img);
    card.classList.toggle("is-picture", !!item.img);
    card.classList.toggle("is-dense", (isCount || item.n !== undefined) && item.n >= 7);
  }

  function renderBadge(item) {
    if (item.badge) {
      badge.textContent = item.badge;
    } else if (deck.emblemImg) {
      badge.innerHTML = '<img class="flashcard__badge-img" src="' + deck.emblemImg + '" alt="">';
    } else if (isCount) {
      badge.textContent = item.n;
    } else {
      badge.textContent = String(index + 1);
    }
  }

  function buildDots() {
    if (isRandom) {
      dotsEl.hidden = true;
      return;
    }

    var fragment = document.createDocumentFragment();
    ITEMS.forEach(function (item, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "dot";
      dot.setAttribute("aria-label", "Go to " + item.char + " — " + item.english);
      dot.addEventListener("click", function () {
        goTo(i, true);
      });
      fragment.appendChild(dot);
    });
    dotsEl.appendChild(fragment);
    dotsEl.classList.toggle("dots--many", ITEMS.length > 8);
    dotsEl.setAttribute("aria-label", "Choose a " + (deck.noun || "card"));
  }

  function updateDots() {
    Array.prototype.forEach.call(dotsEl.children, function (dot, i) {
      var active = i === index;
      dot.classList.toggle("is-active", active);
      if (active) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  }

  function render(shouldSpeak) {
    var item = ITEMS[index];
    var len = Array.from(item.char).length;

    stopAudio();

    renderArt(item);
    renderBadge(item);
    bgChar.textContent = item.char;
    bgChar.setAttribute("data-len", String(len));
    charEl.textContent = item.char;
    charEl.classList.toggle("is-long", len === 2);
    charEl.classList.toggle("is-xlong", len >= 3);
    englishEl.textContent = item.english;
    jyutpingEl.textContent = item.jyutping;
    soundsEl.textContent = item.sounds;
    sayHint.textContent = "tap to hear " + item.char;
    sayBtn.setAttribute("aria-label", "Say it — tap to hear " + item.char + " — " + item.jyutping);
    sayBtn.title = item.hint || "";

    tile.style.setProperty("--tile", item.tile || THEMES[index % THEMES.length]);
    progressFill.style.width = ((index + 1) / ITEMS.length) * 100 + "%";
    progressLabel.textContent = index + 1 + " / " + ITEMS.length;

    var deckLink = document.getElementById("cardDeckLink");
    var deckName = document.getElementById("cardDeckName");
    if (deckLink && deckName && item.deckHref) {
      deckName.textContent = item.deckName || "card";
      deckLink.href = item.deckHref;
      deckLink.setAttribute("aria-label", "See more " + (item.deckName || "card") + " cards");
      deckLink.hidden = false;
    }

    updateDots();

    card.classList.remove("is-changing");
    void card.offsetWidth;
    card.classList.add("is-changing");

    try {
      window.history.replaceState(null, "", "#" + slugOf(item, index));
    } catch (e) {
      /* file:// and some embedded browsers block this */
    }

    if (shouldSpeak && autoSay) speakCurrent();
  }

  function goTo(nextIndex, speak) {
    index = (nextIndex + ITEMS.length) % ITEMS.length;
    render(speak);
  }

  /* ---------- Interaction ---------- */

  sayBtn.addEventListener("click", function () {
    speakCurrent();
  });

  prevBtn.setAttribute("aria-label", isRandom ? "Previous card" : "Previous " + (deck.noun || "card"));
  nextBtn.setAttribute("aria-label", isRandom ? "Another card" : "Next " + (deck.noun || "card"));

  var shuffleBtn = document.getElementById("shuffleBtn");
  if (isRandom && shuffleBtn) {
    shuffleBtn.addEventListener("click", function () {
      goTo(index + 1, true);
    });
  }

  prevBtn.addEventListener("click", function () {
    goTo(index - 1, true);
  });

  nextBtn.addEventListener("click", function () {
    goTo(index + 1, true);
  });

  document.addEventListener("keydown", function (event) {
    var tag = (event.target && event.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1, true);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1, true);
    } else if (event.key === " " || event.key === "Spacebar") {
      if (tag === "BUTTON" || tag === "A") return;
      event.preventDefault();
      speakCurrent();
    }
  });

  /* Swipe the card on touch screens. */
  var touchStartX = 0;
  var touchStartY = 0;
  var touchActive = false;

  card.addEventListener(
    "touchstart",
    function (event) {
      if (event.target.closest("button")) return;
      var touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchActive = true;
    },
    { passive: true }
  );

  card.addEventListener(
    "touchend",
    function (event) {
      if (!touchActive) return;
      touchActive = false;
      var touch = event.changedTouches[0];
      var dx = touch.clientX - touchStartX;
      var dy = touch.clientY - touchStartY;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        goTo(index + (dx < 0 ? 1 : -1), true);
      }
    },
    { passive: true }
  );

  /* ---------- Boot ---------- */

  buildDots();
  paintToggle();

  var hash = String(window.location.hash || "").replace("#", "");
  var start = ITEMS.findIndex(function (item, i) {
    return slugOf(item, i) === hash;
  });

  if (start === -1) {
    try {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("n");
      if (q === null) q = params.get("word");
      if (q === null) q = params.get("item");
      if (q !== null) {
        start = ITEMS.findIndex(function (item, i) {
          return slugOf(item, i) === q;
        });
      }
    } catch (e) {
      /* ignore */
    }
  }
  index = start >= 0 ? start : 0;

  render(false);

  /* Prime the speech engine on the first real tap, especially on iOS. */
  document.addEventListener(
    "pointerdown",
    function prime() {
      if (window.speechSynthesis) loadVoices();
      document.removeEventListener("pointerdown", prime);
    },
    { once: true }
  );
})();
