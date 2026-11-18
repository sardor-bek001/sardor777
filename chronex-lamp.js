/* ===== CHRONEX chronex-lamp.js =====
   Videodagi "Login Form Lamp" effekti: lampaning shnurini pastga tortsangiz lampa yonadi,
   xona yoritiladi va shisha ko'rinishidagi forma paydo bo'ladi. Qayta tortsangiz o'chadi.
   Mavjud kodga TEGMAYDI. index.html da </body> dan oldin bitta qator qo'shing:
       <script src="./chronex-lamp.js"></script>
   CSS ham shu fayl ichida. GSAP yoki tashqi fayllar kerak emas (shnur, bahor effekti va
   bosish ovozi o'zi yozilgan).

   Forma: "Chronex Club"ga qo'shilish. Ism va telefon Telegram orqali sizga yuboriladi,
   shuningdek buyurtma formasini oldindan to'ldirish uchun brauzerda saqlanadi.
   Parol so'ralmaydi: saytda server yo'q, shuning uchun soxta "kirish" yasalmadi. */
(function () {
  "use strict";
  if (window.__cx12) return;
  window.__cx12 = 1;

  /* ================= YORDAMCHILAR ================= */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const TG = () => (typeof TG_USER !== "undefined" && TG_USER) ? TG_USER : "your_username";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ================= CSS (videodagi o'zgaruvchilar asosida) ================= */
  const st = document.createElement("style");
  st.textContent = `
  .cx12-scene{--bg-color:#121417;--lamp-matte:#e8e2d9;--lamp-shade:#f5f0e6;--lamp-base:#d1ccc2;--glow-color:rgba(255,214,110,.3);--accent-color:#d4a373;--on:0;--transition:.5s cubic-bezier(.4,0,.2,1);
    position:relative;display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:20px;min-height:480px;padding:30px;margin-top:36px;
    border-radius:var(--radius,18px);overflow:hidden;background:var(--bg-color);border:1px solid var(--line,#222633);transition:background var(--transition)}
  .cx12-scene::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:var(--on);transition:opacity var(--transition);
    background:radial-gradient(circle at 28% 40%,var(--glow-color),transparent 68%),radial-gradient(circle at 28% 40%,rgba(255,214,110,.18),transparent 40%)}
  .cx12-lamp{position:relative;display:grid;justify-items:center;align-self:stretch;align-content:center;gap:12px}
  .cx12-svg{width:min(250px,62%);height:auto;overflow:visible;user-select:none;-webkit-user-select:none}
  .cx12-inner-glow{fill:rgba(255,214,110,.95);filter:blur(14px);opacity:calc(var(--on) * .9);transition:opacity var(--transition)}
  .cx12-base{fill:var(--lamp-base)}
  .cx12-shade{fill:var(--lamp-matte)}
  .cx12-lit{fill:#fffaf0;opacity:var(--on);transition:opacity var(--transition);filter:drop-shadow(0 0 18px rgba(255,214,110,.85))}
  .cx12-cord-line{stroke:#6b665c;stroke-width:2;stroke-linecap:round}
  .cx12-bead{fill:var(--accent-color)}
  .cx12-hit{cursor:grab;touch-action:none;outline:none}
  .cx12-hit:active{cursor:grabbing}
  .cx12-hit:focus-visible{stroke:var(--accent-color);stroke-width:2;stroke-dasharray:4 3}
  .cx12-scene.hint .cx12-bead{animation:cx12Nudge 1.7s ease-in-out infinite}
  @keyframes cx12Nudge{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(9px)}}
  .cx12-tip{font-size:13px;color:#8b8f9c;text-align:center;min-height:20px}
  .cx12-snd{position:absolute;top:14px;right:14px;z-index:3;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.18);color:#f5f0e6;width:38px;height:38px;border-radius:50%;cursor:pointer;font-size:15px}
  .cx12-snd:hover{background:rgba(255,255,255,.16)}
  .cx12-card{position:relative;z-index:1;justify-self:center;width:100%;max-width:370px;display:grid;gap:14px;padding:28px;color:#f5f0e6;
    background:linear-gradient(145deg,rgba(255,255,255,.11),rgba(255,255,255,.03));border:1px solid rgba(255,255,255,.14);border-radius:22px;
    backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 24px 60px rgba(0,0,0,.45);
    opacity:var(--on);transform:translateY(calc((1 - var(--on)) * 26px)) scale(calc(.95 + var(--on) * .05));
    transition:opacity var(--transition),transform var(--transition);pointer-events:none}
  .cx12-scene[data-on="true"] .cx12-card{pointer-events:auto}
  .cx12-card h3{margin:0;text-align:center;font-size:24px;letter-spacing:.02em}
  .cx12-card p{margin:0;text-align:center;color:#bdb6a8;font-size:14px}
  .cx12-card label{display:grid;gap:6px;font-size:12px;color:#a8a090;letter-spacing:.04em}
  .cx12-card input[type=text],.cx12-card input[type=tel]{width:100%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);color:#f5f0e6;padding:13px 14px;border-radius:12px;font:inherit;font-size:15px;outline:none;transition:.25s}
  .cx12-card input::placeholder{color:rgba(245,240,230,.4)}
  .cx12-card input:focus{border-color:var(--accent-color);box-shadow:0 0 0 3px rgba(212,163,115,.22);background:rgba(255,255,255,.11)}
  .cx12-card input.bad{border-color:#e5646b}
  .cx12-chk{display:flex!important;align-items:center;gap:10px!important;font-size:13px!important;color:#cfc8ba!important;letter-spacing:0!important;cursor:pointer}
  .cx12-chk input{width:17px!important;height:17px;padding:0;accent-color:#d4a373}
  .cx12-err{color:#ff8a92;font-size:12px;min-height:14px}
  .cx12-gold{position:relative;overflow:hidden;border:0;border-radius:12px;padding:14px;cursor:pointer;font:inherit;font-weight:700;font-size:15px;color:#2a1f08;
    background:linear-gradient(135deg,#f6e6bb,#c9a86a 45%,#9b7733 52%,#e8cb88);box-shadow:0 8px 22px rgba(201,168,106,.25);transition:transform .2s,box-shadow .2s}
  .cx12-gold:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(201,168,106,.4)}
  .cx12-gold::after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent);transform:skewX(-20deg);transition:left .7s}
  .cx12-gold:hover::after{left:130%}
  .cx12-link{background:none;border:0;color:#d4a373;cursor:pointer;font:inherit;font-size:13px;justify-self:center}
  .cx12-link:hover{text-decoration:underline}
  .cx12-how{background:var(--bg,#07080b);border:1px dashed var(--line,#222633);border-radius:14px;padding:14px 16px;font-size:13px;color:var(--muted,#9097a8);margin-top:18px}
  .cx12-how b{color:var(--accent,#c9a86a);display:block;margin-bottom:4px}
  .cx12-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
  .cx12-conf{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:900}
  @media(max-width:860px){.cx12-scene{grid-template-columns:1fr;padding:22px 16px;min-height:0}.cx12-svg{width:min(190px,52%)}}`;
  document.head.appendChild(st);

  /* ================= BO'LIM ================= */
  const sec = document.createElement("section");
  sec.className = "section"; sec.id = "cx12Club";
  sec.innerHTML = `<div class="container">
    <p class="eyebrow center">Chronex Club</p>
    <h2 class="center">Chiroqni yoqing, klubga qo'shiling</h2>
    <p class="center muted">Lampaning shnurini pastga torting. Yorug'lik yonganda forma ochiladi.</p>
    <div class="cx12-scene hint" id="cx12S" data-on="false" role="group" aria-label="Lampa va a'zolik formasi">
      <button class="cx12-snd" id="cx12Snd" type="button" aria-label="Ovozni o'chirish" title="Ovoz">🔊</button>
      <div class="cx12-lamp">
        <svg class="cx12-svg" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="false">
          <ellipse class="cx12-inner-glow" cx="100" cy="112" rx="60" ry="30"/>
          <rect class="cx12-base" x="92" y="100" width="16" height="160" rx="8"/>
          <rect class="cx12-base" x="60" y="250" width="80" height="12" rx="6"/>
          <g class="cx12-pull">
            <line class="cx12-cord-line" id="cx12Line" x1="130" y1="110" x2="130" y2="180"/>
            <circle class="cx12-bead" id="cx12Bead" cx="130" cy="190" r="6"/>
            <circle class="cx12-hit" id="cx12Hit" cx="130" cy="190" r="25" fill="transparent" role="switch" tabindex="0" aria-checked="false" aria-label="Lampa shnuri. Torting yoki Enter bosing"/>
          </g>
          <path class="cx12-shade" d="M30 110 C 30 50, 170 50, 170 110 C 170 125, 30 125, 30 110 Z"/>
          <path class="cx12-lit" d="M30 110 C 30 50, 170 50, 170 110 C 170 125, 30 125, 30 110 Z"/>
        </svg>
        <div class="cx12-tip" id="cx12Tip">Shnurni pastga torting yoki bosing</div>
      </div>
      <form class="cx12-card" id="cx12Form" novalidate inert aria-hidden="true">
        <h3 id="cx12H">Xush kelibsiz</h3>
        <p id="cx12P">Chronex Club'ga qo'shiling: yangi modellar va aksiyalarni birinchi bo'lib biling.</p>
        <label>ISMINGIZ<input type="text" id="cx12Name" placeholder="Ism Familiya" autocomplete="name"></label>
        <label>TELEFON RAQAMI<input type="tel" id="cx12Phone" placeholder="+998 90 123 45 67" autocomplete="tel" inputmode="tel"></label>
        <label class="cx12-chk"><input type="checkbox" id="cx12News" checked> Aksiyalar haqida xabar berib turing</label>
        <div class="cx12-err" id="cx12Err" role="alert"></div>
        <button class="cx12-gold" type="submit">Chronex Club'ga qo'shilish</button>
      </form>
      <div class="cx12-sr" id="cx12Live" aria-live="polite"></div>
    </div>
    <div class="cx12-how"><b>Qanday ishlaydi</b>Lampaning shnurini sichqoncha yoki barmoq bilan pastga torting va qo'yib yuboring: shnur bahor kabi qaytadi, lampa yonadi, xona yoritiladi va forma paydo bo'ladi. Qayta tortsangiz o'chadi. Shnurni bosish yoki klaviaturada Enter bosish ham ishlaydi. «Qo'shilish» bosilganda ism va telefon Telegram orqali sizga yuboriladi, shuningdek buyurtma formasi oldindan to'ldiriladi (ma'lumot faqat shu qurilmada saqlanadi). Bu sahifada parol yoki hisob yaratilmaydi.</div>
  </div>`;
  const after = $("#cta"), before = $("#order") || $(".footer");
  if (after) after.after(sec); else if (before) before.before(sec); else document.body.appendChild(sec);

  /* ================= LAMPA: SHNUR, BAHOR, YONISH ================= */
  const scene = $("#cx12S", sec), svg = $(".cx12-svg", sec), bead = $("#cx12Bead", sec), line = $("#cx12Line", sec), hit = $("#cx12Hit", sec);
  const form = $("#cx12Form", sec), tip = $("#cx12Tip", sec), live = $("#cx12Live", sec), sndBtn = $("#cx12Snd", sec);
  let on = false, y = 0, vel = 0, raf = 0, drag = null, sound = store.get("cx12_sound", true), actx = null;
  const MAXY = 60, TRIGGER = 36;

  const setY = v => { y = v; bead.setAttribute("cy", 190 + v); hit.setAttribute("cy", 190 + v); line.setAttribute("y2", 180 + v); };

  function click() {
    if (!sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume();
      const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
      o.type = "square"; o.frequency.setValueAtTime(1600, t); o.frequency.exponentialRampToValueAtTime(380, t + .035);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.1, t + .002); g.gain.exponentialRampToValueAtTime(.0001, t + .07);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + .08);
      const o2 = actx.createOscillator(), g2 = actx.createGain(), t2 = t + .045;
      o2.type = "sine"; o2.frequency.setValueAtTime(220, t2); o2.frequency.exponentialRampToValueAtTime(90, t2 + .08);
      g2.gain.setValueAtTime(.0001, t2); g2.gain.exponentialRampToValueAtTime(.16, t2 + .004); g2.gain.exponentialRampToValueAtTime(.0001, t2 + .1);
      o2.connect(g2); g2.connect(actx.destination); o2.start(t2); o2.stop(t2 + .12);
    } catch (e) {}
  }
  const paintSound = () => { sndBtn.textContent = sound ? "🔊" : "🔇"; sndBtn.setAttribute("aria-label", sound ? "Ovozni o'chirish" : "Ovozni yoqish"); };
  sndBtn.onclick = () => { sound = !sound; store.set("cx12_sound", sound); paintSound(); if (sound) click(); };
  paintSound();

  function spring() {
    cancelAnimationFrame(raf);
    let last = performance.now();
    const step = t => {
      const dt = Math.min(.032, (t - last) / 1000); last = t;
      vel += (-260 * y - 13 * vel) * dt; setY(y + vel * dt);
      if (Math.abs(y) > .05 || Math.abs(vel) > .1) raf = requestAnimationFrame(step); else { setY(0); vel = 0; }
    };
    raf = requestAnimationFrame(step);
  }
  function toggle(viaKeyboard) {
    on = !on;
    scene.dataset.on = on; scene.style.setProperty("--on", on ? 1 : 0); scene.classList.remove("hint");
    hit.setAttribute("aria-checked", on);
    form.inert = !on; form.setAttribute("aria-hidden", on ? "false" : "true");
    tip.textContent = on ? "Qayta tortsangiz lampa o'chadi" : "Shnurni pastga torting yoki bosing";
    live.textContent = on ? "Lampa yondi. Forma ochildi." : "Lampa o'chdi. Forma yopildi.";
    click();
    if (on && viaKeyboard) setTimeout(() => { const n = $("#cx12Name", sec); if (n) n.focus(); }, 520);
  }
  // bosish yoki klaviatura: shnurni o'zi tortib qo'yadi
  function tapPull(viaKeyboard) {
    cancelAnimationFrame(raf); const t0 = performance.now(), from = y;
    const step = t => {
      const p = Math.min(1, (t - t0) / 110); setY(from + (45 - from) * p);
      if (p < 1) raf = requestAnimationFrame(step); else { toggle(viaKeyboard); vel = 0; spring(); }
    };
    raf = requestAnimationFrame(step);
  }
  hit.addEventListener("pointerdown", e => {
    e.preventDefault(); cancelAnimationFrame(raf); vel = 0;
    drag = { sy: e.clientY, y0: y, moved: 0, scale: svg.getBoundingClientRect().width / 200 };
    try { hit.setPointerCapture(e.pointerId); } catch (er) {}
  });
  hit.addEventListener("pointermove", e => {
    if (!drag) return;
    const dy = (e.clientY - drag.sy) / drag.scale;
    drag.moved = Math.max(drag.moved, Math.abs(e.clientY - drag.sy));
    setY(Math.max(0, Math.min(MAXY, drag.y0 + dy)));
  });
  const release = () => {
    if (!drag) return;
    const d = drag; drag = null;
    if (d.moved < 4) { tapPull(false); return; }   // oddiy bosish
    if (y >= TRIGGER) toggle(false);
    spring();
  };
  hit.addEventListener("pointerup", release); hit.addEventListener("pointercancel", release);
  hit.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") { e.preventDefault(); tapPull(true); } });

  /* ================= FORMA ================= */
  const F = () => ({ n: $("#cx12Name", form), p: $("#cx12Phone", form), nw: $("#cx12News", form), er: $("#cx12Err", form) });
  function rebind() {
    const { n, p, er } = F();
    p.addEventListener("focus", () => { if (!p.value) p.value = "+998 "; });
    p.addEventListener("input", () => {
      let d = p.value.replace(/\D/g, ""); if (!d.startsWith("998")) d = "998" + d.replace(/^998?/, ""); d = d.slice(0, 12);
      p.value = "+" + [d.slice(0, 3), d.slice(3, 5), d.slice(5, 8), d.slice(8, 10), d.slice(10, 12)].filter(Boolean).join(" ");
    });
    [n, p].forEach(i => i.addEventListener("input", () => { i.classList.remove("bad"); er.textContent = ""; }));
  }
  rebind();

  const FORM_HTML = form.innerHTML;
  function greet() {
    const m = store.get("cx12_member", null);
    let prev = {}; try { prev = JSON.parse(localStorage.getItem("chronex_order") || "{}"); } catch (e) {}
    const name = (m && m.name) || prev.name || "", phone = (m && m.phone) || prev.phone || "", f = F();
    if (name) f.n.value = name; if (phone) f.p.value = phone;
    if (m && m.name) { $("#cx12H", sec).textContent = "Qaytganingiz bilan!"; $("#cx12P", sec).textContent = m.name + ", siz Chronex Club a'zosisiz. Ma'lumotlarni xohlasangiz yangilang."; }
  }
  greet();

  function confetti() {
    if (reduce) return;
    const cv = document.createElement("canvas"); cv.className = "cx12-conf"; document.body.appendChild(cv);
    const ctx = cv.getContext("2d"), W = cv.width = innerWidth, H = cv.height = innerHeight, cols = ["#f6e6bb", "#c9a86a", "#fffaf0", "#d4a373", "#e8cb88"];
    const r = scene.getBoundingClientRect(), cx = r.left + r.width * .66, cy = r.top + r.height * .5;
    const P = Array.from({ length: 110 }, () => ({ x: cx, y: cy, vx: (Math.random() - .5) * 14, vy: -Math.random() * 12 - 2, s: Math.random() * 6 + 3, r: Math.random() * 6, c: cols[(Math.random() * cols.length) | 0] }));
    const t0 = performance.now();
    (function f(now) {
      const t = now - t0; ctx.clearRect(0, 0, W, H);
      P.forEach(p => { p.vy += .35; p.x += p.vx; p.y += p.vy; p.r += .2; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = Math.max(0, 1 - t / 2600); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
      if (t < 2600) requestAnimationFrame(f); else cv.remove();
    })(t0);
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const f = F(), name = f.n.value.trim(), phone = f.p.value, digits = phone.replace(/\D/g, "");
    let bad = false;
    if (name.length < 2) { f.n.classList.add("bad"); f.er.textContent = "Ismingizni kiriting"; bad = true; }
    else if (digits.length !== 12) { f.p.classList.add("bad"); f.er.textContent = "To'liq telefon raqam kiriting"; bad = true; }
    if (bad) return;

    store.set("cx12_member", { name, phone, news: f.nw.checked, date: Date.now() });
    // buyurtma formasi uchun saqlangan ma'lumotni yangilash (script.js shu kalitdan foydalanadi)
    let prev = {}; try { prev = JSON.parse(localStorage.getItem("chronex_order") || "{}"); } catch (er) {}
    try { localStorage.setItem("chronex_order", JSON.stringify(Object.assign({}, prev, { name, phone }))); } catch (er) {}
    const on1 = $("#name"), on2 = $("#phone");
    if (on1) { on1.value = name; on1.dispatchEvent(new Event("input", { bubbles: true })); }
    if (on2) { on2.value = phone; on2.dispatchEvent(new Event("input", { bubbles: true })); }

    const msg = `🌟 Yangi Chronex Club a'zosi\n\n👤 Ism: ${name}\n📞 Telefon: ${phone}\n📬 Aksiyalar haqida xabar: ${f.nw.checked ? "ha" : "yo'q"}`;
    window.open(`https://t.me/${TG()}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");

    form.innerHTML = `<h3>Rahmat, ${esc(name.split(" ")[0])}! 🎉</h3>
      <p>Telegram ochildi. «Send» tugmasini bosing, shunda arizangiz bizga yetib keladi. Ma'lumotlaringiz buyurtma formasiga ham yozildi.</p>
      <button class="cx12-gold" type="button" id="cx12Go">Buyurtmaga o'tish</button>
      <button class="cx12-link" type="button" id="cx12Again">Boshqa ma'lumot kiritish</button>`;
    live.textContent = "Ariza tayyor. Telegramda yuborishni tasdiqlang.";
    confetti();
  });
  form.addEventListener("click", e => {
    if (e.target.id === "cx12Go") { const o = $("#order"); if (o) o.scrollIntoView({ behavior: "smooth" }); }
    if (e.target.id === "cx12Again") {
      form.innerHTML = FORM_HTML; rebind();
      const m = store.get("cx12_member", null), f = F();
      if (m) { f.n.value = m.name; f.p.value = m.phone; }
    }
  });
})();