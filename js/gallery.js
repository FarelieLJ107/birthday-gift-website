/* ==========================================================================
   gallery.js — Our Memories grid, filters, lightbox and Memory Detail page
   ========================================================================== */
(function () {
  "use strict";

  var C = window.BIRTHDAY_CONFIG || {};
  var memories = (C.memories || []).map(function (m, i) {
    var copy = Object.assign({}, m);
    copy.id = String(m.id || "memory-" + (i + 1));
    copy.index = i;
    copy.dateObj = U.parseDate(m.date);
    return copy;
  });

  var ROT = [-2.2, 1.8, -1.2, 2.4, -1.8, 1.2, -2.6, 1.6];
  var STICKERS = ["heart", "star", "flower", "sparkles"];
  var visible = memories.slice();        // current filtered list (lightbox order)

  function byId(id) { for (var i = 0; i < memories.length; i++) if (memories[i].id === id) return memories[i]; return null; }
  function dateLabel(m) { return U.formatDate(m.dateObj); }

  /* ---------- Grid ---------- */
  function cardHTML(m, i) {
    var size = m.size === "tall" || m.size === "wide" ? " memory-card--" + m.size : "";
    var deco = "";
    if (i % 3 === 0) deco = '<span class="tape ' + (i % 2 ? "tape--tr" : "tape--tl") + (i % 4 === 0 ? "" : " tape--cream") + '" aria-hidden="true"></span>';
    else if (i % 3 === 1) deco = '<span class="sticker" style="--rot:' + (i * 17 % 30 - 15) + 'deg" aria-hidden="true">' + Icons.svg(STICKERS[i % STICKERS.length]) + "</span>";
    return '<button type="button" class="memory-card' + size + '" data-id="' + U.esc(m.id) + '" style="--rot:' + ROT[i % ROT.length] + 'deg" aria-label="Open photo: ' + U.esc(m.title) + '">' +
      deco +
      U.img(m.photo, m.title, "memory-card__img") +
      '<span class="memory-card__cap"><span class="memory-card__title">' + U.esc(m.title) + '</span>' +
      '<span class="memory-card__date">' + U.esc(U.formatDate(m.dateObj, { short: true })) + "</span></span></button>";
  }

  function renderGrid() {
    var grid = document.getElementById("memoryGrid");
    if (!memories.length) {
      grid.innerHTML = '<p class="page-sub">Add memories in <code>js/config.js</code> to fill this page.</p>';
      return;
    }
    grid.innerHTML = memories.map(cardHTML).join("");
    grid.addEventListener("click", function (e) {
      var card = e.target.closest(".memory-card");
      if (!card) return;
      var idx = visible.findIndex(function (m) { return m.id === card.dataset.id; });
      Lightbox.open(idx < 0 ? 0 : idx, card);
    });
  }

  function renderFilters() {
    var wrap = document.getElementById("memoryFilters");
    var tags = ["All"];
    memories.forEach(function (m) { if (m.tag && tags.indexOf(m.tag) === -1) tags.push(m.tag); });
    if (tags.length < 3) { wrap.hidden = true; return; }
    wrap.innerHTML = tags.map(function (t, i) {
      return '<button type="button" role="tab" class="chip-btn" data-tag="' + U.esc(t) + '" aria-selected="' + (i === 0) + '">' + U.esc(t) + "</button>";
    }).join("");
    wrap.addEventListener("click", function (e) {
      var b = e.target.closest(".chip-btn");
      if (!b) return;
      U.$$(".chip-btn", wrap).forEach(function (x) { x.setAttribute("aria-selected", String(x === b)); });
      applyFilter(b.dataset.tag);
    });
  }

  function applyFilter(tag) {
    var n = 0;
    visible = memories.filter(function (m) { return tag === "All" || m.tag === tag; });
    U.$$("#memoryGrid .memory-card").forEach(function (card) {
      var m = byId(card.dataset.id);
      var show = tag === "All" || m.tag === tag;
      card.classList.toggle("is-filtered-out", !show);
      card.classList.remove("is-appearing");
      if (show) {
        void card.offsetWidth;
        card.style.setProperty("--d", (n++ * 60) + "ms");
        card.classList.add("is-appearing");
      }
    });
  }

  /* ---------- Featured (home) + "more memories" scrollers ---------- */
  function hCard(m) {
    return '<a class="h-card" href="#memory/' + encodeURIComponent(m.id) + '">' +
      U.img(m.photo, m.title, "h-card__img") +
      '<span class="h-card__body"><span class="h-card__date">' + U.esc(U.formatDate(m.dateObj, { short: true })) + "</span>" +
      '<span class="h-card__title" style="display:block">' + U.esc(m.title) + "</span></span></a>";
  }

  function renderFeatured() {
    var el = document.getElementById("featuredList");
    if (!el) return;
    var featured = memories.filter(function (m) { return m.featured; });
    if (!featured.length) featured = memories.slice(0, 5);
    el.innerHTML = featured.map(hCard).join("");
  }

  /* ---------- Lightbox ---------- */
  var Lightbox = (function () {
    var root, img, idx = 0, opener = null, closing = false, startX = null, startY = null;

    function fill(dir) {
      var m = visible[idx];
      if (!m) return;
      U.setImg(img, m.photo, m.title);
      img.classList.remove("is-next", "is-prev");
      if (dir) { void img.offsetWidth; img.classList.add(dir > 0 ? "is-next" : "is-prev"); }
      U.setText("lbDate", dateLabel(m));
      U.setText("lbTitle", m.title);
      U.setText("lbCaption", m.caption || "");
      U.setText("lbCounter", (idx + 1) + " / " + visible.length);
      document.getElementById("lbStory").href = "#memory/" + encodeURIComponent(m.id);
      var single = visible.length < 2;
      document.getElementById("lbPrev").disabled = single;
      document.getElementById("lbNext").disabled = single;
      document.getElementById("lbPrev").style.visibility = single ? "hidden" : "";
      document.getElementById("lbNext").style.visibility = single ? "hidden" : "";
    }

    function step(d) {
      if (visible.length < 2) return;
      idx = (idx + d + visible.length) % visible.length;
      fill(d);
    }

    function open(i, from) {
      if (!visible.length) return;
      idx = i; opener = from || document.activeElement;
      closing = false;
      root.hidden = false;
      root.classList.remove("is-closing");
      root.classList.add("is-open");
      fill(0);
      setTimeout(function () { root.querySelector("[data-lb-close].icon-btn").focus(); }, 30);
    }

    function close(instant) {
      if (root.hidden || closing) return;
      closing = true;
      var finish = function () {
        root.hidden = true; root.classList.remove("is-open", "is-closing"); closing = false;
        if (opener && document.body.contains(opener) && !instant) { try { opener.focus({ preventScroll: true }); } catch (e) { /* noop */ } }
      };
      if (instant || U.reducedMotion()) { finish(); return; }
      root.classList.add("is-closing");
      setTimeout(finish, 250);
    }

    function init() {
      root = document.getElementById("lightbox");
      img = document.getElementById("lbImg");
      root.addEventListener("click", function (e) {
        if (e.target.closest("[data-lb-close]")) close();
      });
      document.getElementById("lbPrev").addEventListener("click", function () { step(-1); });
      document.getElementById("lbNext").addEventListener("click", function () { step(1); });
      document.getElementById("lbStory").addEventListener("click", function () { close(true); });

      document.addEventListener("keydown", function (e) {
        if (root.hidden) return;
        if (e.key === "Escape") { e.preventDefault(); close(); }
        else if (e.key === "ArrowRight") step(1);
        else if (e.key === "ArrowLeft") step(-1);
        else if (e.key === "Tab") {           // focus trap
          var f = U.$$("button:not([disabled]), a[href]", root).filter(function (x) { return x.offsetParent !== null && x.style.visibility !== "hidden"; });
          if (!f.length) return;
          var first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });

      // swipe left / right
      var fig = root.querySelector(".lightbox__figure");
      fig.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; startY = e.touches[0].clientY; }, { passive: true });
      fig.addEventListener("touchend", function (e) {
        if (startX == null) return;
        var dx = e.changedTouches[0].clientX - startX, dy = e.changedTouches[0].clientY - startY;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) step(dx < 0 ? 1 : -1);
        else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) close();
        startX = startY = null;
      }, { passive: true });

      window.addEventListener("hashchange", function () { close(true); });
    }

    return { init: init, open: open, close: close };
  })();

  /* ---------- Memory detail page ---------- */
  function renderDetail(id) {
    var m = byId(id) || memories[0];
    if (!m) { Router.go("memories", { replace: true }); return; }

    var img = document.getElementById("detailImg");
    U.setImg(img, m.photo, m.title);

    var photos = [m.photo].concat(m.extraPhotos || []).filter(Boolean);
    var thumbs = document.getElementById("detailThumbs");
    if (photos.length > 1) {
      thumbs.hidden = false;
      thumbs.innerHTML = photos.map(function (p, i) {
        return '<button type="button" data-src="' + U.esc(p) + '" aria-label="Show photo ' + (i + 1) + '" aria-current="' + (i === 0) + '">' + U.img(p, "") + "</button>";
      }).join("");
    } else { thumbs.hidden = true; thumbs.innerHTML = ""; }

    U.setText("detailTag", m.tag || "Memory");
    U.setText("detailCount", "Memory " + (m.index + 1) + " of " + memories.length);
    U.setText("detailTitle", m.title);
    U.setText("detailDate", dateLabel(m));
    U.setText("detailLocation", m.location || "");
    document.getElementById("detailLocationRow").hidden = !m.location;
    U.setText("detailStory", m.story || m.caption || "");
    U.setText("detailNote", m.note || "");
    document.getElementById("detailNoteWrap").hidden = !m.note;

    var others = memories.filter(function (x) { return x.id !== m.id; });
    // start "more" list from the memory after this one
    others = others.slice(m.index).concat(others.slice(0, m.index));
    document.getElementById("detailMore").innerHTML = others.slice(0, 6).map(hCard).join("");

    var next = memories[(m.index + 1) % memories.length];
    var nextLink = document.getElementById("detailNext");
    nextLink.href = "#memory/" + encodeURIComponent(next.id);
    nextLink.hidden = memories.length < 2;

    var fav = document.getElementById("detailFav");
    var favs = U.store.get("favorites", []);
    var on = favs.indexOf(m.id) > -1;
    fav.setAttribute("aria-pressed", String(on));
    fav.setAttribute("aria-label", on ? "Remove from favorites" : "Mark as favorite");
    fav.dataset.id = m.id;
  }

  function initDetail() {
    document.getElementById("detailThumbs").addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      var img = document.getElementById("detailImg");
      U.$$("#detailThumbs button").forEach(function (x) { x.setAttribute("aria-current", String(x === b)); });
      img.classList.add("is-swapping");
      setTimeout(function () {
        U.setImg(img, b.dataset.src, document.getElementById("detailTitle").textContent);
        img.classList.remove("is-swapping");
      }, 180);
    });

    var fav = document.getElementById("detailFav");
    fav.addEventListener("click", function (e) {
      var id = fav.dataset.id;
      var favs = U.store.get("favorites", []);
      var i = favs.indexOf(id);
      if (i > -1) favs.splice(i, 1); else favs.push(id);
      U.store.set("favorites", favs);
      var on = i === -1;
      fav.setAttribute("aria-pressed", String(on));
      fav.setAttribute("aria-label", on ? "Remove from favorites" : "Mark as favorite");
      fav.classList.remove("is-popping"); void fav.offsetWidth; fav.classList.add("is-popping");
      if (on) { Anim.burst(e.clientX || fav.getBoundingClientRect().left + 24, e.clientY || fav.getBoundingClientRect().top + 24); U.toast("Saved to your favorites ♡"); }
    });
  }

  /* ---------- Public API ---------- */
  window.Gallery = {
    memories: memories,
    init: function () {
      renderFilters();
      renderGrid();
      renderFeatured();
      Lightbox.init();
      initDetail();
      Router.on("memory", function (id) { renderDetail(id); });
    }
  };
})();
