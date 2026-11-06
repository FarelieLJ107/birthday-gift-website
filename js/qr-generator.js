/* ==========================================================================
   qr-generator.js — "A Secret Message Just For You"
   Heart-shaped + standard QR codes that hold the real website URL.

   How the heart design stays scannable:
   • The QR itself is a normal, standards-compliant code (qrcode-generator,
     error-correction level H = up to 30% of the code can be damaged).
   • It sits on a WHITE card inside the heart, with a full quiet zone
     (config: margin, default 4 modules) — the heart never touches the code.
   • Finder patterns keep their 7×7 / 5×5 / 3×3 proportions (only the
     corners are softly rounded).
   • The little centre heart covers ~3–4% of the modules, far below the
     30% that level H can repair, and is only drawn on small QR versions
     (≤ 6) where it cannot overlap an alignment pattern.
   • After rendering, the PNG is decoded again in the browser to verify it.
   ========================================================================== */
(function () {
  "use strict";

  var C = window.BIRTHDAY_CONFIG || {};
  var S = C.qrSettings || {};
  var D = Object.assign({
    style: "heart", foreground: "#D83F72", background: "#FFFFFF",
    errorCorrection: "H", size: 1000, margin: 4, centerHeart: true
  }, S.design || {});

  var HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
  var FG = HEX.test(D.foreground) ? D.foreground : "#D83F72";
  var BG = HEX.test(D.background) ? D.background : "#FFFFFF";
  var ECL = /^[LMQH]$/.test(D.errorCorrection) ? D.errorCorrection : "H";
  var MARGIN = Math.max(4, parseInt(D.margin, 10) || 4);   // never below the spec minimum

  /* ======================================================================
     Destination URL (from config) + checks
     ====================================================================== */
  function buildDestination() {
    var warnings = [];
    var raw = String(S.destinationUrl || "").trim();
    var url;
    try {
      url = new URL(raw || "invalid:");
      if (!/^https?:$/.test(url.protocol)) throw new Error("protocol");
    } catch (e) {
      return { ok: false, url: "", host: "", warnings: ["The destination URL in js/config.js (qrSettings.destinationUrl) is not a valid web address."] };
    }
    if (S.redirectPage) url = new URL(String(S.redirectPage).replace(/^\//, ""), url);
    if (S.redirectHash) url.hash = String(S.redirectHash).replace(/^#?/, "#");

    var h = url.hostname;
    if (url.protocol !== "https:") warnings.push("The destination uses http:// — use the https:// address from GitHub Pages or Netlify.");
    if (/^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$)/.test(h) || /\.local$/.test(h) || /^\d+\.\d+\.\d+\.\d+$/.test(h)) {
      warnings.push("The destination is a local address (" + h + "). Other phones cannot open it — use your public website URL.");
    }
    if (/username|your-?name|example\.com/i.test(url.href)) {
      warnings.push("The destination still looks like a placeholder. Put your real website URL in js/config.js.");
    }
    return { ok: true, url: url.href, host: h, warnings: warnings };
  }

  /* ======================================================================
     QR matrix (qrcode-generator, UTF-8, auto version)
     ====================================================================== */
  function makeMatrix(text) {
    if (typeof window.qrcode !== "function") throw new Error("QR library failed to load");
    qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];
    var qr = qrcode(0, ECL);
    qr.addData(text, "Byte");
    qr.make();
    var n = qr.getModuleCount();
    var m = [];
    for (var r = 0; r < n; r++) { m[r] = []; for (var c = 0; c < n; c++) m[r][c] = qr.isDark(r, c); }
    return { n: n, version: (n - 17) / 4, dark: m };
  }

  /* ======================================================================
     Geometry helpers → SVG path strings (also drawable via Path2D)
     ====================================================================== */
  function f(v) { return Math.round(v * 100) / 100; }

  function roundRect(x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    if (!r) return "M" + f(x) + " " + f(y) + "h" + f(w) + "v" + f(h) + "h" + f(-w) + "z";
    return "M" + f(x + r) + " " + f(y) + "h" + f(w - 2 * r) + "a" + f(r) + " " + f(r) + " 0 0 1 " + f(r) + " " + f(r) +
      "v" + f(h - 2 * r) + "a" + f(r) + " " + f(r) + " 0 0 1 " + f(-r) + " " + f(r) +
      "h" + f(-(w - 2 * r)) + "a" + f(r) + " " + f(r) + " 0 0 1 " + f(-r) + " " + f(-r) +
      "v" + f(-(h - 2 * r)) + "a" + f(r) + " " + f(r) + " 0 0 1 " + f(r) + " " + f(-r) + "z";
  }

  // Classic parametric heart: x = 16 sin³t, y = 13cos t − 5cos 2t − 2cos 3t − cos 4t
  // Unit box: x ∈ [−16, 16], y (screen, down) ∈ [−11.92, 17]
  function heartPoints(cx, cy, unit, steps) {
    var pts = [];
    steps = steps || 120;
    for (var i = 0; i < steps; i++) {
      var t = (Math.PI * 2 * i) / steps;
      var x = 16 * Math.pow(Math.sin(t), 3);
      var y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      pts.push([cx + x * unit, cy + y * unit]);
    }
    return pts;
  }
  function polyPath(pts) {
    return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join("") + "Z";
  }
  function inPoly(x, y, pts) {
    var inside = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  // small decorative heart centred on (cx, cy) with total width w
  function miniHeart(cx, cy, w) { return polyPath(heartPoints(cx, cy + w * 0.08, w / 32, 40)); }

  /* ----------------------------------------------------------------------
     Build a drawing ("ops") for either design, in pixel units of `size`.
     op: { d, fill | gradient, opacity, rule, stroke, sw }
     ---------------------------------------------------------------------- */
  function isFinder(r, c, n) {
    return (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  }

  function qrOps(mx, x0, y0, m, style, logo) {
    var n = mx.n, ops = [], body = "";
    var rr = style === "heart" ? m * 0.32 : 0;
    var inset = style === "heart" ? m * 0.04 : 0;
    var logoPts = null;

    if (logo) {
      // centre heart backing: ~9×9 modules (odd, centred), clears modules under it
      var lw = Math.max(7, Math.round(n * 0.22) | 1) * m;
      logoPts = heartPoints(x0 + n * m / 2, y0 + n * m / 2 + lw * 0.06, lw / 32, 60);
    }

    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        if (!mx.dark[r][c] || isFinder(r, c, n)) continue;
        var px = x0 + c * m, py = y0 + r * m;
        if (logoPts && inPoly(px + m / 2, py + m / 2, logoPts)) continue;
        body += roundRect(px + inset, py + inset, m - inset * 2, m - inset * 2, rr);
      }
    }
    ops.push({ d: body, fill: FG });

    // finder patterns: 7×7 dark ring, 5×5 light, 3×3 dark centre — proportions untouched
    [[0, 0], [0, n - 7], [n - 7, 0]].forEach(function (p) {
      var fx = x0 + p[1] * m, fy = y0 + p[0] * m;
      // only a hint of rounding: strongly rounded finders broke some decoders (OpenCV) in testing
      var ro = style === "heart" ? m * 0.45 : 0, ri = style === "heart" ? m * 0.25 : 0, rc = style === "heart" ? m * 0.3 : 0;
      ops.push({ d: roundRect(fx, fy, 7 * m, 7 * m, ro) + roundRect(fx + m, fy + m, 5 * m, 5 * m, ri), fill: FG, rule: "evenodd" });
      ops.push({ d: roundRect(fx + 2 * m, fy + 2 * m, 3 * m, 3 * m, rc), fill: FG });
    });

    if (logoPts) {
      var lw2 = Math.max(7, Math.round(n * 0.22) | 1) * m;
      ops.push({ d: polyPath(logoPts), fill: BG });
      ops.push({ d: miniHeart(x0 + n * m / 2, y0 + n * m / 2, lw2 * 0.74), fill: FG });
      ops.push({ d: miniHeart(x0 + n * m / 2 - lw2 * 0.12, y0 + n * m / 2 - lw2 * 0.1, lw2 * 0.18), fill: "#FFFFFF", opacity: 0.55 });
    }
    return ops;
  }

  function design(text, style, size, transparent) {
    var mx = makeMatrix(text);
    var q = mx.n + MARGIN * 2;
    var ops = [], W, H;
    var logo = D.centerHeart !== false && mx.version <= 6 && ECL === "H";

    if (style === "standard") {
      var m = Math.max(1, Math.floor(size / q));     // whole pixels per module = crisp edges
      W = H = m * q;
      if (!transparent) ops.push({ d: "M0 0h" + W + "v" + H + "h-" + W + "z", fill: BG });
      ops = ops.concat(qrOps(mx, MARGIN * m, MARGIN * m, m, "standard", false));
      return { ops: ops, w: W, h: H, matrix: mx, modulePx: m };
    }

    // ----- heart -----
    W = H = size;
    var unit = (size * 0.92) / 32;
    var heartH = 28.92 * unit;
    var cx = size / 2;
    var top = (size - heartH) / 2;
    var cyUnit = function (u) { return top + (u + 11.92) * unit; };
    var heartPts = heartPoints(cx, cyUnit(0), unit, 180);

    // white card side ≈ 47% of the image: big enough to scan from a small thumbnail (tested
    // at 400 px with ZXing + OpenCV), small enough to stay inside the heart's silhouette
    var card = 16.5 * unit;
    var cardX = cx - card / 2, cardY = cyUnit(1.3) - card / 2;
    var mod = card / q;

    if (!transparent) ops.push({ d: "M0 0h" + W + "v" + H + "h-" + W + "z", fill: BG });
    // soft glow + heart body
    ops.push({ d: polyPath(heartPoints(cx, cyUnit(0) + unit * 0.6, unit * 1.035, 180)), fill: "#F5B8CB", opacity: 0.45 });
    ops.push({ d: polyPath(heartPts), gradient: ["#F4A7BD", "#E96B91", "#D83F72"], gx1: 0, gy1: top, gx2: 0, gy2: top + heartH });
    ops.push({ d: polyPath(heartPoints(cx - unit * 4.5, cyUnit(-6.2), unit * 0.2, 60)), fill: "#FFFFFF", opacity: 0.22 });

    // scattered little hearts + dots on the pink, kept well away from the card
    var seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    var pad = mod * 3;
    for (var i = 0, placed = 0; i < 400 && placed < 26; i++) {
      var x = cx + (rnd() - 0.5) * 30 * unit, y = top + rnd() * heartH;
      var s = unit * (0.7 + rnd() * 1.5);
      if (!inPoly(x, y, heartPts)) continue;
      if (x > cardX - pad - s && x < cardX + card + pad + s && y > cardY - pad - s && y < cardY + card + pad + s) continue;
      // keep inside the heart edge too
      if (!inPoly(x - s, y, heartPts) || !inPoly(x + s, y, heartPts) || !inPoly(x, y + s, heartPts)) continue;
      ops.push(placed % 3 === 2
        ? { d: roundRect(x - s * 0.18, y - s * 0.18, s * 0.36, s * 0.36, s * 0.18), fill: "#FFFFFF", opacity: 0.55 }
        : { d: miniHeart(x, y, s), fill: "#FFFFFF", opacity: placed % 2 ? 0.35 : 0.6 });
      placed++;
    }

    // white card (= quiet zone) with a soft border, then the QR
    ops.push({ d: roundRect(cardX - mod * 0.6, cardY - mod * 0.2, card + mod * 1.2, card + mod * 1.4, mod * 2.4), fill: "#B8325F", opacity: 0.18 });
    ops.push({ d: roundRect(cardX, cardY, card, card, mod * 2.2), fill: BG });
    ops = ops.concat(qrOps(mx, cardX + MARGIN * mod, cardY + MARGIN * mod, mod, "heart", logo));
    return { ops: ops, w: W, h: H, matrix: mx, modulePx: mod, logo: logo };
  }

  /* ======================================================================
     Renderers
     ====================================================================== */
  function toSVG(dr, label) {
    var defs = "", body = "", g = 0;
    dr.ops.forEach(function (o) {
      var fill = o.fill;
      if (o.gradient) {
        var id = "g" + (g++);
        defs += '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + o.gx1 + '" y1="' + f(o.gy1) + '" x2="' + o.gx2 + '" y2="' + f(o.gy2) + '">' +
          o.gradient.map(function (c, i) { return '<stop offset="' + (i / (o.gradient.length - 1)) + '" stop-color="' + c + '"/>'; }).join("") + "</linearGradient>";
        fill = "url(#" + id + ")";
      }
      body += '<path d="' + o.d + '" fill="' + fill + '"' + (o.opacity != null ? ' fill-opacity="' + o.opacity + '"' : "") + (o.rule ? ' fill-rule="' + o.rule + '"' : "") + "/>";
    });
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + f(dr.w) + " " + f(dr.h) + '" width="' + f(dr.w) + '" height="' + f(dr.h) + '" role="img" aria-label="' + U.esc(label || "QR code") + '">' +
      (defs ? "<defs>" + defs + "</defs>" : "") + body + "</svg>";
  }

  function toCanvas(dr) {
    var cv = document.createElement("canvas");
    cv.width = Math.round(dr.w); cv.height = Math.round(dr.h);
    var ctx = cv.getContext("2d");
    dr.ops.forEach(function (o) {
      ctx.save();
      if (o.gradient) {
        var gr = ctx.createLinearGradient(o.gx1, o.gy1, o.gx2, o.gy2);
        o.gradient.forEach(function (c, i) { gr.addColorStop(i / (o.gradient.length - 1), c); });
        ctx.fillStyle = gr;
      } else ctx.fillStyle = o.fill;
      if (o.opacity != null) ctx.globalAlpha = o.opacity;
      ctx.fill(new Path2D(o.d), o.rule || "nonzero");
      ctx.restore();
    });
    return cv;
  }

  function canvasToBlob(cv) {
    return new Promise(function (resolve, reject) {
      if (cv.toBlob) cv.toBlob(function (b) { b ? resolve(b) : reject(new Error("toBlob failed")); }, "image/png");
      else {
        var bin = atob(cv.toDataURL("image/png").split(",")[1]), arr = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        resolve(new Blob([arr], { type: "image/png" }));
      }
    });
  }

  function saveBlob(blob, name) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  /* ======================================================================
     QR Gift page
     ====================================================================== */
  var state = { style: D.style === "standard" ? "standard" : "heart", transparent: false, res: parseInt(D.size, 10) || 1000, dest: null };

  function fileName(ext) {
    return (state.style === "heart" ? "birthday-gift-heart-qr" : "birthday-gift-qr") +
      (state.transparent ? "-transparent" : "") + (state.res > 1000 ? "-" + state.res : "") + "." + ext;
  }

  function label() { return "QR code that opens " + (state.dest ? state.dest.host : "the birthday website"); }

  function render() {
    var stage = document.getElementById("qrPreview");
    var verify = document.getElementById("qrVerify");
    if (!state.dest.ok) {
      stage.innerHTML = '<p class="qr-empty">Add your website address in <code>js/config.js</code> to create the QR code.</p>';
      verify.hidden = true;
      return;
    }
    var dr;
    // on screen the heart floats on the card (its QR keeps its own white card either way)
    try { dr = design(state.dest.url, state.style, 720, state.transparent || state.style === "heart"); }
    catch (e) { stage.innerHTML = '<p class="qr-empty">The QR code could not be created (' + U.esc(e.message) + ").</p>"; return; }
    stage.innerHTML = toSVG(dr, label());
    stage.classList.toggle("is-standard", state.style === "standard");
    stage.classList.toggle("is-transparent", state.transparent);
    stage.classList.remove("is-new"); void stage.offsetWidth; stage.classList.add("is-new");
    U.setText("qrMeta", "QR version " + dr.matrix.version + " · " + dr.matrix.n + "×" + dr.matrix.n + " modules · error correction " + ECL + " · quiet zone " + MARGIN);
    verifyCurrent();
  }

  /** Decode the exact PNG we would download, entirely in this browser. */
  var verifyToken = 0;
  function verifyCurrent() {
    var el = document.getElementById("qrVerify");
    if (!state.dest || !state.dest.ok) { el.hidden = true; return; }
    var token = ++verifyToken;
    el.hidden = false;
    el.className = "qr-verify is-checking";
    el.innerHTML = Icons.svg("scan") + "<span>Checking that this QR scans…</span>";
    var dr = design(state.dest.url, state.style, 1000, false);  // same art, on white like a printed/shared image
    var cv = toCanvas(dr);
    setTimeout(function () {
      if (!window.QRScan) return;
      QRScan.decodeCanvas(cv).then(function (res) {
        if (token !== verifyToken) return;
        if (res && res.text === state.dest.url) {
          el.className = "qr-verify is-ok";
          el.innerHTML = Icons.svg("check") + "<span>Scannable — decoded in your browser with " + U.esc(res.engine) + "</span>";
        } else {
          el.className = "qr-verify is-bad";
          el.innerHTML = Icons.svg("alert") + "<span>This version could not be verified. Try the Standard QR.</span>";
        }
      }, function () {
        if (token !== verifyToken) return;
        el.className = "qr-verify is-bad";
        el.innerHTML = Icons.svg("alert") + "<span>Verification unavailable in this browser.</span>";
      });
    }, 60);
  }

  function download(kind) {
    if (!state.dest.ok) return;
    var dr = design(state.dest.url, state.style, state.res, state.transparent);
    if (kind === "svg") {
      saveBlob(new Blob([toSVG(dr, label())], { type: "image/svg+xml" }), fileName("svg"));
      U.toast("SVG saved ♡");
      return;
    }
    canvasToBlob(toCanvas(dr)).then(function (b) { saveBlob(b, fileName("png")); U.toast("QR code saved ♡"); },
      function () { U.toast("Sorry, this browser could not create the image."); });
  }

  function share() {
    if (!state.dest.ok) return;
    var url = state.dest.url;
    var title = "A Secret Message Just For You";
    var text = "Scan this little heart (or open the link) to discover something special.";
    var dr = design(state.dest.url, state.style, 1000, false);
    canvasToBlob(toCanvas(dr)).then(function (blob) {
      var file = null;
      try { file = new File([blob], fileName("png").replace("-transparent", ""), { type: "image/png" }); } catch (e) { file = null; }
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        return navigator.share({ files: [file], title: title, text: text + " " + url });
      }
      if (navigator.share) return navigator.share({ title: title, text: text, url: url });
      // fallback: copy the link and save the image
      return copyText(url).then(function (ok) {
        saveBlob(blob, fileName("png"));
        U.toast(ok ? "Sharing isn't supported here — link copied & QR saved" : "QR saved. Copy the link below to share it.", 3600);
      });
    }).catch(function (err) {
      if (err && err.name === "AbortError") return;    // user closed the share sheet
      copyText(url).then(function (ok) { U.toast(ok ? "Link copied — paste it anywhere ♡" : "Couldn't share. Copy the link below instead."); });
    });
  }

  function initPage() {
    var page = document.getElementById("screen-qr");
    if (!page) return;
    if (S.enabled === false) {
      U.$$('[href="#qr"]').forEach(function (a) { a.hidden = true; });
      return;
    }
    state.dest = buildDestination();

    var warn = document.getElementById("qrWarn");
    if (state.dest.warnings.length) {
      warn.hidden = false;
      warn.innerHTML = Icons.svg("alert") + "<div>" + state.dest.warnings.map(function (w) { return "<p>" + U.esc(w) + "</p>"; }).join("") + "</div>";
    }
    U.setText("qrDestHost", state.dest.host || "not set");
    var link = document.getElementById("qrDestUrl");
    link.textContent = state.dest.url || "—";
    if (state.dest.ok) link.href = state.dest.url; else link.removeAttribute("href");

    document.getElementById("qrHowTo").hidden = S.allowExternalScanner === false;
    U.$$('[href="#scan"]').forEach(function (a) { a.hidden = S.scannerEnabled === false; });

    // style switch
    var seg = document.getElementById("qrStyle");
    function syncSeg() {
      U.$$("button", seg).forEach(function (b) { b.setAttribute("aria-checked", String(b.dataset.style === state.style)); });
    }
    seg.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-style]");
      if (!b || b.dataset.style === state.style) return;
      state.style = b.dataset.style; syncSeg(); render();
    });
    seg.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      state.style = state.style === "heart" ? "standard" : "heart"; syncSeg(); render();
      seg.querySelector('[aria-checked="true"]').focus();
    });
    syncSeg();

    var tr = document.getElementById("qrTransparent");
    tr.addEventListener("change", function () {
      state.transparent = tr.checked;
      render();
      if (tr.checked) U.toast(state.style === "heart"
        ? "The QR keeps its white card, so it still scans."
        : "Tip: only place a transparent QR on a light background.", 3400);
    });

    var res = document.getElementById("qrRes");
    res.value = String(state.res >= 2000 ? 2000 : 1000);
    res.addEventListener("change", function () { state.res = parseInt(res.value, 10) || 1000; });

    document.getElementById("qrDownloadPng").addEventListener("click", function () { download("png"); });
    document.getElementById("qrDownloadSvg").addEventListener("click", function () { download("svg"); });
    document.getElementById("qrShare").addEventListener("click", share);
    document.getElementById("qrCopy").addEventListener("click", function () {
      if (!state.dest.ok) return;
      copyText(state.dest.url).then(function (ok) { U.toast(ok ? "Link copied ♡" : "Couldn't copy — press and hold the link to copy it."); });
    });

    var rendered = false;
    Router.on("qr", function () {
      if (!rendered) { rendered = true; render(); }
      else verifyCurrent();
    });
  }

  window.QRGift = {
    init: initPage,
    buildDestination: buildDestination,
    makeMatrix: makeMatrix,
    design: design,
    toSVG: toSVG,
    toCanvas: toCanvas,
    copyText: copyText,
    _state: state
  };
})();
