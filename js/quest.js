/* ==========================================================================
   quest.js — Birthday Quest: a tiny three-step treasure hunt
   Quest 1  hidden object on an existing page  → token 1
   Quest 2  light, personal trivia              → token 2
   Quest 3  swap-the-pieces photo puzzle        → token 3
   All three tokens unlock the final gift (see gifts.js).

   State lives in the existing U.store (localStorage, key "quest"):
   { tokens: [1, 2, 3] }  — award() is idempotent, so repeated taps,
   reloads or replays can never grant the same token twice.
   ========================================================================== */
(function () {
  "use strict";

  var C = window.BIRTHDAY_CONFIG || {};
  var Q = C.quest || {};
  var KEY = "quest";
  var TOTAL = 3;

  /* ======================================================================
     Progress (single source of truth)
     ====================================================================== */
  function load() {
    var s = U.store.get(KEY, null);
    var tokens = s && Array.isArray(s.tokens) ? s.tokens.filter(function (t) { return t >= 1 && t <= TOTAL; }) : [];
    return { tokens: tokens.filter(function (t, i) { return tokens.indexOf(t) === i; }) };
  }
  var state = load();
  var listeners = [];

  function has(n) { return state.tokens.indexOf(n) > -1; }
  function count() { return state.tokens.length; }
  function isComplete() { return Q.enabled === false || count() >= TOTAL; }

  function emit(newToken) { listeners.forEach(function (fn) { try { fn(state, newToken); } catch (e) { if (window.console) console.error(e); } }); }

  /** Give a token once. Returns true only the first time. */
  function award(n) {
    if (Q.enabled === false || has(n)) return false;
    state.tokens.push(n);
    state.tokens.sort();
    U.store.set(KEY, state);
    emit(n);
    return true;
  }

  function reset() {
    state = { tokens: [] };
    U.store.set(KEY, state);
    emit(null);
  }

  /* ======================================================================
     Quest 1 — hidden object on an existing page
     ====================================================================== */
  var hidden = { el: null };
  var PAGES = { home: 1, memories: 1, moments: 1, reasons: 1, letter: 1, surprise: 1 };

  function placeHidden() {
    var cfg = Q.hiddenObject || {};
    var page = PAGES[cfg.page] ? cfg.page : "moments";
    var screen = document.getElementById("screen-" + page);
    if (!screen || has(1)) return;
    var host = screen.querySelector(".page-intro") || screen.querySelector(".countdown-card") || screen.querySelector(".screen__body");
    if (!host) return;
    host.classList.add("quest-host");
    var icon = Icons.has(cfg.icon) ? cfg.icon : "star";
    var b = document.createElement("button");
    b.type = "button";
    b.className = "quest-hidden";
    b.setAttribute("aria-label", "A tiny hidden " + icon + " — tap to collect it");
    b.innerHTML = Icons.svg(icon);
    b.addEventListener("click", function (e) {
      if (!award(1)) return;
      Anim.burst(e.clientX || 0, e.clientY || 0, { count: 12 });
      b.classList.add("is-found");
      U.toast(cfg.foundMessage || "You found it! Token 1 is yours.", 3000);
      setTimeout(function () { b.remove(); }, 700);
    });
    host.appendChild(b);
    hidden.el = b;
    hidden.page = page;
  }

  /* ======================================================================
     Quest 2 — trivia (configured, or built only from existing config facts)
     ====================================================================== */
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function uniq(a) { return a.filter(function (x, i) { return x && a.indexOf(x) === i; }); }

  /** Normalise a configured question; returns null if unusable. */
  function cleanQuestion(q) {
    if (!q || !q.question || !Array.isArray(q.options) || q.options.length < 2) return null;
    var ans = parseInt(q.answer, 10);
    if (!(ans >= 0 && ans < q.options.length)) return null;
    var correct = String(q.options[ans]);
    var opts = shuffle(q.options.map(String));
    return { question: String(q.question), options: opts, answer: opts.indexOf(correct), note: q.note || "" };
  }

  /** Questions built from facts the owner already wrote in config.js — nothing invented. */
  function autoQuestions() {
    var qs = [];
    if (C.firstMet) {
      var met = U.parseDate(C.firstMet);
      var right = U.formatDate(met);
      var near = [37, -61, 120].map(function (d) { return U.formatDate(new Date(met.getFullYear(), met.getMonth(), met.getDate() + d)); });
      var o = uniq([right].concat(near)).slice(0, 3);
      qs.push({ question: "When did our story begin?", options: shuffle(o), answerText: right });
    }
    var mems = (C.memories || []).filter(function (m) { return m.title && m.location; });
    var locs = uniq(mems.map(function (m) { return m.location; }));
    if (mems.length && locs.length >= 3) {
      var m = mems[Math.floor(Math.random() * mems.length)];
      var others = shuffle(locs.filter(function (l) { return l !== m.location; })).slice(0, 2);
      qs.push({ question: "Where was “" + m.title + "”?", options: shuffle([m.location].concat(others)), answerText: m.location });
    }
    var reasons = (C.reasons || []).filter(function (r) { return r.title; });
    if (reasons.length) {
      var r = reasons[Math.floor(Math.random() * reasons.length)];
      // obviously-silly wrong answers (jokes, not memories)
      var silly = shuffle(["Your perfect parallel parking", "Your love of Monday mornings", "Your thrilling tax returns", "Your 6 a.m. alarm"]).slice(0, 2);
      qs.push({ question: "Which one is on my list of reasons I love you?", options: shuffle([r.title].concat(silly)), answerText: r.title });
    }
    return qs.map(function (q) { return { question: q.question, options: q.options, answer: q.options.indexOf(q.answerText), note: "" }; });
  }

  function triviaQuestions() {
    var custom = ((Q.trivia || {}).questions || []).map(cleanQuestion).filter(Boolean);
    return custom.length ? custom : autoQuestions();
  }

  var trivia = { qs: [], i: 0, busy: false };

  function renderTrivia() {
    var box = document.getElementById("questTrivia");
    if (!box) return;
    if (has(2)) {
      box.innerHTML = '<p class="quest-done-note">' + Icons.svg("check") + " All answered — token 2 collected.</p>";
      return;
    }
    if (!has(1)) {
      box.innerHTML = '<p class="quest-locked-note">' + Icons.svg("lock") + " Find the hidden object first.</p>";
      return;
    }
    if (!trivia.qs.length) { trivia.qs = triviaQuestions(); trivia.i = 0; }
    if (!trivia.qs.length) {
      box.innerHTML = '<p class="quest-locked-note">No trivia questions yet.</p><button class="btn btn--soft btn--sm" type="button" data-trivia-skip>Collect token</button>';
      return;
    }
    var q = trivia.qs[trivia.i];
    box.innerHTML =
      '<p class="trivia__count">Question ' + (trivia.i + 1) + " of " + trivia.qs.length + "</p>" +
      '<p class="trivia__q">' + U.esc(q.question) + "</p>" +
      '<div class="trivia__options" role="group" aria-label="Answers">' +
      q.options.map(function (o, k) { return '<button type="button" class="trivia__opt" data-k="' + k + '">' + U.esc(o) + "</button>"; }).join("") +
      "</div>" +
      '<p class="trivia__feedback" aria-live="polite"></p>';
  }

  function onTriviaClick(e) {
    if (e.target.closest("[data-trivia-skip]")) { award(2); return; }
    var b = e.target.closest(".trivia__opt");
    if (!b || trivia.busy || b.disabled) return;
    var q = trivia.qs[trivia.i];
    var fb = document.querySelector("#questTrivia .trivia__feedback");
    if (+b.dataset.k === q.answer) {
      trivia.busy = true;
      b.classList.add("is-right");
      U.$$("#questTrivia .trivia__opt").forEach(function (x) { x.disabled = true; });
      fb.textContent = q.note || ["Yes! ♡", "Exactly right ✨", "You know us so well."][trivia.i % 3];
      Anim.burst(e.clientX, e.clientY, { count: 7 });
      setTimeout(function () {
        trivia.busy = false;
        trivia.i++;
        if (trivia.i >= trivia.qs.length) { award(2); }
        else renderTrivia();
      }, 900);
    } else {
      b.classList.add("is-wrong");
      b.disabled = true;
      fb.textContent = "Almost! Try another one ♡";
    }
  }

  /* ======================================================================
     Quest 3 — swap puzzle
     ====================================================================== */
  var puzzle = { order: [], sel: -1, n: 3, src: "" };

  function puzzleImage() {
    var p = Q.puzzle || {};
    return p.image || (C.home && C.home.heroPhoto) || "";
  }

  function newOrder(n) {
    var cells = n * n, o = [];
    for (var i = 0; i < cells; i++) o.push(i);
    // a few random swaps: easy, never already solved
    var swaps = Math.max(2, Math.round(cells * 0.6));
    for (var k = 0; k < swaps; k++) {
      var a = Math.floor(Math.random() * cells), b = Math.floor(Math.random() * cells);
      var t = o[a]; o[a] = o[b]; o[b] = t;
    }
    if (o.every(function (v, i) { return v === i; })) { var t2 = o[0]; o[0] = o[1]; o[1] = t2; }
    return o;
  }

  function solved() { return puzzle.order.every(function (v, i) { return v === i; }); }

  function renderPuzzle() {
    var box = document.getElementById("questPuzzle");
    if (!box) return;
    var n = Math.min(4, Math.max(2, parseInt((Q.puzzle || {}).grid, 10) || 3));
    puzzle.n = n;
    var done = has(3);
    var locked = !has(2) && !done;
    if (locked) {
      box.innerHTML = '<p class="quest-locked-note">' + Icons.svg("lock") + " Answer the trivia first.</p>";
      return;
    }
    if (done) {
      puzzle.order = [];
      for (var i = 0; i < n * n; i++) puzzle.order.push(i);
    } else if (puzzle.order.length !== n * n) {
      puzzle.order = newOrder(n);
    }
    var html = '<div class="puzzle' + (done ? " is-solved" : "") + '" style="--n:' + n + '" role="group" aria-label="Photo puzzle, ' + n + " by " + n + '">';
    puzzle.order.forEach(function (piece, pos) {
      html += '<button type="button" class="puzzle__piece' + (piece === pos ? " is-home" : "") + '" data-pos="' + pos + '"' + (done ? " disabled" : "") +
        ' aria-pressed="false" aria-label="Piece ' + (piece + 1) + ", in spot " + (pos + 1) + '"></button>';
    });
    html += "</div>";
    html += done
      ? '<p class="quest-done-note">' + Icons.svg("check") + " Picture complete — token 3 collected.</p>"
      : '<p class="puzzle__hint">' + U.esc((Q.puzzle || {}).intro || "Tap two pieces to swap them.") + "</p>";
    box.innerHTML = html;
    // set the artwork through the DOM (safe for any file name)
    var bg = "url(" + JSON.stringify(String(puzzle.src)) + ")";
    U.$$(".puzzle__piece", box).forEach(function (el, pos) {
      var piece = puzzle.order[pos];
      el.style.backgroundImage = bg;
      el.style.backgroundPosition = (piece % n) / (n - 1) * 100 + "% " + Math.floor(piece / n) / (n - 1) * 100 + "%";
    });
    puzzle.sel = -1;
  }

  function onPuzzleClick(e) {
    var b = e.target.closest(".puzzle__piece");
    if (!b || b.disabled || has(3)) return;
    var pos = +b.dataset.pos;
    var pieces = U.$$("#questPuzzle .puzzle__piece");
    if (puzzle.sel === -1) {
      puzzle.sel = pos;
      b.classList.add("is-selected"); b.setAttribute("aria-pressed", "true");
      return;
    }
    var a = puzzle.sel;
    pieces[a].classList.remove("is-selected"); pieces[a].setAttribute("aria-pressed", "false");
    puzzle.sel = -1;
    if (a === pos) return;
    var t = puzzle.order[a]; puzzle.order[a] = puzzle.order[pos]; puzzle.order[pos] = t;
    // swap the two pieces' artwork in place (no full re-render → smooth on mobile)
    [a, pos].forEach(function (p) {
      var piece = puzzle.order[p], n = puzzle.n, el = pieces[p];
      el.style.backgroundPosition = (piece % n) / (n - 1) * 100 + "% " + Math.floor(piece / n) / (n - 1) * 100 + "%";
      el.setAttribute("aria-label", "Piece " + (piece + 1) + ", in spot " + (p + 1));
      el.classList.remove("is-swapped"); void el.offsetWidth; el.classList.add("is-swapped");
      el.classList.toggle("is-home", piece === p);
    });
    if (solved()) {
      setTimeout(function () {
        if (award(3)) {
          var r = document.querySelector("#questPuzzle .puzzle").getBoundingClientRect();
          Anim.burst(r.left + r.width / 2, r.top + r.height / 2, { count: 12 });
        }
      }, 250);
    }
  }

  /* ======================================================================
     Quest page
     ====================================================================== */
  function renderProgress(newToken) {
    var n = count();
    U.setText("questCount", n);
    var bar = document.getElementById("questBar");
    if (bar) bar.style.width = (n / TOTAL * 100) + "%";
    U.$$(".quest-token").forEach(function (t) {
      var k = +t.dataset.token;
      t.classList.toggle("is-earned", has(k));
      t.setAttribute("aria-label", "Token " + k + (has(k) ? " collected" : " not collected yet"));
      if (k === newToken) { t.classList.remove("is-new"); void t.offsetWidth; t.classList.add("is-new"); }
    });
    U.$$(".quest-step").forEach(function (s) {
      var k = +s.dataset.step;
      var done = has(k), open = k === 1 || has(k - 1);
      s.classList.toggle("is-done", done);
      s.classList.toggle("is-locked", !done && !open);
      var chip = s.querySelector(".quest-step__status");
      chip.textContent = done ? "Completed" : open ? "In progress" : "Locked";
    });
    var final = document.getElementById("questFinal");
    if (final) final.hidden = n < TOTAL;
    var meta = document.getElementById("exploreQuestMeta");
    if (meta) meta.textContent = n >= TOTAL ? "all tokens found ✓" : n + "/" + TOTAL + " tokens";
    var q1 = document.getElementById("questHiddenStatus");
    if (q1) q1.hidden = !has(1);
    var hintBtn = document.getElementById("questHintBtn");
    if (hintBtn) hintBtn.hidden = has(1);
  }

  function init() {
    var page = document.getElementById("screen-quest");
    if (Q.enabled === false) {
      U.$$('[href="#quest"]').forEach(function (a) { a.hidden = true; });
      return;
    }
    if (!page) return;
    puzzle.src = puzzleImage();
    // pre-check the puzzle image so a missing file still gives a pretty puzzle
    var probe = new Image();
    probe.onerror = function () { puzzle.src = U.placeholder("our little puzzle"); if (!has(3)) renderPuzzle(); };
    probe.src = puzzle.src || "data:,";

    U.setText("questTitle", Q.title || "Birthday Quest");
    U.setText("questSubtitle", Q.subtitle || "");
    U.setText("questHint", (Q.hiddenObject || {}).hint || "Something tiny is hiding on one of the pages.");
    U.setText("questTriviaIntro", (Q.trivia || {}).intro || "");
    U.setText("questComplete", Q.completeMessage || "All three tokens collected!");

    placeHidden();
    document.getElementById("questHintBtn").addEventListener("click", function () {
      if (has(1)) return;
      Router.go(hidden.page || "moments");
      setTimeout(function () {
        if (!hidden.el) return;
        hidden.el.classList.add("is-hinted");
        hidden.el.scrollIntoView({ behavior: U.reducedMotion() ? "auto" : "smooth", block: "center" });
      }, 450);
    });
    document.getElementById("questTrivia").addEventListener("click", onTriviaClick);
    document.getElementById("questPuzzle").addEventListener("click", onPuzzleClick);
    document.getElementById("questReset").addEventListener("click", function () {
      if (!window.confirm("Reset the Birthday Quest? Your tokens will be cleared (opened gifts stay opened).")) return;
      reset();
      trivia = { qs: [], i: 0, busy: false };
      puzzle.order = [];
      placeHidden();
      renderTrivia(); renderPuzzle();
      U.toast("Quest reset — happy hunting!");
    });

    listeners.push(function (s, newToken) {
      renderProgress(newToken);
      if (newToken === 2 || newToken === null) renderPuzzle();
      if (newToken === 1 || newToken === 2 || newToken === null) renderTrivia();
      if (newToken && count() >= TOTAL) {
        setTimeout(function () { Anim.confetti({ count: 140, y: 0.3 }); U.toast(Q.completeMessage || "Quest complete!", 3400); }, 400);
      }
    });

    renderProgress(null);
    renderTrivia();
    renderPuzzle();
    Router.on("quest", function () { renderProgress(null); });
  }

  window.Quest = {
    init: init,
    has: has,
    count: count,
    isComplete: isComplete,
    award: award,
    onChange: function (fn) { listeners.push(fn); }
  };
})();
