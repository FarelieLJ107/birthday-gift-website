/* ==========================================================================
   main.js — renders every page from config.js and wires interactions:
   intro · home dashboard · timeline · reasons · letter · surprise · music
   ========================================================================== */
(function () {
  "use strict";

  var C = window.BIRTHDAY_CONFIG || {};
  var partner = C.partner || {};
  var sender = C.sender || {};
  var displayName = partner.nickname || partner.name || "you";

  /* ======================================================================
     INTRO
     ====================================================================== */
  function initIntro() {
    var intro = C.intro || {};
    U.setText("introTitle", intro.title || "A Little Surprise For You");
    U.setText("introSubtitle", intro.subtitle || "Someone made something special just for you.");
    U.setText("openGiftLabel", intro.button || "Open Your Gift");
    U.setText("introTo", "for " + displayName);
    Anim.floatingHearts(document.getElementById("introHearts"), { count: 16 });

    var btn = document.getElementById("openGiftBtn");
    var gift = document.getElementById("introGift");
    var wrap = U.$(".intro");
    var overlay = document.getElementById("revealOverlay");
    var busy = false;

    function open() {
      if (busy) return;
      busy = true;
      if (C.music && C.music.playOnGiftOpen) Music.play();
      gift.classList.add("is-opening");
      wrap.classList.add("is-leaving");
      overlay.classList.remove("is-fading");
      overlay.classList.add("is-active");
      var total = U.reducedMotion() ? 50 : 1750;
      setTimeout(function () {
        Router.go("home", { replace: true });
        overlay.classList.add("is-fading");
        setTimeout(function () {
          overlay.classList.remove("is-active", "is-fading");
          gift.classList.remove("is-opening");
          wrap.classList.remove("is-leaving");
          busy = false;
          if (!Music.isPlaying()) U.toast("Tip: tap ♪ at the top for our song", 3200);
        }, 520);
      }, total);
    }
    btn.addEventListener("click", open);
    gift.addEventListener("click", open);
  }

  /* ======================================================================
     HOME
     ====================================================================== */
  var countdownTimer;
  function initHome() {
    var home = C.home || {};
    var avatar = document.getElementById("homeAvatar");
    U.setImg(avatar, partner.photo, displayName);
    U.setText("homeGreeting", home.greeting || "Hello");
    U.setText("homeName", partner.name || displayName);
    U.setImg(document.getElementById("heroImg"), home.heroPhoto, "A photo of " + displayName);
    U.setText("heroHeadline", home.headline || "Happy Birthday, My Favorite Person");
    U.setText("heroCaption", home.heroCaption || "");
    U.setText("homeNote", home.note || "");
    U.setText("homeSender", sender.name || "");

    var nb = U.nextBirthday(C.birthday);
    U.setText("heroDate", U.formatDate(nb.date, { noYear: true }));
    var age = document.getElementById("ageChip");
    if (C.showAge !== false && nb.age > 0 && nb.age < 130) {
      age.hidden = false;
      age.textContent = nb.isToday ? nb.age + " today" : "turning " + nb.age;
    }

    var met = U.parseDate(C.firstMet);
    var together = Math.max(0, U.daysBetween(met, U.today()));
    U.setText("daysTogether", together.toLocaleString("en-US"));

    U.setText("exploreMemoriesMeta", (C.memories || []).length + " photos");
    U.setText("exploreReasonsMeta", (C.reasons || []).length + " reasons");

    tickCountdown(nb);
  }

  function tickCountdown(nb) {
    var cd = document.getElementById("countdown");
    var todayMsg = document.getElementById("countdownToday");
    if (nb.isToday) {
      cd.hidden = true; todayMsg.hidden = false;
      U.setText("countdownLabel", "Today is the day");
      return;
    }
    var els = {};
    U.$$("[data-cd]", cd).forEach(function (el) { els[el.dataset.cd] = el; });
    function update() {
      var diff = nb.date.getTime() - Date.now();
      if (diff <= 0) { clearInterval(countdownTimer); initHome(); return; }
      var s = Math.floor(diff / 1000);
      els.d.textContent = Math.floor(s / 86400);
      els.h.textContent = String(Math.floor(s % 86400 / 3600)).padStart(2, "0");
      els.m.textContent = String(Math.floor(s % 3600 / 60)).padStart(2, "0");
      els.s.textContent = String(s % 60).padStart(2, "0");
    }
    update();
    clearInterval(countdownTimer);
    countdownTimer = setInterval(update, 1000);
    cd.setAttribute("aria-live", "off"); // don't announce every second
    cd.setAttribute("aria-label", "Countdown to " + U.formatDate(nb.date));
  }

  function updateJourney(visited) {
    var n = Math.min(6, visited.length);
    U.setText("journeyCount", n);
    document.getElementById("journeyBar").style.width = (n / 6 * 100) + "%";
    var map = { memories: "memories", moments: "moments", reasons: "reasons", letter: "letter", surprise: "surprise" };
    Object.keys(map).forEach(function (k) {
      var card = U.$(".explore-card--" + map[k]);
      if (card) card.classList.toggle("is-visited", visited.indexOf(k) > -1);
    });
  }

  /* ======================================================================
     MOMENTS (timeline)
     ====================================================================== */
  function initMoments() {
    var list = C.moments || [];
    var tl = document.getElementById("timeline");
    var rots = [-2.4, 2, -1.4, 1.8, -2];
    tl.innerHTML = list.map(function (m, i) {
      var d = U.parseDate(m.date);
      var isLast = i === list.length - 1;
      var isToday = m.date === "today" || d.getTime() === U.today().getTime();
      var special = isLast && isToday || (isLast && /today/i.test(m.title || ""));
      var sticker = Icons.has(m.sticker) ? m.sticker : "heart";
      return '<li class="t-item reveal' + (special ? " t-item--today" : "") + '" style="--d:' + (i ? 60 : 0) + 'ms">' +
        '<span class="t-item__dot" aria-hidden="true">' + Icons.svg(sticker) + "</span>" +
        '<div class="t-item__body">' +
          '<p class="t-item__date">' + U.esc(isToday ? "Today · " + U.formatDate(d) : U.formatDate(d)) + "</p>" +
          '<h2 class="t-item__title">' + U.esc(m.title) + "</h2>" +
          (m.photo ? '<div class="polaroid t-item__photo" style="--rot:' + rots[i % rots.length] + 'deg">' +
            '<span class="tape ' + (i % 2 ? "tape--tr tape--cream" : "tape--tl") + '" aria-hidden="true"></span>' +
            U.img(m.photo, m.title) + "</div>" : "") +
          '<p class="t-item__story">' + U.esc(m.story) + "</p>" +
          (special ? '<a class="btn btn--primary btn--sm t-item__cta" href="#surprise">Open your surprise ' + Icons.svg("gift") + "</a>" : "") +
        "</div></li>";
    }).join("");

    var met = U.parseDate(C.firstMet);
    U.setText("momentsDays", Math.max(0, U.daysBetween(met, U.today())).toLocaleString("en-US"));
    U.setText("momentsCount", list.length);
  }

  /* ======================================================================
     REASONS
     ====================================================================== */
  function initReasons() {
    var reasons = C.reasons || [];
    var grid = document.getElementById("reasonsGrid");
    var read = U.store.get("reasonsRead", []);

    grid.innerHTML = reasons.map(function (r, i) {
      var num = String(i + 1).padStart(2, "0");
      var icon = Icons.has(r.icon) ? r.icon : "heart";
      return '<button type="button" class="reason-card' + (read.indexOf(i) > -1 ? " is-read" : "") + '" data-i="' + i + '" aria-pressed="false" aria-label="Reason ' + (i + 1) + ': ' + U.esc(r.title) + '">' +
        '<span class="reason-card__inner">' +
          '<span class="reason-card__face reason-card__front">' +
            '<span class="reason-card__num">No. ' + num + "</span>" +
            '<span class="reason-card__icon">' + Icons.svg(icon) + "</span>" +
            '<span class="reason-card__title">' + U.esc(r.title) + "</span>" +
            '<span class="reason-card__tap">tap to open</span>' +
          "</span>" +
          '<span class="reason-card__face reason-card__back" aria-live="polite">' +
            '<span class="reason-card__desc">' + U.esc(r.description) + "</span>" +
            '<span class="hand">— reason no. ' + (i + 1) + "</span>" +
          "</span>" +
        "</span></button>";
    }).join("");

    U.setText("reasonsTotal", reasons.length);
    function progress() {
      U.setText("reasonsOpened", read.length);
      document.getElementById("reasonsBar").style.width = (reasons.length ? read.length / reasons.length * 100 : 0) + "%";
      document.getElementById("reasonsDone").hidden = read.length < reasons.length;
    }
    progress();

    function flip(card, x, y) {
      var i = +card.dataset.i;
      var on = !card.classList.contains("is-flipped");
      card.classList.toggle("is-flipped", on);
      card.setAttribute("aria-pressed", String(on));
      if (on) {
        if (read.indexOf(i) === -1) {
          read.push(i);
          U.store.set("reasonsRead", read);
          card.classList.add("is-read");
          progress();
          if (read.length === reasons.length) {
            setTimeout(function () { Anim.confetti({ count: 90, y: 0.3 }); U.toast("You found every reason ♡"); }, 500);
          }
        }
        var r = card.getBoundingClientRect();
        Anim.burst(x || r.left + r.width / 2, y || r.top + r.height / 2, { count: 7 });
      }
    }

    grid.addEventListener("click", function (e) {
      var card = e.target.closest(".reason-card");
      if (card) flip(card, e.clientX, e.clientY);
    });

    document.getElementById("reasonRandom").addEventListener("click", function () {
      var cards = U.$$(".reason-card", grid);
      if (!cards.length) return;
      var closed = cards.filter(function (c) { return !c.classList.contains("is-flipped"); });
      var pool = closed.length ? closed : cards;
      var card = pool[Math.floor(Math.random() * pool.length)];
      card.scrollIntoView({ behavior: U.reducedMotion() ? "auto" : "smooth", block: "center" });
      card.classList.remove("is-highlight"); void card.offsetWidth; card.classList.add("is-highlight");
      setTimeout(function () { if (!card.classList.contains("is-flipped")) flip(card); }, 520);
    });
  }

  /* ======================================================================
     LETTER
     ====================================================================== */
  var letterTyper = null;
  function initLetter() {
    var L = C.letter || {};
    U.setText("letterTitle", L.title || "A Letter Just For You");
    U.setText("letterSubtitle", L.subtitle || "");
    U.setText("openLetterLabel", L.button || "Open My Letter");
    var nb = U.nextBirthday(C.birthday);
    U.setText("letterDate", U.formatDate(nb.date));

    var stage = document.getElementById("letterStage");
    var env = document.getElementById("envelope");
    var paper = document.getElementById("letterPaper");
    var body = document.getElementById("letterBody");
    var skip = document.getElementById("letterSkip");
    var replay = document.getElementById("letterReplay");
    var next = document.getElementById("letterNext");
    var screen = document.getElementById("screen-letter");

    var blocks = [];
    if (L.greeting) blocks.push({ text: L.greeting, className: "greeting", pause: 600 });
    (L.paragraphs || []).forEach(function (p) { blocks.push({ text: p }); });
    if (L.closing) blocks.push({ text: L.closing, className: "closing", pause: 300 });
    blocks.push({ text: L.signature || sender.name || "", className: "signature" });

    function type() {
      skip.hidden = false; replay.hidden = true; next.hidden = true;
      if (letterTyper) letterTyper.cancel();
      letterTyper = Anim.typewriter(body, blocks, {
        speed: 24,
        onType: function (p) {
          // keep the line being written comfortably in view
          var r = p.getBoundingClientRect(), sr = screen.getBoundingClientRect();
          if (r.bottom > sr.bottom - 120) screen.scrollTop += r.bottom - (sr.bottom - 160);
        }
      });
      letterTyper.done.then(function () {
        skip.hidden = true; replay.hidden = false; next.hidden = false;
      });
    }

    var opening = false;
    function open() {
      if (opening) return;
      opening = true;
      env.classList.add("is-open");
      stage.classList.add("is-leaving");
      setTimeout(function () {
        stage.hidden = true;
        stage.classList.remove("is-leaving");
        paper.hidden = false;
        paper.classList.remove("is-entering"); void paper.offsetWidth; paper.classList.add("is-entering");
        screen.scrollTop = 0;
        setTimeout(type, 500);
      }, U.reducedMotion() ? 50 : 1700);
    }

    document.getElementById("openLetterBtn").addEventListener("click", open);
    env.addEventListener("click", open);
    skip.addEventListener("click", function () { if (letterTyper) letterTyper.skip(); });
    replay.addEventListener("click", function () { screen.scrollTop = 0; type(); });

    window.LetterReset = function () {
      if (letterTyper) letterTyper.cancel();
      opening = false;
      env.classList.remove("is-open");
      stage.hidden = false; paper.hidden = true; body.innerHTML = "";
    };
  }

  /* ======================================================================
     SURPRISE
     ====================================================================== */
  function initSurprise() {
    var S = C.surprise || {};
    U.setText("surpriseTitle", S.title || "One Last Surprise");
    U.setText("surpriseSubtitle", S.subtitle || "");
    U.setText("openPresentLabel", S.button || "Open Your Present");
    U.setText("surpriseName", displayName);
    U.setImg(document.getElementById("surprisePhoto"), S.photo, "A special photo for " + displayName);
    var nb = U.nextBirthday(C.birthday);
    U.setText("surpriseAge", C.showAge !== false && nb.age > 0 ? "hello, " + nb.age + " ♡" : "another year of you");
    U.setText("surpriseMessage", S.message || "");
    U.setText("presentTitle", S.giftTitle || "Your present");
    U.setText("presentDesc", S.giftDescription || "");
    U.setText("presentNote", S.giftNote || "");
    U.setText("surpriseSender", sender.name || "");

    var stage = document.getElementById("surpriseStage");
    var reveal = document.getElementById("surpriseReveal");
    var gift = document.getElementById("bigGift");
    var screen = document.getElementById("screen-surprise");
    var opened = false;

    function openPresent() {
      if (opened) return;
      opened = true;
      var rm = U.reducedMotion();
      gift.classList.add("is-shaking");
      setTimeout(function () {
        gift.classList.remove("is-shaking");
        gift.classList.add("is-open");
        var gr = gift.getBoundingClientRect(), ar = document.getElementById("app").getBoundingClientRect();
        Anim.confetti({ count: 180, x: (gr.left + gr.width / 2 - ar.left) / ar.width, y: (gr.top + 60 - ar.top) / ar.height });
        stage.classList.add("is-leaving");
      }, rm ? 0 : 620);
      setTimeout(function () {
        stage.hidden = true;
        stage.classList.remove("is-leaving");
        reveal.hidden = false;
        screen.scrollTop = 0;
        Anim.floatingHearts(document.getElementById("surpriseHearts"), { count: 18, stars: true, max: 16 });
        setTimeout(function () { Anim.confetti({ count: 120, y: 0.2 }); }, 700);
        U.store.set("surpriseOpened", true);
      }, rm ? 50 : 1900);
    }

    document.getElementById("openPresentBtn").addEventListener("click", openPresent);
    gift.addEventListener("click", openPresent);
    document.getElementById("celebrateBtn").addEventListener("click", function (e) {
      Anim.confetti({ count: 160, y: 0.35 });
      Anim.burst(e.clientX, e.clientY, { count: 10 });
    });
    document.getElementById("restartBtn").addEventListener("click", function () {
      opened = false;
      gift.classList.remove("is-open", "is-shaking");
      reveal.hidden = true; stage.hidden = false;
      if (window.LetterReset) window.LetterReset();
      Router.go("intro");
    });
  }

  /* ======================================================================
     MUSIC — <audio> file, with a gentle Web Audio music-box fallback
     (never autoplays: only starts after the user taps something)
     ====================================================================== */
  var Music = (function () {
    var cfg = C.music || {};
    var btn, audio, mode = null, playing = false, fileFailed = !cfg.src;
    var box = null; // fallback synth

    function setUI() {
      btn.classList.toggle("is-playing", playing);
      btn.setAttribute("aria-pressed", String(playing));
      btn.setAttribute("aria-label", playing ? "Pause music" : "Play music");
      btn.title = playing ? "Pause · " + (cfg.title || "music") : "Play · " + (cfg.title || "music");
    }

    function playFallback() {
      if (cfg.fallbackMelody === false) { U.toast("Add a song in assets/music to play music"); return; }
      if (!box) box = MusicBox();
      if (!box) { U.toast("Music isn't supported on this browser"); return; }
      box.start(); mode = "box"; playing = true; setUI();
    }

    function play() {
      if (playing) return;
      // create the synth inside the user gesture so browsers allow it to sound later
      if (!box && cfg.fallbackMelody !== false) box = MusicBox();
      if (fileFailed) { playFallback(); return; }
      if (!audio) {
        audio = new Audio();
        audio.loop = true;
        audio.preload = "auto";
        audio.volume = 0.7;
        audio.src = cfg.src;
        audio.addEventListener("error", function () {
          fileFailed = true;
          if (mode === "file" && playing) { playing = false; playFallback(); }
        });
      }
      mode = "file"; playing = true; setUI();
      var p = audio.play();
      if (p && p.catch) p.catch(function (err) {
        if (err && err.name === "NotAllowedError") { playing = false; setUI(); return; }
        fileFailed = true; playing = false; playFallback();
      });
    }

    function pause() {
      if (!playing) return;
      if (mode === "file" && audio) audio.pause();
      if (mode === "box" && box) box.stop();
      playing = false; setUI();
    }

    function init() {
      btn = document.getElementById("musicBtn");
      setUI();
      btn.addEventListener("click", function () { if (playing) pause(); else play(); });
      var wasPlaying = false;
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) { wasPlaying = playing; pause(); }
        else if (wasPlaying) { wasPlaying = false; play(); }
      });
    }

    return { init: init, play: play, pause: pause, isPlaying: function () { return playing; } };
  })();

  /** Soft music-box "Happy Birthday" (public-domain melody) via Web Audio. */
  function MusicBox() {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    var ctx = new Ctx();
    var master = ctx.createGain(); master.gain.value = 0.22;
    var delay = ctx.createDelay(); delay.delayTime.value = 0.32;
    var fb = ctx.createGain(); fb.gain.value = 0.28;
    var wet = ctx.createGain(); wet.gain.value = 0.35;
    master.connect(ctx.destination);
    master.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(ctx.destination);

    var N = { G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, C4: 261.63, F4: 349.23, G3: 196, E4: 329.63 };
    var melody = [
      ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
      ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
      ["G4", .75], ["G4", .25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
      ["F5", .75], ["F5", .25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 3]
    ];
    var beat = 60 / 84;
    var timer = null, nextTime = 0, i = 0, on = false;

    function pluck(freq, t, dur) {
      [1, 2, 3].forEach(function (h, k) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = k === 0 ? "sine" : "triangle";
        o.frequency.value = freq * h;
        var peak = [0.6, 0.12, 0.05][k];
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(peak, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(1.2, dur * 1.6));
        o.connect(g); g.connect(master);
        o.start(t); o.stop(t + Math.max(1.3, dur * 1.7));
      });
    }

    function schedule() {
      while (nextTime < ctx.currentTime + 0.6) {
        var n = melody[i];
        pluck(N[n[0]], nextTime, n[1] * beat);
        nextTime += n[1] * beat;
        i++;
        if (i >= melody.length) { i = 0; nextTime += beat * 2; }
      }
    }

    return {
      start: function () {
        if (on) return;
        on = true;
        if (ctx.state === "suspended") ctx.resume();
        nextTime = ctx.currentTime + 0.1;
        schedule();
        timer = setInterval(schedule, 150);
      },
      stop: function () {
        on = false; clearInterval(timer); i = 0;
        master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08);
        setTimeout(function () { if (!on) { ctx.suspend(); master.gain.value = 0.22; } }, 400);
      }
    };
  }

  /* ======================================================================
     BOOT
     ====================================================================== */
  function boot() {
    Icons.render();
    document.title = "A Little Book About " + (partner.name || "You");

    initIntro();
    initHome();
    Gallery.init();
    initMoments();
    initReasons();
    initLetter();
    initSurprise();
    Music.init();
    if (window.QRGift) QRGift.init();     // "A Secret Message Just For You"
    if (window.QRScan) QRScan.init();     // "Scan Your Little Surprise"
    Icons.render(); // icons inside freshly rendered markup

    Router.onVisited(updateJourney);
    updateJourney(U.store.get("visited", []));

    // tapping the active tab scrolls that page back to the top
    document.getElementById("bottomNav").addEventListener("click", function (e) {
      var a = e.target.closest(".bottom-nav__item");
      var cur = Router.current();
      if (a && cur && a.getAttribute("href") === cur.hash) {
        e.preventDefault();
        var s = document.getElementById("screen-" + cur.name);
        s.scrollTo({ top: 0, behavior: U.reducedMotion() ? "auto" : "smooth" });
      }
    });

    Router.start();
  }

  window.Music = Music;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
