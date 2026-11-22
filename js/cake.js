/* ==========================================================================
   cake.js — Interactive Birthday Cake
   Flow:  lit → (Make a Wish) → wishing → ready → (Blow the Candles)
          → blowing → done (celebration)  → (Light them again) → lit
   No microphone: blowing is a button, so it works on every device.
   Uses the existing Anim.confetti / Anim.burst for the celebration.
   ========================================================================== */
(function () {
  "use strict";

  var C = window.BIRTHDAY_CONFIG || {};
  var K = C.cake || {};
  var partner = C.partner || {};

  var el = {}, timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, U.reducedMotion() ? Math.min(ms, 60) : ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function setState(s) {
    el.stage.dataset.state = s;
    el.wish.hidden = s !== "lit";
    el.blow.hidden = s !== "ready";
    el.replay.hidden = s !== "done";
    el.moment.hidden = !(s === "wishing" || s === "ready");
    el.done.hidden = s !== "done";
    el.wishtext.hidden = !(s === "wishing" || s === "ready");
    var msg = {
      lit: "The candles are lit. Make a wish first ✨",
      wishing: K.wishMessage || "Close your eyes and make a wish…",
      ready: K.wishHint || "When you're ready, blow out the candles.",
      blowing: "Whoooosh…",
      done: "All candles are out — happy birthday!"
    }[s];
    el.status.textContent = msg;
  }

  function buildCandles() {
    var n = Math.min(9, Math.max(1, parseInt(K.candles, 10) || 3));
    var html = "";
    for (var i = 0; i < n; i++) {
      html += '<span class="candle" style="--i:' + i + '"><span class="candle__flame"></span><span class="candle__smoke"></span></span>';
    }
    el.candles.innerHTML = html;
    el.candles.style.setProperty("--count", n);
  }

  function makeWish() {
    if (el.stage.dataset.state !== "lit") return;
    setState("wishing");
    U.setText("cakeMomentText", K.wishMessage || "Close your eyes and make a wish…");
    U.setText("cakeMomentHint", "");
    later(function () {
      U.setText("cakeMomentHint", K.wishHint || "When you're ready, blow out the candles.");
      setState("ready");
      el.blow.focus({ preventScroll: true });
    }, 2600);
  }

  function blow() {
    if (el.stage.dataset.state !== "ready") return;
    setState("blowing");
    var candles = U.$$(".candle", el.candles);
    candles.forEach(function (c, i) {
      later(function () { c.classList.add("is-out"); }, 220 + i * 170);
    });
    later(function () {
      setState("done");
      var r = el.cake.getBoundingClientRect(), a = document.getElementById("app").getBoundingClientRect();
      Anim.confetti({ count: 170, x: (r.left + r.width / 2 - a.left) / a.width, y: (r.top - a.top) / a.height });
      Anim.burst(r.left + r.width / 2, r.top + 20, { count: 12 });
      el.done.classList.remove("is-in"); void el.done.offsetWidth; el.done.classList.add("is-in");
      later(function () { el.done.scrollIntoView({ behavior: U.reducedMotion() ? "auto" : "smooth", block: "nearest" }); }, 300);
    }, 420 + candles.length * 170);
  }

  function relight() {
    clearTimers();
    U.$$(".candle", el.candles).forEach(function (c) { c.classList.remove("is-out"); });
    setState("lit");
    el.wish.focus({ preventScroll: true });
  }

  function init() {
    var page = document.getElementById("screen-cake");
    if (K.enabled === false) {
      U.$$('[href="#cake"]').forEach(function (a) { a.hidden = true; });
      return;
    }
    if (!page) return;
    el = {
      stage: document.getElementById("cakeStage"),
      cake: document.getElementById("cake"),
      candles: document.getElementById("cakeCandles"),
      wish: document.getElementById("cakeWish"),
      blow: document.getElementById("cakeBlow"),
      replay: document.getElementById("cakeReplay"),
      moment: document.getElementById("cakeMoment"),
      done: document.getElementById("cakeDone"),
      status: document.getElementById("cakeStatus"),
      wishtext: document.querySelector("#screen-cake .cake-wishtext")
    };
    U.setText("cakeDoneTitle", K.celebrationTitle || "Happy Birthday!");
    U.setText("cakeDoneName", partner.nickname || partner.name || "");
    U.setText("cakeDoneMessage", K.celebrationMessage || "");
    buildCandles();
    el.wish.addEventListener("click", makeWish);
    el.blow.addEventListener("click", blow);
    el.replay.addEventListener("click", relight);
    setState("lit");

    // leaving mid-wish: come back to a calm, lit cake
    Router.onLeave("cake", function () {
      var s = el.stage.dataset.state;
      if (s === "wishing" || s === "ready" || s === "blowing") {
        clearTimers();
        U.$$(".candle", el.candles).forEach(function (c) { c.classList.remove("is-out"); });
        setState("lit");
      }
    });
  }

  window.BirthdayCake = { init: init };
})();
