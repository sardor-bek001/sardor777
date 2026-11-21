/* ===== CHRONEX chronex-epic.js =====
   Mavjud kodga TEGMAYDI. index.html da </body> dan oldin bitta qator qo'shing:
       <script src="./chronex-epic.js"></script>
   CSS ham shu fayl ichida.

   NIMALAR QO'SHILADI
   1) "Kolleksiya kinoteatri": sahifani aylantirganingiz sari modellar yonma-yon, katta ekranda o'tadi
   2) "Chronex o'yinxonasi" (2 tab):
        - Mexanizm yig'ing: tishli g'ildiraklarni sudrab joylashtiring, ular aylanib, soat strelkasini yuritadi
        - Qirib oching: oltin qatlamni ishqalab promo-kodni oching
   3) Soat atmosferasi: tik-tak va yumshoq fon tovushi (tugma bilan)

   SOZLAMALAR: pastdagi SCRATCH (promo-kod va muddati) */
(function () {
  "use strict";
  if (window.__cx16) return;
  window.__cx16 = 1;

  /* ================= SOZLAMALAR ================= */
  // Qirib ochiladigan kod. FAQAT haqiqatan ishlaydigan kodni yozing, aks holda "on: false" qiling.
  const SCRATCH = { on: true, code: "CHRONEX10", pct: 10, until: "2026-12-01T23:59:59+05:00" };

  /* ================= YORDAMCHILAR ================= */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const pad = n => (n < 10 ? "0" : "") + n;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function toast(m) {
    let box = $(".cx-toasts");
    if (!box) { box = document.createElement("div"); box.className = "cx-toasts"; document.body.appendChild(box); }
    const t = document.createElement("div"); t.className = "cx-toast"; t.textContent = m; box.appendChild(t);
    setTimeout(() => t.classList.add("out"), 2600); setTimeout(() => t.remove(), 3100);
  }
  const prices = () => {
    const l = $$("#model option").filter(o => o.dataset.price).map(o => ({ name: o.value, price: +o.dataset.price }));
    return l.length ? l : [{ name: "Chronex Aero", price: 249 }, { name: "Chronex Titan", price: 349 }, { name: "Chronex Nova", price: 299 }];
  };
  const hex2rgb = h => { h = h.replace("#", ""); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); };
  const rgb2hex = a => "#" + a.map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");
  const shade = (hex, amt) => { const t = amt < 0 ? 0 : 255, p = Math.abs(amt); return rgb2hex(hex2rgb(hex).map(v => v + (t - v) * p)); };
  function confetti(ox, oy) {
    if (reduce) return;
    const cv = document.createElement("canvas"); cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:900"; document.body.appendChild(cv);
    const c = cv.getContext("2d"), W = cv.width = innerWidth, H = cv.height = innerHeight, cols = ["#f6e6bb", "#c9a86a", "#fffaf0", "#7ee8ff", "#ff5a6e"];
    const P = Array.from({ length: 120 }, () => ({ x: ox == null ? W / 2 : ox, y: oy == null ? H * .6 : oy, vx: (Math.random() - .5) * 15, vy: -Math.random() * 13 - 3, s: Math.random() * 6 + 3, r: Math.random() * 6, c: cols[(Math.random() * cols.length) | 0] }));
    const t0 = performance.now();
    (function f(now) { const t = now - t0; c.clearRect(0, 0, W, H);
      P.forEach(p => { p.vy += .36; p.x += p.vx; p.y += p.vy; p.r += .2; c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.globalAlpha = Math.max(0, 1 - t / 2800); c.fillStyle = p.c; c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); c.restore(); });
      if (t < 2800) requestAnimationFrame(f); else cv.remove(); })(t0);
  }

  /* ================= CSS ================= */
  const st = document.createElement("style");
  st.textContent = `
  /* kinoteatr */
  .cx16-cine{position:relative;background:var(--bg,#07080b)}
  .cx16-sticky{position:sticky;top:0;height:100vh;overflow:hidden;background:radial-gradient(60% 70% at 72% 50%,rgba(var(--cx16-glow,201,168,106),.22),transparent 70%),var(--bg,#07080b)}
  .cx16-track{display:flex;height:100%;will-change:transform}
  .cx16-slide{flex:0 0 100vw;width:100vw;height:100%;display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:30px;box-sizing:border-box;padding:0 max(4vw,calc((100vw - 1160px)/2))}
  .cx16-txt{display:grid;gap:14px;align-content:center}
  .cx16-txt h2{margin:0;font-size:clamp(36px,6vw,76px);line-height:1;letter-spacing:-.02em}
  .cx16-txt p{margin:0;color:var(--muted,#9097a8);font-size:clamp(15px,1.6vw,19px);max-width:460px}
  .cx16-chips{display:flex;gap:8px;flex-wrap:wrap}
  .cx16-chips span{border:1px solid var(--line,#222633);color:var(--text,#f2f3f7);border-radius:999px;padding:5px 14px;font-size:13px;background:rgba(255,255,255,.03)}
  .cx16-buy{display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-top:6px}
  .cx16-buy strong{font-size:clamp(28px,3.4vw,40px);color:var(--accent2,#e8d3a0)}
  .cx16-fw{display:grid;place-items:center;will-change:transform}
  .cx16-fw svg{width:min(62vh,440px,90%);height:auto;overflow:visible;filter:drop-shadow(0 30px 40px rgba(0,0,0,.55))}
  .cx16-nav{position:absolute;left:50%;bottom:26px;transform:translateX(-50%);display:flex;gap:10px;align-items:center;z-index:2}
  .cx16-nav button{width:34px;height:5px;border-radius:5px;border:0;background:var(--line,#222633);cursor:pointer;padding:0;transition:.3s}
  .cx16-nav button.on{width:54px;background:var(--accent,#c9a86a)}
  .cx16-hintc{position:absolute;right:4vw;bottom:20px;font-size:12px;color:var(--muted,#9097a8);z-index:2;display:flex;gap:10px;align-items:center}
  .cx16-snd{background:rgba(255,255,255,.05);border:1px solid var(--line,#222633);color:var(--text,#f2f3f7);border-radius:999px;padding:6px 14px;cursor:pointer;font:inherit;font-size:12px}
  .cx16-snd.on{border-color:var(--accent,#c9a86a);background:rgba(201,168,106,.15)}
  @media(max-width:900px){.cx16-slide{grid-template-columns:1fr;grid-template-rows:auto 1fr;align-content:center;gap:0;padding:0 5vw}.cx16-fw{order:-1;height:40vh}.cx16-fw svg{width:min(44vh,70vw)}.cx16-txt{gap:8px;align-content:start}.cx16-txt h2{font-size:34px}.cx16-hintc{display:none}}

  /* o'yinxona */
  .cx16-tabs{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin:28px 0 34px}
  .cx16-tabs button{background:var(--card,#13161e);color:var(--muted,#9097a8);border:1px solid var(--line,#222633);padding:10px 20px;border-radius:999px;cursor:pointer;font:inherit;font-size:14px;transition:.25s}
  .cx16-tabs button:hover{border-color:var(--accent,#c9a86a);color:var(--text,#f2f3f7)}
  .cx16-tabs button.on{background:linear-gradient(135deg,var(--accent2,#e8d3a0),var(--accent,#c9a86a));color:#111;border-color:transparent;font-weight:700}
  .cx16-pane{display:none;grid-template-columns:1.25fr .75fr;gap:28px;align-items:center}
  .cx16-pane.on{display:grid;animation:cx16In .4s}
  @keyframes cx16In{from{opacity:0;transform:translateY(12px)}}
  .cx16-board{background:var(--card,#13161e);border:1px solid var(--line,#222633);border-radius:var(--radius,18px);padding:12px;position:relative;touch-action:none}
  .cx16-board svg{width:100%;height:auto;display:block;user-select:none;-webkit-user-select:none}
  .cx16-gear{cursor:grab;outline:none}
  .cx16-gear:active{cursor:grabbing}
  .cx16-gear:focus-visible path.body{stroke:#fff;stroke-width:2}
  .cx16-shake{animation:cx16Shake .35s}
  @keyframes cx16Shake{20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
  .cx16-side{display:grid;gap:14px}
  .cx16-side h3{margin:0;font-size:24px}
  .cx16-how{background:var(--bg,#07080b);border:1px dashed var(--line,#222633);border-radius:14px;padding:12px 14px;font-size:13px;color:var(--muted,#9097a8)}
  .cx16-how b{color:var(--accent,#c9a86a);display:block;margin-bottom:3px}
  .cx16-row{display:flex;gap:8px;flex-wrap:wrap}
  .cx16-status{font-size:15px;min-height:22px;color:var(--accent2,#e8d3a0);font-weight:600}
  .cx16-scwrap{position:relative;width:min(340px,100%);aspect-ratio:340/150;margin:auto;border-radius:16px;overflow:hidden;background:#0b0b0f;border:1px solid var(--accent,#c9a86a)}
  .cx16-prize{position:absolute;inset:0;display:grid;place-content:center;text-align:center;gap:4px;background:radial-gradient(circle at 50% 40%,#2a2210,#0b0b0f)}
  .cx16-prize small{color:#9097a8;letter-spacing:.2em;text-transform:uppercase;font-size:11px}
  .cx16-prize b{font-size:32px;letter-spacing:.18em;color:#e8d3a0}
  .cx16-prize span{color:#cfc8ba;font-size:14px}
  .cx16-scwrap canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:crosshair;transition:opacity .7s}
  @media(max-width:900px){.cx16-pane.on{grid-template-columns:1fr}}`;
  document.head.appendChild(st);

  /* ================================================================
     1) KOLLEKSIYA KINOTEATRI
     ================================================================ */
  const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  function handPath(kind, len, w) {
    if (kind === "sword") return `M${-w * 1.1} 14 L${-w * 1.3} ${-len * .18} L0 ${-len} L${w * 1.3} ${-len * .18} L${w * 1.1} 14Z`;
    if (kind === "baton") return `M${-w * .6} 14 L${-w * .6} ${-len} L${w * .6} ${-len} L${w * .6} 14Z`;
    return `M${-w} 14 L${-w * .7} 0 L${-w * .5} ${-len + 8} L0 ${-len} L${w * .5} ${-len + 8} L${w * .7} 0 L${w} 14Z`;
  }
  function faceSVG(c, p) {
    const d0 = shade(c.dial, .2), d1 = shade(c.dial, -.5); let m = "", burst = "";
    for (let i = 0; i < 60; i++) {
      const a = i * 6;
      if (i % 5 === 0) {
        const k = i / 5;
        if (c.style === "bars") m += `<rect x="146.5" y="42" width="7" height="22" rx="1.5" fill="${c.mark}" transform="rotate(${a} 150 150)"/>`;
        else { const r = Math.PI * a / 180; m += `<text x="${(150 + 90 * Math.sin(r)).toFixed(1)}" y="${(150 - 90 * Math.cos(r) + 5).toFixed(1)}" text-anchor="middle" font-family="Georgia,serif" font-size="17" fill="${c.mark}">${ROMAN[k]}</text>`; }
      } else m += `<rect x="149.4" y="34" width="1.2" height="5" fill="${c.mark}" opacity=".6" transform="rotate(${a} 150 150)"/>`;
      burst += `<line x1="150" y1="150" x2="150" y2="18" stroke="#fff" stroke-opacity=".05" transform="rotate(${a} 150 150)"/>`;
    }
    const date = c.date ? `<rect x="196" y="141" width="28" height="18" rx="2" fill="#f4f1e8" stroke="rgba(0,0,0,.35)"/><text x="210" y="154.5" text-anchor="middle" font-family="Arial" font-size="12" font-weight="700" fill="#111">${new Date().getDate()}</text>` : "";
    return `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Soat"><defs>
<linearGradient id="${p}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.rim[0]}"/><stop offset=".5" stop-color="${c.rim[1]}"/><stop offset="1" stop-color="${c.rim[2]}"/></linearGradient>
<radialGradient id="${p}d" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="${d0}"/><stop offset="1" stop-color="${d1}"/></radialGradient>
<linearGradient id="${p}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<clipPath id="${p}c"><circle cx="150" cy="150" r="132"/></clipPath></defs>
<circle cx="150" cy="150" r="148" fill="url(#${p}r)"/><circle cx="150" cy="150" r="140" fill="#0b0b0f"/><circle cx="150" cy="150" r="132" fill="url(#${p}d)"/>
<g clip-path="url(#${p}c)">${burst}</g>${m}
<text x="150" y="${c.style === "roman" ? 112 : 104}" text-anchor="middle" font-family="Arial" font-size="11" letter-spacing="4" fill="${c.mark}">CHRONEX</text>${date}
<g data-hand="h" transform="translate(150 150)"><path d="${handPath(c.hand, 68, 4.5)}" fill="${c.handc}" stroke="rgba(0,0,0,.35)" stroke-width=".6"/></g>
<g data-hand="m" transform="translate(150 150)"><path d="${handPath(c.hand, 100, 3.5)}" fill="${c.handc}" stroke="rgba(0,0,0,.35)" stroke-width=".6"/></g>
<g data-hand="s" transform="translate(150 150)"><line y1="26" y2="-112" stroke="${c.sec}" stroke-width="1.6" stroke-linecap="round"/><circle cy="20" r="4" fill="${c.sec}"/></g>
<circle cx="150" cy="150" r="6" fill="${c.sec}"/><circle cx="150" cy="150" r="2.2" fill="#111"/>
<g clip-path="url(#${p}c)"><ellipse cx="108" cy="92" rx="100" ry="50" fill="url(#${p}s)" transform="rotate(-28 108 92)"/></g></svg>`;
  }
  const RIM = { gold: ["#f6e6bb", "#9b7733", "#e8cb88"], steel: ["#f4f6fa", "#7d8494", "#dfe3ec"], rose: ["#fbe2d8", "#b07767", "#f0c9bb"] };
  const CINE = [
    { key: "Aero", glow: [142, 149, 168], chips: ["Titan", "50 m", "14 kun"], desc: "Yengil titan korpus. Kundalik va sport uchun ideal.", face: { dial: "#cfd4df", mark: "#1a1d26", handc: "#20232d", sec: "#2b6fff", rim: RIM.steel, style: "bars", hand: "classic", date: true } },
    { key: "Titan", glow: [201, 168, 106], chips: ["Sapfir", "GPS", "Xronograf"], desc: "Sapfir oyna, GPS va yurak ritmi sensori bilan flagman.", face: { dial: "#161820", mark: "#e8d3a0", handc: "#e8d3a0", sec: "#ff5a3c", rim: RIM.gold, style: "bars", hand: "sword", date: true } },
    { key: "Nova", glow: [215, 154, 154], chips: ["Rose gold", "Teri tasma", "Ingichka"], desc: "Nafis dizayn, ingichka korpus va premium teri tasma.", face: { dial: "#efe3d3", mark: "#5e362c", handc: "#5e362c", sec: "#b5473a", rim: RIM.rose, style: "roman", hand: "baton", date: false } }
  ];
  const N = CINE.length;
  const cards = $$("#collection .card");
  CINE.forEach(c => {
    const card = cards.find(x => (($("h3", x) || {}).textContent || "").includes(c.key));
    c.name = card ? $("h3", card).textContent.trim() : "Chronex " + c.key;
    if (card && $("p", card)) c.desc = $("p", card).textContent.trim();
    const pr = prices().find(p => p.name.includes(c.key)); c.price = pr ? pr.price : 0; c.model = pr ? pr.name : c.name;
  });
  const cine = document.createElement("section");
  cine.id = "cx16Cine"; cine.className = "cx16-cine"; cine.style.height = (100 + (N - 1) * 100) + "vh";
  cine.innerHTML = `<div class="cx16-sticky"><div class="cx16-track" id="cx16Tr">${CINE.map((c, i) => `
      <div class="cx16-slide" data-i="${i}">
        <div class="cx16-txt"><p class="eyebrow" style="margin:0">Kolleksiya · ${pad(i + 1)} / ${pad(N)}</p><h2>${esc(c.name)}</h2><p>${esc(c.desc)}</p>
          <div class="cx16-chips">${c.chips.map(x => `<span>${esc(x)}</span>`).join("")}</div>
          <div class="cx16-buy"><strong>$${c.price}</strong><button class="btn" type="button" data-pick="${esc(c.model)}">Tanlash</button></div></div>
        <div class="cx16-fw" data-fw="${i}">${faceSVG(c.face, "k" + i)}</div></div>`).join("")}</div>
    <div class="cx16-nav" id="cx16Nav">${CINE.map((c, i) => `<button type="button" data-i="${i}" aria-label="${esc(c.name)}"></button>`).join("")}</div>
    <div class="cx16-hintc"><span>Aylantiring ↓</span><button class="cx16-snd" id="cx16Snd" type="button" aria-pressed="false">🔇 Soat atmosferasi</button></div></div>`;
  const colSec = $("#collection");
  if (colSec) colSec.after(cine); else { const a = $("#technology") || $("#story") || $("#order") || $(".footer"); if (a) a.before(cine); else document.body.appendChild(cine); }

  const track = $("#cx16Tr", cine), sticky = $(".cx16-sticky", cine), fws = $$("[data-fw]", cine), navB = $$("#cx16Nav button", cine), slides = $$(".cx16-slide", cine);
  let ticking = false;
  function cineUpdate() {
    ticking = false;
    const r = cine.getBoundingClientRect(), total = Math.max(1, r.height - innerHeight), p = clamp(-r.top / total, 0, 1), x = p * (N - 1);
    track.style.transform = `translate3d(${(-x * 100).toFixed(3)}vw,0,0)`;
    const i0 = Math.floor(x), f = x - i0, a = CINE[i0].glow, b = CINE[Math.min(N - 1, i0 + 1)].glow;
    sticky.style.setProperty("--cx16-glow", a.map((v, k) => Math.round(v + (b[k] - v) * f)).join(","));
    fws.forEach((fw, i) => { const o = i - x, ao = Math.abs(o); fw.style.transform = `translateX(${(-o * 70).toFixed(1)}px) rotate(${(-o * 16).toFixed(1)}deg) scale(${(1 - ao * .16).toFixed(3)})`; fw.style.opacity = clamp(1 - ao * .55, 0, 1).toFixed(2); });
    slides.forEach((s, i) => { const t = $(".cx16-txt", s); t.style.opacity = clamp(1 - Math.abs(i - x) * 1.3, 0, 1).toFixed(2); });
    const act = Math.round(x); navB.forEach((b, i) => b.classList.toggle("on", i === act));
  }
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(cineUpdate); } };
  addEventListener("scroll", req, { passive: true }); addEventListener("resize", req); cineUpdate();
  navB.forEach((b, i) => b.onclick = () => {
    const top = cine.getBoundingClientRect().top + scrollY, total = cine.offsetHeight - innerHeight;
    scrollTo({ top: top + (i / (N - 1)) * total, behavior: "smooth" });
  });
  cine.addEventListener("click", e => {
    const b = e.target.closest("[data-pick]"); if (!b) return;
    const sel = $("#model"); if (sel) { sel.value = b.dataset.pick; sel.dispatchEvent(new Event("change")); }
    const o = $("#order"); if (o) o.scrollIntoView({ behavior: "smooth" });
  });
  function cineHands() {
    const d = new Date(), s = d.getSeconds() + d.getMilliseconds() / 1000, m = d.getMinutes() + s / 60, h = (d.getHours() % 12) + m / 60;
    $$("svg", cine).forEach(sv => {
      const set = (k, a) => { const g = sv.querySelector(`[data-hand="${k}"]`); if (g) g.setAttribute("transform", `translate(150 150) rotate(${a.toFixed(2)})`); };
      set("h", h * 30); set("m", m * 6); set("s", s * 6);
    });
  }
  let cvis = false; new IntersectionObserver(es => { cvis = es[0].isIntersecting; }, { threshold: 0 }).observe(cine);
  (function loop() { if (cvis) cineHands(); requestAnimationFrame(loop); })();

  /* ---------- 3. SOAT ATMOSFERASI ---------- */
  const sndBtn = $("#cx16Snd", cine);
  let ac = null, ambient = null;
  function startAmbient() {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === "suspended") ac.resume();
    const master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination); master.gain.linearRampToValueAtTime(.5, ac.currentTime + 1.2);
    const drone = [110, 164.8, 220].map((f, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = "sine"; o.frequency.value = f; g.gain.value = .025 / (i + 1); o.connect(g); g.connect(master); o.start(); return o; });
    const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = .12; lg.gain.value = 3; lfo.connect(lg); drone.forEach(o => lg.connect(o.detune)); lfo.start();
    let n = 0;
    const iv = setInterval(() => {
      const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(); n++;
      o.type = "square"; o.frequency.setValueAtTime(n % 2 ? 1700 : 1300, t); o.frequency.exponentialRampToValueAtTime(500, t + .03);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.05, t + .002); g.gain.exponentialRampToValueAtTime(.0001, t + .05);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + .06);
    }, 1000);
    ambient = { stop() { clearInterval(iv); try { master.gain.cancelScheduledValues(ac.currentTime); master.gain.setValueAtTime(master.gain.value, ac.currentTime); master.gain.linearRampToValueAtTime(0, ac.currentTime + .5); } catch (e) {} setTimeout(() => { drone.forEach(o => { try { o.stop(); } catch (e) {} }); try { lfo.stop(); } catch (e) {} master.disconnect(); }, 700); } };
  }
  sndBtn.onclick = () => {
    const on = !ambient;
    try { if (on) startAmbient(); else { ambient.stop(); ambient = null; } } catch (e) { ambient = null; toast("Ovozni yoqib bo'lmadi"); return; }
    sndBtn.classList.toggle("on", !!ambient); sndBtn.setAttribute("aria-pressed", String(!!ambient)); sndBtn.textContent = (ambient ? "🔊" : "🔇") + " Soat atmosferasi";
  };

  /* ================================================================
     2) CHRONEX O'YINXONASI
     ================================================================ */
  const expired = Date.now() > new Date(SCRATCH.until).getTime();
  const showScratch = SCRATCH.on && !expired;
  const game = document.createElement("section");
  game.className = "section dark"; game.id = "cx16Game";
  game.innerHTML = `<div class="container">
    <p class="eyebrow center">Chronex o'yinxonasi</p><h2 class="center">O'ynab ko'ring</h2>
    <p class="center muted">Soatning ichini o'zingiz yig'ing${showScratch ? " va sovrinni oching" : ""}.</p>
    <div class="cx16-tabs" role="tablist"><button type="button" class="on" data-t="g">⚙️ Mexanizm yig'ing</button>${showScratch ? `<button type="button" data-t="s">🎟 Qirib oching</button>` : ""}</div>

    <div class="cx16-pane on" data-p="g">
      <div class="cx16-board"><svg id="cx16Svg" viewBox="0 0 520 400" role="group" aria-label="Tishli g'ildiraklar o'yini"></svg></div>
      <div class="cx16-side"><h3>Mexanizm yig'ing</h3><div class="cx16-status" id="cx16St" role="status">G'ildiraklarni mos joyga sudrang.</div>
        <div class="cx16-row"><button class="btn btn-sm btn-ghost" id="cx16Auto" type="button">✨ Avto-yig'ish</button><button class="btn btn-sm btn-ghost" id="cx16Reset" type="button">↺ Qaytadan</button></div>
        <div class="cx16-how"><b>Qanday ishlaydi</b>Pastdagi 3 ta g'ildirakni sudrab, nuqtali doiralarga qo'ying. Doira ichidagi raqam tishlar sonini bildiradi, g'ildirakni shu raqamga mos joyga qo'ying. To'g'ri qo'ysangiz joyiga yopishadi, noto'g'ri bo'lsa qaytib ketadi. Hamma g'ildirak joylashsa, tishlar bir-biriga ilashib aylanadi va o'ngdagi soat strelkasini yuritadi. Klaviaturada: g'ildirakka Tab bilan o'tib Enter bosing.</div></div>
    </div>
    ${showScratch ? `<div class="cx16-pane" data-p="s">
      <div class="cx16-board" style="display:grid;gap:14px;justify-items:center;padding:28px">
        <div class="cx16-scwrap"><div class="cx16-prize"><small>Promo-kod</small><b>${esc(SCRATCH.code)}</b><span>−${SCRATCH.pct}% chegirma</span></div><canvas id="cx16Sc" width="340" height="150" aria-label="Qirib ochiladigan qatlam"></canvas></div>
        <div class="cx16-row" style="justify-content:center"><button class="btn btn-sm btn-ghost" id="cx16Rev" type="button">Qirmasdan ko'rsatish</button><button class="btn btn-sm" id="cx16Cp" type="button" hidden>Nusxalash va buyurtmaga o'tish</button></div></div>
      <div class="cx16-side"><h3>Sovrinni oching</h3><p class="muted" style="margin:0">Oltin qatlamni sichqoncha yoki barmoq bilan ishqalang.</p>
        <div class="cx16-how"><b>Qanday ishlaydi</b>Qatlamning yarmidan ko'pi ochilganda promo-kod ko'rinadi. Bu tasodifiy yutuq emas: kod hammaga bir xil va aksiya muddatigacha amal qiladi. «Nusxalash» kodni almashish buferiga qo'yib, buyurtma formasiga o'tkazadi, u yerda kodni kiritasiz. Muddat: ${esc(new Date(SCRATCH.until).toLocaleDateString("ru-RU"))} gacha.</div></div>
    </div>` : ""}
  </div>`;
  const cta = $("#cta");
  if (cta) cta.before(game); else { const a = $("#order") || $(".footer"); if (a) a.before(game); else document.body.appendChild(game); }
  $$(".cx16-tabs button", game).forEach(b => b.onclick = () => {
    $$(".cx16-tabs button", game).forEach(x => x.classList.toggle("on", x === b));
    $$(".cx16-pane", game).forEach(p => p.classList.toggle("on", p.dataset.p === b.dataset.t));
  });

  /* ---------- Mexanizm: tishli g'ildiraklar ---------- */
  const MOD = 4;
  const TEETH = [12, 10, 16, 8], rp = TEETH.map(t => t * MOD);
  const ANG = [-20, 25, -30];                                       // markazlarni tutashtiruvchi chiziq burchaklari (daraja)
  const PEG = [[110, 170]];
  for (let i = 0; i < 3; i++) { const d = rp[i] + rp[i + 1], a = ANG[i] * Math.PI / 180, p = PEG[i]; PEG.push([p[0] + d * Math.cos(a), p[1] + d * Math.sin(a)]); }
  const TRAY = [[80, 345, .72], [190, 335, .6], [295, 350, .82]];     // 1,2,3-g'ildirak uchun [x, y, masshtab]
  function gearPath(t) {
    const r = t * MOD, ro = r + MOD, rr = r - MOD * 1.15, a = 2 * Math.PI / t; let d = "";
    const P = (rad, ang) => `${(rad * Math.cos(ang)).toFixed(2)} ${(rad * Math.sin(ang)).toFixed(2)}`;
    for (let k = 0; k < t; k++) { const c = k * a; d += (k ? "L" : "M") + P(rr, c - a * .3) + "L" + P(ro, c - a * .15) + "L" + P(ro, c + a * .15) + "L" + P(rr, c + a * .3); }
    return d + "Z";
  }
  const svg = $("#cx16Svg", game), NS = "http://www.w3.org/2000/svg";
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); (parent || svg).appendChild(e); return e; };
  svg.innerHTML = `<defs><linearGradient id="gGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e6bb"/><stop offset=".5" stop-color="#c9a86a"/><stop offset="1" stop-color="#9b7733"/></linearGradient>
    <linearGradient id="gSteel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9ecf3"/><stop offset=".5" stop-color="#9aa0b0"/><stop offset="1" stop-color="#6b7080"/></linearGradient></defs>
    <rect x="0" y="0" width="520" height="400" rx="14" fill="#0b0b0f"/><rect x="0" y="280" width="520" height="120" fill="rgba(255,255,255,.03)"/>
    <text x="14" y="300" fill="#6d7385" font-family="Arial" font-size="12">G'ildiraklar</text>`;
  // nuqtali joylar (g'ildirak 1..3 uchun)
  const ghosts = [1, 2, 3].map(i => { const g = mk("g", {}); mk("circle", { cx: PEG[i][0], cy: PEG[i][1], r: rp[i], fill: "rgba(201,168,106,.05)", stroke: "#c9a86a", "stroke-dasharray": "5 6", "stroke-width": 1.5 }, g);
    const tx = mk("text", { x: PEG[i][0], y: PEG[i][1] + 5, "text-anchor": "middle", fill: "#c9a86a", "font-family": "Arial", "font-size": 16, "font-weight": 700 }, g); tx.textContent = TEETH[i]; return g; });
  const ghost0 = mk("circle", { cx: PEG[0][0], cy: PEG[0][1], r: 6, fill: "#6d7385" });
  // chiqish: kichik soat
  const OUT = [462, 90];
  const outG = mk("g", { transform: `translate(${OUT[0]} ${OUT[1]})` });
  mk("circle", { r: 40, fill: "#14161c", stroke: "url(#gGold)", "stroke-width": 4 }, outG);
  for (let i = 0; i < 12; i++) mk("rect", { x: -1, y: -35, width: 2, height: i % 3 ? 4 : 7, fill: "#e8d3a0", transform: `rotate(${i * 30})` }, outG);
  const outHand = mk("line", { x1: 0, y1: 5, x2: 0, y2: -28, stroke: "#ff5a3c", "stroke-width": 2.5, "stroke-linecap": "round" }, outG); mk("circle", { r: 3.5, fill: "#ff5a3c" }, outG);
  const outT = mk("text", { x: OUT[0], y: OUT[1] + 62, "text-anchor": "middle", fill: "#6d7385", "font-family": "Arial", "font-size": 11 }); outT.textContent = "chiqish";

  const gear = [];   // g'ildirak holati
  for (let i = 0; i < 4; i++) {
    const g = mk("g", { class: i ? "cx16-gear" : "", tabindex: i ? 0 : -1, role: i ? "button" : "img", "aria-label": i ? `${TEETH[i]} tishli g'ildirak. Enter bilan joyiga qo'ying` : "Yetaklovchi g'ildirak" });
    mk("path", { class: "body", d: gearPath(TEETH[i]), fill: i === 0 ? "url(#gGold)" : "url(#gSteel)", stroke: "#2a2d37", "stroke-width": 1.2 }, g);
    mk("circle", { r: rp[i] * .62, fill: "none", stroke: "rgba(0,0,0,.35)", "stroke-width": 2 }, g);
    mk("circle", { r: rp[i] * .22, fill: "#14161c", stroke: "rgba(255,255,255,.4)" }, g);
    const t = mk("text", { y: 4, "text-anchor": "middle", fill: "#14161c", "font-family": "Arial", "font-size": 11, "font-weight": 700, "pointer-events": "none" }, g); t.textContent = TEETH[i];
    gear.push({ i, g, x: i ? TRAY[i - 1][0] : PEG[0][0], y: i ? TRAY[i - 1][1] : PEG[0][1], s: i ? TRAY[i - 1][2] : 1, placed: i === 0, phi: 0 });
  }
  const stEl = $("#cx16St", game);
  const placeAt = (o, x, y, s) => { o.x = x; o.y = y; o.s = s; };
  function draw() {
    gear.forEach(o => o.g.setAttribute("transform", `translate(${o.x.toFixed(1)} ${o.y.toFixed(1)}) rotate(${o.phi.toFixed(2)}) scale(${o.s})`));
    ghosts.forEach((g, k) => { g.style.opacity = gear[k + 1].placed ? 0 : 1; });
  }
  draw();
  let won = false, t0 = performance.now(), gvis = false;
  new IntersectionObserver(es => { gvis = es[0].isIntersecting; }, { threshold: 0 }).observe(game);
  function chainPhases(phi0) {
    // yetaklovchi g'ildirakdan boshlab, tishlar mos tushadigan burchaklar
    const ph = [phi0];
    for (let i = 0; i < 3; i++) {
      if (!gear[i + 1].placed || (i > 0 && ph[i] == null)) { ph.push(null); continue; }
      const th = ANG[i], a = TEETH[i], b = TEETH[i + 1];
      ph.push(th + 180 - 180 / b - (a / b) * (ph[i] - th));
    }
    return ph;
  }
  function gframe(ts) {
    if (gvis) {
      const phi0 = ((ts - t0) / 1000) * 36, ph = chainPhases(phi0);
      gear.forEach((o, i) => { if (ph[i] != null && o.placed) o.phi = ph[i]; });
      if (gear[3].placed && ph[3] != null) outHand.setAttribute("transform", `rotate(${(ph[3] * .35).toFixed(1)})`);
      draw();
    }
    requestAnimationFrame(gframe);
  }
  requestAnimationFrame(gframe);

  const toSvg = (cx, cy) => { const pt = svg.createSVGPoint(); pt.x = cx; pt.y = cy; const m = svg.getScreenCTM(); return m ? pt.matrixTransform(m.inverse()) : { x: cx, y: cy }; };
  function tween(o, x, y, s, ms, done) {
    const x0 = o.x, y0 = o.y, s0 = o.s, t0 = performance.now();
    (function st(t) { const p = clamp((t - t0) / ms, 0, 1), e = 1 - Math.pow(1 - p, 3); o.x = x0 + (x - x0) * e; o.y = y0 + (y - y0) * e; o.s = s0 + (s - s0) * e; draw(); if (p < 1) requestAnimationFrame(st); else if (done) done(); })(t0);
  }
  function checkWin() {
    if (won || !gear.every(o => o.placed)) { stEl.textContent = gear.filter(o => o.placed).length - 1 + " / 3 g'ildirak joylandi"; return; }
    won = true; stEl.textContent = "Mexanizm ishlayapti! ⚙️✓"; toast("Mexanizm yig'ildi! 🎉");
    const r = svg.getBoundingClientRect(); confetti(r.left + r.width * .6, r.top + r.height * .4);
  }
  function snap(o) { o.placed = true; o.g.classList.remove("cx16-dragging"); tween(o, PEG[o.i][0], PEG[o.i][1], 1, 160, () => { o.g.setAttribute("tabindex", -1); checkWin(); }); }
  function reject(o) {
    o.g.classList.add("cx16-shake"); setTimeout(() => o.g.classList.remove("cx16-shake"), 380);
    const T = TRAY[o.i - 1]; tween(o, T[0], T[1], T[2], 260); stEl.textContent = "Bu g'ildirak bu joyga mos emas. Raqamni tekshiring.";
  }
  gear.slice(1).forEach(o => {
    let d = null;
    o.g.addEventListener("pointerdown", e => {
      if (o.placed) return; e.preventDefault();
      const p = toSvg(e.clientX, e.clientY); d = { dx: o.x - p.x, dy: o.y - p.y }; o.s = 1; svg.appendChild(o.g); draw();
      try { o.g.setPointerCapture(e.pointerId); } catch (er) {}
    });
    o.g.addEventListener("pointermove", e => { if (!d) return; const p = toSvg(e.clientX, e.clientY); o.x = clamp(p.x + d.dx, 0, 520); o.y = clamp(p.y + d.dy, 0, 400); draw(); });
    const end = () => {
      if (!d) return; d = null;
      const own = PEG[o.i], dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (dist([o.x, o.y], own) < 42) snap(o);
      else if (PEG.slice(1).some(p => dist([o.x, o.y], p) < 42)) reject(o);
      else { const T = TRAY[o.i - 1]; tween(o, T[0], T[1], T[2], 260); }
    };
    o.g.addEventListener("pointerup", end); o.g.addEventListener("pointercancel", end);
    o.g.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && !o.placed) { e.preventDefault(); svg.appendChild(o.g); o.s = 1; snap(o); } });
  });
  $("#cx16Auto", game).onclick = () => { gear.slice(1).forEach((o, k) => { if (!o.placed) setTimeout(() => { svg.appendChild(o.g); snap(o); }, k * 380); }); };
  $("#cx16Reset", game).onclick = () => {
    won = false; stEl.textContent = "G'ildiraklarni mos joyga sudrang.";
    gear.slice(1).forEach(o => { o.placed = false; o.g.setAttribute("tabindex", 0); const T = TRAY[o.i - 1]; tween(o, T[0], T[1], T[2], 300); });
  };

  /* ---------- Qirib ochish ---------- */
  if (showScratch) {
    const sc = $("#cx16Sc", game), c = sc.getContext("2d"), cp = $("#cx16Cp", game), rev = $("#cx16Rev", game);
    const W = 340, H = 150; let down = false, last = null, moves = 0, done = false;
    const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#f6e6bb"); g.addColorStop(.35, "#c9a86a"); g.addColorStop(.65, "#e8cb88"); g.addColorStop(1, "#9b7733");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(255,255,255,${Math.random() * .12})`; c.fillRect(Math.random() * W, Math.random() * H, Math.random() * 30 + 4, 1.2); }
    c.fillStyle = "rgba(60,40,10,.75)"; c.font = "700 20px Arial"; c.textAlign = "center"; c.fillText("Ishqalang", W / 2, H / 2 - 2); c.font = "13px Arial"; c.fillText("promo-kodni ochish uchun", W / 2, H / 2 + 20);
    const pos = e => { const r = sc.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
    function cleared() { const d = c.getImageData(0, 0, W, H).data; let n = 0, t = 0; for (let y = 0; y < H; y += 5) for (let x = 0; x < W; x += 5) { t++; if (d[(y * W + x) * 4 + 3] < 40) n++; } return n / t; }
    function reveal() {
      if (done) return; done = true; sc.style.opacity = 0; sc.style.pointerEvents = "none"; cp.hidden = false; rev.hidden = true;
      const r = sc.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height / 2);
    }
    sc.addEventListener("pointerdown", e => { down = true; last = pos(e); try { sc.setPointerCapture(e.pointerId); } catch (er) {} });
    sc.addEventListener("pointermove", e => {
      if (!down || done) return; const p = pos(e);
      c.globalCompositeOperation = "destination-out"; c.lineWidth = 34; c.lineCap = "round"; c.beginPath(); c.moveTo(last[0], last[1]); c.lineTo(p[0], p[1]); c.stroke(); c.globalCompositeOperation = "source-over";
      last = p; if (++moves % 6 === 0 && cleared() > .5) reveal();
    });
    const up = () => { down = false; if (!done && cleared() > .5) reveal(); }; sc.addEventListener("pointerup", up); sc.addEventListener("pointercancel", up);
    rev.onclick = reveal;
    cp.onclick = async () => {
      try { await navigator.clipboard.writeText(SCRATCH.code); toast("Kod nusxalandi ✓"); } catch (e) { toast("Kodni qo'lda nusxalang: " + SCRATCH.code); }
      const o = $("#order"); if (o) o.scrollIntoView({ behavior: "smooth" });
    };
  }
})();