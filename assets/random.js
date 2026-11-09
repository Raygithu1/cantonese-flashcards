/* Gong Gong 講講 — builds one shuffled deck from every section */
(function () {
  "use strict";

  var decks = window.__GONG_GONG_DECKS || [];
  var BADGES = { numbers: "數", animals: "動", vehicles: "車", food: "食", colours: "色", body: "身" };
  var NAMES = {
    numbers: "Numbers",
    animals: "Animals",
    vehicles: "Vehicles",
    food: "Food",
    colours: "Colours",
    body: "My body"
  };
  var items = [];
  var FALLBACK_TILES = ["#ff6b5b", "#ffb020", "#28b5a6", "#9b7ede", "#e2557f", "#4f8fe8"];

  decks.forEach(function (deck) {
    (deck.items || []).forEach(function (item, i) {
      var copy = {};
      var key;

      for (key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key)) copy[key] = item[key];
      }

      var slug = item.slug !== undefined && item.slug !== null ? String(item.slug) : String(item.n);

      copy.badge = BADGES[deck.id] || "?";
      copy.deckName = NAMES[deck.id] || deck.id;
      copy.deckHref = deck.id + ".html";
      copy.tile = deck.palette ? deck.palette[i % deck.palette.length] : FALLBACK_TILES[i % FALLBACK_TILES.length];
      copy.audioSrc = item.audio || (deck.audioBase || "assets/audio/") + slug + ".m4a";
      items.push(copy);
    });
  });

  /* Fisher–Yates shuffle so every visit starts with a different card. */
  for (var i = items.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var swap = items[i];
    items[i] = items[j];
    items[j] = swap;
  }

  delete window.GONG_GONG_DECK;
  window.GONG_GONG_DECK = {
    id: "random",
    kind: "picture",
    mode: "random",
    noun: "card",
    palette: ["#ff6b5b", "#ffb020", "#28b5a6", "#9b7ede", "#e2557f", "#4f8fe8"],
    items: items
  };
})();
