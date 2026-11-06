/* ==========================================================================
   navigation.js — tiny hash router (works on file:// and GitHub Pages)
   Routes:  #intro  #home  #memories  #memory/<id>  #moments  #reasons
            #letter  #surprise  #qr (QR gift)  #scan (QR scanner)
   ========================================================================== */
(function () {
  "use strict";

  var ROUTES = ["intro", "home", "memories", "memory", "moments", "reasons", "letter", "surprise", "qr", "scan"];
  var NAV_FOR = { home: "home", memories: "memories", memory: "memories", moments: "moments", letter: "letter", surprise: "surprise", qr: "surprise", scan: "surprise" };
  var PARENT = { memory: "memories", scan: "qr", qr: "surprise" };
  var NO_NAV = { intro: true, memory: true };
  var JOURNEY = ["memories", "memory", "moments", "reasons", "letter", "surprise"];

  var hooks = {};
  var leaveHooks = {};
  var current = null;        // { name, param, hash }
  var stack = [];            // in-app history of hashes (for back direction)
  var leaveTimer;

  function parse(hash) {
    var h = (hash || "").replace(/^#\/?/, "");
    var parts = h.split("/");
    var name = parts[0];
    if (ROUTES.indexOf(name) === -1) name = "";
    return { name: name, param: parts[1] ? decodeURIComponent(parts[1]) : null, hash: "#" + h };
  }

  function screenFor(name) { return document.getElementById("screen-" + name); }

  function updateChrome(name) {
    var app = document.getElementById("app");
    var nav = document.getElementById("bottomNav");
    var music = document.getElementById("musicBtn");
    app.dataset.route = name;
    nav.hidden = false;
    nav.classList.toggle("is-hidden", !!NO_NAV[name]);
    nav.setAttribute("aria-hidden", NO_NAV[name] ? "true" : "false");
    U.$$("a", nav).forEach(function (a) { a.tabIndex = NO_NAV[name] ? -1 : 0; });
    music.hidden = name === "intro";
    U.$$(".bottom-nav__item", nav).forEach(function (a) {
      var on = a.dataset.nav === NAV_FOR[name];
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }

  function markVisited(name) {
    if (JOURNEY.indexOf(name) === -1) return;
    var v = U.store.get("visited", []);
    if (v.indexOf(name) === -1) { v.push(name); U.store.set("visited", v); }
    if (hooks.__visited) hooks.__visited(v);
  }

  function show(route, opts) {
    opts = opts || {};
    var next = screenFor(route.name);
    if (!next) return;
    var prevScreen = current ? screenFor(current.name) : null;
    var sameScreen = prevScreen === next;

    // direction: going "back" if the target is the previous entry in our stack
    var back = stack.length > 1 && stack[stack.length - 2] === route.hash;
    if (back) stack.pop(); else if (!opts.replace && stack[stack.length - 1] !== route.hash) stack.push(route.hash);
    if (opts.replace) stack[stack.length ? stack.length - 1 : 0] = route.hash;

    var prevRoute = current;
    if (prevRoute && prevRoute.name !== route.name && leaveHooks[prevRoute.name]) {
      try { leaveHooks[prevRoute.name](route.name); } catch (e) { if (window.console) console.error(e); }
    }
    current = route;
    updateChrome(route.name);

    if (hooks[route.name]) hooks[route.name](route.param, { back: back, from: prevRoute && prevRoute.name });

    if (!sameScreen) {
      clearTimeout(leaveTimer);
      U.$$(".screen.is-leaving").forEach(function (s) { s.classList.remove("is-leaving"); s.hidden = true; });
      if (prevScreen && !opts.instant) {
        prevScreen.classList.remove("is-entering");
        prevScreen.classList.add("is-leaving");
        leaveTimer = setTimeout(function () {
          prevScreen.classList.remove("is-leaving");
          if (prevScreen !== screenFor(current.name)) prevScreen.hidden = true;
        }, 260);
      } else if (prevScreen) {
        prevScreen.hidden = true;
      }
      next.hidden = false;
      next.classList.remove("is-leaving");
      next.classList.toggle("is-back", back);
      if (!opts.instant) {
        next.classList.remove("is-entering");
        void next.offsetWidth; // restart animation
        next.classList.add("is-entering");
        next.addEventListener("animationend", function done(e) {
          if (e.target !== next) return;
          next.classList.remove("is-entering", "is-back");
          next.removeEventListener("animationend", done);
        });
      }
    }
    next.scrollTop = 0;
    updateScroll(next);

    if (prevRoute && !opts.instant) {
      var focusTarget = next.querySelector("h1") || next;
      if (!focusTarget.hasAttribute("tabindex")) focusTarget.setAttribute("tabindex", "-1");
      setTimeout(function () { try { focusTarget.focus({ preventScroll: true }); } catch (e) { focusTarget.focus(); } }, 60);
    }

    markVisited(route.name);
    Anim.observeReveal(next);
  }

  /* ---------- scroll progress + header shadow ---------- */
  var bar;
  function updateScroll(screen) {
    if (!bar) bar = document.getElementById("scrollProgress");
    var max = screen.scrollHeight - screen.clientHeight;
    var p = max > 4 ? screen.scrollTop / max : 0;
    bar.style.transform = "scaleX(" + p.toFixed(3) + ")";
    var header = screen.querySelector(".app-header");
    if (header) header.classList.toggle("is-scrolled", screen.scrollTop > 6);
  }

  var Router = {
    on: function (name, fn) { hooks[name] = fn; },
    onLeave: function (name, fn) { leaveHooks[name] = fn; },
    onVisited: function (fn) { hooks.__visited = fn; },
    current: function () { return current; },

    go: function (hash, opts) {
      opts = opts || {};
      if (hash.charAt(0) !== "#") hash = "#" + hash;
      if (opts.replace) {
        try { history.replaceState(null, "", hash); } catch (e) { location.replace(hash); return; }
        show(parse(hash), { replace: true });
      } else if (location.hash === hash) {
        show(parse(hash));
      } else {
        location.hash = hash;
      }
    },

    back: function () {
      if (stack.length > 1) { history.back(); return; }
      var parent = current && PARENT[current.name] ? PARENT[current.name] : "home";
      Router.go(parent, { replace: true });
    },

    start: function () {
      var route = parse(location.hash);
      if (!route.name) route = parse("#intro");
      if (route.name === "intro" && location.hash !== "#intro") {
        try { history.replaceState(null, "", "#intro"); } catch (e) { /* file:// in some browsers */ }
      }
      stack = [route.hash];
      // only the starting screen may be visible (the intro is visible in the HTML by default)
      U.$$(".screen").forEach(function (sc) { sc.hidden = sc !== screenFor(route.name); });
      show(route, { instant: true });

      window.addEventListener("hashchange", function () {
        var r = parse(location.hash);
        if (!r.name) r = parse("#home");
        if (current && r.hash === current.hash) return;
        show(r);
      });

      document.addEventListener("click", function (e) {
        var b = e.target.closest("[data-back]");
        if (b) { e.preventDefault(); Router.back(); }
      });

      U.$$(".screen").forEach(function (s) {
        var ticking = false;
        s.addEventListener("scroll", function () {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(function () { ticking = false; updateScroll(s); });
        }, { passive: true });
      });
    }
  };

  window.Router = Router;
})();
