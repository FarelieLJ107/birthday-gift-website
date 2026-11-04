/* ==========================================================================
   animations.js — floating hearts, confetti, heart bursts, scroll reveal,
   typewriter. All effects are lightweight and respect reduced motion.
   ========================================================================== */
(function () {
  "use strict";

  var A = {};

  /* ---------- Floating hearts (DOM + CSS animation) ---------- */
  A.floatingHearts = function (container, opts) {
    if (!container || container.dataset.ready) return;
    container.dataset.ready = "1";
    opts = opts || {};
    var count = opts.count || 14;
    var html = "";
    for (var i = 0; i < count; i++) {
      var star = opts.stars && i % 3 === 0;
      var size = 10 + Math.random() * (opts.max || 20);
      html += '<span class="float-heart' + (star ? " is-star" : "") + '" style="' +
        "left:" + (Math.random() * 96).toFixed(1) + "%;" +
        "width:" + size.toFixed(0) + "px;height:" + size.toFixed(0) + "px;" +
        "--dur:" + (8 + Math.random() * 8).toFixed(1) + "s;" +
        "--delay:" + (-Math.random() * 14).toFixed(1) + "s;" +
        "--sway:" + (Math.random() * 60 - 30).toFixed(0) + "px;" +
        "--op:" + (0.35 + Math.random() * 0.5).toFixed(2) + ";" +
        "--sc:" + (0.7 + Math.random() * 0.6).toFixed(2) + '">' +
        Icons.svg(star ? "star" : "heart") + "</span>";
    }
    container.innerHTML = html;
  };

  /* ---------- Heart burst at a point (relative to #app) ---------- */
  A.burst = function (clientX, clientY, opts) {
    if (U.reducedMotion()) return;
    opts = opts || {};
    var app = document.getElementById("app");
    var r = app.getBoundingClientRect();
    var el = document.createElement("div");
    el.className = "burst";
    el.style.left = (clientX - r.left) + "px";
    el.style.top = (clientY - r.top) + "px";
    var n = opts.count || 9, html = "";
    for (var i = 0; i < n; i++) {
      var ang = (Math.PI * 2 * i) / n + Math.random() * 0.5;
      var dist = 34 + Math.random() * 30;
      html += '<i style="--x:' + (Math.cos(ang) * dist).toFixed(0) + "px;--y:" + (Math.sin(ang) * dist).toFixed(0) +
        "px;color:" + (i % 2 ? "#F4A7BD" : "#D83F72") + '">' + Icons.svg(i % 4 === 0 ? "star" : "heart") + "</i>";
    }
    el.innerHTML = html;
    app.appendChild(el);
    setTimeout(function () { el.remove(); }, 900);
  };

  /* ---------- Confetti (single canvas, rAF, auto-stops) ---------- */
  var COLORS = ["#D83F72", "#E96B91", "#F5B8CB", "#F4A7BD", "#FCE4EC", "#F7C873", "#FFFFFF"];
  var conf = { parts: [], raf: 0 };

  A.confetti = function (opts) {
    if (U.reducedMotion()) return;
    opts = opts || {};
    var canvas = document.getElementById("confetti");
    var app = document.getElementById("app");
    if (!canvas || !app) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = app.clientWidth, h = app.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var n = opts.count || 150;
    var ox = (opts.x != null ? opts.x : 0.5) * w, oy = (opts.y != null ? opts.y : 0.45) * h;
    for (var i = 0; i < n; i++) {
      var ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.25;
      var spd = 6 + Math.random() * 9;
      conf.parts.push({
        x: ox, y: oy,
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
        size: 5 + Math.random() * 6,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        shape: Math.random() < 0.18 ? "heart" : (Math.random() < 0.5 ? "rect" : "circle"),
        tilt: Math.random() * 10, life: 0
      });
    }

    function heart(c, s) {
      c.beginPath();
      c.moveTo(0, s * 0.3);
      c.bezierCurveTo(-s, -s * 0.4, -s * 0.4, -s, 0, -s * 0.35);
      c.bezierCurveTo(s * 0.4, -s, s, -s * 0.4, 0, s * 0.3);
      c.fill();
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (var i = conf.parts.length - 1; i >= 0; i--) {
        var p = conf.parts[i];
        p.life++;
        p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.22;
        p.x += p.vx + Math.sin((p.life + p.tilt) / 9) * 0.6;
        p.y += p.vy; p.rot += p.vr;
        if (p.y > h + 30 || p.life > 400) { conf.parts.splice(i, 1); continue; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life > 300 ? Math.max(0, (400 - p.life) / 100) : 1;
        if (p.shape === "rect") ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2 * (1 + Math.abs(Math.sin(p.life / 6))));
        else if (p.shape === "circle") { ctx.beginPath(); ctx.arc(0, 0, p.size / 2.6, 0, Math.PI * 2); ctx.fill(); }
        else heart(ctx, p.size * 0.9);
        ctx.restore();
      }
      if (conf.parts.length) conf.raf = requestAnimationFrame(frame);
      else { conf.raf = 0; ctx.clearRect(0, 0, w, h); }
    }
    if (!conf.raf) conf.raf = requestAnimationFrame(frame);
  };

  /* ---------- Scroll reveal ---------- */
  var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }) : null;

  A.observeReveal = function (root) {
    U.$$(".reveal:not(.is-visible)", root).forEach(function (el) {
      if (io) io.observe(el); else el.classList.add("is-visible");
    });
  };

  /* ---------- Typewriter ----------
     blocks: [{ text, className }] → typed into `target` one <p> at a time.
     Returns a controller { skip(), cancel(), done: Promise }                 */
  A.typewriter = function (target, blocks, opts) {
    opts = opts || {};
    var speed = opts.speed || 26;
    var cancelled = false, skipping = false, resolveDone;
    var done = new Promise(function (r) { resolveDone = r; });
    var caret = document.createElement("span");
    caret.className = "caret";
    target.innerHTML = "";

    function renderAll() {
      target.innerHTML = "";
      blocks.forEach(function (b) {
        var p = document.createElement("p");
        p.className = (b.className || "") + " is-revealed";
        p.textContent = b.text;
        target.appendChild(p);
      });
      finish();
    }
    function finish() { caret.remove(); resolveDone(); }

    if (U.reducedMotion()) { renderAll(); return { skip: function () {}, cancel: function () {}, done: done }; }

    (function run(bi) {
      if (cancelled) return;
      if (skipping) { renderAll(); return; }
      if (bi >= blocks.length) { finish(); return; }
      var b = blocks[bi];
      var p = document.createElement("p");
      if (b.className) p.className = b.className;
      var textNode = document.createTextNode("");
      p.appendChild(textNode); p.appendChild(caret);
      target.appendChild(p);
      var i = 0;
      (function type() {
        if (cancelled) return;
        if (skipping) { renderAll(); return; }
        i++;
        textNode.nodeValue = b.text.slice(0, i);
        if (opts.onType && i % 12 === 0) opts.onType(p);
        if (i < b.text.length) {
          var ch = b.text.charAt(i - 1);
          var delay = /[.!?]/.test(ch) ? speed * 12 : /[,;—]/.test(ch) ? speed * 6 : speed + Math.random() * speed * 0.6;
          setTimeout(type, delay);
        } else {
          setTimeout(function () { run(bi + 1); }, b.pause || 420);
        }
      })();
    })(0);

    return {
      skip: function () { skipping = true; },
      cancel: function () { cancelled = true; caret.remove(); },
      done: done
    };
  };

  window.Anim = A;
})();
