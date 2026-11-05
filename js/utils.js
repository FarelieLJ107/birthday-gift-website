/* ==========================================================================
   utils.js — small shared helpers (DOM, dates, storage, images, toast)
   ========================================================================== */
(function () {
  "use strict";

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July",
                "August", "September", "October", "November", "December"];

  var U = {};

  U.$ = function (sel, root) { return (root || document).querySelector(sel); };
  U.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /** Escape text from config before putting it into innerHTML. */
  U.esc = function (str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

  U.setText = function (id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text == null ? "" : text;
    return el;
  };

  /* ---------- Dates ---------- */
  U.today = function () { var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };

  /** "YYYY-MM-DD" or "today" → local Date (no timezone shift). */
  U.parseDate = function (str) {
    if (!str || str === "today") return U.today();
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(str).trim());
    if (!m) { var d = new Date(str); return isNaN(d) ? U.today() : d; }
    return new Date(+m[1], +m[2] - 1, +m[3]);
  };

  U.formatDate = function (d, opts) {
    opts = opts || {};
    var month = MONTHS[d.getMonth()];
    if (opts.short) month = month.slice(0, 3);
    if (opts.noYear) return month + " " + d.getDate();
    return month + " " + d.getDate() + ", " + d.getFullYear();
  };

  U.daysBetween = function (a, b) {
    var ms = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    return Math.round(ms / 86400000);
  };

  /** Next occurrence of the birthday (today counts as "is today"). */
  U.nextBirthday = function (birthStr) {
    var b = U.parseDate(birthStr);
    var now = new Date();
    var t = U.today();
    var next = new Date(t.getFullYear(), b.getMonth(), b.getDate());
    var isToday = next.getTime() === t.getTime();
    if (!isToday && next < now) next = new Date(t.getFullYear() + 1, b.getMonth(), b.getDate());
    return { date: next, isToday: isToday, age: next.getFullYear() - b.getFullYear(), born: b };
  };

  /* ---------- Storage (never throws) ---------- */
  var PREFIX = "littlebook:";
  U.store = {
    get: function (key, fallback) {
      try { var v = window.localStorage.getItem(PREFIX + key); return v == null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { window.localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* private mode */ }
    }
  };

  /* ---------- Images with automatic placeholder ---------- */
  U.placeholder = function (label) {
    var text = U.esc(label || "photo coming soon");
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FCE4EC"/><stop offset="1" stop-color="#F5B8CB"/></linearGradient></defs>' +
      '<rect width="400" height="500" fill="url(#g)"/>' +
      '<path transform="translate(200 210) scale(3.2)" d="M0 6C-6-4-20 0-14 12L0 24 14 12C20 0 6-4 0 6Z" fill="#fff" opacity=".9"/>' +
      '<text x="200" y="350" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="22" fill="#D83F72">' + text + "</text></svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  };

  U.img = function (src, alt, cls, extra) {
    return '<img src="' + U.esc(src || U.placeholder()) + '" alt="' + U.esc(alt || "") + '"' +
      (cls ? ' class="' + cls + '"' : "") + ' loading="lazy" decoding="async"' + (extra || "") + ">";
  };

  /** Any <img> that fails to load gets a pretty placeholder instead of a broken icon. */
  document.addEventListener("error", function (e) {
    var el = e.target;
    if (el && el.tagName === "IMG" && !el.dataset.fallback) {
      el.dataset.fallback = "1";
      el.src = U.placeholder();
    }
  }, true);

  U.setImg = function (el, src, alt) {
    if (!el) return;
    delete el.dataset.fallback;
    el.src = src || U.placeholder();
    el.alt = alt || "";
  };

  /* ---------- Toast ---------- */
  var toastTimer;
  U.toast = function (msg, ms) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-visible"); }, ms || 2400);
  };

  U.reducedMotion = function () {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  U.wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  window.U = U;
})();
