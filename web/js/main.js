/* Portada: idioma, leyenda, tarjeta del habitante elegido, cuaderno y formulario. */
(function () {
  "use strict";
  var SITE = window.SITE, P = SITE.projects, root = document.documentElement;
  var $ = function (s) { return document.querySelector(s); };
  var lang = root.lang === "en" ? "en" : "es", sel = 0, formState = null;
  function t(k) { return SITE.text[lang][k]; }
  function tx(v) { return typeof v === "string" ? v : v[lang]; }

  /* leyenda */
  var legend = $("#legend");
  var chips = P.map(function (p, i) {
    var c = document.createElement("button");
    c.type = "button"; c.className = "chip"; c.id = "chip-" + p.id;
    c.addEventListener("click", function () { pick(i); });
    legend.appendChild(c);
    return c;
  });

  var screen = $("#screen");
  var island = window.Island ? window.Island.create(screen, P, tap) : null;
  if (!island) screen.classList.add("no-gl");

  /* tema: el botón recorre auto -> claro -> oscuro; la isla se hace de noche */
  var Theme = window.Theme, themeBtn = $("#theme-btn");
  function syncTheme() {
    if (island) island.setNight(!!Theme && Theme.isDark());
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(root).getPropertyValue("--bg").trim();
  }
  if (Theme) {
    themeBtn.addEventListener("click", function () { Theme.cycle(); });
    Theme.onChange(function () { syncTheme(); paint(); });
  } else themeBtn.hidden = true;

  function pick(i) { sel = i; paint(); if (island) island.face(i); }
  // número de la isla: el primer toque lo elige; otro toque sobre el elegido abre su página
  // (igual que el botón "Abrir" de la tarjeta, que ya apunta a ese proyecto)
  function tap(i) { if (i === sel && P[i].url) $("#c-link").click(); else pick(i); }

  function fmtDate(ym) {
    var d = new Date(ym + "-01T00:00:00");
    try { return d.toLocaleDateString(lang, { month: "short", year: "numeric" }); } catch (e) { return ym; }
  }

  function paint() {
    root.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    document.querySelectorAll(".lang-switch button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.lang === lang); });
    legend.setAttribute("aria-label", t("legend"));
    if (Theme) themeBtn.textContent = t("theme." + Theme.mode());
    P.forEach(function (p, i) {
      chips[i].textContent = (i + 1) + " " + tx(p.name);
      chips[i].setAttribute("aria-pressed", i === sel);
      if (island) {
        var m = island.marks[i], go = i === sel && !!p.url;
        m.setAttribute("aria-pressed", i === sel);
        m.setAttribute("aria-label", go ? t("open") + " " + tx(p.name) : tx(p.name));
        m.classList.toggle("go", go);
        if (go) m.title = t("open") + " " + tx(p.name); else m.removeAttribute("title");
      }
    });

    var p = P[sel];
    $("#c-kind").textContent = tx(p.kind);
    $("#c-name").textContent = tx(p.name);
    $("#c-desc").textContent = tx(p.desc);
    $("#c-status").textContent = p.about ? "" : (p.url ? t("live") : t("soon"));
    var a = $("#c-link");
    a.hidden = !p.url;
    if (p.url) {
      var inner = p.url.charAt(0) === "#";
      a.href = p.url;
      a.textContent = t("open") + " " + tx(p.name);
      if (inner) { a.removeAttribute("target"); a.removeAttribute("rel"); }
      else { a.target = "_blank"; a.rel = "noopener"; }
    }

    var list = $("#issues");
    list.innerHTML = "";
    SITE.notebook.forEach(function (n) {
      var li = document.createElement("li");
      var meta = document.createElement("span");
      meta.className = "util";
      meta.textContent = "Nº " + String(n.n).padStart(2, "0") + " · " + fmtDate(n.date);
      var body = document.createElement("div"); body.className = "body";
      var h = document.createElement("h3"); h.textContent = n.title;
      var d = document.createElement("p"); d.textContent = tx(n.desc);
      var l = document.createElement("a"); l.href = n.url; l.target = "_blank"; l.rel = "noopener"; l.textContent = t("nb.read");
      var lp = document.createElement("p"); lp.appendChild(l);
      body.appendChild(h); body.appendChild(d); body.appendChild(lp);
      li.appendChild(meta); li.appendChild(body);
      list.appendChild(li);
    });

    var note = $("#f-note");
    note.hidden = !formState;
    if (formState) note.textContent = t("f." + formState);
    $("#f-send").textContent = formState === "sending" ? t("f.sending") : t("f.send");
  }

  document.querySelectorAll(".lang-switch button").forEach(function (b) {
    b.addEventListener("click", function () {
      lang = b.dataset.lang;
      try { localStorage.setItem("taridepaco-lang", lang); } catch (e) { /* sin almacenamiento */ }
      paint();
    });
  });

  /* formulario: se envía a Formspree sin salir de la página; sin JS funciona como un POST normal */
  var form = $("#contact-form");
  form.addEventListener("submit", function (e) {
    if (!window.fetch || !window.FormData) return;
    e.preventDefault();
    var btn = $("#f-send");
    formState = "sending"; btn.disabled = true; paint();
    fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); formState = "ok"; form.reset(); })
      .catch(function () { formState = "err"; })
      .then(function () { btn.disabled = false; paint(); });
  });

  syncTheme();
  paint();
})();
