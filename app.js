/* ГМУ-2027 · общий скрипт всех страниц
   · Мультипользовательский режим (?user=friend → префикс friend:: в localStorage)
   · Темы: тёмная по умолчанию, светлая по кнопке ☀️/🌙 (запоминается)
   · Адаптив под телефоны (общие media-query для всех страниц)          */
(function () {
  var USERS = {
    main:   { label: "Я",    name: "Сергей",             greet: "С возвращением, Сергей" },
    friend: { label: "Друг", name: "Алексей Николаевич", greet: "Здравствуйте, Алексей Николаевич" }
  };
  var LS_KEY = "gmu_user";
  var TH_KEY = "gmu_theme";

  function rawGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function rawSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* ── тема: применяем как можно раньше, чтобы не мигало ──────── */
  var THEME = rawGet(TH_KEY);
  if (THEME !== "light" && THEME !== "dark") THEME = "dark";
  window.CURRENT_THEME = THEME;
  function applyTheme(t) {
    document.documentElement.classList.toggle("theme-light", t === "light");
    window.CURRENT_THEME = t;
  }
  applyTheme(THEME);

  /* ── пользователь ───────────────────────────────────────────── */
  var fromUrl = new URLSearchParams(location.search).get("user");
  if (fromUrl && USERS[fromUrl]) rawSet(LS_KEY, fromUrl);
  var cur = rawGet(LS_KEY);
  if (!USERS[cur]) cur = "main";
  window.CURRENT_USER = cur;
  window.USER_NAME = USERS[cur].name;

  window.uKey = function (k) {
    return cur === "main" ? k : cur.replace(/[^a-z0-9_-]/gi, "") + "::" + k;
  };
  window.userPrefix = function () {
    return cur === "main" ? "" : cur.replace(/[^a-z0-9_-]/gi, "") + "::";
  };

  /* внутренние ссылки автоматически несут ?user=… */
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute("href");
    if (!href || /^(https?:|mailto:|tel:|#)/i.test(href)) return;
    try {
      var url = new URL(a.href, location.href);
      if (!url.searchParams.get("user") && cur !== "main") {
        url.searchParams.set("user", cur);
        a.href = url.pathname + url.search + url.hash;
      }
    } catch (err) {}
  }, true);

  /* ── глобальные переменные тем + адаптив (общие для сайта) ──── */
  function globalCss() {
    var st = document.createElement("style");
    st.id = "gmu-global-css";
    st.textContent =
      ":root{--bg:#0f172a;--card:#1e293b;--card2:#16223a;--line:#334155;--line2:#2c3b57;--soft:#22304d;" +
      "--head:#f8fafc;--txt:#e2e8f0;--txt2:#94a3b8;--muted:#64748b;--link:#38bdf8;--good:#6ee7b7;" +
      "--ambert:#fbbf24;--warnbg:rgba(69,26,3,.67);--warnc:#fcd34d;--warnb:rgba(217,119,6,.4);" +
      "--infobg:rgba(12,42,68,.67);--inforc:#bae6fd;--infob:rgba(56,189,248,.35)}" +
      "html.theme-light{--bg:#eef2f7;--card:#ffffff;--card2:#e9eef6;--line:#c9d4e3;--line2:#d5deea;--soft:#dfe6f0;" +
      "--head:#0f172a;--txt:#25314a;--txt2:#55637c;--muted:#8090a6;--link:#0369a1;--good:#047857;" +
      "--ambert:#b45309;--warnbg:#fff7ed;--warnc:#9a3412;--warnb:rgba(180,83,9,.35);" +
      "--infobg:#eff8ff;--inforc:#075985;--infob:rgba(3,105,161,.25)}" +
      "@media(max-width:640px){body{padding-left:10px;padding-right:10px}.wrap{max-width:100%}h1{font-size:23px}" +
      ".bigbar,.block-card,.week-card,.month,.card,.prep{padding-left:16px;padding-right:16px}" +
      ".day-row{flex-wrap:wrap;gap:6px}.day-name{min-width:96px;font-size:13px}.stat-num{font-size:32px}" +
      "td{height:40px}.daycell{padding:3px 4px;font-size:11px;border-radius:7px}.dtask{display:none}" +
      ".daycell.today::after{display:none}.ev-d{min-width:58px;font-size:11.5px}" +
      "table.tl td:first-child{white-space:normal;min-width:0}.u-head{flex-direction:column}" +
      ".badges{flex-direction:row;align-items:flex-start;flex-wrap:wrap}" +
      "#splash .hi{font-size:clamp(21px,6vw,30px)}#splash .q{font-size:15px}}" +
      "@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}";
    document.head.appendChild(st);
  }

  /* ── приветствие при входе ──────────────────────────────────── */
  function splash(force) {
    if (!force) {
      try { if (sessionStorage.getItem("gmu_splash")) return; } catch (e) {}
    }
    try { sessionStorage.setItem("gmu_splash", "1"); } catch (e) {}

    var st = document.createElement("style");
    st.textContent =
      "#splash{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;" +
      "background:radial-gradient(60% 60% at 50% 38%,rgba(16,185,129,.18),transparent 70%),var(--bg);" +
      "opacity:1;transition:opacity .6s ease;font-family:'Segoe UI',system-ui,sans-serif}" +
      "#splash.hide{opacity:0;pointer-events:none}" +
      "#splash .sp{text-align:center;padding:20px;animation:spUp .7s ease both}" +
      "@keyframes spUp{from{transform:translateY(18px);opacity:0}to{transform:none;opacity:1}}" +
      "#splash .hi{font-size:30px;color:var(--head);font-weight:800;line-height:1.35}" +
      "#splash .q{margin-top:12px;font-size:17px;color:var(--txt2)}" +
      "#splash .go{margin-top:26px;background:linear-gradient(90deg,#059669,#10b981);color:#fff;border:none;" +
      "border-radius:13px;padding:13px 28px;font-size:15px;font-weight:700;cursor:pointer;" +
      "box-shadow:0 10px 30px rgba(16,185,129,.25)}" +
      "#splash .go:hover{filter:brightness(1.08)}";
    document.head.appendChild(st);

    var w = document.createElement("div");
    w.id = "splash";
    w.innerHTML =
      '<div class="sp">' +
        '<div class="hi">' + USERS[cur].greet + ' 👋</div>' +
        '<div class="q">Готовы снова учиться?</div>' +
        '<button class="go">▶ К занятиям</button>' +
      '</div>';
    document.body.appendChild(w);

    function close(){ w.classList.add("hide"); setTimeout(function(){ w.remove(); }, 650); }
    w.querySelector(".go").addEventListener("click", close);
    w.addEventListener("click", close);
    setTimeout(close, 3200);
  }

  /* ── виджеты: тема + пользователь ───────────────────────────── */
  function inject() {
    globalCss();
    splash(new URLSearchParams(location.search).has("user"));

    var st = document.createElement("style");
    st.textContent =
      "#upill{position:fixed;right:14px;bottom:14px;z-index:999;font-family:'Segoe UI',system-ui,sans-serif}" +
      "#tbtn{position:fixed;right:14px;bottom:62px;z-index:999;width:41px;height:41px;border-radius:50%;" +
      "background:var(--card,#1e293b);border:1px solid var(--line,#334155);cursor:pointer;font-size:17px;" +
      "display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(0,0,0,.35)}" +
      "#tbtn:hover{border-color:#10b98188}" +
      "#upill .up-btn{display:flex;align-items:center;gap:8px;background:var(--card,#1e293b);color:var(--txt,#e2e8f0);border:1px solid var(--line,#334155);" +
      "border-radius:999px;padding:8px 16px;cursor:pointer;font-size:13.5px;font-weight:600;box-shadow:0 6px 20px rgba(0,0,0,.35)}" +
      "#upill .up-btn:hover{border-color:#10b98188}" +
      "#upill .dot{width:9px;height:9px;border-radius:50%;background:" + (cur === "main" ? "#10b981" : "#38bdf8") + "}" +
      "#upill .panel{display:none;position:absolute;right:0;bottom:46px;width:270px;background:var(--card,#1e293b);border:1px solid var(--line,#334155);" +
      "border-radius:14px;padding:12px;box-shadow:0 10px 30px rgba(0,0,0,.4)}" +
      "#upill .panel.open{display:block}" +
      "#upill .u-row{display:flex;flex-direction:column;gap:2px;width:100%;background:var(--card2,#16223a);border:1px solid var(--line2,#2c3b57);color:var(--txt,#cbd5e1);" +
      "border-radius:10px;padding:9px 11px;margin-bottom:7px;cursor:pointer;font-size:13px;text-align:left}" +
      "#upill .u-row:hover{border-color:#10b98188}" +
      "#upill .u-row.act{border-color:#10b981;color:var(--good,#6ee7b7)}" +
      "#upill .u-row small{color:var(--muted,#64748b);font-size:11px}" +
      "#upill .hint{font-size:11.5px;color:var(--muted,#64748b);line-height:1.45;margin-top:4px}" +
      "#upill .copy{width:100%;background:rgba(29,78,216,.33);color:var(--link,#93c5fd);border:1px solid rgba(59,130,246,.4);border-radius:10px;" +
      "padding:9px 11px;cursor:pointer;font-size:13px;font-weight:600}" +
      "#upill .copy:hover{filter:brightness(1.15)}";
    document.head.appendChild(st);

    /* кнопка темы */
    var tb = document.createElement("button");
    tb.id = "tbtn";
    tb.title = "Сменить тему";
    tb.textContent = THEME === "dark" ? "☀️" : "🌙";
    tb.addEventListener("click", function () {
      THEME = THEME === "dark" ? "light" : "dark";
      rawSet(TH_KEY, THEME);
      applyTheme(THEME);
      tb.textContent = THEME === "dark" ? "☀️" : "🌙";
    });
    document.body.appendChild(tb);

    /* пользователь */
    var w = document.createElement("div");
    w.id = "upill";
    w.innerHTML =
      '<div class="panel" id="upanel">' +
        '<button class="u-row act" data-u="main">🟢 Я<small>' + USERS.main.name + ' · основной прогресс</small></button>' +
        '<button class="u-row" data-u="friend">🔵 Друг<small>' + USERS.friend.name + ' · свой прогресс</small></button>' +
        '<button class="copy">📋 Скопировать ссылку для друга</button>' +
        '<div class="hint">Друг открывает эту же ссылку — его тесты и зачёты сохраняются отдельно и не попадают в твой прогресс.</div>' +
      '</div>' +
      '<button class="up-btn"><span class="dot"></span><span id="uname">' + USERS[cur].label + ' · ' + USERS[cur].name + '</span></button>';
    document.body.appendChild(w);

    var panel = document.getElementById("upanel");
    markActive();
    w.querySelector(".up-btn").addEventListener("click", function () {
      panel.classList.toggle("open");
    });
    document.addEventListener("click", function (e) {
      if (!w.contains(e.target)) panel.classList.remove("open");
    });
    panel.querySelectorAll(".u-row").forEach(function (b) {
      b.addEventListener("click", function () {
        rawSet(LS_KEY, b.dataset.u);
        location.href = location.pathname + (b.dataset.u === "main" ? "" : "?user=" + b.dataset.u) + location.hash;
      });
    });
    panel.querySelector(".copy").addEventListener("click", function () {
      var base = location.href.split(/[?#]/)[0];
      var link = base + "?user=friend";
      function done() {
        var c = this;
        c.textContent = "✔ Скопировано";
        setTimeout(function () { c.textContent = "📋 Скопировать ссылку для друга"; }, 2000);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(done.bind(this), function () { fallback(link); done.call(panel.querySelector(".copy")); });
      } else { fallback(link); done.call(this); }
      function fallback(t) {
        var ta = document.createElement("textarea");
        ta.value = t; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta);
      }
    });

    function markActive() {
      panel.querySelectorAll(".u-row").forEach(function (b) {
        b.classList.toggle("act", b.dataset.u === cur);
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inject);
  else inject();

  /* ── дни предстартовой недели ─────────────────────────────────
     каждый день становится активен автоматически в свою календарную дату;
     «закрытия» остаются как отметка прогресса, но ничего не блокируют */
  window.GMU_DAYS = ["d20260825","d20260826","d20260827","d20260828","d20260829","d20260830","d20260831"];
  window.GMU_DATES = {
    d20260825: [2026, 7, 25],
    d20260826: [2026, 7, 26],
    d20260827: [2026, 7, 27],
    d20260828: [2026, 7, 28],
    d20260829: [2026, 7, 29],
    d20260830: [2026, 7, 30],
    d20260831: [2026, 7, 31]
  };

  window.dayOpenDate = function (id) {
    var d = window.GMU_DATES[id];
    return d ? new Date(d[0], d[1], d[2]) : null;
  };

  window.dayIsOpen = function (id) {
    var openAt = window.dayOpenDate(id);
    if (!openAt) return true;
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()) >= openAt;
  };

  window.closeDay = function (id) {
    try { localStorage.setItem(window.uKey("closed_" + id), "1"); } catch (e) {}
  };

  window.dayClosed = function (id) {
    try { return localStorage.getItem(window.uKey("closed_" + id)) === "1"; } catch (e) { return false; }
  };

  /* подключение страницы учебного дня: initDayPage("d20260825", { home:"../../index.html" }) */
  window.initDayPage = function (id, opts) {
    opts = opts || {};
    function applyClosed() {
      Array.prototype.forEach.call(document.querySelectorAll("[data-close]"), function (b) {
        b.disabled = true;
        b.textContent = "✔ День закрыт";
        b.style.opacity = ".7";
        b.style.cursor = "default";
      });
      var after = document.getElementById("afterclose");
      if (after) after.style.display = "";
    }
    if (!window.dayIsOpen(id)) {
      var openAt = window.dayOpenDate(id);
      var when = "";
      try { when = openAt.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }); } catch (e) {}
      try {
        var st = document.createElement("style");
        st.textContent =
          "#gatewrap{min-height:82vh;display:flex;align-items:center;justify-content:center;padding:24px}" +
          ".gatecard{max-width:470px;background:var(--card,#1e293b);border:1px solid rgba(245,158,11,.45);border-radius:18px;" +
          "padding:36px 30px;text-align:center;font-family:'Segoe UI',system-ui,sans-serif;box-shadow:0 16px 50px rgba(0,0,0,.35)}" +
          ".gatecard .gi{font-size:46px}.gatecard h1{font-size:22px;color:var(--head,#f8fafc);margin:14px 0 10px}" +
          ".gatecard p{font-size:14.5px;color:var(--txt2,#94a3b8);line-height:1.65;margin-bottom:24px}" +
          ".gatecard .gd{color:#fbbf24;font-weight:700}" +
          ".gatecard a{display:inline-block;background:linear-gradient(90deg,#059669,#10b981);color:#fff;text-decoration:none;" +
          "font-weight:700;border-radius:11px;padding:12px 24px;font-size:14.5px}" +
          ".gatecard a:hover{filter:brightness(1.08)}";
        document.head.appendChild(st);
      } catch (e) {}
      document.body.innerHTML =
        '<div id="gatewrap"><div class="gatecard"><div class="gi">🔒</div>' +
        '<h1>День ещё не наступил</h1>' +
        '<p>Этот учебный день откроется автоматически<br><span class="gd">' + when + "</span>.<br><br>" +
        'Загляни на дашборд — там видно расписание всей недели.</p>' +
        '<a href="' + (opts.home || "../../index.html") + '">← На дашборд</a></div></div>';
      window.scrollTo(0, 0);
      return { locked: true };
    }
    if (window.dayClosed(id)) applyClosed();
    Array.prototype.forEach.call(document.querySelectorAll("[data-close]"), function (b) {
      b.addEventListener("click", function () { window.closeDay(id); applyClosed(); });
    });
    return {
      locked: false,
      autoClose: function () { window.closeDay(id); applyClosed(); }
    };
  };
})();
