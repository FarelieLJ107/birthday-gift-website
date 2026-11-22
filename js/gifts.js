/* ==========================================================================
   gifts.js — Multiple Birthday Gifts
   • Gift boxes rendered from config.gifts.items (3–4 recommended)
   • Opening animation → content in a modal sheet → opened state saved
     in the existing U.store (key "giftsOpened"); every gift can be reopened
   • A gift with requiresQuest: true stays locked until Quest.isComplete()
   Content types: message | photos | audio | letter
   ========================================================================== */
(function () {
  "use strict";

  var C = window.BIRTHDAY_CONFIG || {};
  var G = C.gifts || {};
  var sender = C.sender || {};
  var KEY = "giftsOpened";

  var items = (G.items || []).slice(0, 6).map(function (g, i) {
    var c = Object.assign({}, g);
    c.id = String(g.id || "gift-" + (i + 1));
    c.index = i;
    return c;
  });

  var opened = (function () {
    var v = U.store.get(KEY, []);
    return Array.isArray(v) ? v : [];
  })();

  function isOpened(g) { return opened.indexOf(g.id) > -1; }
  function isLocked(g) { return !!g.requiresQuest && window.Quest && !Quest.isComplete(); }
  function markOpened(g) {
    if (isOpened(g)) return;
    opened.push(g.id);
    U.store.set(KEY, opened);
  }

  /* ---------- grid ---------- */
  function boxHTML(g) {
    var num = String(g.index + 1).padStart(2, "0");
    var state = isLocked(g) ? "locked" : isOpened(g) ? "opened" : "closed";
    var statusText = state === "locked" ? "Locked" : state === "opened" ? "Opened · tap to reopen" : "Tap to open";
    return '<button type="button" class="gift-box gift-box--' + (g.index % 4) + " is-" + state + '" data-id="' + U.esc(g.id) + '"' +
      ' aria-label="Gift ' + num + ": " + U.esc(g.label || g.title || "") + " — " + statusText + '">' +
      '<span class="gift-box__art" aria-hidden="true">' +
        '<span class="gift-box__lid"><span class="gift-box__bow"></span></span>' +
        '<span class="gift-box__base"></span>' +
        (state === "locked" ? '<span class="gift-box__lock">' + Icons.svg("lock") + "</span>" : "") +
      "</span>" +
      '<span class="gift-box__num">Gift ' + num + "</span>" +
      '<span class="gift-box__label">' + U.esc(g.label || g.title || "") + "</span>" +
      '<span class="gift-box__status">' + (state === "opened" ? Icons.svg("check") : state === "locked" ? Icons.svg("lock") : "") + statusText + "</span>" +
      "</button>";
  }

  function renderGrid() {
    var grid = document.getElementById("giftGrid");
    if (!grid) return;
    grid.innerHTML = items.map(boxHTML).join("");
    var lockedOne = items.filter(isLocked)[0];
    var hint = document.getElementById("giftQuestHint");
    if (hint) hint.hidden = !lockedOne;
    if (lockedOne) U.setText("giftQuestHintText", lockedOne.lockedMessage || "The last gift opens after the Birthday Quest.");
    var meta = document.getElementById("exploreGiftsMeta");
    if (meta) meta.textContent = opened.filter(function (id) { return items.some(function (g) { return g.id === id; }); }).length + "/" + items.length + " opened";
  }

  /* ---------- modal ---------- */
  var modal, panel, body, opener = null, audioEl = null;

  function contentHTML(g) {
    var h = '<p class="eyebrow">gift ' + String(g.index + 1).padStart(2, "0") + "</p>" +
      '<h2 class="gift-modal__title" id="giftModalTitle">' + U.esc(g.title || g.label || "A little gift") + "</h2>";
    var type = g.type || "message";
    if (type === "message") {
      h += '<div class="gift-note"><span class="tape tape--top" aria-hidden="true"></span><p class="hand">' + U.esc(g.message || "") + "</p></div>";
      if (g.insideJoke) h += '<div class="sticky-note gift-joke"><span class="clip" aria-hidden="true"></span><p class="hand">' + U.esc(g.insideJoke) + "</p></div>";
      if (g.note) h += '<p class="gift-modal__sign hand">' + U.esc(g.note) + "</p>";
    } else if (type === "photos") {
      if (g.message) h += '<p class="gift-modal__text">' + U.esc(g.message) + "</p>";
      var photos = (g.photos || []).filter(function (p) { return p && (p.src || typeof p === "string"); });
      h += '<div class="gift-photos">' + photos.map(function (p, i) {
        var src = typeof p === "string" ? p : p.src, cap = typeof p === "string" ? "" : (p.caption || "");
        return '<figure class="polaroid gift-photo" style="--rot:' + [-2.5, 2, -1.2, 1.6][i % 4] + 'deg">' + U.img(src, cap || "Memory photo " + (i + 1)) +
          (cap ? '<figcaption class="polaroid__caption hand">' + U.esc(cap) + "</figcaption>" : "") + "</figure>";
      }).join("") + "</div>";
      if (!photos.length) h += '<p class="gift-modal__text">Photos are on their way ♡</p>';
    } else if (type === "audio") {
      if (g.message) h += '<p class="gift-modal__text">' + U.esc(g.message) + "</p>";
      h += '<div class="gift-audio">' +
        '<span class="gift-audio__icon" aria-hidden="true">' + Icons.svg("volume") + "</span>" +
        '<audio class="gift-audio__player" controls preload="metadata"></audio>' +
        '<p class="gift-audio__missing hand" hidden>' + U.esc(g.missingMessage || "The voice note is on its way ♡") + "</p>" +
        "</div>";
    } else { // letter / final gift
      h += '<article class="gift-letter"><p class="hand">' + U.esc(g.message || "") + "</p>" +
        '<p class="gift-letter__sign hand">— ' + U.esc(g.signature || sender.name || "") + "</p></article>";
    }
    return h;
  }

  function openModal(g, from) {
    opener = from || document.activeElement;
    body.innerHTML = contentHTML(g);
    if ((g.type || "message") === "audio") setupAudio(g);
    modal.hidden = false;
    modal.classList.remove("is-closing");
    modal.classList.add("is-open");
    panel.scrollTop = 0;
    setTimeout(function () { modal.querySelector(".gift-modal__close").focus(); }, 40);
  }

  function setupAudio(g) {
    audioEl = body.querySelector(".gift-audio__player");
    var missing = body.querySelector(".gift-audio__missing");
    function showMissing() { audioEl.hidden = true; missing.hidden = false; }
    if (!g.audio) { showMissing(); return; }
    audioEl.addEventListener("error", showMissing);
    audioEl.addEventListener("play", function () {
      // let the voice note be heard: pause the background music (it isn't auto-resumed)
      if (window.Music && Music.isPlaying()) { Music.pause(); U.toast("Background music paused for the voice note"); }
    });
    audioEl.src = g.audio;
  }

  function closeModal(instant) {
    if (!modal || modal.hidden) return;
    if (audioEl) { try { audioEl.pause(); } catch (e) { /* noop */ } audioEl = null; }
    var finish = function () {
      modal.hidden = true;
      modal.classList.remove("is-open", "is-closing");
      body.innerHTML = "";
      if (opener && document.body.contains(opener) && !instant) { try { opener.focus({ preventScroll: true }); } catch (e) { /* noop */ } }
    };
    if (instant || U.reducedMotion()) { finish(); return; }
    modal.classList.add("is-closing");
    setTimeout(finish, 240);
  }

  /* ---------- interaction ---------- */
  var busy = false;
  function onGridClick(e) {
    var b = e.target.closest(".gift-box");
    if (!b || busy) return;
    var g = items.filter(function (x) { return x.id === b.dataset.id; })[0];
    if (!g) return;
    if (isLocked(g)) {
      b.classList.remove("is-denied"); void b.offsetWidth; b.classList.add("is-denied");
      U.toast(g.lockedMessage || "Finish the Birthday Quest to open this one ♡", 3000);
      return;
    }
    var first = !isOpened(g);
    busy = true;
    b.classList.add("is-opening");
    var r = b.getBoundingClientRect();
    setTimeout(function () { if (first) Anim.burst(r.left + r.width / 2, r.top + r.height * 0.35, { count: 10 }); }, first ? 520 : 0);
    setTimeout(function () {
      busy = false;
      b.classList.remove("is-opening");
      markOpened(g);
      renderGrid();
      openModal(g, document.querySelector('.gift-box[data-id="' + CSS.escape(g.id) + '"]'));
      if (first && g.index === items.length - 1) Anim.confetti({ count: 120, y: 0.25 });
    }, U.reducedMotion() ? 30 : first ? 900 : 380);
  }

  function init() {
    var page = document.getElementById("screen-gifts");
    if (G.enabled === false || !items.length) {
      U.$$('[href="#gifts"]').forEach(function (a) { a.hidden = true; });
      return;
    }
    if (!page) return;
    U.setText("giftsTitle", G.title || "Your Birthday Gifts");
    U.setText("giftsSubtitle", G.subtitle || "");
    modal = document.getElementById("giftModal");
    panel = modal.querySelector(".gift-modal__panel");
    body = document.getElementById("giftModalBody");

    renderGrid();
    document.getElementById("giftGrid").addEventListener("click", onGridClick);
    modal.addEventListener("click", function (e) { if (e.target.closest("[data-gift-close]")) closeModal(); });
    document.addEventListener("keydown", function (e) {
      if (!modal || modal.hidden) return;
      if (e.key === "Escape") { e.preventDefault(); closeModal(); }
      else if (e.key === "Tab") {
        var f = U.$$("button, a[href], audio[controls]", modal).filter(function (x) { return x.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener("hashchange", function () { closeModal(true); });

    if (window.Quest) Quest.onChange(function () { renderGrid(); });
    Router.on("gifts", function () { renderGrid(); });
  }

  window.Gifts = { init: init, isOpened: function (id) { return opened.indexOf(id) > -1; } };
})();
