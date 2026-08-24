/* ГМУ-2027 · общий скрипт всех страниц
   Мультипользовательский режим:
   ?user=friend  → прогресс пишется под префиксом friend::
   без параметра → основной пользователь (префикса нет).
   Ссылка для друга: <адрес сайта>/index.html?user=friend

   Плюс персональное приветствие при входе (splash-экран).            */
(function () {
  var USERS = {
    main:   { label: "Я",    name: "Сергей",             greet: "С возвращением, Сергей" },
    friend: { label: "Друг", name: "Алексей Николаевич", greet: "Здравствуйте, Алексей Николаевич" }
  };
  var LS_KEY = "gmu_user";

  function rawGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function rawSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  var fromUrl = new URLSearchParams(location.search).get("user");
  if (fromUrl && USERS[fromUrl]) rawSet(LS_KEY, fromUrl);
  var cur = rawGet(LS_KEY);
  if (!USERS[cur]) cur = "main";
  window.CURRENT_USER = cur;
  window.USER_NAME = USERS[cur].name;

  /* ключ хранилища с учётом пользователя */
  window.uKey = function (k) {
    return cur === "main" ? k : cur.replace(/[^a-z0-9_-]/gi, "") + "::" + k;
  };
  window.userPrefix = function () {
    return cur === "main" ? "" : cur.replace(/[^a-z0-9_-]/gi, "") + "::";
  };

  /* все внутренние ссылки автоматически несут ?user=… , чтобы друг не потерялся */
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

  /* ── приветствие при входе ──────────────────────────────────── */
  function splash(force) {
    /* показываем один раз за вкладку; но если в ссылке есть ?user= — это явный вход по ссылке, показываем всегда */
    if (!force) {
      try { if (sessionStorage.getItem("gmu_splash")) return; } catch (e) {}
    }
    try { sessionStorage.setItem("gmu_splash", "1"); } catch (e) {}

    var st = document.createElement("style");
    st.textContent =
      "#splash{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;" +
      "background:radial-gradient(60% 60% at 50% 38%,#134e4a55,#0f172a 70%),#0f172a;" +
      "opacity:1;transition:opacity .6s ease;font-family:'Segoe UI',system-ui,sans-serif}" +
      "#splash.hide{opacity:0;pointer-events:none}" +
      "#splash .sp{text-align:center;padding:20px;animation:spUp .7s ease both}" +
      "@keyframes spUp{from{transform:translateY(18px);opacity:0}to{transform:none;opacity:1}}" +
      "#splash .hi{font-size:30px;color:#f8fafc;font-weight:800;line-height:1.35}" +
      "#splash .q{margin-top:12px;font-size:17px;color:#94a3b8}" +
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

  /* ── виджет пользователя + ссылка для друга ─────────────────── */
  function inject() {
    splash(new URLSearchParams(location.search).has("user"));

    var st = document.createElement("style");
    st.textContent =
      "#upill{position:fixed;right:14px;bottom:14px;z-index:999;font-family:'Segoe UI',system-ui,sans-serif}" +
      "#upill .up-btn{display:flex;align-items:center;gap:8px;background:#1e293b;color:#e2e8f0;border:1px solid #334155;" +
      "border-radius:999px;padding:8px 16px;cursor:pointer;font-size:13.5px;font-weight:600;box-shadow:0 6px 20px rgba(0,0,0,.45)}" +
      "#upill .up-btn:hover{border-color:#10b98188}" +
      "#upill .dot{width:9px;height:9px;border-radius:50%;background:" + (cur === "main" ? "#10b981" : "#38bdf8") + "}" +
      "#upill .panel{display:none;position:absolute;right:0;bottom:46px;width:270px;background:#1e293b;border:1px solid #334155;" +
      "border-radius:14px;padding:12px;box-shadow:0 10px 30px rgba(0,0,0,.5)}" +
      "#upill .panel.open{display:block}" +
      "#upill .u-row{display:flex;flex-direction:column;gap:2px;width:100%;background:#16223a;border:1px solid #2c3b57;color:#cbd5e1;" +
      "border-radius:10px;padding:9px 11px;margin-bottom:7px;cursor:pointer;font-size:13px;text-align:left}" +
      "#upill .u-row:hover{border-color:#10b98188}" +
      "#upill .u-row.act{border-color:#10b981;color:#6ee7b7}" +
      "#upill .u-row small{color:#64748b;font-size:11px}" +
      "#upill .hint{font-size:11.5px;color:#64748b;line-height:1.45;margin-top:4px}" +
      "#upill .copy{width:100%;background:#1d4ed855;color:#93c5fd;border:1px solid #3b82f666;border-radius:10px;" +
      "padding:9px 11px;cursor:pointer;font-size:13px;font-weight:600}" +
      "#upill .copy:hover{border-color:#93c5fd}";
    document.head.appendChild(st);

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
})();
