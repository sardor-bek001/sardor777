/* ===== CHRONEX chronex-cord.js =====
   Mavjud kodga TEGMAYDI. index.html da </body> dan oldin bitta qator qo'shing:
       <script src="./chronex-cord.js"></script>
   CSS ham shu fayl ichida.

   NIMALAR QO'SHILADI
   1) Menyuda lampa shnuriga o'xshash "tortma shnur": tortsangiz yorug' / qorong'i mavzu almashadi
   2) Buyurtmani yuborishdan oldin tasdiqlash oynasi (xatolarni oldini oladi)
   3) Bosh ekranda kunning vaqtiga qarab o'zgaradigan yorug'lik (tong, kun, shom, tun) */
(function () {
  "use strict";
  if (window.__cx13) return;
  window.__cx13 = 1;

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const root = document.documentElement;

  /* ================= CSS ================= */
  const st = document.createElement("style");
  st.textContent = `
  /* 1) shnur */
  .cx13-cord{position:relative;width:24px;height:72px;margin-left:12px;align-self:flex-start;flex:none}
  .cx13-cord svg{position:absolute;left:0;top:0;width:24px;height:96px;overflow:visible;user-select:none;-webkit-user-select:none}
  .cx13-line{stroke:var(--muted,#9097a8);stroke-width:1.6;stroke-linecap:round}
  .cx13-bead{fill:var(--accent,#c9a86a);transition:r .2s}
  .cx13-hit{cursor:grab;touch-action:none;outline:none}
  .cx13-hit:active{cursor:grabbing}
  .cx13-hit:focus-visible{stroke:var(--accent,#c9a86a);stroke-width:1.5;stroke-dasharray:3 3}
  .cx13-cord:hover .cx13-bead{r:6.5}
  .cx13-cord.hint .cx13-bead{animation:cx13Nudge 2s ease-in-out 1.5s 3}
  @keyframes cx13Nudge{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(6px)}}
  /* o'z yorug' mavzu (sayt boshqa mavzu tugmasiga ega bo'lmasa) */
  html.cx13-light{color-scheme:light;--bg:#f7f5f0;--bg2:#ece8de;--card:#fff;--line:#d9d2c3;--text:#15171d;--muted:#5b6272}
  html.cx13-light .header.scrolled{background:rgba(247,245,240,.92)}
  html.cx13-light .big{color:#3b4150}
  html.cx13-light .card-img{background:radial-gradient(circle at 50% 40%,#fff,#e4ddcd)}
  html.cx13-light .hero{background:radial-gradient(60% 60% at 75% 45%,rgba(201,168,106,.28),transparent 70%),var(--bg)}
  html.cx13-light .cta{background:radial-gradient(50% 80% at 50% 50%,rgba(201,168,106,.25),transparent 70%),var(--bg)}
  html.cx13-light .stats,html.cx13-light .footer,html.cx13-light .section.dark{background:var(--bg2)}
  @media(max-width:900px){html.cx13-light .menu{background:rgba(247,245,240,.97)}}

  /* 2) tasdiqlash oynasi */
  .cx13-modal{position:fixed;inset:0;z-index:700;background:rgba(0,0,0,.7);display:grid;place-items:center;padding:16px;animation:cx13In .25s}
  @keyframes cx13In{from{opacity:0}}
  .cx13-box{width:min(480px,100%);max-height:92vh;overflow:auto;background:var(--bg2,#0e1016);border:1px solid var(--accent,#c9a86a);border-radius:var(--radius,18px);padding:28px 24px;display:grid;gap:14px;color:var(--text,#f2f3f7)}
  .cx13-box h3{margin:0;font-size:22px;text-align:center}
  .cx13-rows{display:grid;gap:0;border:1px solid var(--line,#222633);border-radius:14px;overflow:hidden}
  .cx13-row{display:grid;grid-template-columns:110px 1fr;gap:10px;padding:10px 14px;font-size:14px;border-bottom:1px solid var(--line,#222633);background:var(--card,#13161e)}
  .cx13-row:last-child{border-bottom:0}
  .cx13-row span{color:var(--muted,#9097a8)}
  .cx13-row b{word-break:break-word;font-weight:600}
  .cx13-total{display:flex;justify-content:space-between;align-items:center;font-size:18px;padding:0 4px}
  .cx13-total b{color:var(--accent,#c9a86a);font-size:26px}
  .cx13-info{font-size:13px;color:var(--muted,#9097a8);border:1px dashed var(--line,#222633);border-radius:12px;padding:10px 14px}
  .cx13-btns{display:grid;grid-template-columns:1fr 1.4fr;gap:10px}
  .cx13-btns .btn{margin:0;text-align:center}
  @media(max-width:480px){.cx13-row{grid-template-columns:90px 1fr}.cx13-btns{grid-template-columns:1fr}}

  /* 3) vaqtga mos yorug'lik */
  .hero::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;background:radial-gradient(55% 62% at 72% 45%,var(--cx13-tint,rgba(201,168,106,.14)),transparent 72%)}
  .hero>.container{position:relative;z-index:1}`;
  document.head.appendChild(st);

  /* ================================================================
     1) TORTMA SHNUR: MAVZU
     ================================================================ */
  const nav = $(".nav"), burger = $("#burger");
  if (nav) {
    const ext = () => $(".cx-theme");                // sayt allaqachon mavzu tugmasiga ega bo'lsa, shuni ishlatamiz
    const isLight = () => root.dataset.theme === "light" || root.classList.contains("cx-light") || root.classList.contains("cx13-light");
    if (!ext() && store.get("cx13_light", false)) root.classList.add("cx13-light");

    const box = document.createElement("div");
    box.className = "cx13-cord hint"; box.title = "Mavzuni almashtirish: shnurni torting";
    box.innerHTML = `<svg viewBox="0 0 24 96" aria-hidden="false"><line class="cx13-line" id="cx13L" x1="12" y1="0" x2="12" y2="50"/>
      <circle class="cx13-bead" id="cx13B" cx="12" cy="56" r="5.5"/>
      <circle class="cx13-hit" id="cx13H" cx="12" cy="56" r="16" fill="transparent" role="switch" tabindex="0" aria-checked="${isLight()}" aria-label="Yorug' mavzu. Shnurni torting yoki Enter bosing"/></svg>`;
    nav.insertBefore(box, burger || null);
    const svg = $("svg", box), line = $("#cx13L", box), bead = $("#cx13B", box), hit = $("#cx13H", box);
    let y = 0, vel = 0, raf = 0, drag = null, actx = null;
    const MAXY = 22, TRIGGER = 13;
    const setY = v => { y = v; bead.setAttribute("cy", 56 + v); hit.setAttribute("cy", 56 + v); line.setAttribute("y2", 50 + v); };

    function click() {
      try {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume();
        const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
        o.type = "square"; o.frequency.setValueAtTime(1500, t); o.frequency.exponentialRampToValueAtTime(380, t + .03);
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.07, t + .002); g.gain.exponentialRampToValueAtTime(.0001, t + .06);
        o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + .07);
      } catch (e) {}
      try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) {}
    }
    function toggle() {
      const e = ext();
      if (e) e.click();
      else { root.classList.toggle("cx13-light"); store.set("cx13_light", root.classList.contains("cx13-light")); }
      click();
      setTimeout(() => hit.setAttribute("aria-checked", isLight()), 60);
    }
    function spring() {
      cancelAnimationFrame(raf); let last = performance.now();
      const step = t => {
        const dt = Math.min(.032, (t - last) / 1000); last = t;
        vel += (-300 * y - 14 * vel) * dt; setY(y + vel * dt);
        if (Math.abs(y) > .03 || Math.abs(vel) > .1) raf = requestAnimationFrame(step); else { setY(0); vel = 0; }
      };
      raf = requestAnimationFrame(step);
    }
    function tapPull() {
      cancelAnimationFrame(raf); const t0 = performance.now(), from = y;
      const step = t => { const p = Math.min(1, (t - t0) / 100); setY(from + (16 - from) * p); if (p < 1) raf = requestAnimationFrame(step); else { toggle(); vel = 0; spring(); } };
      raf = requestAnimationFrame(step);
    }
    hit.addEventListener("pointerdown", e => {
      e.preventDefault(); cancelAnimationFrame(raf); vel = 0; box.classList.remove("hint");
      drag = { sy: e.clientY, y0: y, moved: 0, scale: svg.getBoundingClientRect().width / 24 };
      try { hit.setPointerCapture(e.pointerId); } catch (er) {}
    });
    hit.addEventListener("pointermove", e => {
      if (!drag) return;
      drag.moved = Math.max(drag.moved, Math.abs(e.clientY - drag.sy));
      setY(Math.max(0, Math.min(MAXY, drag.y0 + (e.clientY - drag.sy) / drag.scale)));
    });
    const release = () => {
      if (!drag) return; const d = drag; drag = null;
      if (d.moved < 4) { tapPull(); return; }
      if (y >= TRIGGER) toggle();
      spring();
    };
    hit.addEventListener("pointerup", release); hit.addEventListener("pointercancel", release);
    hit.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") { e.preventDefault(); tapPull(); } });
  }

  /* ================================================================
     2) BUYURTMANI TASDIQLASH OYNASI
     ================================================================ */
  const form = $("#orderForm");
  if (form) {
    let ok = false;
    const val = id => { const e = $("#" + id); return e ? e.value : ""; };
    function closeModal(m, prevFocus) { m.remove(); document.body.style.overflow = ""; if (prevFocus && prevFocus.focus) { try { prevFocus.focus(); } catch (e) {} } }
    function showConfirm() {
      const prevFocus = document.activeElement;
      const note = val("note").trim(), special = /Gravirovka:|Siferblat dizayni:|Sovg'a:/.test(note);
      const disc = $("#cxDisc:not([hidden])") || $(".cx-disc:not([hidden])");
      const rows = [["Model", val("model") && $("#model").selectedOptions[0].textContent.replace(/\s+—.*$/, "")], ["Rang", val("finish")], ["Soni", val("qty")],
        ["Ism", val("name").trim()], ["Telefon", val("phone")], ["Manzil", val("address").trim()], note ? ["Izoh", note] : null].filter(Boolean);
      const m = document.createElement("div");
      m.className = "cx13-modal";
      m.innerHTML = `<div class="cx13-box" role="dialog" aria-modal="true" aria-label="Buyurtmani tekshirish">
        <h3>Buyurtmani tekshiring</h3>
        <div class="cx13-rows">${rows.map(r => `<div class="cx13-row"><span>${esc(r[0])}</span><b>${esc(r[1]).replace(/\n/g, "<br>")}</b></div>`).join("")}</div>
        ${disc ? `<div class="cx13-info">${esc(disc.textContent.trim())}</div>` : ""}
        <div class="cx13-total"><span>Jami</span><b>${esc(($("#total") || {}).textContent || "")}</b></div>
        ${special ? `<div class="cx13-info">Izohdagi maxsus talablar (gravirovka, siferblat dizayni yoki sovg'a qadoqlash) uchun narx va muddatni operator tasdiqlaydi.</div>` : ""}
        <div class="cx13-btns"><button type="button" class="btn btn-ghost" data-a="edit">← Tahrirlash</button><button type="button" class="btn" data-a="ok">Tasdiqlash ✓</button></div></div>`;
      document.body.appendChild(m); document.body.style.overflow = "hidden";
      $('[data-a="ok"]', m).focus();
      const onKey = e => { if (e.key === "Escape") { closeModal(m, prevFocus); removeEventListener("keydown", onKey); } };
      addEventListener("keydown", onKey);
      m.addEventListener("click", e => {
        const a = e.target.closest("[data-a]");
        if (e.target === m || (a && a.dataset.a === "edit")) { closeModal(m, prevFocus); removeEventListener("keydown", onKey); }
        else if (a && a.dataset.a === "ok") {
          closeModal(m, null); removeEventListener("keydown", onKey); ok = true;
          if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }
      });
    }
    // capture bosqichida: saytning o'z tekshiruvidan oldin ishlaydi
    form.addEventListener("submit", e => {
      if (ok) { ok = false; return; }
      const name = val("name").trim(), digits = val("phone").replace(/\D/g, ""), addr = val("address").trim();
      if (name.length < 2 || digits.length !== 12 || addr.length < 5) return; // xato bo'lsa, sayt o'zi ko'rsatadi
      e.preventDefault(); e.stopImmediatePropagation(); showConfirm();
    }, true);
  }

  /* ================================================================
     3) VAQTGA MOS YORUG'LIK
     ================================================================ */
  const KEYS = [[0, [70, 110, 230, .14]], [5, [70, 110, 230, .14]], [7, [255, 150, 90, .2]], [10, [201, 168, 106, .14]],
    [16, [201, 168, 106, .14]], [18.5, [255, 125, 85, .2]], [21, [90, 120, 240, .14]], [24, [70, 110, 230, .14]]];
  function tint() {
    const d = new Date(), h = d.getHours() + d.getMinutes() / 60;
    let i = KEYS.findIndex(k => k[0] > h); if (i < 1) i = 1;
    const a = KEYS[i - 1], b = KEYS[i], p = (h - a[0]) / (b[0] - a[0]);
    const c = a[1].map((v, k) => v + (b[1][k] - v) * p);
    root.style.setProperty("--cx13-tint", `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${c[3].toFixed(3)})`);
  }
  tint(); setInterval(tint, 60000);
})();/* ===== CHRONEX chronex-flow.js =====
   Mavjud kodga TEGMAYDI. index.html da </body> dan oldin bitta qator qo'shing:
       <script src="./chronex-flow.js"></script>
   CSS ham shu fayl ichida.

   NIMALAR QO'SHILADI
   1) "Yig'ilish jarayoni": sahifani aylantirganingiz sari soat qatlam-qatlam yig'iladi
   2) Sovg'a chizig'i (bayramgacha necha kun qolgani) va "Sovg'a maslahatchisi"
   3) "Katalogni chop etish / PDF" tugmasi (footer'da)

   SOZLAMALAR: pastdagi HOLIDAYS (bayramlar ro'yxati) */
(function () {
  "use strict";
  if (window.__cx14) return;
  window.__cx14 = 1;

  /* ================= SOZLAMALAR ================= */
  // Faqat sanasi har yili bir xil bo'ladigan bayramlar (m = oy, d = kun). O'zingizga moslab o'zgartiring.
  const HOLIDAYS = [
    { m: 1, d: 1, n: "Yangi yil" }, { m: 1, d: 14, n: "Vatan himoyachilari kuni" }, { m: 2, d: 14, n: "Sevishganlar kuni" },
    { m: 3, d: 8, n: "8-mart" }, { m: 3, d: 21, n: "Navro'z" }, { m: 9, d: 1, n: "Mustaqillik kuni" }, { m: 10, d: 1, n: "Ustoz va murabbiylar kuni" }
  ];
  const SHOW_DAYS = 45; // bayramgacha shuncha kun qolganda "N kun qoldi" deb yozadi

  /* ================= YORDAMCHILAR ================= */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const TG = () => (typeof TG_USER !== "undefined" && TG_USER) ? TG_USER : "your_username";
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function toast(m) {
    let box = $(".cx-toasts");
    if (!box) { box = document.createElement("div"); box.className = "cx-toasts"; document.body.appendChild(box); }
    const t = document.createElement("div"); t.className = "cx-toast"; t.textContent = m; box.appendChild(t);
    setTimeout(() => t.classList.add("out"), 2600); setTimeout(() => t.remove(), 3100);
  }
  const money = n => "$" + Math.round(n).toLocaleString("en-US");
  const models = () => {
    const l = $$("#model option").filter(o => o.dataset.price).map(o => ({ name: o.value, price: +o.dataset.price }));
    return l.length ? l : [{ name: "Chronex Aero", price: 249 }, { name: "Chronex Titan", price: 349 }, { name: "Chronex Nova", price: 299 }];
  };

  /* ================= CSS ================= */
  const st = document.createElement("style");
  st.textContent = `
  /* 1) yig'ilish */
  .cx14-build{position:relative;height:430vh;background:var(--bg,#07080b)}
  .cx14-sticky{position:sticky;top:0;height:100vh;display:grid;align-items:center;overflow:hidden}
  .cx14-sticky::before{content:"";position:absolute;inset:0;background:radial-gradient(50% 55% at 72% 50%,rgba(201,168,106,.14),transparent 70%);pointer-events:none}
  .cx14-in{width:min(1160px,92%);margin-inline:auto;display:grid;grid-template-columns:1fr 1fr;gap:30px;align-items:center;position:relative}
  .cx14-copy h2{margin:0 0 20px;font-size:clamp(28px,4.4vw,46px);line-height:1.1}
  .cx14-steps{display:grid;gap:8px}
  .cx14-st{border-left:3px solid var(--line,#222633);padding:6px 0 6px 16px;opacity:.38;transition:opacity .35s,border-color .35s,transform .35s}
  .cx14-st b{display:block;font-size:17px}
  .cx14-st p{margin:2px 0 0;font-size:14px;color:var(--muted,#9097a8);max-height:0;overflow:hidden;transition:max-height .4s}
  .cx14-st.on{opacity:1;border-color:var(--accent,#c9a86a);transform:translateX(6px)}
  .cx14-st.on p{max-height:60px}
  .cx14-st.past{opacity:.7}
  .cx14-bar{height:4px;background:var(--line,#222633);border-radius:4px;overflow:hidden;margin-top:22px;max-width:360px}
  .cx14-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--accent2,#e8d3a0),var(--accent,#c9a86a))}
  .cx14-hint{font-size:13px;color:var(--muted,#9097a8);margin-top:10px;transition:opacity .4s}
  .cx14-stage{display:grid;place-items:center;position:relative}
  .cx14-stage svg{width:100%;max-width:480px;height:auto;overflow:visible;filter:drop-shadow(0 28px 36px rgba(0,0,0,.5))}
  .cx14-spin{animation:cx14Dash 3s linear infinite}
  @keyframes cx14Dash{to{stroke-dashoffset:-40}}
  .cx14-done .cx14-halo{opacity:1}
  .cx14-halo{opacity:0;transition:opacity .6s}
  @media(max-width:900px){.cx14-build{height:380vh}.cx14-in{grid-template-columns:1fr;gap:6px;align-content:center}.cx14-stage svg{max-width:300px}.cx14-copy h2{font-size:26px;margin-bottom:12px}.cx14-st b{font-size:15px}.cx14-st.past,.cx14-st{padding:3px 0 3px 12px}}

  /* 2) sovg'a */
  .cx14-gift{background:linear-gradient(135deg,rgba(201,168,106,.18),rgba(201,168,106,.05));border-block:1px solid var(--line,#222633);padding:18px 0}
  .cx14-gift-in{width:min(1160px,92%);margin-inline:auto;display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap}
  .cx14-gift b{color:var(--accent2,#e8d3a0)}
  .cx14-gift span{display:block;color:var(--muted,#9097a8);font-size:14px}
  .cx14-modal{position:fixed;inset:0;z-index:720;background:rgba(0,0,0,.7);display:grid;place-items:center;padding:16px;animation:cx14In .25s}
  @keyframes cx14In{from{opacity:0}}
  .cx14-box{position:relative;width:min(480px,100%);max-height:92vh;overflow:auto;background:var(--bg2,#0e1016);border:1px solid var(--accent,#c9a86a);border-radius:var(--radius,18px);padding:30px 24px;display:grid;gap:14px;color:var(--text,#f2f3f7)}
  .cx14-box h3{margin:0;font-size:22px;text-align:center}
  .cx14-x{position:absolute;top:8px;right:14px;background:none;border:0;color:var(--text,#f2f3f7);font-size:28px;cursor:pointer;line-height:1}
  .cx14-dots{display:flex;gap:6px;justify-content:center}
  .cx14-dots i{width:28px;height:4px;border-radius:4px;background:var(--line,#222633)}
  .cx14-dots i.on{background:var(--accent,#c9a86a)}
  .cx14-opts{display:grid;gap:10px}
  .cx14-opt{background:var(--card,#13161e);border:1px solid var(--line,#222633);color:var(--text,#f2f3f7);border-radius:14px;padding:14px 16px;cursor:pointer;font:inherit;font-size:15px;text-align:left;transition:.2s}
  .cx14-opt:hover{border-color:var(--accent,#c9a86a);transform:translateX(4px)}
  .cx14-res{background:var(--card,#13161e);border:1px solid var(--line,#222633);border-radius:14px;padding:16px;display:grid;gap:6px;text-align:center}
  .cx14-res b{font-size:24px;color:var(--accent2,#e8d3a0)}
  .cx14-res strong{font-size:20px}
  .cx14-back{background:none;border:0;color:var(--muted,#9097a8);cursor:pointer;font:inherit;font-size:13px;justify-self:center}
  .cx14-back:hover{color:var(--text,#f2f3f7)}
  /* 3) katalog */
  .cx14-cat{text-align:center;padding:10px 0 0}
  .cx14-cat button{background:none;border:1px solid var(--line,#222633);color:var(--muted,#9097a8);border-radius:999px;padding:8px 20px;cursor:pointer;font:inherit;font-size:14px;transition:.2s}
  .cx14-cat button:hover{border-color:var(--accent,#c9a86a);color:var(--text,#f2f3f7)}`;
  document.head.appendChild(st);

  /* ================================================================
     1) YIG'ILISH JARAYONI (scroll bilan)
     ================================================================ */
  const STEPS = [
    ["Titan orqa qopqoq", "Soatning asosi: mustahkam va yengil. Sensorlar shu yerda joylashadi."],
    ["Harakat mexanizmi", "Batareya, protsessor va datchiklar o'rnatiladi."],
    ["Siferblat", "Belgilar va CHRONEX yozuvi joylashadi."],
    ["Strelkalar", "Soat, daqiqa va soniya strelkalari qo'yiladi."],
    ["Sapfir oyna", "Eng ustidan chiziqqa chidamli oyna yopiladi."],
    ["Tayyor", "Chronex tayyor. Endi sizning bilagingiz navbati."]
  ];
  const RX = 130, RY = 46;
  const layerSVG = [
    `<ellipse cy="8" rx="${RX}" ry="${RY}" fill="#2a2d36"/><ellipse rx="${RX}" ry="${RY}" fill="url(#cx14m)"/><ellipse rx="96" ry="34" fill="none" stroke="rgba(0,0,0,.35)"/><ellipse rx="40" ry="14" fill="#14161c" stroke="#c9a86a"/><circle cx="-14" r="3" fill="#7ee8a8"/><circle cx="14" r="3" fill="#ff5a3c"/>`,
    `<ellipse cy="6" rx="${RX - 10}" ry="${RY - 4}" fill="#0a0f0c"/><ellipse rx="${RX - 10}" ry="${RY - 4}" fill="#12301f" stroke="#2d6a45"/><ellipse cx="-48" rx="34" ry="12" fill="none" stroke="#c9a86a" stroke-width="3" stroke-dasharray="6 4" class="cx14-spin"/><ellipse cx="44" cy="2" rx="26" ry="9" fill="none" stroke="#e8d3a0" stroke-width="3" stroke-dasharray="5 4" class="cx14-spin" style="animation-direction:reverse"/><rect x="-14" y="-8" width="28" height="14" rx="2" fill="#1b1e27" stroke="#7ee8ff"/>`,
    `<ellipse cy="5" rx="${RX - 8}" ry="${RY - 3}" fill="#0b0b0f"/><ellipse rx="${RX - 8}" ry="${RY - 3}" fill="url(#cx14d)" stroke="#c9a86a" stroke-width="2"/>` +
      Array.from({ length: 12 }, (_, k) => { const a = k * Math.PI / 6; return `<circle cx="${(Math.sin(a) * (RX - 22)).toFixed(1)}" cy="${(-Math.cos(a) * (RY - 12)).toFixed(1)}" r="${k % 3 ? 2 : 3.6}" fill="#e8d3a0"/>`; }).join("") +
      `<text y="-8" text-anchor="middle" font-size="10" letter-spacing="3" fill="#e8d3a0" font-family="Arial">CHRONEX</text>`,
    `<line x2="-24" y2="-6" stroke="#e8d3a0" stroke-width="5" stroke-linecap="round"/><line x2="22" y2="-30" stroke="#f2f3f7" stroke-width="3" stroke-linecap="round"/><line x2="4" y2="30" stroke="#ff5a3c" stroke-width="1.6" stroke-linecap="round"/><circle r="5" fill="#ff5a3c"/>`,
    `<ellipse cy="3" rx="${RX}" ry="${RY}" fill="rgba(160,210,255,.1)"/><ellipse rx="${RX}" ry="${RY}" fill="rgba(170,215,255,.12)" stroke="rgba(255,255,255,.55)" stroke-width="1.5"/><path d="M-80 -8 Q-30 -34 40 -30" stroke="rgba(255,255,255,.6)" stroke-width="3" fill="none" stroke-linecap="round"/>`
  ];
  const build = document.createElement("section");
  build.className = "cx14-build"; build.id = "cx14Build";
  build.innerHTML = `<div class="cx14-sticky"><div class="cx14-in">
    <div class="cx14-copy"><p class="eyebrow">Yig'ilish jarayoni</p><h2>Har bir detal o'z o'rnini topadi</h2>
      <div class="cx14-steps">${STEPS.map((s, i) => `<div class="cx14-st" data-i="${i}"><b>${i + 1}. ${s[0]}</b><p>${s[1]}</p></div>`).join("")}</div>
      <div class="cx14-bar"><i id="cx14Bar"></i></div><div class="cx14-hint" id="cx14Hint">Pastga aylantiring ↓</div></div>
    <div class="cx14-stage"><svg viewBox="0 0 400 460" role="img" aria-label="Soatning qatlam-qatlam yig'ilishi">
      <defs><linearGradient id="cx14m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9aa0b0"/><stop offset=".5" stop-color="#4a4f5e"/><stop offset="1" stop-color="#8a8f9e"/></linearGradient>
      <radialGradient id="cx14d" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#2a2d37"/><stop offset="1" stop-color="#050608"/></radialGradient>
      <radialGradient id="cx14h" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="rgba(255,214,110,.55)"/><stop offset="1" stop-color="rgba(255,214,110,0)"/></radialGradient></defs>
      <ellipse class="cx14-halo" cx="200" cy="255" rx="190" ry="120" fill="url(#cx14h)"/>
      <line id="cx14Axis" x1="200" x2="200" stroke="#c9a86a" stroke-dasharray="4 5" opacity="0"/>
      ${layerSVG.map((s, i) => `<g class="cx14-l" data-i="${i}" transform="translate(200 250)" opacity="0">${s}</g>`).join("")}
    </svg></div></div></div>`;
  const tech = $("#technology"), prevSec = $("#cx10Viewer") || $("#cx9Studio") || tech;
  if (tech) tech.after(build);
  else { const a = $("#story") || $("#order") || $(".footer"); if (a) a.before(build); else document.body.appendChild(build); }

  const layers = $$(".cx14-l", build), stepEls = $$(".cx14-st", build), bar = $("#cx14Bar", build), axis = $("#cx14Axis", build), hint = $("#cx14Hint", build);
  const ease = t => 1 - Math.pow(1 - t, 3);
  let ticking = false;
  function update() {
    ticking = false;
    const r = build.getBoundingClientRect(), total = Math.max(1, r.height - innerHeight);
    const p = clamp(-r.top / total, 0, 1);
    const c = clamp(p * 6 - 5, 0, 1);                 // oxirgi bosqich: qatlamlar jipslashadi
    const gap = 56 - 44 * ease(c);
    layers.forEach((g, i) => {
      const q = ease(clamp(p * 6 - i, 0, 1));
      const y = 250 - (i - 2) * gap - (1 - q) * 220;
      g.setAttribute("transform", `translate(200 ${y.toFixed(1)})`);
      g.setAttribute("opacity", q.toFixed(2));
    });
    axis.setAttribute("y1", 250 - 2 * gap); axis.setAttribute("y2", 250 + 2 * gap); axis.style.opacity = (clamp(p * 6 - 4.5, 0, 1) * (1 - c)).toFixed(2);
    const active = Math.min(5, Math.floor(p * 6));
    stepEls.forEach((s, i) => { s.classList.toggle("on", i === active); s.classList.toggle("past", i < active); });
    bar.style.width = (p * 100).toFixed(1) + "%";
    build.classList.toggle("cx14-done", p > .97);
    hint.style.opacity = p > .02 ? 0 : 1;
  }
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener("scroll", req, { passive: true }); addEventListener("resize", req); update();

  /* ================================================================
     2) SOVG'A CHIZIG'I VA MASLAHATCHI
     ================================================================ */
  function nextHoliday() {
    const now = new Date(), t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let best = null;
    HOLIDAYS.forEach(h => {
      let d = new Date(now.getFullYear(), h.m - 1, h.d); if (d < t0) d = new Date(now.getFullYear() + 1, h.m - 1, h.d);
      const days = Math.round((d - t0) / 864e5);
      if (!best || days < best.days) best = { n: h.n, days };
    });
    return best;
  }
  const gift = document.createElement("div");
  gift.className = "cx14-gift";
  const hol = nextHoliday();
  let line1, line2;
  if (hol && hol.days === 0) { line1 = `🎁 Bugun ${esc(hol.n)}!`; line2 = "Yaqinlaringizga Chronex sovg'a qiling."; }
  else if (hol && hol.days <= SHOW_DAYS) { line1 = `🎁 ${esc(hol.n)}gacha <b>${hol.days} kun</b> qoldi`; line2 = "Chronex eng yaxshi sovg'alardan biri. Qaysi model mos kelishini aniqlab beramiz."; }
  else { line1 = "🎁 Sovg'a izlayapsizmi?"; line2 = "3 ta savolga javob bering, mos modelni tanlab beramiz."; }
  gift.innerHTML = `<div class="cx14-gift-in"><div>${line1}<span>${line2}</span></div><button class="btn btn-sm" id="cx14GiftBtn" type="button">Sovg'a maslahatchisi</button></div>`;
  const col = $("#collection");
  if (col) col.before(gift); else { const a = $(".stats") || $("#order"); if (a) a.after(gift); }

  const Q = [
    { q: "Kimga sovg'a qilmoqchisiz?", o: [["Erkakka (ota, aka, turmush o'rtog'i)", { who: "m" }], ["Ayolga (ona, opa, turmush o'rtog'i)", { who: "f" }], ["O'zim uchun", { who: "s" }], ["Do'st yoki hamkasbga", { who: "d" }]] },
    { q: "Uning uslubi qanday?", o: [["Faol va sportga yaqin", { sty: "sport" }], ["Klassik va nafis", { sty: "elegant" }], ["Texnologiyani yaxshi ko'radi", { sty: "tech" }]] },
    { q: "Byudjetingiz qancha?", o: null }
  ];
  const STYLE_MODEL = { sport: "Aero", tech: "Titan", elegant: "Nova" };
  function openWizard() {
    const ms = models().slice().sort((a, b) => a.price - b.price);
    Q[2].o = [[`${money(ms[0].price)} gacha`, { cap: ms[0].price }], [`${money(ms[Math.min(1, ms.length - 1)].price)} gacha`, { cap: ms[Math.min(1, ms.length - 1)].price }], ["Cheklov yo'q", { cap: Infinity }]];
    const ans = {}; let step = 0;
    const m = document.createElement("div"); m.className = "cx14-modal";
    m.innerHTML = `<div class="cx14-box" role="dialog" aria-modal="true" aria-label="Sovg'a maslahatchisi"><button class="cx14-x" type="button" aria-label="Yopish">×</button><div id="cx14W" style="display:grid;gap:14px"></div></div>`;
    document.body.appendChild(m); document.body.style.overflow = "hidden";
    const w = $("#cx14W", m);
    const close = () => { m.remove(); document.body.style.overflow = ""; removeEventListener("keydown", onKey); };
    const onKey = e => { if (e.key === "Escape") close(); }; addEventListener("keydown", onKey);
    const dots = () => `<div class="cx14-dots">${[0, 1, 2].map(i => `<i class="${i <= Math.min(step, 2) ? "on" : ""}"></i>`).join("")}</div>`;
    function show() {
      if (step < 3) {
        const q = Q[step];
        w.innerHTML = `${dots()}<h3>${esc(q.q)}</h3><div class="cx14-opts">${q.o.map((o, i) => `<button type="button" class="cx14-opt" data-i="${i}">${esc(o[0])}</button>`).join("")}</div>${step ? `<button type="button" class="cx14-back" data-back>← Orqaga</button>` : ""}`;
      } else {
        const rec = recommend(ans);
        w.innerHTML = `${dots()}<h3>Sizga tavsiyamiz</h3><div class="cx14-res"><b>${esc(rec.model.name)}</b><strong>${money(rec.model.price)}</strong><span class="muted" style="font-size:14px">${esc(rec.why)}</span></div>
          <button type="button" class="btn" data-order>Sovg'a qilib buyurtma berish</button><button type="button" class="cx14-back" data-again>Qayta boshlash</button>`;
        w._rec = rec;
      }
    }
    function recommend(a) {
      const ms = models(), want = STYLE_MODEL[a.sty] || "Titan";
      const byName = n => ms.find(x => x.name.includes(n)) || ms[0];
      let model = byName(want), note = "";
      if (a.who === "f" && a.sty !== "sport") { model = byName("Nova"); }
      if (model.price > a.cap) {
        const cheaper = ms.filter(x => x.price <= a.cap).sort((x, y) => y.price - x.price)[0];
        if (cheaper) { note = `${model.name} byudjetdan qimmat, shuning uchun eng mos arzonroq variant tanlandi. `; model = cheaper; }
        else { note = "Byudjetingizdan arzon model yo'q, eng hamyonbop variant ko'rsatildi. "; model = ms.slice().sort((x, y) => x.price - y.price)[0]; }
      }
      const WHY = { Aero: "Yengil titan korpus, kundalik va sport uchun mos.", Titan: "Sapfir oyna, GPS va yurak ritmi sensori bilan flagman model.", Nova: "Nafis dizayn, ingichka korpus va teri tasma." };
      const key = Object.keys(WHY).find(k => model.name.includes(k));
      return { model, why: note + (key ? WHY[key] : "") };
    }
    m.addEventListener("click", e => {
      if (e.target === m || e.target.closest(".cx14-x")) { close(); return; }
      const opt = e.target.closest(".cx14-opt");
      if (opt) { Object.assign(ans, Q[step].o[+opt.dataset.i][1]); step++; show(); return; }
      if (e.target.closest("[data-back]")) { step = Math.max(0, step - 1); show(); return; }
      if (e.target.closest("[data-again]")) { step = 0; for (const k in ans) delete ans[k]; show(); return; }
      if (e.target.closest("[data-order]")) { applyGift(w._rec.model.name, ans); close(); }
    });
    show();
  }
  function applyGift(modelName, ans) {
    const sel = $("#model");
    if (sel) { sel.value = modelName; sel.dispatchEvent(new Event("change")); }
    const fin = $("#finish"), pick = ans.who === "f" ? "Rose Gold" : ans.who === "m" ? "Midnight Black" : "Silver Steel";
    if (fin && [...fin.options].some(o => o.value === pick || o.text === pick)) { fin.value = [...fin.options].find(o => o.value === pick || o.text === pick).value; fin.dispatchEvent(new Event("change")); }
    const g = $("#cx8G");                       // chronex-plus.js dagi sovg'a belgisi bo'lsa
    if (g) { if (!g.checked) { g.checked = true; g.dispatchEvent(new Event("change")); } }
    else { const note = $("#note"); if (note && !/Sovg'a:/.test(note.value)) { note.value = (note.value.trim() ? note.value.trim() + "\n" : "") + "🎁 Sovg'a: qadoqlansin"; note.dispatchEvent(new Event("input", { bubbles: true })); } }
    const o = $("#order"); if (o) o.scrollIntoView({ behavior: "smooth" });
    toast("Model va sovg'a belgisi buyurtmaga qo'yildi ✓");
  }
  $("#cx14GiftBtn", gift).onclick = openWizard;

  /* ================================================================
     3) KATALOG (chop etish / PDF)
     ================================================================ */
  const foot = $(".footer"), copy = $(".copy");
  const catBox = document.createElement("div");
  catBox.className = "cx14-cat container";
  catBox.innerHTML = `<button type="button" id="cx14Cat">📄 Katalogni chop etish / PDF</button>`;
  if (copy) copy.before(catBox); else if (foot) foot.appendChild(catBox);
  function catalogHTML() {
    const cards = $$("#collection .card").map(c => ({
      n: ($("h3", c) || {}).textContent || "", d: ($("p", c) || {}).textContent || "", p: ($(".card-foot strong", c) || {}).textContent || "",
      top: !!$(".badge", c)
    })).filter(x => x.n);
    const list = cards.length ? cards : models().map(m => ({ n: m.name, d: "", p: money(m.price), top: false }));
    const d = new Date(), date = d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear();
    return `<!DOCTYPE html><html lang="uz"><head><meta charset="utf-8"><title>CHRONEX katalog</title><style>
      body{font-family:Arial,sans-serif;max-width:760px;margin:30px auto;padding:0 20px;color:#15171d}
      h1{letter-spacing:.4em;text-align:center;margin:0 0 4px}.c{text-align:center;color:#666;margin-bottom:28px}
      .it{border:1px solid #d9d2c3;border-radius:14px;padding:18px 22px;margin-bottom:14px;display:flex;justify-content:space-between;gap:20px;align-items:center;page-break-inside:avoid}
      .it h2{margin:0 0 6px;font-size:20px}.it p{margin:0;color:#555;font-size:14px}.pr{font-size:26px;font-weight:700;white-space:nowrap}
      .tag{font-size:11px;background:#c9a86a;color:#111;border-radius:99px;padding:2px 10px;margin-left:8px;vertical-align:middle}
      .f{margin-top:26px;font-size:13px;color:#666;text-align:center;border-top:1px dashed #999;padding-top:16px}
      button{display:block;margin:20px auto;padding:10px 26px;font-size:15px;cursor:pointer}@media print{button{display:none}}</style></head><body>
      <h1>CHRONEX</h1><div class="c">Time. Redefined. · Katalog · ${esc(date)}</div>
      ${list.map(x => `<div class="it"><div><h2>${esc(x.n)}${x.top ? '<span class="tag">Eng ommabop</span>' : ""}</h2><p>${esc(x.d)}</p></div><div class="pr">${esc(x.p)}</div></div>`).join("")}
      <div class="f">Buyurtma uchun: Telegram @${esc(TG())}<br>Narxlar o'zgarishi mumkin. Aniq shartlarni operator tasdiqlaydi.</div>
      <button onclick="window.print()">Chop etish / PDF</button></body></html>`;
  }
  $("#cx14Cat", catBox).onclick = () => {
    const html = catalogHTML(), w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
    else { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([html], { type: "text/html" })); a.download = "chronex-katalog.html"; document.body.appendChild(a); a.click(); a.remove(); toast("Katalog fayl sifatida yuklandi"); }
  };
})();