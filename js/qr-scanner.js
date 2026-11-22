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
        s.onload = function () { window.jsQR ? resolve(window.jsQR) : reject(new Error("jsQR tidak ditemukan")); };
        s.onerror = function () { jsqrPromise = null; reject(new Error("Decoder QR gagal dimuat")); };
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
      out.warnings.push("Ini terlihat seperti alamat web tanpa https:// — hanya ditampilkan sebagai teks.");
      return out;
    } else {
      return out; // plain text message
    }

    var u;
    try { u = new URL(text); } catch (e) { out.kind = "text"; out.warnings.push("Ini terlihat seperti tautan, tapi bukan alamat yang valid."); return out; }
    if (/[\u0000-\u001F\u007F\s]/.test(text)) { out.kind = "blocked"; out.scheme = "malformed"; return out; }

    out.kind = "url";
    out.url = u.href;
    out.host = u.hostname;
    out.secure = u.protocol === "https:";
    if (!out.secure) out.warnings.push("Tidak aman: tautan ini memakai http://, jadi koneksinya tidak terenkripsi.");
    if (u.username || u.password) out.warnings.push("Tautan ini menyembunyikan data login sebelum alamatnya — hati-hati.");
    if (/(^|\.)xn--/i.test(u.hostname)) out.warnings.push("Domainnya memakai karakter khusus (" + u.hostname + ") dan mungkin meniru situs lain.");

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
      if (reason === "user") status("Kamera dimatikan.", "");
    }
  }

  function cameraError(err) {
    var name = err && err.name;
    var msg;
    if (name === "NotAllowedError" || name === "SecurityError" || name === "PermissionDeniedError") {
      msg = "Izin kamera ditolak. Izinkan akses kamera di pengaturan browser, atau pakai Unggah Gambar QR.";
    } else if (name === "NotFoundError" || name === "DevicesNotFoundError" || name === "OverconstrainedError") {
      msg = "Tidak ada kamera di perangkat ini. Kamu tetap bisa memakai Unggah Gambar QR.";
    } else if (name === "NotReadableError" || name === "TrackStartError" || name === "AbortError") {
      msg = "Kamera sedang dipakai aplikasi lain. Tutup aplikasinya lalu coba lagi.";
    } else {
      msg = "Kamera tidak bisa dinyalakan" + (err && err.message ? " (" + err.message + ")" : "") + ". Coba Unggah Gambar QR saja.";
    }
    status(msg, "error");
    setMode("idle");
  }

  function startCamera() {
    if (S.allowCameraScanning === false) return;
    if (!window.isSecureContext) {
      status("Kamera hanya berfungsi di halaman aman (https://). Buka website dari link GitHub Pages / Netlify-nya.", "error");
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      status("Browser ini tidak bisa memakai kamera. Pakai Unggah Gambar QR saja.", "error");
      return;
    }
    hideResult();
    var gen = ++startGen;
    setMode("starting");
    status("Menunggu izin kamera…", "");

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
        status("Memindai… " + (videoCount > 1 ? (facing === "environment" ? "(kamera belakang)" : "(kamera depan)") : ""), "live");
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
      status("Decoder QR gagal dimuat (" + (err && err.message) + "). Periksa koneksi lalu muat ulang.", "error");
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

    title.textContent = a.kind === "blocked" ? "Kode QR terdeteksi — tautan diblokir" : "Kode QR terdeteksi!";
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
    if (a.kind === "blocked") warnings.unshift("Demi keamananmu, tautan \"" + a.scheme + ":\" tidak bisa dibuka dari pemindai ini.");
    if (a.kind === "text") warnings.unshift("QR ini berisi teks, bukan tautan.");
    if (warnings.length) {
      warn.hidden = false;
      warn.innerHTML = warnings.map(function (w) { return "<p>" + Icons.svg("alert") + "<span>" + U.esc(w) + "</span></p>"; }).join("");
    }
    status("Terbaca dengan " + engine + (lastSource === "upload" ? " dari gambarmu." : " — kamera dimatikan."), "ok");

    var r = el.view.getBoundingClientRect();
    Anim.burst(r.left + r.width / 2, r.top + r.height / 2, { count: 10 });

    clearTimeout(openTimer);
    if (S.autoRedirect === true && a.kind === "url" && a.ours && a.secure) {
      status("Ini hadiah ulang tahunmu — sebentar lagi terbuka…", "ok");
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
    else { status("Siap. Nyalakan kamera atau unggah gambar lain.", ""); el.fileBtn.focus(); }
  }

  /* ---------- upload ---------- */
  var TYPES = /^image\/(png|jpe?g|webp)$/i;
  function handleFile(file) {
    if (!file) return;
    if (!TYPES.test(file.type) && !/\.(png|jpe?g|webp)$/i.test(file.name)) {
      status("Pilih gambar PNG, JPG, JPEG, atau WEBP.", "error"); return;
    }
    if (file.size > 20 * 1024 * 1024) { status("Gambar terlalu besar (maks. 20 MB).", "error"); return; }
    stopCamera("keep-ui");
    hideResult();
    setMode("idle");
    status("Membaca gambarmu…", "");
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      el.preview.src = url;
      el.preview.hidden = false;
      decodeStill(img, img.naturalWidth, img.naturalHeight).then(function (res) {
        if (res) found(res, "upload");
        else status("Tidak ada kode QR di gambar ini. Coba foto yang lebih tajam dan terang, dengan seluruh kode terlihat.", "error");
      }, function (err) {
        status("Decoder QR gagal dimuat (" + (err && err.message) + ").", "error");
      });
    };
    img.onerror = function () { URL.revokeObjectURL(url); status("File itu tidak bisa dibuka sebagai gambar.", "error"); };
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
      status("Pemindaian kamera dimatikan — unggah gambar QR saja.", "");
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
      (window.QRGift ? QRGift.copyText(t) : Promise.resolve(false)).then(function (ok) { U.toast(ok ? "Disalin" : "Gagal menyalin — tekan lama untuk memilih teksnya."); });
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
      status("Kamera butuh https:// (atau localhost). Unggah gambar bisa di mana saja.", "");
    }

    Router.on("scan", function () {
      if (el.view.dataset.mode !== "result") { setMode("idle"); }
      getNative(); // warm up
    });
    Router.onLeave("scan", function () { stopCamera("leave"); hideResult(); setMode("idle"); status("Ketuk Nyalakan Kamera untuk mulai.", ""); });

    // never keep the camera running in a background tab
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && stream) { stopCamera("keep-ui"); setMode("idle"); status("Kamera dijeda saat halaman tersembunyi. Ketuk Nyalakan Kamera untuk lanjut.", ""); }
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
