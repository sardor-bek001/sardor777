/* ===== CHRONEX chronex-max.js =====
   Mavjud kodga TEGMAYDI. index.html da </body> dan oldin bitta qator qo'shing:
       <script src="./chronex-max.js"></script>
   CSS ham shu fayl ichida.

   NIMALAR QO'SHILADI
   A) "Chronex Studio" bo'limi (4 tab):
        1. Soat ekrani simulyatori (6 ta ilova: Vaqt, Yurak, Faollik, Musiqa, Kompas, Taymer)
        2. Siferblat studiyasi (o'zingiz loyihalang, PNG yuklab oling, buyurtmaga qo'shing)
        3. Bilakda sinab ko'rish (bilak o'lchami va model bo'yicha ko'rinish)
        4. "Soniyani ushla" o'yini
   B) "Mijozlar markazi" bo'limi (3 tab): Buyurtmani kuzatish, Cheklar, Sharh qoldirish
   C) Buyurtma tayyor bo'lganda "Chekni ochish" tugmasi
   D) Saytdan chiqib ketishdan oldin promo-kod eslatmasi

   SOZLAMALAR (pastda): ORDER_STATUS_URL, EXIT_PROMO */
(function () {
  "use strict";
  if (window.__cx9) return;
  window.__cx9 = 1;

  /* ================= SOZLAMALAR ================= */
  // Buyurtma holatlari uchun JSON manzili (ixtiyoriy). Bo'sh qoldirsangiz, holatni operator Telegramda aytadi.
  // JSON ko'rinishi: {"CX123456": {"step": 3, "note": "Kuryer yo'lda"}}   (step: 1 qabul, 2 tasdiq, 3 yo'lda, 4 yetkazildi)
  const ORDER_STATUS_URL = "";
  // Chiqishdan oldingi eslatma: faqat shu sanagacha va faqat shu promo-kod haqiqatan ishlasa yoqing
  const EXIT_PROMO = { on: true, code: "CHRONEX10", pct: 10, until: "2026-12-01T23:59:59+05:00" };

  /* ================= YORDAMCHILAR ================= */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const pad = n => (n < 10 ? "0" : "") + n;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const TG = () => (typeof TG_USER !== "undefined" && TG_USER) ? TG_USER : "your_username";
  const tgUrl = t => `https://t.me/${TG()}?text=${encodeURIComponent(t)}`;
  function toast(m) {
    let box = $(".cx-toasts");
    if (!box) { box = document.createElement("div"); box.className = "cx-toasts"; document.body.appendChild(box); }
    const t = document.createElement("div"); t.className = "cx-toast"; t.textContent = m; box.appendChild(t);
    setTimeout(() => t.classList.add("out"), 2600); setTimeout(() => t.remove(), 3100);
  }
  const hex2rgb = h => { h = h.replace("#", ""); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); };
  const rgb2hex = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const shade = (hex, amt) => { const t = amt < 0 ? 0 : 255, p = Math.abs(amt); return rgb2hex(hex2rgb(hex).map(v => v + (t - v) * p)); };
  const DAYS = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
  const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];

  /* ================= CSS ================= */
  const st = document.createElement("style");
  st.textContent = `
  .cx9-tabs{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin:30px 0 36px}
  .cx9-tabs button{background:var(--card,#13161e);color:var(--muted,#9097a8);border:1px solid var(--line,#222633);padding:10px 20px;border-radius:999px;cursor:pointer;font:inherit;font-size:14px;transition:.25s}
  .cx9-tabs button:hover{border-color:var(--accent,#c9a86a);color:var(--text,#f2f3f7)}
  .cx9-tabs button.on{background:linear-gradient(135deg,var(--accent2,#e8d3a0),var(--accent,#c9a86a));color:#111;border-color:transparent;font-weight:700}
  .cx9-pane{display:none;grid-template-columns:1.05fr .95fr;gap:34px;align-items:center}
  .cx9-pane.on{display:grid;animation:cx9In .45s}
  @keyframes cx9In{from{opacity:0;transform:translateY(14px)}}
  .cx9-vis{background:var(--card,#13161e);border:1px solid var(--line,#222633);border-radius:var(--radius,18px);padding:22px;display:grid;place-items:center;min-height:380px;position:relative;overflow:hidden}
  .cx9-side{display:grid;gap:14px;align-content:center}
  .cx9-side h3{margin:0;font-size:24px}
  .cx9-side label{display:grid;gap:7px;font-size:13px;color:var(--muted,#9097a8)}
  .cx9-side input[type=range]{padding:0;border:0;background:none;accent-color:var(--accent,#c9a86a);height:24px;cursor:pointer}
  .cx9-side input[type=color]{width:100%;height:38px;padding:3px;cursor:pointer}
  .cx9-grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .cx9-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
  .cx9-how{background:var(--bg,#07080b);border:1px dashed var(--line,#222633);border-radius:14px;padding:14px 16px;font-size:13px;color:var(--muted,#9097a8)}
  .cx9-how b{color:var(--accent,#c9a86a);display:block;margin-bottom:4px}
  .cx9-chip{background:var(--card,#13161e);border:1px solid var(--line,#222633);color:var(--muted,#9097a8);border-radius:999px;padding:6px 14px;cursor:pointer;font:inherit;font-size:13px;transition:.2s}
  .cx9-chip:hover,.cx9-chip.on{border-color:var(--accent,#c9a86a);color:var(--text,#f2f3f7)}
  .cx9-chip.on{background:rgba(201,168,106,.15)}
  .cx9-sw{width:30px;height:30px;border-radius:50%;border:2px solid transparent;outline:1px solid var(--line,#222633);outline-offset:2px;cursor:pointer;padding:0}
  .cx9-sw.on{outline:2px solid var(--accent,#c9a86a)}
  .cx9-face{width:100%;max-width:360px;height:auto;display:block;filter:drop-shadow(0 22px 28px rgba(0,0,0,.55))}

  /* simulyator */
  .cx9-sim{display:grid;gap:16px;justify-items:center;width:100%}
  .cx9-bezel{position:relative;width:min(330px,78vw);aspect-ratio:1;border-radius:50%;padding:14px;outline:none;
    background:linear-gradient(145deg,#4a4f5e,#14161c 60%,#3a3e4b);box-shadow:0 30px 70px rgba(0,0,0,.6),0 0 60px rgba(201,168,106,.15)}
  .cx9-bezel:focus-visible{box-shadow:0 0 0 3px var(--accent,#c9a86a),0 30px 70px rgba(0,0,0,.6)}
  .cx9-scr{width:100%;height:100%;border-radius:50%;background:#000;overflow:hidden;position:relative;touch-action:pan-y;cursor:grab;user-select:none;-webkit-user-select:none}
  .cx9-scr:active{cursor:grabbing}
  .cx9-track{display:flex;width:600%;height:100%;transition:transform .45s cubic-bezier(.2,.8,.2,1)}
  .cx9-track.drag{transition:none}
  .cx9-pg{flex:0 0 calc(100% / 6);height:100%;display:grid;place-content:center;text-align:center;gap:6px;padding:26px;color:#f2f3f7}
  .cx9-pg small{color:#9097a8;font-size:11px;letter-spacing:.15em;text-transform:uppercase}
  .cx9-big{font-size:clamp(46px,13vw,64px);font-weight:800;letter-spacing:.02em;font-variant-numeric:tabular-nums;background:linear-gradient(135deg,#e8d3a0,#c9a86a);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1}
  .cx9-mini{display:flex;gap:12px;justify-content:center;font-size:12px;color:#9097a8;margin-top:6px}
  .cx9-mini b{color:#f2f3f7}
  .cx9-crown{position:absolute;right:-9px;top:41%;width:15px;height:46px;border-radius:5px;border:0;background:linear-gradient(90deg,#9b7733,#e8cb88);cursor:pointer}
  .cx9-crown:hover{filter:brightness(1.15)}
  .cx9-dots{display:flex;gap:8px;justify-content:center}
  .cx9-dots button{width:9px;height:9px;border-radius:50%;border:0;background:var(--line,#222633);cursor:pointer;padding:0;transition:.2s}
  .cx9-dots button.on{background:var(--accent,#c9a86a);transform:scale(1.4)}
  .cx9-bpm{font-size:30px;font-weight:800;color:#ff5a6e;font-variant-numeric:tabular-nums}
  .cx9-bpm small{color:#9097a8;font-size:11px;margin-left:4px;font-weight:400;letter-spacing:0;text-transform:none}
  .cx9-ring{transition:stroke-dasharray 1.1s cubic-bezier(.2,.8,.2,1)}
  .cx9-leg{display:flex;gap:10px;justify-content:center;font-size:10px;color:#9097a8}
  .cx9-leg i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px}
  .cx9-prog{height:4px;background:#222633;border-radius:4px;overflow:hidden;width:120px;margin:4px auto}
  .cx9-prog i{display:block;height:100%;width:0;background:linear-gradient(90deg,#e8d3a0,#c9a86a)}
  .cx9-ctl{display:flex;gap:10px;justify-content:center}
  .cx9-ctl button{width:36px;height:36px;border-radius:50%;border:1px solid #2b3040;background:#13161e;color:#f2f3f7;cursor:pointer;font-size:14px}
  .cx9-ctl button:hover{border-color:#c9a86a}
  .cx9-note{font-size:26px;animation:cx9Bob 2s ease-in-out infinite!important}
  @keyframes cx9Bob{50%{transform:translateY(-5px)}}
  .cx9-sw-t{font-size:30px;font-weight:700;font-variant-numeric:tabular-nums;color:#e8d3a0}
  .cx9-apps{display:flex;gap:8px;flex-wrap:wrap}

  /* o'yin */
  .cx9-game{text-align:center;display:grid;gap:14px;justify-items:center}
  .cx9-gt{font-size:clamp(48px,11vw,84px);font-weight:800;font-variant-numeric:tabular-nums;color:var(--accent2,#e8d3a0)}
  .cx9-gres{min-height:48px;color:var(--muted,#9097a8)}

  /* mijozlar markazi */
  .cx9-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:18px 0}
  .cx9-step{text-align:center;font-size:12px;color:var(--muted,#9097a8);position:relative;padding-top:34px}
  .cx9-step::before{content:"";position:absolute;left:50%;top:0;width:26px;height:26px;margin-left:-13px;border-radius:50%;background:var(--line,#222633);display:grid}
  .cx9-step.ok::before{content:"✓";background:var(--accent,#c9a86a);color:#111;font-weight:700;text-align:center;line-height:26px}
  .cx9-step.now::before{box-shadow:0 0 0 4px rgba(201,168,106,.3)}
  .cx9-res{background:var(--bg,#07080b);border:1px solid var(--line,#222633);border-radius:14px;padding:16px}
  .cx9-res h4{margin:0 0 4px;font-size:18px}
  .cx9-list{display:grid;gap:8px;max-height:260px;overflow:auto}
  .cx9-item{display:flex;gap:12px;align-items:center;justify-content:space-between;background:var(--card,#13161e);border:1px solid var(--line,#222633);border-radius:12px;padding:10px 14px;font-size:14px}
  .cx9-item small{display:block;color:var(--muted,#9097a8)}
  .cx9-stars{display:flex;gap:4px}
  .cx9-stars button{background:none;border:0;font-size:28px;cursor:pointer;color:var(--line,#222633);padding:0;transition:.15s}
  .cx9-stars button.on{color:var(--accent,#c9a86a)}
  .cx9-cc{max-width:760px;margin:0 auto}
  .cx9-cc .cx9-pane{grid-template-columns:1fr}
  .cx9-form{display:grid;gap:14px}
  .cx9-form label{display:grid;gap:7px;font-size:14px;color:var(--muted,#9097a8)}

  /* chiqish eslatmasi */
  .cx9-modal{position:fixed;inset:0;z-index:650;background:rgba(0,0,0,.7);display:grid;place-items:center;padding:16px;animation:cx9In .3s}
  .cx9-mbox{position:relative;background:var(--bg2,#0e1016);border:1px solid var(--accent,#c9a86a);border-radius:var(--radius,18px);padding:34px 28px;width:min(440px,100%);text-align:center;display:grid;gap:12px}
  .cx9-code{font-size:30px;font-weight:800;letter-spacing:.2em;color:var(--accent2,#e8d3a0);border:2px dashed var(--accent,#c9a86a);border-radius:14px;padding:10px}
  .cx9-x{position:absolute;top:8px;right:14px;background:none;border:0;color:var(--text,#f2f3f7);font-size:28px;cursor:pointer}

  @media(max-width:900px){.cx9-pane.on{grid-template-columns:1fr}.cx9-steps{grid-template-columns:1fr 1fr}}`;
  document.head.appendChild(st);

  /* ================= SOAT SIFERBLATI (umumiy generator) ================= */
  const RIM = {
    "Oltin": ["#f6e6bb", "#9b7733", "#e8cb88"], "Po'lat": ["#f4f6fa", "#7d8494", "#dfe3ec"],
    "Rose": ["#fbe2d8", "#b07767", "#f0c9bb"], "Qora": ["#5a5f6e", "#14161c", "#3a3e4b"]
  };
  const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  const MODELS = {
    "Chronex Aero": { mm: 42, strap: ["#14151a", "#3a3d48"], face: { dial: "#cfd4df", mark: "#1a1d26", handc: "#20232d", sec: "#2b6fff", rim: RIM["Po'lat"], style: "bars", hand: "classic", brand: "CHRONEX", date: true, secHand: true } },
    "Chronex Titan": { mm: 46, strap: ["#0a0b0e", "#2b2e38"], face: { dial: "#161820", mark: "#e8d3a0", handc: "#e8d3a0", sec: "#ff5a3c", rim: RIM["Oltin"], style: "bars", hand: "sword", brand: "CHRONEX", date: true, secHand: true } },
    "Chronex Nova": { mm: 38, strap: ["#3a2018", "#8a5340"], face: { dial: "#efe3d3", mark: "#5e362c", handc: "#5e362c", sec: "#b5473a", rim: RIM["Rose"], style: "roman", hand: "baton", brand: "CHRONEX", date: false, secHand: true } }
  };

  function handPath(kind, len, w) {
    if (kind === "sword") return `M${-w * 1.1} 14 L${-w * 1.3} ${-len * .18} L0 ${-len} L${w * 1.3} ${-len * .18} L${w * 1.1} 14Z`;
    if (kind === "baton") return `M${-w * .6} 14 L${-w * .6} ${-len} L${w * .6} ${-len} L${w * .6} 14Z`;
    return `M${-w} 14 L${-w * .7} 0 L${-w * .5} ${-len + 8} L0 ${-len} L${w * .5} ${-len + 8} L${w * .7} 0 L${w} 14Z`;
  }

  function faceInner(c, p) {
    const d0 = shade(c.dial, .2), d1 = shade(c.dial, -.5);
    let m = "";
    for (let i = 0; i < 60; i++) {
      const a = i * 6;
      if (i % 5 === 0) {
        const k = i / 5;
        if (c.style === "bars") m += `<rect x="146.5" y="42" width="7" height="22" rx="1.5" fill="${c.mark}" transform="rotate(${a} 150 150)"/>`;
        else if (c.style === "dots") m += `<circle cx="150" cy="54" r="${k % 3 === 0 ? 6 : 4}" fill="${c.mark}" transform="rotate(${a} 150 150)"/>`;
        else {
          const r = Math.PI * a / 180, roman = c.style === "roman";
          m += `<text x="${(150 + 90 * Math.sin(r)).toFixed(1)}" y="${(150 - 90 * Math.cos(r) + (roman ? 5 : 7)).toFixed(1)}" text-anchor="middle" font-family="${roman ? "Georgia,serif" : "Arial,sans-serif"}" font-size="${roman ? 17 : 20}" font-weight="${roman ? 400 : 700}" fill="${c.mark}">${roman ? ROMAN[k] : (k === 0 ? 12 : k)}</text>`;
        }
      } else m += `<rect x="149.4" y="34" width="1.2" height="5" fill="${c.mark}" opacity=".6" transform="rotate(${a} 150 150)"/>`;
    }
    let burst = "";
    for (let i = 0; i < 60; i++) burst += `<line x1="150" y1="150" x2="150" y2="18" stroke="#fff" stroke-opacity=".05" transform="rotate(${i * 6} 150 150)"/>`;
    const brand = String(c.brand || "").slice(0, 14);
    const date = c.date ? `<rect x="196" y="141" width="28" height="18" rx="2" fill="#f4f1e8" stroke="rgba(0,0,0,.35)"/><text data-date x="210" y="154.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="#111">${new Date().getDate()}</text>` : "";
    return `<defs>
<linearGradient id="${p}rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.rim[0]}"/><stop offset=".5" stop-color="${c.rim[1]}"/><stop offset="1" stop-color="${c.rim[2]}"/></linearGradient>
<radialGradient id="${p}dial" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="${d0}"/><stop offset="1" stop-color="${d1}"/></radialGradient>
<linearGradient id="${p}shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<clipPath id="${p}clip"><circle cx="150" cy="150" r="132"/></clipPath></defs>
<circle cx="150" cy="150" r="148" fill="url(#${p}rim)"/><circle cx="150" cy="150" r="140" fill="#0b0b0f"/><circle cx="150" cy="150" r="132" fill="url(#${p}dial)"/>
<g clip-path="url(#${p}clip)">${burst}</g>${m}
<text x="150" y="${c.style === "roman" || c.style === "arabic" ? 112 : 104}" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" letter-spacing="4" fill="${c.mark}">${esc(brand)}</text>${date}
<g data-hand="h" transform="translate(150 150)"><path d="${handPath(c.hand, 68, 4.5)}" fill="${c.handc}" stroke="rgba(0,0,0,.35)" stroke-width=".6"/></g>
<g data-hand="m" transform="translate(150 150)"><path d="${handPath(c.hand, 100, 3.5)}" fill="${c.handc}" stroke="rgba(0,0,0,.35)" stroke-width=".6"/></g>
${c.secHand ? `<g data-hand="s" transform="translate(150 150)"><line x1="0" y1="26" x2="0" y2="-112" stroke="${c.sec}" stroke-width="1.6" stroke-linecap="round"/><circle cy="20" r="4" fill="${c.sec}"/></g>` : ""}
<circle cx="150" cy="150" r="6" fill="${c.sec}"/><circle cx="150" cy="150" r="2.2" fill="#111"/>
<g clip-path="url(#${p}clip)"><ellipse cx="108" cy="92" rx="100" ry="50" fill="url(#${p}shine)" transform="rotate(-28 108 92)"/></g>`;
  }
  const faceSVG = (c, p, cls) => `<svg class="${cls || ""}" viewBox="0 0 300 300" role="img" aria-label="Soat siferblati" xmlns="http://www.w3.org/2000/svg">${faceInner(c, p)}</svg>`;

  function setHands(root, d, fixed) {
    let h, m, s;
    if (fixed) { s = 35; m = 10 + s / 60; h = 10 + m / 60; } // reklama holati: 10:10:35
    else { s = d.getSeconds() + d.getMilliseconds() / 1000; m = d.getMinutes() + s / 60; h = (d.getHours() % 12) + m / 60; }
    const set = (k, a) => { const g = root.querySelector(`[data-hand="${k}"]`); if (g) g.setAttribute("transform", `translate(150 150) rotate(${a.toFixed(2)})`); };
    set("h", h * 30); set("m", m * 6); set("s", s * 6);
  }

  /* ================= TAB YORDAMCHISI ================= */
  function tabs(root) {
    const bs = $$(".cx9-tabs button", root), ps = $$(".cx9-pane", root);
    bs.forEach(b => b.onclick = () => {
      bs.forEach(x => x.classList.toggle("on", x === b));
      ps.forEach(p => p.classList.toggle("on", p.dataset.p === b.dataset.t));
    });
  }
  const paneOn = (root, id) => { const p = $(`.cx9-pane[data-p="${id}"]`, root); return !!p && p.classList.contains("on"); };

  /* ================================================================
     A) CHRONEX STUDIO
     ================================================================ */
  const studio = document.createElement("section");
  studio.className = "section"; studio.id = "cx9Studio";
  studio.innerHTML = `<div class="container">
    <p class="eyebrow center">Chronex Studio</p>
    <h2 class="center">Soatni o'zingiz sinab ko'ring</h2>
    <p class="center muted">Ekranni bosib ko'ring, siferblat loyihalang, bilagingizda qanday turishini ko'ring.</p>
    <div class="cx9-tabs" role="tablist">
      <button type="button" class="on" data-t="s">📱 Simulyator</button>
      <button type="button" data-t="d">🎨 Siferblat studiyasi</button>
      <button type="button" data-t="t">👤 Bilakda ko'rish</button>
      <button type="button" data-t="g">🎮 Soniyani ushla</button>
    </div>

    <!-- SIMULYATOR -->
    <div class="cx9-pane on" data-p="s">
      <div class="cx9-vis"><div class="cx9-sim">
        <div class="cx9-bezel" id="cx9Bz" tabindex="0" aria-label="Soat ekrani simulyatori. Chap va o'ng strelka tugmalari bilan almashtiring">
          <div class="cx9-scr" id="cx9Scr"><div class="cx9-track" id="cx9Track">
            <div class="cx9-pg"><small id="cx9TD">—</small><div class="cx9-big" id="cx9T">--:--</div><div class="cx9-sw-t" id="cx9TS" style="font-size:18px;color:#9097a8">00</div>
              <div class="cx9-mini"><span>👟 <b id="cx9St">6 240</b></span><span>♥ <b id="cx9B0">72</b></span><span>🔋 <b>87%</b></span></div></div>
            <div class="cx9-pg"><small>Yurak ritmi</small><canvas id="cx9Ecg" width="240" height="100" style="width:100%;max-width:200px;margin:auto"></canvas>
              <div class="cx9-bpm"><span id="cx9B1">72</span><small>urish/daq</small></div><small>SpO₂ 98%</small></div>
            <div class="cx9-pg"><small>Faollik</small>
              <svg viewBox="0 0 140 140" width="136" height="136" style="margin:auto;transform:rotate(-90deg)">
                <g fill="none" stroke-linecap="round" stroke-width="9">
                  <circle cx="70" cy="70" r="58" stroke="#2a1a1d"/><circle class="cx9-ring" id="cx9R1" cx="70" cy="70" r="58" stroke="#ff5a6e" stroke-dasharray="0 400"/>
                  <circle cx="70" cy="70" r="46" stroke="#1d2a1f"/><circle class="cx9-ring" id="cx9R2" cx="70" cy="70" r="46" stroke="#7ee8a8" stroke-dasharray="0 400"/>
                  <circle cx="70" cy="70" r="34" stroke="#162630"/><circle class="cx9-ring" id="cx9R3" cx="70" cy="70" r="34" stroke="#7ee8ff" stroke-dasharray="0 400"/></g></svg>
              <div class="cx9-leg"><span><i style="background:#ff5a6e"></i>78%</span><span><i style="background:#7ee8a8"></i>54%</span><span><i style="background:#7ee8ff"></i>90%</span></div></div>
            <div class="cx9-pg"><div class="cx9-note">♪</div><b>Chronex Beats</b><small>Namuna trek</small>
              <div class="cx9-prog"><i id="cx9Pr"></i></div>
              <div class="cx9-ctl"><button type="button" aria-label="Oldingi" data-m="prev">⏮</button><button type="button" id="cx9Play" aria-label="Ijro">▶</button><button type="button" aria-label="Keyingi" data-m="next">⏭</button></div></div>
            <div class="cx9-pg"><small>Kompas</small>
              <svg viewBox="0 0 120 120" width="120" height="120" style="margin:auto"><circle cx="60" cy="60" r="54" fill="none" stroke="#2b3040" stroke-width="2"/>
                <g font-family="Arial" font-size="11" fill="#9097a8" text-anchor="middle"><text x="60" y="16">N</text><text x="106" y="64">E</text><text x="60" y="112">S</text><text x="14" y="64">W</text></g>
                <g id="cx9Nd"><path d="M60 22 L66 60 L60 56 L54 60Z" fill="#ff5a3c"/><path d="M60 98 L66 60 L60 64 L54 60Z" fill="#e8d3a0"/></g><circle cx="60" cy="60" r="3" fill="#111" stroke="#c9a86a"/></svg>
              <div class="cx9-sw-t" id="cx9Hd" style="font-size:18px">0° N</div></div>
            <div class="cx9-pg"><small>Taymer</small><div class="cx9-sw-t" id="cx9Sw">00:00.0</div>
              <div class="cx9-ctl"><button type="button" id="cx9SwGo" aria-label="Boshlash / to'xtatish">▶</button><button type="button" id="cx9SwRs" aria-label="Nolga">↺</button></div></div>
          </div></div>
          <button class="cx9-crown" id="cx9Crown" type="button" aria-label="Keyingi ekran"></button>
        </div>
        <div class="cx9-dots" id="cx9SD"></div>
      </div></div>
      <div class="cx9-side">
        <h3>Soat ichidagi ilovalar</h3>
        <div class="cx9-apps" id="cx9Apps"></div>
        <div class="cx9-how"><b>Qanday ishlaydi</b>Ekranni chapga yoki o'ngga suring (sichqoncha bilan sudrang), yon tomondagi tojni bosing yoki klaviaturadagi ← → tugmalaridan foydalaning. Vaqt haqiqiy. Yurak, qadam, faollik va musiqa ma'lumotlari <b style="display:inline;color:inherit">namuna</b>, soat nima ko'rsatishini namoyish qilish uchun. Kompas strelkasi sichqonchaga qarab buriladi.</div>
      </div>
    </div>

    <!-- SIFERBLAT STUDIYASI -->
    <div class="cx9-pane" data-p="d">
      <div class="cx9-vis" id="cx9DV"></div>
      <div class="cx9-side">
        <h3>O'z siferblatingizni yarating</h3>
        <div class="cx9-grid2">
          <label>Belgilar uslubi<select id="cx9DS"><option value="bars">Chiziqlar</option><option value="arabic">Arab raqamlari</option><option value="roman">Rim raqamlari</option><option value="dots">Nuqtalar</option></select></label>
          <label>Strelka shakli<select id="cx9DH"><option value="classic">Klassik</option><option value="sword">Qilich</option><option value="baton">Nozik</option></select></label>
          <label>Siferblat rangi<input type="color" id="cx9DD" value="#161820"></label>
          <label>Belgilar rangi<input type="color" id="cx9DM" value="#e8d3a0"></label>
          <label>Strelka rangi<input type="color" id="cx9DHC" value="#e8d3a0"></label>
          <label>Soniya strelkasi<input type="color" id="cx9DSC" value="#ff5a3c"></label>
          <label>Korpus<select id="cx9DR"></select></label>
          <label>Yozuv (14 belgigacha)<input id="cx9DB" maxlength="14" value="CHRONEX"></label>
        </div>
        <div class="cx9-row">
          <label class="cx9-row" style="display:flex"><input type="checkbox" id="cx9DDt" checked style="width:18px;height:18px;accent-color:var(--accent,#c9a86a)"> Sana oynasi</label>
          <label class="cx9-row" style="display:flex"><input type="checkbox" id="cx9DPs" style="width:18px;height:18px;accent-color:var(--accent,#c9a86a)"> 10:10 holati</label>
        </div>
        <div class="cx9-row"><button class="btn btn-sm btn-ghost" id="cx9DRnd" type="button">🎲 Tasodifiy</button><button class="btn btn-sm btn-ghost" id="cx9DPng" type="button">⬇ PNG yuklab olish</button><button class="btn btn-sm" id="cx9DAdd" type="button">Buyurtmaga qo'shish</button></div>
        <div class="cx9-how"><b>Qanday ishlaydi</b>Tanlovlaringiz siferblatda darrov ko'rinadi va soat yurib turadi. «PNG yuklab olish» siferblatni rasm (telefon yoki kompyuter fon rasmi sifatida) qilib saqlaydi. «Buyurtmaga qo'shish» dizayn tavsifini buyurtma izohiga yozadi. Maxsus siferblatning mavjudligi va narxini operator tasdiqlaydi.</div>
      </div>
    </div>

    <!-- BILAKDA KO'RISH -->
    <div class="cx9-pane" data-p="t">
      <div class="cx9-vis" id="cx9TV"></div>
      <div class="cx9-side">
        <h3>Bilagingizda qanday turadi?</h3>
        <label>Model<select id="cx9TM"></select></label>
        <label><span>Bilak aylanasi: <b id="cx9TWv" style="color:var(--accent,#c9a86a)">16</b> sm</span><input type="range" id="cx9TW" min="12" max="22" step="0.5" value="16"></label>
        <div><div class="muted" style="font-size:13px;margin-bottom:8px">Teri rangi</div><div class="cx9-row" id="cx9TSk"></div></div>
        <div class="cx9-res"><h4 id="cx9TVer">—</h4><div class="muted" id="cx9TInfo" style="font-size:14px"></div></div>
        <button class="btn btn-sm" id="cx9TPick" type="button">Shu modelni tanlash</button>
        <div class="cx9-how"><b>Qanday ishlaydi</b>Bilak aylanasidan uning taxminiy kengligi hisoblanadi, soat korpusi diametri shunga solishtiriladi. Odatda korpus bilak kengligining taxminan 65–80% ini egallasa, soat chiroyli ko'rinadi. Bu taxminiy tavsiya: bilak shakli va qalinligi odamdan odamga farq qiladi.</div>
      </div>
    </div>

    <!-- O'YIN -->
    <div class="cx9-pane" data-p="g">
      <div class="cx9-vis"><div class="cx9-game">
        <div class="muted">Maqsad: aynan <b style="color:var(--accent2,#e8d3a0)">5.00</b> soniyada to'xtating</div>
        <div class="cx9-gt" id="cx9GT">0.00</div>
        <button class="btn" id="cx9GB" type="button">BOSHLASH</button>
        <div class="cx9-gres" id="cx9GR">Birinchi soniyalarda vaqt ko'rinadi, keyin yashirinadi.</div>
        <div class="muted" id="cx9GBest" style="font-size:14px"></div>
      </div></div>
      <div class="cx9-side">
        <h3>Soniyani ushla</h3>
        <p class="muted">Haqiqiy soatsoz vaqtni ichida his qiladi. Siz ham sinab ko'ring.</p>
        <div class="cx9-how"><b>Qanday ishlaydi</b>«Boshlash» ni bosing. Taymer 1,5 soniya ko'rinadi, so'ng yashirinadi. Siz 5 soniya o'tdi deb o'ylaganingizda «To'xtatish» ni bosing. Natija 5.00 ga qanchalik yaqin bo'lsa, shuncha yaxshi. Eng yaxshi natijangiz shu qurilmada saqlanadi.</div>
      </div>
    </div>
  </div>`;
  const tech = $("#technology");
  if (tech) tech.after(studio);
  else { const a = $("#story") || $("#order") || $(".footer"); if (a) a.before(studio); else document.body.appendChild(studio); }
  tabs(studio);

  /* ---------- 1. SIMULYATOR ---------- */
  const PAGES = ["Vaqt", "Yurak", "Faollik", "Musiqa", "Kompas", "Taymer"];
  let page = 0, bpm = 72, playing = false, mus = 0, swRun = false, swT = 0, swS = 0, compass = 0, mouse = null;
  const track = $("#cx9Track", studio), scr = $("#cx9Scr", studio), bz = $("#cx9Bz", studio);
  const dotsBox = $("#cx9SD", studio), appsBox = $("#cx9Apps", studio);
  PAGES.forEach((n, i) => {
    const d = document.createElement("button"); d.type = "button"; d.setAttribute("aria-label", n); d.onclick = () => go(i); dotsBox.appendChild(d);
    const a = document.createElement("button"); a.type = "button"; a.className = "cx9-chip"; a.textContent = n; a.onclick = () => go(i); appsBox.appendChild(a);
  });
  const RINGS = [["cx9R1", 58, .78], ["cx9R2", 46, .54], ["cx9R3", 34, .9]];
  function go(i) {
    page = (i + PAGES.length) % PAGES.length;
    track.style.transform = `translateX(${-page * 100 / 6}%)`;
    $$("button", dotsBox).forEach((b, k) => b.classList.toggle("on", k === page));
    $$("button", appsBox).forEach((b, k) => b.classList.toggle("on", k === page));
    RINGS.forEach(([id, r, v]) => { const c = 2 * Math.PI * r; $("#" + id, studio).setAttribute("stroke-dasharray", page === 2 ? `${(c * v).toFixed(1)} ${c.toFixed(1)}` : `0 ${c.toFixed(1)}`); });
  }
  go(0);
  $("#cx9Crown", studio).onclick = () => go(page + 1);
  bz.addEventListener("keydown", e => { if (e.key === "ArrowRight") { go(page + 1); e.preventDefault(); } if (e.key === "ArrowLeft") { go(page - 1); e.preventDefault(); } });

  // sudrab almashtirish
  (function () {
    let down = false, x0 = 0, dx = 0, moved = false;
    scr.addEventListener("pointerdown", e => { if (e.target.closest("button")) return; down = true; moved = false; x0 = e.clientX; dx = 0; track.classList.add("drag"); try { scr.setPointerCapture(e.pointerId); } catch (er) {} });
    scr.addEventListener("pointermove", e => {
      if (!down) return; dx = e.clientX - x0; if (Math.abs(dx) > 4) moved = true;
      track.style.transform = `translateX(calc(${-page * 100 / 6}% + ${dx}px))`;
    });
    const end = () => { if (!down) return; down = false; track.classList.remove("drag"); if (dx < -40) go(page + 1); else if (dx > 40) go(page - 1); else go(page); };
    scr.addEventListener("pointerup", end); scr.addEventListener("pointercancel", end);
  })();

  // musiqa
  const playBtn = $("#cx9Play", studio);
  playBtn.onclick = () => { playing = !playing; playBtn.textContent = playing ? "⏸" : "▶"; };
  $$("[data-m]", studio).forEach(b => b.onclick = () => { mus = 0; });
  // taymer
  $("#cx9SwGo", studio).onclick = function () {
    if (swRun) { swT += performance.now() - swS; swRun = false; this.textContent = "▶"; }
    else { swS = performance.now(); swRun = true; this.textContent = "⏸"; }
  };
  $("#cx9SwRs", studio).onclick = () => { swRun = false; swT = 0; $("#cx9SwGo", studio).textContent = "▶"; $("#cx9Sw", studio).textContent = "00:00.0"; };
  addEventListener("pointermove", e => { mouse = { x: e.clientX, y: e.clientY }; }, { passive: true });

  // ECG
  const ecg = $("#cx9Ecg", studio), ectx = ecg.getContext("2d"), buf = new Array(240).fill(0);
  let phase = 0;
  const g = (x, mu, s) => Math.exp(-((x - mu) ** 2) / (2 * s * s));
  const wave = t => .12 * g(t, .12, .03) - .1 * g(t, .27, .008) + 1 * g(t, .30, .010) - .22 * g(t, .33, .010) + .24 * g(t, .56, .05);
  function ecgStep(dt) {
    const n = Math.max(1, Math.round(dt * .08));
    for (let k = 0; k < n; k++) { phase = (phase + (1 / 80) * (bpm / 60)) % 1; buf.push(wave(phase) + (Math.random() - .5) * .02); buf.shift(); }
    ectx.clearRect(0, 0, 240, 100);
    ectx.strokeStyle = "rgba(255,90,110,.12)"; ectx.lineWidth = 1;
    for (let x = 0; x < 240; x += 20) { ectx.beginPath(); ectx.moveTo(x, 0); ectx.lineTo(x, 100); ectx.stroke(); }
    ectx.strokeStyle = "#ff5a6e"; ectx.lineWidth = 2; ectx.shadowColor = "#ff5a6e"; ectx.shadowBlur = 8; ectx.beginPath();
    buf.forEach((v, i) => { const y = 72 - v * 56; i ? ectx.lineTo(i, y) : ectx.moveTo(i, y); }); ectx.stroke(); ectx.shadowBlur = 0;
  }
  setInterval(() => {
    bpm = 66 + Math.round(Math.random() * 12);
    ["cx9B0", "cx9B1"].forEach(id => { $("#" + id, studio).textContent = bpm; });
  }, 2200);
  let steps = 6240; setInterval(() => { steps += 1 + Math.round(Math.random() * 3); $("#cx9St", studio).textContent = steps.toLocaleString("ru-RU"); }, 2500);

  /* ---------- 2. SIFERBLAT STUDIYASI ---------- */
  const ds = Object.assign({}, MODELS["Chronex Titan"].face);
  const dv = $("#cx9DV", studio), rimSel = $("#cx9DR", studio);
  Object.keys(RIM).forEach(k => { const o = document.createElement("option"); o.value = k; o.textContent = k; rimSel.appendChild(o); });
  let dFace = null, dPose = false;
  function renderDesign() { dv.innerHTML = faceSVG(ds, "dz", "cx9-face"); dFace = dv.firstElementChild; setHands(dFace, new Date(), dPose); }
  const bind = (id, key, ev, fn) => { const el = $("#" + id, studio); el.addEventListener(ev || "input", () => { ds[key] = fn ? fn(el) : el.value; renderDesign(); }); return el; };
  bind("cx9DS", "style", "change"); bind("cx9DH", "hand", "change");
  bind("cx9DD", "dial"); bind("cx9DM", "mark"); bind("cx9DHC", "handc"); bind("cx9DSC", "sec");
  bind("cx9DB", "brand"); bind("cx9DDt", "date", "change", el => el.checked);
  rimSel.value = "Oltin"; rimSel.addEventListener("change", () => { ds.rim = RIM[rimSel.value]; renderDesign(); });
  $("#cx9DPs", studio).addEventListener("change", e => { dPose = e.target.checked; renderDesign(); });
  $("#cx9DRnd", studio).onclick = () => {
    const rc = () => "#" + [0, 0, 0].map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join("");
    const pick = a => a[Math.floor(Math.random() * a.length)];
    ds.style = pick(["bars", "arabic", "roman", "dots"]); ds.hand = pick(["classic", "sword", "baton"]);
    ds.dial = rc(); const light = (hex2rgb(ds.dial).reduce((a, b) => a + b, 0) / 765) > .55;
    ds.mark = light ? "#1a1d26" : "#f2f3f7"; ds.handc = ds.mark; ds.sec = rc(); ds.rim = RIM[pick(Object.keys(RIM))];
    $("#cx9DS", studio).value = ds.style; $("#cx9DH", studio).value = ds.hand; $("#cx9DD", studio).value = ds.dial;
    $("#cx9DM", studio).value = ds.mark; $("#cx9DHC", studio).value = ds.handc; $("#cx9DSC", studio).value = ds.sec;
    rimSel.value = Object.keys(RIM).find(k => RIM[k] === ds.rim); renderDesign();
  };
  const STYLE_N = { bars: "chiziqlar", arabic: "arab raqamlari", roman: "rim raqamlari", dots: "nuqtalar" };
  const HAND_N = { classic: "klassik", sword: "qilich", baton: "nozik" };
  $("#cx9DAdd", studio).onclick = () => {
    const note = $("#note");
    if (!note) { toast("Buyurtma formasi topilmadi"); return; }
    const line = `Siferblat dizayni: ${STYLE_N[ds.style]}, strelka: ${HAND_N[ds.hand]}, siferblat ${ds.dial}, belgilar ${ds.mark}, strelka ${ds.handc}, soniya ${ds.sec}, yozuv «${ds.brand}»`;
    const rest = note.value.replace(/Siferblat dizayni:[^\n]*\n?/g, "").trim();
    note.value = (rest ? rest + "\n" : "") + line;
    note.dispatchEvent(new Event("input", { bubbles: true }));
    toast("Dizayn buyurtma izohiga qo'shildi ✓");
    const o = $("#order"); if (o) o.scrollIntoView({ behavior: "smooth" });
  };
  $("#cx9DPng", studio).onclick = () => {
    try {
      setHands(dFace, new Date(), dPose);
      const clone = dFace.cloneNode(true); clone.setAttribute("width", 1200); clone.setAttribute("height", 1200);
      const xml = new XMLSerializer().serializeToString(clone);
      const img = new Image();
      img.onload = () => {
        const cv = document.createElement("canvas"); cv.width = cv.height = 1200;
        cv.getContext("2d").drawImage(img, 0, 0, 1200, 1200);
        cv.toBlob(b => {
          if (!b) { toast("Rasmni yaratib bo'lmadi"); return; }
          const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "chronex-siferblat.png";
          document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
          toast("PNG yuklab olindi ✓");
        }, "image/png");
      };
      img.onerror = () => toast("Rasmni yaratib bo'lmadi");
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
    } catch (e) { toast("Rasmni yaratib bo'lmadi"); }
  };
  renderDesign();

  /* ---------- 3. BILAKDA KO'RISH ---------- */
  const tv = $("#cx9TV", studio), tm = $("#cx9TM", studio), tw = $("#cx9TW", studio);
  Object.keys(MODELS).forEach(k => { const o = document.createElement("option"); o.value = k; o.textContent = k + " (" + MODELS[k].mm + " mm)"; tm.appendChild(o); });
  tm.value = "Chronex Titan";
  const SKIN = ["#f1c9a5", "#d9a679", "#b07a4f", "#7a4b2e"]; let skin = SKIN[1], tFace = null;
  const skBox = $("#cx9TSk", studio);
  SKIN.forEach((c, i) => { const b = document.createElement("button"); b.type = "button"; b.className = "cx9-sw" + (i === 1 ? " on" : ""); b.style.background = c; b.setAttribute("aria-label", "Teri rangi " + (i + 1)); b.onclick = () => { skin = c; $$("button", skBox).forEach(x => x.classList.toggle("on", x === b)); renderTry(); }; skBox.appendChild(b); });
  function renderTry() {
    const M = MODELS[tm.value], cir = +tw.value; $("#cx9TWv", studio).textContent = cir;
    const wMM = cir * 10 / Math.PI * 1.15, pxmm = 5, armH = wMM * pxmm, cy = 210, cx = 280, caseD = M.mm * pxmm;
    const lug = 20 * pxmm * .9, top = cy - armH / 2, d0 = shade(skin, .18), d1 = shade(skin, -.28);
    tv.innerHTML = `<svg viewBox="0 0 560 420" style="width:100%;max-width:560px;height:auto" role="img" aria-label="Soat bilakda">
      <defs><linearGradient id="toarm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${d0}"/><stop offset=".5" stop-color="${skin}"/><stop offset="1" stop-color="${d1}"/></linearGradient>
      <linearGradient id="tostrap" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${M.strap[0]}"/><stop offset=".5" stop-color="${M.strap[1]}"/><stop offset="1" stop-color="${M.strap[0]}"/></linearGradient></defs>
      <rect x="-30" y="${top.toFixed(1)}" width="620" height="${armH.toFixed(1)}" rx="${(armH * .16).toFixed(1)}" fill="url(#toarm)"/>
      <g stroke="rgba(0,0,0,.1)" fill="none"><path d="M40 ${cy - armH * .2} Q90 ${cy - armH * .25} 140 ${cy - armH * .2}"/><path d="M430 ${cy + armH * .22} Q490 ${cy + armH * .27} 550 ${cy + armH * .22}"/></g>
      <rect x="${(cx - lug / 2).toFixed(1)}" y="${(top - 4).toFixed(1)}" width="${lug.toFixed(1)}" height="${(armH + 8).toFixed(1)}" rx="8" fill="url(#tostrap)"/>
      <g stroke="rgba(255,255,255,.25)" stroke-dasharray="5 4" fill="none"><path d="M${(cx - lug / 2 + 8).toFixed(1)} ${(top - 2).toFixed(1)} V${(top + armH + 2).toFixed(1)}"/><path d="M${(cx + lug / 2 - 8).toFixed(1)} ${(top - 2).toFixed(1)} V${(top + armH + 2).toFixed(1)}"/></g>
      <rect x="${(cx + caseD / 2 - 2).toFixed(1)}" y="${cy - 12}" width="14" height="24" rx="4" fill="#b9bcc7"/>
      <ellipse cx="${cx + 4}" cy="${cy + 8}" rx="${(caseD / 2 + 4).toFixed(1)}" ry="${(caseD / 2 + 2).toFixed(1)}" fill="rgba(0,0,0,.28)"/>
      <svg x="${(cx - caseD / 2).toFixed(1)}" y="${(cy - caseD / 2).toFixed(1)}" width="${caseD}" height="${caseD}" viewBox="0 0 300 300" id="cx9TFace">${faceInner(M.face, "to")}</svg>
      <g stroke="#e8d3a0" stroke-width="1" fill="#e8d3a0" font-family="Arial" font-size="12"><line x1="${(cx - caseD / 2).toFixed(1)}" y1="${(top + armH + 24).toFixed(1)}" x2="${(cx + caseD / 2).toFixed(1)}" y2="${(top + armH + 24).toFixed(1)}"/>
      <text stroke="none" x="${cx}" y="${(top + armH + 42).toFixed(1)}" text-anchor="middle">${M.mm} mm</text></g></svg>`;
    tFace = $("#cx9TFace", tv); setHands(tFace, new Date());
    const ratio = M.mm / wMM, pct = Math.round(ratio * 100);
    let verdict, info;
    if (ratio < .6) { verdict = "Bilagingizga nisbatan kichik"; info = "Nafis va yengil ko'rinadi. Katta o'lchamni yoqtirsangiz, kattaroq modelni ko'ring."; }
    else if (ratio <= .8) { verdict = "Ideal nisbat ✓"; info = "Korpus bilak kengligiga uyg'un joylashadi. Kundalik taqish uchun qulay."; }
    else if (ratio <= .9) { verdict = "Yirik, sport uslubi"; info = "Aniq ko'rinadigan soat bo'ladi. Yirik soatlarni yaxshi ko'rsangiz, mos keladi."; }
    else { verdict = "Bilagingiz uchun katta bo'lishi mumkin"; info = "Korpus bilak chetlaridan chiqib ketishi mumkin. Kichikroq modelni ko'rib chiqing."; }
    $("#cx9TVer", studio).textContent = verdict;
    $("#cx9TInfo", studio).innerHTML = `Korpus bilak kengligining taxminan <b>${pct}%</b> ini egallaydi.<br>${info}<br><span style="font-size:12px">Tasma uzunligi: bilak aylanasi + 1,5–2 sm zaxira bilan tanlang (≈ ${(cir + 1.5).toFixed(1)}–${(cir + 2).toFixed(1)} sm).</span>`;
  }
  tm.addEventListener("change", renderTry); tw.addEventListener("input", renderTry); renderTry();
  $("#cx9TPick", studio).onclick = () => {
    const sel = $("#model"); if (sel) { sel.value = tm.value; sel.dispatchEvent(new Event("change")); }
    const o = $("#order"); if (o) o.scrollIntoView({ behavior: "smooth" });
  };

  /* ---------- 4. O'YIN ---------- */
  const gt = $("#cx9GT", studio), gb = $("#cx9GB", studio), gr = $("#cx9GR", studio), gbest = $("#cx9GBest", studio);
  let gRun = false, g0 = 0, gIv = null, best = store.get("cx9_gbest", null);
  const showBest = () => { gbest.textContent = best == null ? "" : `Eng yaxshi natijangiz: ${best.toFixed(2)} s ga yaqinlik farqi`; };
  showBest();
  gb.onclick = () => {
    if (!gRun) {
      gRun = true; g0 = performance.now(); gb.textContent = "TO'XTATISH"; gr.textContent = "Ichingizda sanang...";
      gIv = setInterval(() => { const t = (performance.now() - g0) / 1000; gt.textContent = t < 1.5 ? t.toFixed(2) : "?.??"; }, 30);
    } else {
      clearInterval(gIv); gRun = false; gb.textContent = "YANA BOSHLASH";
      const t = (performance.now() - g0) / 1000, diff = Math.abs(t - 5);
      gt.textContent = t.toFixed(2);
      const v = diff < .05 ? "🎯 Ajoyib! Haqiqiy soatsoz!" : diff < .2 ? "👏 Juda yaxshi!" : diff < .5 ? "🙂 Yomon emas" : "⌚ Yana urinib ko'ring";
      gr.innerHTML = `${v}<br>5.00 dan farq: <b>${diff.toFixed(2)} s</b>`;
      if (best == null || diff < best) { best = diff; store.set("cx9_gbest", best); showBest(); if (diff < 1) toast("Yangi rekord! 🏆"); }
    }
  };

  /* ---------- UMUMIY ANIMATSIYA SIKLI ---------- */
  let visible = false, lastT = 0, lastSec = -1, lastTry = -1;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(studio);
  function loop(ts) {
    const dt = lastT ? Math.min(100, ts - lastT) : 16; lastT = ts;
    if (visible) {
      const now = new Date(), sec = now.getSeconds();
      if (paneOn(studio, "s")) {
        if (sec !== lastSec) {
          lastSec = sec;
          $("#cx9T", studio).textContent = pad(now.getHours()) + ":" + pad(now.getMinutes());
          $("#cx9TS", studio).textContent = pad(sec);
          $("#cx9TD", studio).textContent = DAYS[now.getDay()] + ", " + now.getDate() + " " + MONTHS[now.getMonth()];
        }
        if (page === 1) ecgStep(dt);
        if (page === 3 && playing) { mus = (mus + dt / 30000) % 1; $("#cx9Pr", studio).style.width = (mus * 100).toFixed(1) + "%"; }
        if (page === 4) {
          const r = $("#cx9Nd", studio).getBoundingClientRect();
          const target = mouse ? Math.atan2(mouse.x - (r.left + r.width / 2), -(mouse.y - (r.top + r.height / 2))) * 180 / Math.PI : Math.sin(ts / 2500) * 25;
          let diff = ((target - compass + 540) % 360) - 180; compass += diff * .08;
          $("#cx9Nd", studio).setAttribute("transform", `rotate(${compass.toFixed(1)} 60 60)`);
          const h = ((Math.round(compass) % 360) + 360) % 360;
          $("#cx9Hd", studio).textContent = h + "° " + ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(h / 45) % 8];
        }
        if (page === 5 && swRun) { const t = swT + performance.now() - swS; $("#cx9Sw", studio).textContent = pad(Math.floor(t / 60000)) + ":" + pad(Math.floor(t / 1000) % 60) + "." + Math.floor(t / 100) % 10; }
      }
      if (paneOn(studio, "d")) setHands(dFace, now, dPose);
      if (paneOn(studio, "t") && sec !== lastTry && tFace) { lastTry = sec; setHands(tFace, now); }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ================================================================
     B) MIJOZLAR MARKAZI
     ================================================================ */
  const cc = document.createElement("section");
  cc.className = "section dark"; cc.id = "cx9Center";
  cc.innerHTML = `<div class="container"><div class="cx9-cc">
    <p class="eyebrow center">Mijozlar markazi</p>
    <h2 class="center">Buyurtma va sharhlar</h2>
    <div class="cx9-tabs" role="tablist">
      <button type="button" class="on" data-t="k">📦 Buyurtmani kuzatish</button>
      <button type="button" data-t="c">🧾 Cheklar</button>
      <button type="button" data-t="r">⭐ Sharh qoldirish</button>
    </div>
    <div class="cx9-pane on" data-p="k"><div class="cx9-form">
      <label>Buyurtma raqami<input id="cx9KN" placeholder="Masalan: CX123456" maxlength="12" autocomplete="off"></label>
      <button class="btn" id="cx9KB" type="button">Tekshirish</button>
      <div id="cx9KR"></div>
      <div class="cx9-how"><b>Qanday ishlaydi</b>Buyurtma raqami buyurtma berganingizda hosil bo'ladi (masalan CX123456) va Telegram xabarida ko'rinadi. Shu qurilmadan berilgan buyurtmalar bu yerda saqlanadi. Yetkazib berish bosqichlarini operator yangilab turadi. Yangi holat chiqmasa, Telegramda so'rashingiz mumkin.</div>
    </div></div>
    <div class="cx9-pane" data-p="c"><div class="cx9-form">
      <div class="cx9-list" id="cx9CL"></div>
      <div class="cx9-how"><b>Qanday ishlaydi</b>Har bir buyurtma uchun chek ochiladi. Uni chop etish yoki PDF sifatida saqlash mumkin. Chek buyurtma so'rovi ma'lumoti, to'lov tasdig'i emas. Ma'lumotlar faqat sizning brauzeringizda saqlanadi.</div>
    </div></div>
    <div class="cx9-pane" data-p="r"><form class="cx9-form" id="cx9RF" novalidate>
      <label>Ismingiz<input id="cx9RN" maxlength="40" autocomplete="name"></label>
      <label>Model<select id="cx9RM"></select></label>
      <label>Bahoyingiz<div class="cx9-stars" id="cx9RS"></div></label>
      <label>Fikringiz<textarea id="cx9RT" rows="4" maxlength="500" placeholder="Soat sizga qanday yoqdi?"></textarea></label>
      <small class="err" id="cx9RE" style="color:#e5646b"></small>
      <button class="btn" type="submit">Telegramda yuborish</button>
      <div class="cx9-how"><b>Qanday ishlaydi</b>Sharhingiz Telegram orqali do'konga yuboriladi. Saytda e'lon qilish yoki qilmaslikni do'kon egasi hal qiladi.</div>
    </form></div>
  </div></div>`;
  const foot = $(".footer");
  if (foot) foot.before(cc); else document.body.appendChild(cc);
  tabs(cc);

  /* ---------- buyurtmalarni yozib borish ---------- */
  const OK = "cx9_orders";
  const orders = () => store.get(OK, []);
  const allOrders = () => {
    const mine = orders(), nums = new Set(mine.map(o => o.num));
    return mine.concat(store.get("cx4_orders", []).filter(o => o && !nums.has(o.num)));
  };
  const form = $("#orderForm"), done = $("#done"), tgBtn = $("#tgBtn");
  let lastOrder = null;
  if (form && done && tgBtn) form.addEventListener("submit", () => {
    if (done.hidden) return;
    const m = /CX\d{6}/.exec(tgBtn.href);
    const o = {
      num: m ? m[0] : "CX" + Date.now().toString().slice(-6), ts: Date.now(),
      date: pad(new Date().getDate()) + "." + pad(new Date().getMonth() + 1) + "." + new Date().getFullYear() + " " + pad(new Date().getHours()) + ":" + pad(new Date().getMinutes()),
      model: $("#model").value, finish: $("#finish").value, qty: +$("#qty").value, total: $("#total").textContent,
      name: $("#name").value.trim(), phone: $("#phone").value, address: $("#address").value.trim(), note: ($("#note").value || "").trim()
    };
    const list = orders().filter(x => x.num !== o.num); list.unshift(o); store.set(OK, list.slice(0, 30));
    lastOrder = o; drawCheques(); addReceiptBtn();
  });

  /* ---------- chek ---------- */
  function receiptHTML(o) {
    return `<!DOCTYPE html><html lang="uz"><head><meta charset="utf-8"><title>Chek ${esc(o.num)}</title><style>
      body{font-family:Arial,sans-serif;max-width:420px;margin:30px auto;padding:0 16px;color:#111}
      h1{letter-spacing:.35em;text-align:center;margin:0}.c{text-align:center;color:#666;font-size:13px}
      hr{border:0;border-top:1px dashed #999;margin:16px 0}table{width:100%;font-size:14px}td{padding:4px 0;vertical-align:top}td:last-child{text-align:right}
      .t{font-size:20px;font-weight:700}.n{font-size:11px;color:#777;margin-top:18px}button{display:block;margin:20px auto;padding:10px 24px;font-size:15px;cursor:pointer}
      @media print{button{display:none}}</style></head><body>
      <h1>CHRONEX</h1><div class="c">Buyurtma cheki</div><hr>
      <table><tr><td>Buyurtma</td><td><b>#${esc(o.num)}</b></td></tr><tr><td>Sana</td><td>${esc(o.date || "")}</td></tr></table><hr>
      <table><tr><td>${esc(o.model)}<br><small>${esc(o.finish || "")} × ${esc(o.qty || 1)}</small></td><td>${esc(o.total || "")}</td></tr></table><hr>
      <table><tr><td>Mijoz</td><td>${esc(o.name || "—")}</td></tr><tr><td>Telefon</td><td>${esc(o.phone || "—")}</td></tr><tr><td>Manzil</td><td>${esc(o.address || "—")}</td></tr>
      ${o.note ? `<tr><td>Izoh</td><td>${esc(o.note).replace(/\n/g, "<br>")}</td></tr>` : ""}</table><hr>
      <table><tr><td class="t">Jami</td><td class="t">${esc(o.total || "")}</td></tr></table>
      <div class="n">Bu chek buyurtma so'rovi haqidagi ma'lumotdir va to'lov tasdig'i emas. Buyurtma operator tomonidan tasdiqlanadi.</div>
      <button onclick="window.print()">Chop etish / PDF</button></body></html>`;
  }
  function openReceipt(o) {
    const html = receiptHTML(o), w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
    else {
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([html], { type: "text/html" })); a.download = "chek-" + o.num + ".html";
      document.body.appendChild(a); a.click(); a.remove(); toast("Chek fayl sifatida yuklandi");
    }
  }
  function addReceiptBtn() {
    if (!done || $("#cx9RcBtn")) return;
    const b = document.createElement("button"); b.type = "button"; b.id = "cx9RcBtn"; b.className = "link"; b.textContent = "🧾 Chekni ochish"; b.style.display = "block"; b.style.margin = "14px auto 0";
    b.onclick = () => { if (lastOrder) openReceipt(lastOrder); };
    const back = $("#backBtn"); if (back) back.before(b); else done.appendChild(b);
  }
  function drawCheques() {
    const box = $("#cx9CL", cc), list = orders();
    box.innerHTML = list.length ? list.map((o, i) => `<div class="cx9-item"><div><b>${esc(o.model)}</b> × ${esc(o.qty || 1)}<small>#${esc(o.num)} · ${esc(o.date || "")} · ${esc(o.total || "")}</small></div><button class="btn btn-sm btn-ghost" data-i="${i}" type="button">Chekni ochish</button></div>`).join("")
      : `<p class="muted" style="text-align:center">Hozircha buyurtmalar yo'q. Buyurtma bergach, cheklar shu yerda paydo bo'ladi.</p>`;
  }
  $("#cx9CL", cc).addEventListener("click", e => { const b = e.target.closest("button[data-i]"); if (b) openReceipt(orders()[+b.dataset.i]); });
  drawCheques();

  /* ---------- kuzatish ---------- */
  const STEPS = ["Qabul qilindi", "Tasdiqlandi", "Yo'lda", "Yetkazildi"];
  let remote = null;
  async function loadRemote() {
    if (!ORDER_STATUS_URL) return null;
    try { const r = await fetch(ORDER_STATUS_URL, { cache: "no-store" }); if (!r.ok) throw 0; remote = await r.json(); } catch (e) { remote = null; }
    return remote;
  }
  async function trackOrder() {
    const num = $("#cx9KN", cc).value.trim().toUpperCase().replace(/^#/, ""), box = $("#cx9KR", cc);
    if (!/^CX\d{6}$/.test(num)) { box.innerHTML = `<div class="cx9-res"><h4>Raqam noto'g'ri</h4><div class="muted">Raqam «CX» va 6 ta raqamdan iborat bo'ladi, masalan CX123456.</div></div>`; return; }
    box.innerHTML = `<div class="cx9-res muted">Tekshirilmoqda...</div>`;
    const rem = await loadRemote(), local = allOrders().find(o => o.num === num);
    const info = rem && rem[num];
    if (!info && !local) {
      box.innerHTML = `<div class="cx9-res"><h4>Bu qurilmada topilmadi</h4><div class="muted">Buyurtma boshqa qurilmadan berilgan bo'lishi mumkin. Holatni operatordan so'rang: <a class="link" target="_blank" rel="noopener" href="${tgUrl("Salom! " + num + " raqamli buyurtma holatini bilmoqchiman.")}">Telegramda yozish</a></div></div>`;
      return;
    }
    const step = Math.min(4, Math.max(1, info ? +info.step || 1 : 1));
    box.innerHTML = `<div class="cx9-res"><h4>#${esc(num)}${local ? " · " + esc(local.model) : ""}</h4>
      <div class="muted" style="font-size:14px">${local ? esc(local.date || "") + (local.total ? " · " + esc(local.total) : "") : ""}</div>
      <div class="cx9-steps">${STEPS.map((s, i) => `<div class="cx9-step ${i < step ? "ok" : ""} ${i === step - 1 ? "now" : ""}">${s}</div>`).join("")}</div>
      <div>${info && info.note ? esc(info.note) : (step === 1 ? "Buyurtmangiz qabul qilindi. Operator tasdiqlagach holat yangilanadi." : "")}</div>
      <div style="margin-top:10px"><a class="link" target="_blank" rel="noopener" href="${tgUrl("Salom! " + num + " raqamli buyurtma holatini bilmoqchiman.")}">Telegramda holatni so'rash →</a></div></div>`;
  }
  $("#cx9KB", cc).onclick = trackOrder;
  $("#cx9KN", cc).addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); trackOrder(); } });
  const lastNum = allOrders()[0]; if (lastNum) $("#cx9KN", cc).value = lastNum.num;

  /* ---------- sharh ---------- */
  let rating = 5; const rs = $("#cx9RS", cc), rm = $("#cx9RM", cc);
  for (let i = 1; i <= 5; i++) { const b = document.createElement("button"); b.type = "button"; b.textContent = "★"; b.setAttribute("aria-label", i + " yulduz"); b.onclick = () => { rating = i; paintStars(); }; rs.appendChild(b); }
  const paintStars = () => $$("button", rs).forEach((b, k) => b.classList.toggle("on", k < rating)); paintStars();
  Object.keys(MODELS).forEach(k => { const o = document.createElement("option"); o.value = k; o.textContent = k; rm.appendChild(o); });
  $("#cx9RF", cc).addEventListener("submit", e => {
    e.preventDefault();
    const n = $("#cx9RN", cc).value.trim(), t = $("#cx9RT", cc).value.trim(), err = $("#cx9RE", cc);
    if (n.length < 2) { err.textContent = "Ismingizni kiriting"; return; }
    if (t.length < 10) { err.textContent = "Fikringizni kamida 10 ta belgi bilan yozing"; return; }
    err.textContent = "";
    window.open(tgUrl(`⭐ Yangi sharh\n\n👤 ${n}\n⌚ ${rm.value}\n${"★".repeat(rating)}${"☆".repeat(5 - rating)}\n\n${t}`), "_blank", "noopener");
    $("#cx9RT", cc).value = ""; toast("Telegram ochildi. «Send» tugmasini bosing");
  });

  /* ================================================================
     C) CHIQISHDAN OLDIN ESLATMA
     ================================================================ */
  (function exitIntent() {
    if (!EXIT_PROMO.on || !matchMedia("(hover: hover)").matches) return;
    if (Date.now() > new Date(EXIT_PROMO.until).getTime()) return;
    try { if (sessionStorage.getItem("cx9_exit")) return; } catch (e) {}
    const t0 = Date.now();
    document.addEventListener("mouseout", e => {
      if (e.clientY > 0 || e.relatedTarget || Date.now() - t0 < 15000) return;
      try { if (sessionStorage.getItem("cx9_exit")) return; sessionStorage.setItem("cx9_exit", "1"); } catch (er) {}
      const m = document.createElement("div"); m.className = "cx9-modal";
      m.innerHTML = `<div class="cx9-mbox" role="dialog" aria-modal="true"><button class="cx9-x" type="button" aria-label="Yopish">×</button>
        <div style="font-size:38px">⌚</div><h3 style="margin:0">Ketishdan oldin!</h3>
        <p class="muted" style="margin:0">Bu promo-kod bilan <b>−${EXIT_PROMO.pct}%</b> chegirma oling:</p>
        <div class="cx9-code">${esc(EXIT_PROMO.code)}</div>
        <button class="btn" id="cx9Cp" type="button">Kodni nusxalash va buyurtmaga o'tish</button></div>`;
      document.body.appendChild(m);
      const close = () => m.remove();
      m.addEventListener("click", ev => { if (ev.target === m || ev.target.closest(".cx9-x")) close(); });
      $("#cx9Cp", m).onclick = async () => {
        try { await navigator.clipboard.writeText(EXIT_PROMO.code); toast("Kod nusxalandi ✓"); } catch (er) {}
        close(); const o = $("#order"); if (o) o.scrollIntoView({ behavior: "smooth" });
      };
      addEventListener("keydown", function esc2(k) { if (k.key === "Escape") { close(); removeEventListener("keydown", esc2); } });
    });
  })();
})();