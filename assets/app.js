/* Gong Gong 講講 — landing page interactions */
(function () {
  "use strict";

  var toast = document.getElementById("toast");
  var toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2600);
  }

  document.querySelectorAll("[data-soon]").forEach(function (card) {
    card.addEventListener("click", function () {
      showToast(card.getAttribute("data-soon") + " is coming soon — try Numbers, Animals or Vehicles!");
    });
  });

  /* Friendly little greeting for screen readers and curious grown-ups. */
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
  }
})();
