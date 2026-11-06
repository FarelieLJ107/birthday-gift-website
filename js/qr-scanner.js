/* ==========================================================================
   qr-scanner.js — "Scan Your Little Surprise"
   Real-time camera scanner + image upload scanner + safe URL handling.

   Privacy & safety
   • The camera only starts after the user taps "Start Camera".
   • Frames and images are decoded locally in the browser — nothing is
     uploaded, and scan results are never stored.
   • Camera tracks are stopped on Stop, after a successful scan, when the
     page is left, and when the tab is hidden.
   • Links are NEVER opened automatically (except, if enabled in config,
     this website's own https address). Only http(s) links can be opened;
     javascript:, data:, file: and every other scheme are blocked.

   Detection engines
   1. BarcodeDetector (native; Chrome on Android, some desktop browsers)
   2. jsQR (pure JavaScript fallback, loaded on demand — iPhone Safari,
      Firefox, and anywhere BarcodeDetector is missing or fails)
   ========================================================================== */
(function () {
  "use strict";

  var C = window.BIRTHDAY_CONFIG || {};
  var S = C.qrSettings || {};

  /* ======================================================================
     Decoders
     ====================================================================== */
  var nativeDetector = null, nativeChecked = false, nativeBroken = false;

  function getNative() {
    if (nativeChecked) return Promise.resolve(nativeBroken ? null : nativeDetector);
    nativeChecked = true;
    if (!("BarcodeDetector" in window)) return Promise.resolve(null);
    var check = window.BarcodeDetector.getSupportedFormats ? window.BarcodeDetector.getSupportedFormats() : Promise.resolve(["qr_code"]);
    return check.then(function (formats) {
      if (formats.indexOf("qr_code") === -1) return null;
      nativeDetector = new window.BarcodeDetector({ formats: ["qr_code"] });
      return nativeDetector;
    }).catch(function () { return null; });
  }

  var jsqrPromise = null;
  function loadJsQR() {
    if (window.jsQR) return Promise.resolve(window.jsQR);
    if (!jsqrPromise) {
      jsqrPromise = new Promise(function (resolve, reject) {
        var s = document.createElement("script");
        s.src = "js/vendor/jsQR.min.js";
        s.async = true;
        s.onload = function () { window.jsQR ? resolve(window.jsQR) : reject(new Error("jsQR missing")); };
        s.onerror = function () { jsqrPromise = null; reject(new Error("Could not load the QR decoder")); };
        document.head.appendChild(s);
      });
    }
    return jsqrPromise;
  }

  var work = document.createElement("canvas");
  var wctx = work.getContext("2d", { willReadFrequently: true });

  /** Run jsQR on a source (or a region of it: crop = [x, y, w, h]) drawn at a given max size. */
  function jsqrDecode(src, sw, sh, maxDim, attempts, crop) {
    var cx = 0, cy = 0, cw = sw, ch = sh;
    if (crop) { cx = crop[0]; cy = crop[1]; cw = crop[2]; ch = crop[3]; }
    var scale = Math.min(1, maxDim / Math.max(cw, ch));
    var w = Math.max(1, Math.round(cw * scale)), h = Math.max(1, Math.round(ch * scale));
    work.width = w; work.height = h;
    wctx.drawImage(src, cx, cy, cw, ch, 0, 0, w, h);
    var img = wctx.getImageData(0, 0, w, h);
    var res = window.jsQR(img.data, w, h, { inversionAttempts: attempts || "dontInvert" });
    return res && res.data ? res.data : null;
  }

  /**
   * Decode a still image (canvas / ImageBitmap / <img>) thoroughly.
   * Returns { text, engine } or null.
   */
  function decodeStill(src, sw, sh) {
    return getNative().then(function (det) {
      if (!det || nativeBroken) return null;
      return det.detect(src).then(function (codes) {
        return codes && codes.length && codes[0].rawValue ? { text: codes[0].rawValue, engine: "BarcodeDetector" } : null;
      }).catch(function () { nativeBroken = true; return null; });
    }).then(function (res) {
      if (res) return res;
      return loadJsQR().then(function () {
        var sizes = [1400, 900, 600, 2000];
        for (var i = 0; i < sizes.length; i++) {
          if (i > 0 && sizes[i] >= Math.max(sw, sh) && sizes[i - 1] >= Math.max(sw, sh)) continue;
          var t = jsqrDecode(src, sw, sh, sizes[i], "attemptBoth");
          if (t) return { text: t, engine: "jsQR" };
        }
        return null;
      });
    });
  }

  function decodeCanvas(cv) { return decodeStill(cv, cv.width, cv.height); }

  /* ======================================================================
     Result analysis — what is inside the QR, and is it safe to open?
     ====================================================================== */
  function destination() {
    try { return window.QRGift ? QRGift.buildDestination() : null; } catch (e) { return null; }
  }

  function analyze(raw) {
    var text = String(raw == null ? "" : raw).trim();
    var out = { raw: text, kind: "text", url: null, host: "", secure: false, ours: false, warnings: [] };
    if (!text) { out.kind = "empty"; return out; }

    var scheme = (/^([a-z][a-z0-9+.\-]*):/i.exec(text) || [])[1];
    if (scheme) {
      scheme = scheme.toLowerCase();
      if (scheme !== "http" && scheme !== "https") {
        // javascript:, data:, vbscript:, file:, blob:, intent:, about:, … are never opened
        out.kind = "blocked";
        out.scheme = scheme;
        return out;
      }
    } else if (/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(text) && !/\s/.test(text)) {
      out.warnings.push("This looks like a web address without https:// — it is shown as text only.");
      return out;
    } else {
      return out; // plain text message
    }

    var u;
    try { u = new URL(text); } catch (e) { out.kind = "text"; out.warnings.push("This looks like a link but isn't a valid address."); return out; }
    if (/[\u0000-\u001F\u007F\s]/.test(text)) { out.kind = "blocked"; out.scheme = "malformed"; return out; }

    out.kind = "url";
    out.url = u.href;
    out.host = u.hostname;
    out.secure = u.protocol === "https:";
    if (!out.secure) out.warnings.push("Not secure: this link uses http://, so the connection isn't encrypted.");
    if (u.username || u.password) out.warnings.push("This link hides login details before the address — be careful.");
    if (/(^|\.)xn--/i.test(u.hostname)) out.warnings.push("The domain uses special characters (" + u.hostname + ") and may imitate another site.");

    var dest = destination();
    if (dest && dest.ok) {
      var d = new URL(dest.url);
      out.ours = u.hostname === d.hostname && u.pathname.indexOf(d.pathname.replace(/index\.html$/, "")) === 0;
    }
    if (!out.ours && location.protocol.indexOf("http") === 0 && u.origin === location.origin) out.ours = true;
    return out;
  }

  /* ======================================================================
     Scanner page
     ====================================================================== */
  var el = {};
  var stream = null, facing = "environment", scanning = false, timer = 0, frameNo = 0, startGen = 0, busy = false;
  var videoCount = 0;

  function status(msg, tone) {
    el.status.textContent = msg;
    el.status.dataset.tone = tone || "";
  }

  function setMode(mode) {     // idle | starting | live | result
    el.view.dataset.mode = mode;
    var live = mode === "live" || mode === "starting";
    el.start.hidden = live;
    el.stop.hidden = !live;
    el.switchBtn.disabled = !(mode === "live" && videoCount > 1);
  }

  function stopCamera(reason) {
    startGen++;                 // cancels a start that is still waiting for permission
    scanning = false;
    clearTimeout(timer);
    if (stream) {
      stream.getTracks().forEach(function (t) { t.stop(); });
      stream = null;
    }
    if (el.video) { el.video.pause(); el.video.srcObject = null; }
    if (reason !== "keep-ui" && el.view && el.view.dataset.mode !== "result") {
      setMode("idle");
      if (reason === "user") status("Camera stopped.", "");
    }
  }

  function cameraError(err) {
    var name = err && err.name;
    var msg;
    if (name === "NotAllowedError" || name === "SecurityError" || name === "PermissionDeniedError") {
      msg = "Camera permission was denied. Allow camera access in your browser settings, or use Upload QR Image.";
    } else if (name === "NotFoundError" || name === "DevicesNotFoundError" || name === "OverconstrainedError") {
      msg = "No camera was found on this device. You can still use Upload QR Image.";
    } else if (name === "NotReadableError" || name === "TrackStartError" || name === "AbortError") {
      msg = "The camera is busy in another app. Close it and try again.";
    } else {
      msg = "The camera couldn't start" + (err && err.message ? " (" + err.message + ")" : "") + ". Try Upload QR Image instead.";
    }
    status(msg, "error");
    setMode("idle");
  }

  function startCamera() {
    if (S.allowCameraScanning === false) return;
    if (!window.isSecureContext) {
      status("The camera only works on a secure (https://) page. Open the website from its GitHub Pages / Netlify link.", "error");
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      status("This browser can't use the camera. Use Upload QR Image instead.", "error");
      return;
    }
    hideResult();
    var gen = ++startGen;
    setMode("starting");
    status("Waiting for camera permission…", "");

    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } }
    }).then(function (s) {
      // the user left the page or pressed Stop while the prompt was open
      if (gen !== startGen || !isOnScanPage()) { s.getTracks().forEach(function (t) { t.stop(); }); return; }
      stream = s;
      var track = s.getVideoTracks()[0];
      var settings = track && track.getSettings ? track.getSettings() : {};
      el.video.classList.toggle("is-mirrored", (settings.facingMode || facing) === "user");
      el.video.srcObject = s;
      return el.video.play().then(function () {
        if (gen !== startGen) return;
        return navigator.mediaDevices.enumerateDevices().then(function (list) {
          videoCount = list.filter(function (d) { return d.kind === "videoinput"; }).length;
        }, function () { videoCount = 1; });
      }).then(function () {
        if (gen !== startGen) return;
        setMode("live");
        status("Scanning… " + (videoCount > 1 ? (facing === "environment" ? "(back camera)" : "(front camera)") : ""), "live");
        scanning = true;
        frameNo = 0;
        loop();
      });
    }).catch(function (err) { if (gen === startGen) cameraError(err); });
  }

  function loop() {
    if (!scanning) return;
    var v = el.video;
    if (busy || v.readyState < 2 || !v.videoWidth) { timer = setTimeout(loop, 120); return; }
    busy = true;
    frameNo++;
    getNative().then(function (det) {
      // native detector on most frames; jsQR every 3rd frame (or always without native)
      if (det && !nativeBroken && frameNo % 3 !== 0) {
        return det.detect(v).then(function (codes) {
          return codes && codes.length && codes[0].rawValue ? { text: codes[0].rawValue, engine: "BarcodeDetector" } : null;
        }).catch(function () { nativeBroken = true; return null; });
      }
      return loadJsQR().then(function () {
        var w = v.videoWidth, h = v.videoHeight, t;
        if (frameNo % 2) {
          // centre of the picture (where the frame is) at full camera resolution
          var side = Math.round(Math.min(w, h) * 0.9);
          t = jsqrDecode(v, w, h, 900, "dontInvert", [Math.round((w - side) / 2), Math.round((h - side) / 2), side, side]);
        } else {
          // whole picture, keeping enough pixels for a QR held further away
          t = jsqrDecode(v, w, h, 1280, frameNo % 4 === 0 ? "attemptBoth" : "dontInvert");
        }
        return t ? { text: t, engine: "jsQR" } : null;
      });
    }).then(function (res) {
      busy = false;
      if (!scanning) return;
      if (res) found(res, "camera");
      else timer = setTimeout(loop, 110);
    }, function (err) {
      busy = false;
      status("The QR decoder couldn't load (" + (err && err.message) + "). Check your connection and reload.", "error");
      stopCamera("keep-ui"); setMode("idle");
    });
  }

  function freezeFrame() {
    var v = el.video;
    if (!v.videoWidth) return;
    var cv = el.freeze;
    cv.width = v.videoWidth; cv.height = v.videoHeight;
    var ctx = cv.getContext("2d");
    if (v.classList.contains("is-mirrored")) { ctx.translate(cv.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(v, 0, 0);
    cv.hidden = false;
  }

  var lastSource = "camera";
  function found(res, source) {
    lastSource = source;
    if (source === "camera") { freezeFrame(); scanning = false; stopCamera("keep-ui"); }
    if (navigator.vibrate) { try { navigator.vibrate(60); } catch (e) { /* noop */ } }
    showResult(analyze(res.text), res.engine);
  }

  /* ---------- result card ---------- */
  var openTimer = 0;
  function showResult(a, engine) {
    setMode("result");
    var box = el.result;
    box.hidden = false;
    box.classList.remove("is-in"); void box.offsetWidth; box.classList.add("is-in");
    box.dataset.kind = a.kind;
    var title = document.getElementById("scanResultTitle");
    var badge = document.getElementById("scanResultBadge");
    var domain = document.getElementById("scanResultDomain");
    var value = document.getElementById("scanResultValue");
    var warn = document.getElementById("scanResultWarn");
    var open = document.getElementById("scanOpen");
    var copy = document.getElementById("scanCopy");

    title.textContent = a.kind === "blocked" ? "QR Code detected — link blocked" : "QR Code detected!";
    box.querySelector(".scan-result__check").innerHTML = Icons.svg(a.kind === "blocked" ? "alert" : "check");
    value.textContent = a.raw.length > 600 ? a.raw.slice(0, 600) + "…" : a.raw;
    badge.hidden = !a.ours;
    warn.hidden = true; warn.innerHTML = "";
    open.hidden = true; open.removeAttribute("href");
    copy.hidden = a.kind === "empty";

    if (a.kind === "url") {
      domain.hidden = false;
      domain.className = "scan-domain " + (a.secure ? "is-secure" : "is-insecure");
      domain.innerHTML = Icons.svg(a.secure ? "lock" : "alert") + "<span>" + U.esc(a.host) + "</span>";
      open.hidden = false;
      open.href = a.url;
      open.target = a.ours ? "_self" : "_blank";
      open.rel = "noopener noreferrer";
    } else {
      domain.hidden = true;
    }
    var warnings = a.warnings.slice();
    if (a.kind === "blocked") warnings.unshift("For your safety, \"" + a.scheme + ":\" links can't be opened from this scanner.");
    if (a.kind === "text") warnings.unshift("This QR contains text, not a link.");
    if (warnings.length) {
      warn.hidden = false;
      warn.innerHTML = warnings.map(function (w) { return "<p>" + Icons.svg("alert") + "<span>" + U.esc(w) + "</span></p>"; }).join("");
    }
    status("Found with " + engine + (lastSource === "upload" ? " from your image." : " — camera stopped."), "ok");

    var r = el.view.getBoundingClientRect();
    Anim.burst(r.left + r.width / 2, r.top + r.height / 2, { count: 10 });

    clearTimeout(openTimer);
    if (S.autoRedirect === true && a.kind === "url" && a.ours && a.secure) {
      status("This is your birthday gift — opening in a moment…", "ok");
      openTimer = setTimeout(function () { location.href = a.url; }, 1800);
    }
    // bring the result (and its buttons) into view, then focus the main action
    setTimeout(function () {
      var screen = document.getElementById("screen-scan");
      var sr = screen.getBoundingClientRect(), br = box.getBoundingClientRect();
      var navSpace = 96;
      if (br.bottom > sr.bottom - navSpace) {
        var target = screen.scrollTop + br.top - sr.top - 72;
        screen.scrollTo({ top: Math.max(0, target), behavior: U.reducedMotion() ? "auto" : "smooth" });
      }
      (a.kind === "url" ? open : document.getElementById("scanAgain")).focus({ preventScroll: true });
    }, 380);
  }

  function hideResult() {
    clearTimeout(openTimer);
    el.result.hidden = true;
    el.freeze.hidden = true;
    if (el.preview) {
      if (el.preview.src && el.preview.src.indexOf("blob:") === 0) URL.revokeObjectURL(el.preview.src);
      el.preview.hidden = true; el.preview.removeAttribute("src");
    }
  }

  function scanAgain() {
    hideResult();
    setMode("idle");
    if (lastSource === "camera" && S.allowCameraScanning !== false) startCamera();
    else { status("Ready. Start the camera or upload another image.", ""); el.fileBtn.focus(); }
  }

  /* ---------- upload ---------- */
  var TYPES = /^image\/(png|jpe?g|webp)$/i;
  function handleFile(file) {
    if (!file) return;
    if (!TYPES.test(file.type) && !/\.(png|jpe?g|webp)$/i.test(file.name)) {
      status("Please choose a PNG, JPG, JPEG or WEBP image.", "error"); return;
    }
    if (file.size > 20 * 1024 * 1024) { status("That image is too large (max 20 MB).", "error"); return; }
    stopCamera("keep-ui");
    hideResult();
    setMode("idle");
    status("Reading your image…", "");
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      el.preview.src = url;
      el.preview.hidden = false;
      decodeStill(img, img.naturalWidth, img.naturalHeight).then(function (res) {
        if (res) found(res, "upload");
        else status("No QR code found in this image. Try a sharper, brighter photo where the whole code is visible.", "error");
      }, function (err) {
        status("The QR decoder couldn't load (" + (err && err.message) + ").", "error");
      });
    };
    img.onerror = function () { URL.revokeObjectURL(url); status("That file couldn't be opened as an image.", "error"); };
    img.src = url;
    lastSource = "upload";
  }

  function isOnScanPage() {
    var cur = window.Router && Router.current();
    return !!cur && cur.name === "scan";
  }

  function initPage() {
    var page = document.getElementById("screen-scan");
    if (!page) return;
    el = {
      view: document.getElementById("scanView"),
      video: document.getElementById("scanVideo"),
      freeze: document.getElementById("scanFreeze"),
      preview: document.getElementById("scanPreview"),
      status: document.getElementById("scanStatus"),
      start: document.getElementById("scanStart"),
      stop: document.getElementById("scanStop"),
      switchBtn: document.getElementById("scanSwitch"),
      file: document.getElementById("scanFile"),
      fileBtn: document.getElementById("scanUpload"),
      result: document.getElementById("scanResult")
    };
    el.video.setAttribute("playsinline", "");
    el.video.muted = true;

    if (S.allowCameraScanning === false) {
      el.start.hidden = true; el.switchBtn.hidden = true;
      status("Camera scanning is turned off — upload a QR image instead.", "");
    }
    if (S.allowImageUpload === false) el.fileBtn.hidden = true;

    el.start.addEventListener("click", startCamera);
    el.stop.addEventListener("click", function () { stopCamera("user"); });
    el.switchBtn.addEventListener("click", function () {
      facing = facing === "environment" ? "user" : "environment";
      stopCamera("keep-ui");
      startCamera();
    });
    el.fileBtn.addEventListener("click", function () { el.file.click(); });
    el.file.addEventListener("change", function () { handleFile(el.file.files && el.file.files[0]); el.file.value = ""; });
    document.getElementById("scanAgain").addEventListener("click", scanAgain);
    document.getElementById("scanCopy").addEventListener("click", function () {
      var t = document.getElementById("scanResultValue").textContent;
      (window.QRGift ? QRGift.copyText(t) : Promise.resolve(false)).then(function (ok) { U.toast(ok ? "Copied" : "Couldn't copy — press and hold to select the text."); });
    });
    document.getElementById("scanOpen").addEventListener("click", function () {
      clearTimeout(openTimer);  // explicit user action
    });

    // drag & drop an image onto the viewer (desktop)
    el.view.addEventListener("dragover", function (e) { if (S.allowImageUpload !== false) { e.preventDefault(); el.view.classList.add("is-drop"); } });
    el.view.addEventListener("dragleave", function () { el.view.classList.remove("is-drop"); });
    el.view.addEventListener("drop", function (e) {
      el.view.classList.remove("is-drop");
      if (S.allowImageUpload === false) return;
      e.preventDefault();
      handleFile(e.dataTransfer.files && e.dataTransfer.files[0]);
    });

    if (!window.isSecureContext && S.allowCameraScanning !== false) {
      status("Camera needs https:// (or localhost). Image upload works everywhere.", "");
    }

    Router.on("scan", function () {
      if (el.view.dataset.mode !== "result") { setMode("idle"); }
      getNative(); // warm up
    });
    Router.onLeave("scan", function () { stopCamera("leave"); hideResult(); setMode("idle"); status("Tap Start Camera to begin.", ""); });

    // never keep the camera running in a background tab
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && stream) { stopCamera("keep-ui"); setMode("idle"); status("Camera paused while the page was hidden. Tap Start Camera to continue.", ""); }
    });
    window.addEventListener("pagehide", function () { stopCamera("leave"); });

    setMode("idle");
  }

  window.QRScan = {
    init: initPage,
    analyze: analyze,
    decodeCanvas: decodeCanvas,
    isCameraOn: function () { return !!stream && stream.getTracks().some(function (t) { return t.readyState === "live"; }); }
  };
})();
