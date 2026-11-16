/* ===== CHRONEX chronex-pro.js =====
   Mavjud kodga TEGMAYDI. index.html da </body> dan oldin bitta qator qo'shing:
       <script src="./chronex-pro.js"></script>
   CSS ham shu fayl ichida.

   NIMALAR QO'SHILADI
   1) "3D ko'rish": sudrab aylantiriladigan haqiqiy hajmli soat (old, yon va orqa tomoni)
   2) Tezkor qidiruv va buyruqlar oynasi: Ctrl+K yoki / tugmasi
   3) Qidiruv tizimlari uchun mahsulot ma'lumotlari (JSON-LD)
   4) Internet uzilganda ogohlantirish
   5) Manzil maydoniga shaharlar tugmalari
   6) Aksiya tugashini kalendarga qo'shish (.ics fayl)
   7) Yashirin syurpriz (Konami kodi)

   SOZLAMALAR: pastdagi PROMO_END, PROMO_CODE */
(function () {
  "use strict";
  if (window.__cx10) return;
  window.__cx10 = 1;

  /* ================= SOZLAMALAR ================= */
  const PROMO_CODE = "CHRONEX10";
  const PROMO_END = "2026-12-01T23:59:59+05:00"; // aksiya haqiqatan shu sanagacha amal qilsa

  /* ================= YORDAMCHILAR ================= */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const pad = n => (n < 10 ? "0" : "") + n;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const TG = () => (typeof TG_USER !== "undefined" && TG_USER) ? TG_USER : "your_username";
  function toast(m) {
    let box = $(".cx-toasts");
    if (!box) { box = document.createElement("div"); box.className = "cx-toasts"; document.body.appendChild(box); }
    const t = document.createElement("div"); t.className = "cx-toast"; t.textContent = m; box.appendChild(t);
    setTimeout(() => t.classList.add("out"), 2600); setTimeout(() => t.remove(), 3100);
  }
  const hex2rgb = h => { h = h.replace("#", ""); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); };
  const rgb2hex = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const shade = (hex, amt) => { const t = amt < 0 ? 0 : 255, p = Math.abs(amt); return rgb2hex(hex2rgb(hex).map(v => v + (t - v) * p)); };
  const scrollToId = id => { if (id === "top") { scrollTo({ top: 0, behavior: "smooth" }); return; } const e = document.getElementById(id); if (e) e.scrollIntoView({ behavior: "smooth" }); };

  /* ================= CSS ================= */
  const st = document.createElement("style");
  st.textContent = `
  /* 3D */
  .cx10-wrap{display:grid;grid-template-columns:1.1fr .9fr;gap:34px;align-items:center;margin-top:36px}
  .cx10-stagebox{background:var(--card,#13161e);border:1px solid var(--line,#222633);border-radius:var(--radius,18px);position:relative;overflow:hidden;min-height:520px;display:grid;place-items:center}
  .cx10-stagebox::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 45%,rgba(201,168,106,.16),transparent 62%)}
  .cx10-stage{position:relative;width:360px;height:500px;perspective:1100px;touch-action:pan-y;cursor:grab;user-select:none;-webkit-user-select:none;outline:none}
  .cx10-stage:active{cursor:grabbing}
  .cx10-stage:focus-visible{box-shadow:0 0 0 2px var(--accent,#c9a86a)}
  .cx10-rot{position:absolute;left:50%;top:50%;width:0;height:0;transform-style:preserve-3d}
  .cx10-rot>*{position:absolute;left:0;top:0}
  .cx10-st{backface-visibility:visible}
  .cx10-front,.cx10-back,.cx10-glass{border-radius:50%;backface-visibility:hidden;-webkit-backface-visibility:hidden}
  .cx10-front svg,.cx10-back svg{width:100%;height:100%;display:block}
  .cx10-glass{background:linear-gradient(135deg,rgba(255,255,255,.2),rgba(255,255,255,0) 45%,rgba(255,255,255,.06));pointer-events:none}
  .cx10-strap i{position:absolute;left:0;top:0;width:100%;height:100%;border-radius:10px}
  .cx10-floor{position:absolute;left:50%;bottom:20px;width:240px;height:34px;margin-left:-120px;border-radius:50%;background:radial-gradient(ellipse,rgba(0,0,0,.6),transparent 70%);pointer-events:none}
  .cx10-side{display:grid;gap:14px}
  .cx10-side h3{margin:0;font-size:24px}
  .cx10-side label{display:grid;gap:7px;font-size:13px;color:var(--muted,#9097a8)}
  .cx10-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .cx10-sw{width:30px;height:30px;border-radius:50%;border:2px solid transparent;outline:1px solid var(--line,#222633);outline-offset:2px;cursor:pointer;padding:0}
  .cx10-sw.on{outline:2px solid var(--accent,#c9a86a)}
  .cx10-how{background:var(--bg,#07080b);border:1px dashed var(--line,#222633);border-radius:14px;padding:14px 16px;font-size:13px;color:var(--muted,#9097a8)}
  .cx10-how b{color:var(--accent,#c9a86a);display:block;margin-bottom:4px}
  .cx10-chip{background:var(--card,#13161e);border:1px solid var(--line,#222633);color:var(--muted,#9097a8);border-radius:999px;padding:6px 14px;cursor:pointer;font:inherit;font-size:13px;transition:.2s}
  .cx10-chip:hover,.cx10-chip.on{border-color:var(--accent,#c9a86a);color:var(--text,#f2f3f7)}
  .cx10-chip.on{background:rgba(201,168,106,.15)}
  /* qidiruv */
  .cx10-sbtn{background:none;border:1px solid var(--line,#222633);color:var(--text,#f2f3f7);width:38px;height:38px;border-radius:50%;cursor:pointer;font-size:15px;margin-left:12px;transition:.2s}
  .cx10-sbtn:hover{border-color:var(--accent,#c9a86a)}
  .cx10-pal{position:fixed;inset:0;z-index:850;background:rgba(0,0,0,.65);display:grid;justify-items:center;align-items:start;padding:12vh 16px 16px;animation:cx10In .2s}
  .cx10-pal[hidden]{display:none}
  @keyframes cx10In{from{opacity:0}}
  .cx10-pbox{width:min(600px,100%);background:var(--bg2,#0e1016);border:1px solid var(--accent,#c9a86a);border-radius:18px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.6)}
  .cx10-pbox input{width:100%;border:0;border-bottom:1px solid var(--line,#222633);border-radius:0;background:transparent;padding:18px 20px;font-size:17px;color:var(--text,#f2f3f7);outline:none}
  .cx10-plist{max-height:50vh;overflow:auto;padding:8px}
  .cx10-pi{display:flex;gap:12px;align-items:center;padding:10px 12px;border-radius:12px;cursor:pointer;color:var(--text,#f2f3f7);font-size:15px}
  .cx10-pi small{margin-left:auto;color:var(--muted,#9097a8);font-size:12px}
  .cx10-pi.on{background:rgba(201,168,106,.16)}
  .cx10-pe{padding:26px;text-align:center;color:var(--muted,#9097a8)}
  .cx10-pf{border-top:1px solid var(--line,#222633);padding:10px 16px;font-size:12px;color:var(--muted,#9097a8);display:flex;gap:14px;flex-wrap:wrap}
  /* internet */
  .cx10-off{position:fixed;left:0;right:0;top:0;z-index:880;background:#e5646b;color:#fff;text-align:center;padding:10px 16px;font-size:14px;font-weight:600}
  .cx10-off[hidden]{display:none}
  /* shaharlar */
  .cx10-cities{display:flex;gap:6px;flex-wrap:wrap;margin-top:-6px}
  .cx10-cities button{background:var(--bg,#07080b);border:1px solid var(--line,#222633);color:var(--muted,#9097a8);border-radius:999px;padding:4px 12px;cursor:pointer;font:inherit;font-size:12px;transition:.2s}
  .cx10-cities button:hover{border-color:var(--accent,#c9a86a);color:var(--text,#f2f3f7)}
  .cx10-conf{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:900}
  @media(max-width:900px){.cx10-wrap{grid-template-columns:1fr}.cx10-stagebox{min-height:460px}.cx10-stage{transform:scale(.86)}}`;
  document.head.appendChild(st);

  /* ================================================================
     1) 3D KO'RISH
     ================================================================ */
  const RIM = {
    "Oltin": ["#f6e6bb", "#9b7733", "#e8cb88"], "Po'lat": ["#f4f6fa", "#7d8494", "#dfe3ec"],
    "Rose": ["#fbe2d8", "#b07767", "#f0c9bb"], "Qora": ["#5a5f6e", "#14161c", "#3a3e4b"]
  };
  const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  const MODELS = {
    "Chronex Aero": { strap: ["#14151a", "#3a3d48"], rim: "Po'lat", face: { dial: "#cfd4df", mark: "#1a1d26", handc: "#20232d", sec: "#2b6fff", style: "bars", hand: "classic", date: true } },
    "Chronex Titan": { strap: ["#0a0b0e", "#2b2e38"], rim: "Oltin", face: { dial: "#161820", mark: "#e8d3a0", handc: "#e8d3a0", sec: "#ff5a3c", style: "bars", hand: "sword", date: true } },
    "Chronex Nova": { strap: ["#3a2018", "#8a5340"], rim: "Rose", face: { dial: "#efe3d3", mark: "#5e362c", handc: "#5e362c", sec: "#b5473a", style: "roman", hand: "baton", date: false } }
  };
  const FONTS = {
    "Klassik (serif)": 'Georgia,"Times New Roman",serif', "Zamonaviy (sans)": "Arial,Helvetica,sans-serif",
    "Qo'l yozuvi": '"Brush Script MT","Segoe Script",cursive', "Texnik (mono)": '"Courier New",monospace'
  };
  function handPath(kind, len, w) {
    if (kind === "sword") return `M${-w * 1.1} 14 L${-w * 1.3} ${-len * .18} L0 ${-len} L${w * 1.3} ${-len * .18} L${w * 1.1} 14Z`;
    if (kind === "baton") return `M${-w * .6} 14 L${-w * .6} ${-len} L${w * .6} ${-len} L${w * .6} 14Z`;
    return `M${-w} 14 L${-w * .7} 0 L${-w * .5} ${-len + 8} L0 ${-len} L${w * .5} ${-len + 8} L${w * .7} 0 L${w} 14Z`;
  }
  function faceSVG(c, p) {
    const d0 = shade(c.dial, .2), d1 = shade(c.dial, -.5);
    let m = "", burst = "";
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
    return `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"><defs>
<linearGradient id="${p}rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.rim[0]}"/><stop offset=".5" stop-color="${c.rim[1]}"/><stop offset="1" stop-color="${c.rim[2]}"/></linearGradient>
<radialGradient id="${p}dial" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="${d0}"/><stop offset="1" stop-color="${d1}"/></radialGradient>
<clipPath id="${p}clip"><circle cx="150" cy="150" r="132"/></clipPath></defs>
<circle cx="150" cy="150" r="148" fill="url(#${p}rim)"/><circle cx="150" cy="150" r="140" fill="#0b0b0f"/><circle cx="150" cy="150" r="132" fill="url(#${p}dial)"/>
<g clip-path="url(#${p}clip)">${burst}</g>${m}
<text x="150" y="${c.style === "roman" ? 112 : 104}" text-anchor="middle" font-family="Arial" font-size="11" letter-spacing="4" fill="${c.mark}">CHRONEX</text>${date}
<g data-hand="h" transform="translate(150 150)"><path d="${handPath(c.hand, 68, 4.5)}" fill="${c.handc}" stroke="rgba(0,0,0,.35)" stroke-width=".6"/></g>
<g data-hand="m" transform="translate(150 150)"><path d="${handPath(c.hand, 100, 3.5)}" fill="${c.handc}" stroke="rgba(0,0,0,.35)" stroke-width=".6"/></g>
<g data-hand="s" transform="translate(150 150)"><line y1="26" y2="-112" stroke="${c.sec}" stroke-width="1.6" stroke-linecap="round"/><circle cy="20" r="4" fill="${c.sec}"/></g>
<circle cx="150" cy="150" r="6" fill="${c.sec}"/><circle cx="150" cy="150" r="2.2" fill="#111"/></svg>`;
  }
  function backSVG(rim, l1, l2, fam) {
    const fs = t => Math.max(12, Math.min(30, 250 / Math.max(6, t.length)));
    let screws = "";
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; screws += `<circle cx="${(150 + Math.sin(a) * 134).toFixed(1)}" cy="${(150 - Math.cos(a) * 134).toFixed(1)}" r="3.6" fill="#4a4f5e"/>`; }
    const tx = (t, y) => `<text x="150" y="${y + 1}" text-anchor="middle" font-family='${fam}' font-size="${fs(t)}" fill="rgba(255,255,255,.65)">${esc(t)}</text><text x="150" y="${y}" text-anchor="middle" font-family='${fam}' font-size="${fs(t)}" fill="#2b2e38">${esc(t)}</text>`;
    return `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"><defs>
<linearGradient id="bk-rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${rim[0]}"/><stop offset=".5" stop-color="${rim[1]}"/><stop offset="1" stop-color="${rim[2]}"/></linearGradient>
<radialGradient id="bk-m" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#d9dde7"/><stop offset="1" stop-color="#7c8292"/></radialGradient>
<path id="bk-arc" d="M 40 150 A 110 110 0 0 1 260 150"/></defs>
<circle cx="150" cy="150" r="148" fill="url(#bk-rim)"/><circle cx="150" cy="150" r="138" fill="url(#bk-m)"/>${screws}
<text font-family="Arial" font-size="10" letter-spacing="3" fill="#4a4f5e"><textPath href="#bk-arc" startOffset="50%" text-anchor="middle">CHRONEX · TITAN · 50M</textPath></text>
<circle cx="150" cy="150" r="78" fill="none" stroke="rgba(0,0,0,.18)" stroke-dasharray="2 4"/>${l1 ? tx(l1, l2 ? 144 : 160) : ""}${l2 ? tx(l2, 176) : ""}</svg>`;
  }

  const R = 112, TH = 24, N = 56;
  const view = document.createElement("section");
  view.className = "section dark"; view.id = "cx10Viewer";
  view.innerHTML = `<div class="container">
    <p class="eyebrow center">3D ko'rish</p>
    <h2 class="center">Soatni har tomondan ko'ring</h2>
    <p class="center muted">Sichqoncha bilan sudrang yoki barmog'ingiz bilan suring.</p>
    <div class="cx10-wrap">
      <div class="cx10-stagebox"><div class="cx10-stage" id="cx10St" tabindex="0" aria-label="3D soat. Aylantirish uchun strelka tugmalaridan foydalaning"><div class="cx10-rot" id="cx10Rot"></div></div><div class="cx10-floor"></div></div>
      <div class="cx10-side">
        <h3>Sizning Chronex'ingiz</h3>
        <label>Model<select id="cx10M"></select></label>
        <div><div class="muted" style="font-size:13px;margin-bottom:8px">Korpus rangi</div><div class="cx10-row" id="cx10Sw"></div></div>
        <div class="cx10-row" id="cx10V"></div>
        <div class="cx10-row"><button class="cx10-chip" id="cx10Auto" type="button">⏸ Avto-aylanish</button><button class="cx10-chip" id="cx10Tilt" type="button" hidden>📱 Telefon bilan boshqarish</button></div>
        <label>Orqa qopqoqdagi yozuv (gravirovka)<input id="cx10E1" maxlength="18" placeholder="1-qator"></label>
        <input id="cx10E2" maxlength="18" placeholder="2-qator (ixtiyoriy)">
        <select id="cx10F" aria-label="Shrift"></select>
        <div class="cx10-row"><button class="btn btn-sm" id="cx10Pick" type="button">Shu modelni tanlash</button><button class="btn btn-sm btn-ghost" id="cx10Eng" type="button">Gravirovkani buyurtmaga qo'shish</button></div>
        <div class="cx10-how"><b>Qanday ishlaydi</b>Soat haqiqiy hajmli: korpusning qalinligi, toji va tasmasi bor. Sudrab aylantirsangiz, yon va orqa tomonini ko'rasiz. Orqa qopqoqda yozgan matningiz chiqadi. Strelkalar hozirgi vaqtni ko'rsatadi. Gravirovkaning narxi va imkoniyatlarini operator tasdiqlaydi.</div>
      </div>
    </div>
  </div>`;
  const anchor = $("#cx9Studio") || $("#technology");
  if (anchor) anchor.after(view);
  else { const a = $("#story") || $("#order") || $(".footer"); if (a) a.before(view); else document.body.appendChild(view); }

  const rot = $("#cx10Rot", view), stage = $("#cx10St", view);
  const modelSel = $("#cx10M", view), swBox = $("#cx10Sw", view), fontSel = $("#cx10F", view);
  Object.keys(MODELS).forEach(k => { const o = document.createElement("option"); o.value = k; o.textContent = k; modelSel.appendChild(o); });
  Object.keys(FONTS).forEach(k => { const o = document.createElement("option"); o.value = k; o.textContent = k; fontSel.appendChild(o); });
  modelSel.value = "Chronex Titan";
  let rimName = MODELS["Chronex Titan"].rim, faceEl = null;
  Object.keys(RIM).forEach(k => {
    const b = document.createElement("button"); b.type = "button"; b.className = "cx10-sw" + (k === rimName ? " on" : ""); b.title = k; b.setAttribute("aria-label", k);
    b.style.background = RIM[k][1]; b.onclick = () => { rimName = k; $$("button", swBox).forEach(x => x.classList.toggle("on", x === b)); build(); };
    swBox.appendChild(b);
  });

  function build() {
    const M = MODELS[modelSel.value], rim = RIM[rimName], cfg = Object.assign({}, M.face, { rim });
    const chord = 2 * Math.PI * R / N + 1.4;
    let strips = "";
    for (let i = 0; i < N; i++) {
      const th = i * 360 / N, f = .2 * Math.cos((th - 40) * Math.PI / 180);
      strips += `<i class="cx10-st" style="position:absolute;left:0;top:0;width:${TH}px;height:${chord.toFixed(1)}px;margin:${(-chord / 2).toFixed(1)}px 0 0 ${-TH / 2}px;background:linear-gradient(90deg,${shade(rim[0], f)},${shade(rim[1], f)} 50%,${shade(rim[2], f)});transform:rotateZ(${th}deg) translateX(${R}px) rotateY(90deg)"></i>`;
    }
    const strapCol = M.strap;
    const strap = (top) => {
      let sl = ""; for (let k = 0; k < 5; k++) sl += `<i style="transform:translateZ(${-k * 1.2}px);background:linear-gradient(90deg,${strapCol[0]},${strapCol[1]} 50%,${strapCol[0]});${k === 0 ? "border:1px dashed rgba(255,255,255,.18)" : ""}"></i>`;
      return `<div class="cx10-strap" style="position:absolute;left:0;top:0;width:100px;height:150px;margin-left:-50px;margin-top:${top ? -R + 10 - 150 : R - 10}px;transform-origin:${top ? "50% 100%" : "50% 0"};transform:rotateX(${top ? 20 : -20}deg) translateZ(-2px);transform-style:preserve-3d">${sl}</div>`;
    };
    let crown = ""; for (let k = 0; k < 7; k++) crown += `<i style="position:absolute;left:0;top:0;width:18px;height:34px;margin:-17px 0 0 ${R - 3}px;border-radius:5px;background:linear-gradient(180deg,${rim[0]},${rim[1]} 55%,${rim[2]});transform:translateZ(${(k - 3) * 2.2}px)"></i>`;
    rot.innerHTML = strap(true) + strap(false) + strips + crown +
      `<div class="cx10-front" style="position:absolute;left:0;top:0;width:${2 * R}px;height:${2 * R}px;margin:${-R}px 0 0 ${-R}px;transform:translateZ(${TH / 2}px)">${faceSVG(cfg, "f")}</div>` +
      `<div class="cx10-glass" style="position:absolute;left:0;top:0;width:${2 * R}px;height:${2 * R}px;margin:${-R}px 0 0 ${-R}px;transform:translateZ(${TH / 2 + 1}px)"></div>` +
      `<div class="cx10-back" style="position:absolute;left:0;top:0;width:${2 * R}px;height:${2 * R}px;margin:${-R}px 0 0 ${-R}px;transform:rotateY(180deg) translateZ(${TH / 2}px)">${backSVG(rim, $("#cx10E1", view).value.trim(), $("#cx10E2", view).value.trim(), FONTS[fontSel.value])}</div>`;
    faceEl = $(".cx10-front svg", rot);
  }
  function refreshBack() {
    const b = $(".cx10-back", rot); if (b) b.innerHTML = backSVG(RIM[rimName], $("#cx10E1", view).value.trim(), $("#cx10E2", view).value.trim(), FONTS[fontSel.value]);
  }
  modelSel.addEventListener("change", () => {
    rimName = MODELS[modelSel.value].rim;
    $$("button", swBox).forEach(x => x.classList.toggle("on", x.title === rimName)); build();
  });
  ["cx10E1", "cx10E2"].forEach(id => $("#" + id, view).addEventListener("input", () => { refreshBack(); if (!moving()) animateTo(0, 180); }));
  fontSel.addEventListener("change", refreshBack);
  build();

  function setHands(root, d) {
    if (!root) return;
    const s = d.getSeconds() + d.getMilliseconds() / 1000, m = d.getMinutes() + s / 60, h = (d.getHours() % 12) + m / 60;
    const set = (k, a) => { const g = root.querySelector(`[data-hand="${k}"]`); if (g) g.setAttribute("transform", `translate(150 150) rotate(${a.toFixed(2)})`); };
    set("h", h * 30); set("m", m * 6); set("s", s * 6);
  }

  // aylantirish holati
  let rx = -8, ry = 24, vx = 0, vy = 0, dragging = false, auto = true, idleUntil = 0, tween = null, tiltOn = false;
  const moving = () => dragging || !!tween;
  const apply = () => { rot.style.transform = `rotateX(${rx.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg)`; };
  apply();
  function animateTo(tx, ty) {
    const dy = ((ty - ry + 540) % 360) - 180; tween = { x0: rx, y0: ry, dx: tx - rx, dy, t0: performance.now(), d: 700 };
    auto = false; $("#cx10Auto", view).textContent = "▶ Avto-aylanish";
  }
  const VBTN = [["Old", 0, 0], ["Yon", 0, 90], ["Orqa", 0, 180], ["Tepadan", -55, 0]];
  VBTN.forEach(([n, x, y]) => { const b = document.createElement("button"); b.type = "button"; b.className = "cx10-chip"; b.textContent = n; b.onclick = () => animateTo(x, y); $("#cx10V", view).appendChild(b); });
  $("#cx10Auto", view).onclick = function () { auto = !auto; tween = null; this.textContent = auto ? "⏸ Avto-aylanish" : "▶ Avto-aylanish"; };

  let lx = 0, ly = 0;
  stage.addEventListener("pointerdown", e => { dragging = true; tween = null; vx = vy = 0; lx = e.clientX; ly = e.clientY; try { stage.setPointerCapture(e.pointerId); } catch (er) {} });
  stage.addEventListener("pointermove", e => {
    if (!dragging) return;
    const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
    ry += dx * .6; rx = Math.max(-70, Math.min(70, rx - dy * .4)); vy = dx * .6; vx = -dy * .4; apply();
  });
  const endDrag = () => { if (!dragging) return; dragging = false; idleUntil = performance.now() + 3500; };
  stage.addEventListener("pointerup", endDrag); stage.addEventListener("pointercancel", endDrag);
  stage.addEventListener("keydown", e => {
    const k = { ArrowLeft: [0, -12], ArrowRight: [0, 12], ArrowUp: [-8, 0], ArrowDown: [8, 0] }[e.key];
    if (k) { e.preventDefault(); rx = Math.max(-70, Math.min(70, rx + k[0])); ry += k[1]; apply(); idleUntil = performance.now() + 3500; }
  });

  // telefon qiyshaytirish
  const tiltBtn = $("#cx10Tilt", view);
  if (window.DeviceOrientationEvent && matchMedia("(pointer: coarse)").matches) tiltBtn.hidden = false;
  tiltBtn.onclick = async () => {
    try { if (typeof DeviceOrientationEvent.requestPermission === "function") { const r = await DeviceOrientationEvent.requestPermission(); if (r !== "granted") return; } } catch (e) { return; }
    tiltOn = !tiltBtn.classList.contains("on"); tiltBtn.classList.toggle("on", tiltOn);
    if (tiltOn) { auto = false; tween = null; $("#cx10Auto", view).textContent = "▶ Avto-aylanish"; }
  };
  addEventListener("deviceorientation", e => {
    if (!tiltOn || e.gamma == null) return;
    ry = Math.max(-90, Math.min(90, e.gamma * 1.4)); rx = Math.max(-60, Math.min(60, ((e.beta || 45) - 45) * .8)); apply();
  });

  // tugmalar
  $("#cx10Pick", view).onclick = () => { const s = $("#model"); if (s) { s.value = modelSel.value; s.dispatchEvent(new Event("change")); } scrollToId("order"); };
  $("#cx10Eng", view).onclick = () => {
    const l1 = $("#cx10E1", view).value.trim(), l2 = $("#cx10E2", view).value.trim(), note = $("#note");
    if (!l1 && !l2) { toast("Avval gravirovka matnini yozing"); return; }
    if (!note) { toast("Buyurtma formasi topilmadi"); return; }
    const line = `Gravirovka: «${[l1, l2].filter(Boolean).join(" / ")}» (shrift: ${fontSel.value})`;
    const rest = note.value.replace(/Gravirovka:[^\n]*\n?/g, "").trim();
    note.value = (rest ? rest + "\n" : "") + line;
    note.dispatchEvent(new Event("input", { bubbles: true }));
    toast("Gravirovka buyurtma izohiga qo'shildi ✓"); scrollToId("order");
  };

  let vis3 = false, last3 = 0;
  new IntersectionObserver(es => { vis3 = es[0].isIntersecting; }, { threshold: 0 }).observe(view);
  function frame3(ts) {
    if (vis3) {
      const dt = Math.min(50, ts - (last3 || ts)); last3 = ts;
      if (tween) {
        const p = Math.min(1, (ts - tween.t0) / tween.d), e = 1 - Math.pow(1 - p, 3);
        rx = tween.x0 + tween.dx * e; ry = tween.y0 + tween.dy * e; if (p >= 1) { tween = null; idleUntil = ts + 5000; } apply();
      } else if (!dragging && !tiltOn) {
        if (Math.abs(vy) > .02 || Math.abs(vx) > .02) { ry += vy; rx = Math.max(-70, Math.min(70, rx + vx)); vy *= .94; vx *= .94; apply(); }
        else if (auto && ts > idleUntil) { ry += dt * .02; rx += (-8 + Math.sin(ts / 1800) * 6 - rx) * .03; apply(); }
      }
      setHands(faceEl, new Date());
    } else last3 = 0;
    requestAnimationFrame(frame3);
  }
  requestAnimationFrame(frame3);

  /* ================================================================
     2) QIDIRUV VA BUYRUQLAR OYNASI (Ctrl+K)
     ================================================================ */
  const pal = document.createElement("div");
  pal.className = "cx10-pal"; pal.hidden = true;
  pal.innerHTML = `<div class="cx10-pbox" role="dialog" aria-modal="true" aria-label="Qidiruv">
    <input id="cx10Q" placeholder="Qidiring: bo'lim, model yoki amal..." autocomplete="off" aria-label="Qidiruv">
    <div class="cx10-plist" id="cx10L" role="listbox"></div>
    <div class="cx10-pf"><span>↑↓ tanlash</span><span>Enter ochish</span><span>Esc yopish</span></div></div>`;
  document.body.appendChild(pal);
  const qIn = $("#cx10Q", pal), list = $("#cx10L", pal);
  const SEC = [["top", "🏠", "Bosh sahifa"], ["collection", "⌚", "Kolleksiya"], ["live-watches", "🎞️", "Jonli soatlar"], ["technology", "⚙️", "Texnologiya"],
    ["advisor", "🔋", "Batareya va o'lcham maslahatchisi"], ["cx9Studio", "🎨", "Chronex Studio: simulyator va siferblat"], ["cx10Viewer", "🔄", "3D ko'rish"],
    ["lab", "🔬", "Soat laboratoriyasi: gravirovka, budilnik"], ["story", "📖", "Hikoyamiz"], ["order", "🛒", "Buyurtma berish"], ["branches", "📍", "Do'konlar"],
    ["message", "💬", "Bizga yozing"], ["faq", "❓", "Savol-javob"], ["reviews", "⭐", "Sharhlar"], ["cx9Center", "📦", "Buyurtmani kuzatish va cheklar"]];
  const click = s => { const e = $(s); if (e) e.click(); };
  const norm = s => s.toLowerCase().replace(/[ʻʼ`’‘']/g, "");
  let items = [], sel = 0;

  function buildItems() {
    const a = [];
    SEC.forEach(([id, ic, t]) => { if (id === "top" || document.getElementById(id)) a.push({ ic, t, g: "Bo'lim", k: "otish bolim", run: () => scrollToId(id) }); });
    $$("#model option").forEach(o => a.push({ ic: "⌚", t: o.value + " buyurtma berish", g: "$" + o.dataset.price, k: "model narx soat", run: () => { const s = $("#model"); s.value = o.value; s.dispatchEvent(new Event("change")); scrollToId("order"); } }));
    if (window.cx8SetLang) [["uz", "O'zbekcha"], ["ru", "Русский"], ["en", "English"]].forEach(([l, n]) => a.push({ ic: "🌐", t: "Til: " + n, g: "Amal", k: "til language yazyk", run: () => window.cx8SetLang(l) }));
    if ($(".cx-theme")) a.push({ ic: "🌓", t: "Yorug' / qorong'i mavzuni almashtirish", g: "Amal", k: "tema mavzu dark light", run: () => click(".cx-theme") });
    if ($("#cxCartBtn") || $(".cx-cart")) a.push({ ic: "🛒", t: "Savatni ochish", g: "Amal", k: "savat cart", run: () => click("#cxCartBtn, .cx-cart") });
    if ($(".cx7-bot")) a.push({ ic: "💬", t: "Yordamchi chatni ochish", g: "Amal", k: "chat yordam savol bot", run: () => click(".cx7-bot") });
    if ($("#cx4Gear")) a.push({ ic: "⚙️", t: "Sozlamalar (matn o'lchami, kontrast, so'm)", g: "Amal", k: "sozlama kontrast font so'm", run: () => click("#cx4Gear") });
    a.push({ ic: "🔗", t: "Sayt havolasini nusxalash", g: "Amal", k: "link ulashish nusxa", run: async () => { try { await navigator.clipboard.writeText(location.href.split("#")[0]); toast("Havola nusxalandi ✓"); } catch (e) { window.prompt("Havolani nusxalang:", location.href.split("#")[0]); } } });
    a.push({ ic: "✈️", t: "Telegramda yozish", g: "Aloqa", k: "telegram aloqa operator", run: () => window.open("https://t.me/" + TG(), "_blank", "noopener") });
    if (Date.now() < new Date(PROMO_END).getTime()) a.push({ ic: "📅", t: "Aksiya tugashini kalendarga qo'shish", g: "Eslatma", k: "kalendar aksiya eslatma promo ics", run: downloadICS });
    return a;
  }
  function render() {
    const q = norm(qIn.value.trim()), toks = q.split(/\s+/).filter(Boolean);
    let res = items.filter(it => { const hay = norm(it.t + " " + it.k + " " + it.g); return toks.every(t => hay.includes(t)); });
    if (toks.length) res.sort((x, y) => (norm(y.t).startsWith(toks[0]) ? 1 : 0) - (norm(x.t).startsWith(toks[0]) ? 1 : 0));
    res = res.slice(0, 12); sel = Math.min(sel, Math.max(0, res.length - 1));
    list.innerHTML = res.length ? res.map((it, i) => `<div class="cx10-pi${i === sel ? " on" : ""}" role="option" data-i="${i}"><span>${it.ic}</span><span>${esc(it.t)}</span><small>${esc(it.g)}</small></div>`).join("")
      : `<div class="cx10-pe">Hech narsa topilmadi. Boshqa so'z bilan sinab ko'ring.</div>`;
    list._res = res;
    const on = $(".cx10-pi.on", list); if (on) on.scrollIntoView({ block: "nearest" });
  }
  let lastFocus = null;
  function openPal() { lastFocus = document.activeElement; items = buildItems(); qIn.value = ""; sel = 0; pal.hidden = false; render(); qIn.focus(); }
  function closePal() { pal.hidden = true; if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} } }
  function runSel() { const it = list._res && list._res[sel]; if (!it) return; closePal(); setTimeout(() => it.run(), 60); }
  qIn.addEventListener("input", () => { sel = 0; render(); });
  qIn.addEventListener("keydown", e => {
    const n = (list._res || []).length;
    if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % Math.max(1, n); render(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + Math.max(1, n)) % Math.max(1, n); render(); }
    else if (e.key === "Enter") { e.preventDefault(); runSel(); }
    else if (e.key === "Escape") { e.preventDefault(); closePal(); }
  });
  list.addEventListener("click", e => { const r = e.target.closest(".cx10-pi"); if (r) { sel = +r.dataset.i; runSel(); } });
  list.addEventListener("mousemove", e => { const r = e.target.closest(".cx10-pi"); if (r && +r.dataset.i !== sel) { sel = +r.dataset.i; $$(".cx10-pi", list).forEach((x, i) => x.classList.toggle("on", i === sel)); } });
  pal.addEventListener("mousedown", e => { if (e.target === pal) closePal(); });
  addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.hidden ? openPal() : closePal(); return; }
    if (e.key === "Escape" && !pal.hidden) { closePal(); return; }
    const tag = (e.target.tagName || "").toLowerCase();
    if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !["input", "textarea", "select"].includes(tag) && !e.target.isContentEditable && pal.hidden) { e.preventDefault(); openPal(); }
  });
  const nav = $(".nav"), burger = $("#burger");
  if (nav) {
    const b = document.createElement("button"); b.type = "button"; b.className = "cx10-sbtn"; b.textContent = "🔍";
    b.title = "Qidiruv (Ctrl+K)"; b.setAttribute("aria-label", "Qidiruv"); b.onclick = openPal;
    nav.insertBefore(b, burger || null);
  }

  /* ================================================================
     3) QIDIRUV TIZIMLARI UCHUN MA'LUMOT (JSON-LD)
     ================================================================ */
  (function seo() {
    try {
      if ($("#cx10-ld")) return;
      const base = location.href.split("#")[0], prods = $$("#model option").filter(o => o.dataset.price).map(o => ({
        "@type": "Product", name: o.value, brand: { "@type": "Brand", name: "Chronex" },
        description: ($('meta[name="description"]') || {}).content || "Chronex premium smart-soat",
        offers: { "@type": "Offer", price: o.dataset.price, priceCurrency: "USD", url: base + "#order" }
      }));
      const data = { "@context": "https://schema.org", "@graph": [{ "@type": "WebSite", name: "CHRONEX", url: base, inLanguage: "uz" }].concat(prods) };
      const s = document.createElement("script"); s.type = "application/ld+json"; s.id = "cx10-ld"; s.textContent = JSON.stringify(data);
      document.head.appendChild(s);
      if (/^https?:/.test(location.protocol) && !$('link[rel="canonical"]')) { const l = document.createElement("link"); l.rel = "canonical"; l.href = base; document.head.appendChild(l); }
    } catch (e) {}
  })();

  /* ================================================================
     4) INTERNET UZILGANDA OGOHLANTIRISH
     ================================================================ */
  const off = document.createElement("div");
  off.className = "cx10-off"; off.hidden = true; off.setAttribute("role", "alert");
  off.textContent = "Internet aloqasi yo'q. Buyurtma yuborish va havolalar ishlamasligi mumkin.";
  document.body.appendChild(off);
  const net = () => { off.hidden = navigator.onLine; };
  addEventListener("offline", net);
  addEventListener("online", () => { net(); toast("Aloqa tiklandi ✓"); });
  net();

  /* ================================================================
     5) MANZIL UCHUN SHAHARLAR TUGMALARI
     ================================================================ */
  (function cities() {
    const addr = $("#address"), lab = addr && addr.closest("label");
    if (!lab) return;
    const CITIES = ["Toshkent", "Samarqand", "Buxoro", "Andijon", "Namangan", "Farg'ona", "Qarshi", "Navoiy", "Jizzax", "Guliston", "Termiz", "Urganch", "Nukus"];
    const box = document.createElement("div"); box.className = "cx10-cities"; box.setAttribute("aria-label", "Shahar tanlash");
    CITIES.forEach(c => { const b = document.createElement("button"); b.type = "button"; b.textContent = c; box.appendChild(b); });
    lab.after(box);
    box.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      const rest = addr.value.replace(new RegExp("^(" + CITIES.map(c => c.replace(/'/g, "['ʻ’]")).join("|") + ")\\s*,?\\s*"), "");
      addr.value = b.textContent + ", " + rest;
      addr.dispatchEvent(new Event("input", { bubbles: true })); addr.focus();
      addr.setSelectionRange(addr.value.length, addr.value.length);
    });
  })();

  /* ================================================================
     6) KALENDARGA ESLATMA (.ics)
     ================================================================ */
  function downloadICS() {
    const end = new Date(PROMO_END), z = d => d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + "Z";
    const start = new Date(end.getTime() - 3600e3);
    const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Chronex//UZ//EN", "BEGIN:VEVENT", "UID:" + Date.now() + "@chronex", "DTSTAMP:" + z(new Date()),
      "DTSTART:" + z(start), "DTEND:" + z(end), "SUMMARY:Chronex aksiyasi tugaydi", `DESCRIPTION:${PROMO_CODE} promo-kodi bilan -10% chegirma bugun tugaydi.`,
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:Chronex aksiyasi ertaga tugaydi", "END:VALARM", "END:VEVENT", "END:VCALENDAR"];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([L.join("\r\n")], { type: "text/calendar" })); a.download = "chronex-aksiya.ics";
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast("Kalendar fayli yuklandi ✓");
  }

  /* ================================================================
     7) YASHIRIN SYURPRIZ (Konami kodi)
     ================================================================ */
  (function konami() {
    const SEQ = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let pos = 0;
    addEventListener("keydown", e => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = k === SEQ[pos] ? pos + 1 : (k === SEQ[0] ? 1 : 0);
      if (pos === SEQ.length) { pos = 0; party(); }
    });
    function party() {
      toast("🎉 Siz haqiqiy soatsoz ekansiz!");
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const cv = document.createElement("canvas"); cv.className = "cx10-conf"; document.body.appendChild(cv);
      const ctx = cv.getContext("2d"), W = cv.width = innerWidth, H = cv.height = innerHeight, cols = ["#e8d3a0", "#c9a86a", "#fff3c8", "#7ee8ff", "#ff5a6e"];
      const P = Array.from({ length: 160 }, () => ({ x: Math.random() * W, y: -20 - Math.random() * H * .5, vx: (Math.random() - .5) * 3, vy: Math.random() * 3 + 2, s: Math.random() * 7 + 4, r: Math.random() * 6, c: cols[(Math.random() * cols.length) | 0] }));
      const t0 = performance.now();
      (function f(now) {
        const t = now - t0; ctx.clearRect(0, 0, W, H);
        P.forEach(p => { p.x += p.vx; p.y += p.vy; p.r += .1; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = Math.max(0, 1 - t / 3500); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
        if (t < 3500) requestAnimationFrame(f); else cv.remove();
      })(t0);
    }
  })();
})();/* ===== CHRONEX chronex-ultra.js =====
   Mavjud kodga TEGMAYDI. index.html da </body> dan oldin bitta qator qo'shing:
       <script src="./chronex-ultra.js"></script>
   CSS ham shu fayl ichida.

   NIMALAR QO'SHILADI
   A) "Hayot uchun asboblar" bo'limi (5 tab):
        1. Yurak zonalari   2. Uyqu hisoblagich   3. Qadam va masofa
        4. Jamg'arma rejasi (soatni necha oyda olish mumkin)   5. Stol soati (to'liq ekran + Pomodoro)
   B) Buyurtmada: tanlovni havola bilan ulashish va oxirgi tanlovni tiklash
   C) Brauzer yorlig'ida (favicon) yurib turuvchi soat, boshqa oynaga o'tilganda sarlavha eslatmasi
   D) Qidiruv oynasida ovozli qidiruv (chronex-pro.js bilan birga ishlaydi)

   SOZLAMALAR: UZ_RATE (so'm kursi) */
(function () {
  "use strict";
  if (window.__cx11) return;
  window.__cx11 = 1;

  const UZ_RATE = 12500; // 1 USD = ? so'm. Haqiqiy kursga almashtiring.

  /* ================= YORDAMCHILAR ================= */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const pad = n => (n < 10 ? "0" : "") + n;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  function toast(m) {
    let box = $(".cx-toasts");
    if (!box) { box = document.createElement("div"); box.className = "cx-toasts"; document.body.appendChild(box); }
    const t = document.createElement("div"); t.className = "cx-toast"; t.textContent = m; box.appendChild(t);
    setTimeout(() => t.classList.add("out"), 2600); setTimeout(() => t.remove(), 3100);
  }
  const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
  const DAYS = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
  const fmtDate = d => d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
  const prices = () => {
    const l = $$("#model option").filter(o => o.dataset.price).map(o => ({ name: o.value, price: +o.dataset.price }));
    return l.length ? l : [{ name: "Chronex Aero", price: 249 }, { name: "Chronex Titan", price: 349 }, { name: "Chronex Nova", price: 299 }];
  };
  const money = n => "$" + Math.round(n).toLocaleString("en-US");
  const som = n => Math.round(n).toLocaleString("ru-RU") + " so'm";
  const zdt = d => d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + "Z";
  function downloadFile(name, text, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  /* ================= CSS ================= */
  const st = document.createElement("style");
  st.textContent = `
  .cx11-tabs{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin:30px 0 36px}
  .cx11-tabs button{background:var(--card,#13161e);color:var(--muted,#9097a8);border:1px solid var(--line,#222633);padding:10px 18px;border-radius:999px;cursor:pointer;font:inherit;font-size:14px;transition:.25s}
  .cx11-tabs button:hover{border-color:var(--accent,#c9a86a);color:var(--text,#f2f3f7)}
  .cx11-tabs button.on{background:linear-gradient(135deg,var(--accent2,#e8d3a0),var(--accent,#c9a86a));color:#111;border-color:transparent;font-weight:700}
  .cx11-pane{display:none;grid-template-columns:.9fr 1.1fr;gap:30px;align-items:start}
  .cx11-pane.on{display:grid;animation:cx11In .4s}
  @keyframes cx11In{from{opacity:0;transform:translateY(12px)}}
  .cx11-box{background:var(--card,#13161e);border:1px solid var(--line,#222633);border-radius:var(--radius,18px);padding:24px;display:grid;gap:14px}
  .cx11-box h3{margin:0;font-size:22px}
  .cx11-box label{display:grid;gap:7px;font-size:13px;color:var(--muted,#9097a8)}
  .cx11-box input[type=range]{padding:0;border:0;background:none;accent-color:var(--accent,#c9a86a);height:24px;cursor:pointer}
  .cx11-g2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .cx11-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .cx11-how{background:var(--bg,#07080b);border:1px dashed var(--line,#222633);border-radius:14px;padding:12px 14px;font-size:13px;color:var(--muted,#9097a8)}
  .cx11-how b{color:var(--accent,#c9a86a);display:block;margin-bottom:3px}
  .cx11-note{font-size:12px;color:var(--muted,#9097a8)}
  .cx11-chip{background:var(--card,#13161e);border:1px solid var(--line,#222633);color:var(--muted,#9097a8);border-radius:999px;padding:6px 14px;cursor:pointer;font:inherit;font-size:13px;transition:.2s}
  .cx11-chip:hover,.cx11-chip.on{border-color:var(--accent,#c9a86a);color:var(--text,#f2f3f7)}
  .cx11-chip.on{background:rgba(201,168,106,.15)}
  .cx11-big{font-size:clamp(34px,6vw,54px);font-weight:800;color:var(--accent2,#e8d3a0);font-variant-numeric:tabular-nums;line-height:1.05}
  .cx11-zone{display:grid;grid-template-columns:130px 1fr 96px;gap:12px;align-items:center;font-size:14px;padding:8px 10px;border-radius:12px;border:1px solid transparent;transition:.2s}
  .cx11-zone.on{border-color:var(--accent,#c9a86a);background:rgba(201,168,106,.1)}
  .cx11-zone small{display:block;color:var(--muted,#9097a8);font-size:11px}
  .cx11-bar{height:10px;background:var(--line,#222633);border-radius:8px;overflow:hidden}
  .cx11-bar i{display:block;height:100%;border-radius:8px;transition:width .4s}
  .cx11-zone b{text-align:right;font-variant-numeric:tabular-nums}
  .cx11-times{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
  .cx11-time{background:var(--bg,#07080b);border:1px solid var(--line,#222633);border-radius:14px;padding:14px;text-align:center}
  .cx11-time b{display:block;font-size:26px;color:var(--accent2,#e8d3a0);font-variant-numeric:tabular-nums}
  .cx11-time small{color:var(--muted,#9097a8);font-size:12px}
  .cx11-prog{height:12px;background:var(--line,#222633);border-radius:10px;overflow:hidden}
  .cx11-prog i{display:block;height:100%;background:linear-gradient(90deg,var(--accent2,#e8d3a0),var(--accent,#c9a86a));border-radius:10px;transition:width .5s}
  .cx11-plan{background:rgba(201,168,106,.08);border:1px solid var(--accent,#c9a86a);border-radius:14px;padding:14px;display:grid;gap:8px}
  .cx11-prev{display:grid;place-items:center;background:#000;border-radius:var(--radius,18px);min-height:230px;padding:20px;text-align:center}
  .cx11-prev .t{font-size:clamp(40px,8vw,64px);font-weight:800;font-variant-numeric:tabular-nums}
  .cx11-sw{width:30px;height:30px;border-radius:50%;border:2px solid transparent;outline:1px solid var(--line,#222633);outline-offset:2px;cursor:pointer;padding:0}
  .cx11-sw.on{outline:2px solid var(--accent,#c9a86a)}
  /* to'liq ekran soat */
  .cx11-clock{position:fixed;inset:0;z-index:950;background:#000;color:#f2f3f7;display:grid;place-items:center;text-align:center;animation:cx11In .3s}
  .cx11-clock .cx11-ctn{transition:filter .3s;display:grid;gap:10px;justify-items:center}
  .cx11-clock .t{font-size:min(26vw,30vh);font-weight:800;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:.02em}
  .cx11-clock .t.min{font-weight:200;font-size:min(30vw,36vh)}
  .cx11-clock .t small{font-size:.28em;opacity:.7;font-weight:600}
  .cx11-clock .d{font-size:clamp(16px,3vw,26px);letter-spacing:.2em;text-transform:uppercase;opacity:.75}
  .cx11-clock .p{font-size:clamp(16px,3vw,24px);margin-top:10px;padding:8px 20px;border:1px solid currentColor;border-radius:999px;opacity:.9}
  .cx11-cbar{position:absolute;left:0;right:0;bottom:0;padding:16px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center;background:linear-gradient(transparent,rgba(0,0,0,.85));transition:opacity .4s}
  .cx11-cbar.hide{opacity:0;pointer-events:none}
  .cx11-cbar button,.cx11-cbar label{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);color:#f2f3f7;border-radius:999px;padding:8px 16px;cursor:pointer;font:inherit;font-size:14px}
  .cx11-cbar button:hover{background:rgba(255,255,255,.18)}
  .cx11-cbar button.on{background:#e8d3a0;color:#111;border-color:#e8d3a0}
  .cx11-cbar input[type=range]{width:110px;accent-color:#e8d3a0;padding:0;border:0;background:none}
  .cx11-cx{position:absolute;top:14px;right:18px;background:none;border:0;color:#f2f3f7;font-size:34px;cursor:pointer;line-height:1;transition:opacity .4s}
  .cx11-cx.hide{opacity:0;pointer-events:none}
  /* buyurtma qatori */
  .cx11-share{display:flex;gap:8px;flex-wrap:wrap}
  .cx11-share button{background:var(--bg,#07080b);border:1px solid var(--line,#222633);color:var(--muted,#9097a8);border-radius:999px;padding:7px 16px;cursor:pointer;font:inherit;font-size:13px;transition:.2s}
  .cx11-share button:hover{border-color:var(--accent,#c9a86a);color:var(--text,#f2f3f7)}
  /* mikrofon */
  .cx10-pbox{position:relative}
  .cx11-mic{position:absolute;right:12px;top:12px;width:40px;height:40px;border-radius:50%;border:1px solid var(--line,#222633);background:var(--card,#13161e);color:var(--text,#f2f3f7);cursor:pointer;font-size:17px;z-index:2}
  .cx11-mic.on{background:#e5646b;border-color:#e5646b;animation:cx11Pulse 1s infinite}
  @keyframes cx11Pulse{50%{box-shadow:0 0 0 8px rgba(229,100,107,.25)}}
  .cx11-hasmic #cx10Q{padding-right:64px}
  @media(max-width:900px){.cx11-pane.on{grid-template-columns:1fr}.cx11-zone{grid-template-columns:100px 1fr 80px}.cx11-times{grid-template-columns:1fr}}`;
  document.head.appendChild(st);

  /* ================================================================
     A) HAYOT UCHUN ASBOBLAR
     ================================================================ */
  const sec = document.createElement("section");
  sec.className = "section"; sec.id = "cx11Tools";
  sec.innerHTML = `<div class="container">
    <p class="eyebrow center">Hayot uchun asboblar</p>
    <h2 class="center">Soat bilan kundalik hayot</h2>
    <p class="center muted">Puls zonalari, uyqu, qadam, jamg'arma rejasi va stol soati.</p>
    <div class="cx11-tabs" role="tablist">
      <button type="button" class="on" data-t="h">❤️ Yurak zonalari</button>
      <button type="button" data-t="s">😴 Uyqu</button>
      <button type="button" data-t="w">👟 Qadam va masofa</button>
      <button type="button" data-t="m">💰 Jamg'arma rejasi</button>
      <button type="button" data-t="c">🖥 Stol soati</button>
    </div>

    <!-- YURAK ZONALARI -->
    <div class="cx11-pane on" data-p="h">
      <div class="cx11-box"><h3>Puls zonalari</h3>
        <div class="cx11-g2"><label>Yoshingiz<input type="number" id="cx11Age" min="10" max="90" value="30"></label>
          <label>Dam olishdagi puls (ixtiyoriy)<input type="number" id="cx11Rest" min="30" max="120" placeholder="masalan 62"></label></div>
        <label>Hozirgi puls (ixtiyoriy)<input type="number" id="cx11Now" min="30" max="230" placeholder="soat ko'rsatgan qiymat"></label>
        <div class="cx11-how"><b>Qanday ishlaydi</b>Maksimal puls Tanaka formulasi bilan topiladi: 208 − 0,7 × yosh. Dam olishdagi pulsni kiritsangiz, zonalar Karvonen usulida hisoblanadi. Hozirgi pulsingiz qaysi zonaga tushishi yoritib ko'rsatiladi. Bu umumiy taxminiy formula. Yurak yoki sog'liq muammosi bo'lsa, mashq darajasini shifokor bilan kelishing.</div>
      </div>
      <div class="cx11-box"><div class="cx11-note" id="cx11Hm"></div><div id="cx11Zones" style="display:grid;gap:6px"></div></div>
    </div>

    <!-- UYQU -->
    <div class="cx11-pane" data-p="s">
      <div class="cx11-box"><h3>Uyqu hisoblagich</h3>
        <label>Nimani bilmoqchisiz?<select id="cx11SM"><option value="wake">Ertalab soat nechada turmoqchiman, qachon yotay?</option><option value="now">Hozir yotsam, qachon turay?</option></select></label>
        <label id="cx11SWl">Uyg'onish vaqti<input type="time" id="cx11ST" value="06:30"></label>
        <div class="cx11-how"><b>Qanday ishlaydi</b>Uyqu taxminan 90 daqiqalik sikllardan iborat. Sikl oxirida uyg'onish osonroq bo'ladi. Hisobda uxlab qolish uchun 15 daqiqa qo'shiladi. Ko'pchilik kattalar uchun odatiy tavsiya 7–9 soat. Bu taxminiy hisob-kitob, tibbiy maslahat emas.</div>
      </div>
      <div class="cx11-box"><div class="cx11-note" id="cx11SH"></div><div class="cx11-times" id="cx11STimes"></div></div>
    </div>

    <!-- QADAM -->
    <div class="cx11-pane" data-p="w">
      <div class="cx11-box"><h3>Qadam va masofa</h3>
        <label>Qadamlar soni: <b id="cx11StV" style="color:var(--accent,#c9a86a)">8 000</b><input type="range" id="cx11St" min="500" max="30000" step="500" value="8000"></label>
        <div class="cx11-g2"><label>Bo'yingiz (sm)<input type="number" id="cx11Ht" min="120" max="220" value="170"></label>
          <label>Vazningiz (kg)<input type="number" id="cx11Wt" min="30" max="200" value="70"></label></div>
        <div class="cx11-how"><b>Qanday ishlaydi</b>Qadam uzunligi bo'yingizning taxminan 41,5% iga teng deb olinadi. Masofa = qadam soni × qadam uzunligi. Kaloriya yurish uchun odatiy o'rtacha qiymat (har kg vazn va km uchun taxminan 0,57 kkal) bo'yicha topiladi. Natija taxminiy, soat datchiklari aniqroq o'lchaydi.</div>
      </div>
      <div class="cx11-box" style="text-align:center">
        <svg viewBox="0 0 160 160" width="170" height="170" style="margin:auto;transform:rotate(-90deg)"><circle cx="80" cy="80" r="68" fill="none" stroke="var(--line,#222633)" stroke-width="12"/><circle id="cx11Ring" cx="80" cy="80" r="68" fill="none" stroke="#c9a86a" stroke-width="12" stroke-linecap="round" stroke-dasharray="0 428" style="transition:stroke-dasharray .6s"/></svg>
        <div class="cx11-note">Kunlik maqsad: 10 000 qadam</div>
        <div class="cx11-g2" style="margin-top:6px"><div class="cx11-time"><b id="cx11Km">—</b><small>kilometr</small></div><div class="cx11-time"><b id="cx11Kc">—</b><small>kkal (taxminan)</small></div></div>
      </div>
    </div>

    <!-- JAMG'ARMA -->
    <div class="cx11-pane" data-p="m">
      <div class="cx11-box"><h3>Soatni necha oyda olasiz?</h3>
        <label>Model<select id="cx11PM"></select></label>
        <div class="cx11-row"><button type="button" class="cx11-chip on" data-cur="usd">$ dollar</button><button type="button" class="cx11-chip" data-cur="uzs">so'm</button></div>
        <div class="cx11-g2"><label>Oyiga jamg'arma<input type="number" id="cx11Mo" min="1" value="50"></label>
          <label>Hozirgi jamg'arma<input type="number" id="cx11Sv" min="0" value="0"></label></div>
        <div class="cx11-how"><b>Qanday ishlaydi</b>Narx va jamg'armangiz farqi oylik summaga bo'linadi. Natijada necha oy kerakligi, taxminiy sana va haftalik summa chiqadi. «Rejani saqlash» uni brauzerda saqlaydi, «Kalendarga eslatma» har oy jamg'arish uchun eslatma qo'shadi. Bu hisob-kitob kalkulyatori, do'kon taklif qiladigan bo'lib to'lash sharti emas. To'lov shartlarini operator aytadi.</div>
      </div>
      <div class="cx11-box">
        <div class="cx11-note" id="cx11Mp"></div><div class="cx11-big" id="cx11Mn">—</div><div class="muted" id="cx11Md"></div>
        <div class="cx11-time"><b id="cx11Mw" style="font-size:22px">—</b><small>haftasiga taxminan</small></div>
        <div class="cx11-row"><button class="btn btn-sm" id="cx11Msave" type="button">Rejani saqlash</button><button class="btn btn-sm btn-ghost" id="cx11Mics" type="button">📅 Kalendarga eslatma</button><button class="btn btn-sm btn-ghost" id="cx11Mnow" type="button">Hozir buyurtma</button></div>
        <div id="cx11Plan"></div>
      </div>
    </div>

    <!-- STOL SOATI -->
    <div class="cx11-pane" data-p="c">
      <div class="cx11-box"><h3>Telefoningizni stol soatiga aylantiring</h3>
        <label>Ko'rinishi<select id="cx11CS"><option value="digital">Raqamli</option><option value="analog">Analog</option><option value="minimal">Minimal</option></select></label>
        <div><div class="cx11-note" style="margin-bottom:8px">Rangi</div><div class="cx11-row" id="cx11CC"></div></div>
        <label class="cx11-row" style="display:flex"><input type="checkbox" id="cx11CSec" checked style="width:18px;height:18px;accent-color:var(--accent,#c9a86a)"> Soniyalarni ko'rsatish</label>
        <button class="btn" id="cx11COpen" type="button">⛶ To'liq ekranda ochish</button>
        <div class="cx11-how"><b>Qanday ishlaydi</b>Soat butun ekranni egallaydi. Imkon bo'lsa, ekran o'chib qolmaydi (brauzer ruxsat bersa). Pastdagi tugmalar bilan ko'rinish, yorqinlik va Pomodoro (25 daqiqa ish, 5 daqiqa tanaffus) boshqariladi. Tugmalar harakatsiz qolsa yashirinadi. Chiqish uchun Esc yoki × ni bosing.</div>
      </div>
      <div class="cx11-prev" id="cx11Prev"></div>
    </div>
  </div>`;
  const story = $("#story");
  const prevSec = $("#cx10Viewer") || $("#cx9Studio") || $("#technology");
  if (story) story.before(sec); else if (prevSec) prevSec.after(sec); else { const a = $("#order") || $(".footer"); if (a) a.before(sec); else document.body.appendChild(sec); }

  $$(".cx11-tabs button", sec).forEach(b => b.onclick = () => {
    $$(".cx11-tabs button", sec).forEach(x => x.classList.toggle("on", x === b));
    $$(".cx11-pane", sec).forEach(p => p.classList.toggle("on", p.dataset.p === b.dataset.t));
  });

  /* ---------- 1. YURAK ZONALARI ---------- */
  const ZN = [["1 · Yengil", .5, .6, "#7ee8ff", "isinish, tiklanish"], ["2 · Yog' yoqish", .6, .7, "#7ee8a8", "bir tekis yurish yoki yugurish"],
    ["3 · Aerob", .7, .8, "#e8d3a0", "chidamlilikni oshirish"], ["4 · Anaerob", .8, .9, "#ffb020", "tez tempdagi mashq"], ["5 · Maksimal", .9, 1, "#ff5a3c", "juda qisqa va kuchli zo'riqish"]];
  function zones() {
    const age = Math.min(90, Math.max(10, +$("#cx11Age", sec).value || 30)), max = Math.round(208 - .7 * age);
    const rest = +$("#cx11Rest", sec).value || 0, kv = rest >= 30 && rest < max, now = +$("#cx11Now", sec).value || 0;
    const bpm = p => Math.round(kv ? rest + (max - rest) * p : max * p);
    $("#cx11Hm", sec).textContent = `Maksimal puls ≈ ${max} urish/daq · ${kv ? "Karvonen usuli (dam olish pulsi " + rest + ")" : "Tanaka formulasi"}`;
    let hit = -1; ZN.forEach((z, i) => { if (now && now >= bpm(z[1]) && (now <= bpm(z[2]) || i === 4)) hit = i; });
    $("#cx11Zones", sec).innerHTML = ZN.map((z, i) => `<div class="cx11-zone${i === hit ? " on" : ""}"><div>${z[0]}<small>${z[4]}</small></div>
      <div class="cx11-bar"><i style="width:${(bpm(z[2]) / max * 100).toFixed(0)}%;background:${z[3]}"></i></div><b>${bpm(z[1])}–${bpm(z[2])}</b></div>`).join("");
  }
  ["cx11Age", "cx11Rest", "cx11Now"].forEach(id => $("#" + id, sec).addEventListener("input", zones)); zones();

  /* ---------- 2. UYQU ---------- */
  const sm = $("#cx11SM", sec), stime = $("#cx11ST", sec);
  function sleep() {
    const mode = sm.value, box = $("#cx11STimes", sec); $("#cx11SWl", sec).style.display = mode === "wake" ? "" : "none";
    const f = d => pad(d.getHours()) + ":" + pad(d.getMinutes());
    let out = [];
    if (mode === "wake") {
      const [h, m] = (stime.value || "06:30").split(":").map(Number), t = new Date(); t.setHours(h, m, 0, 0);
      $("#cx11SH", sec).textContent = `${f(t)} da uyg'onish uchun quyidagi vaqtlarda yoting:`;
      out = [6, 5, 4].map(n => ({ n, t: new Date(t.getTime() - (n * 90 + 15) * 60000) }));
    } else {
      const t = new Date(Date.now() + 15 * 60000);
      $("#cx11SH", sec).textContent = "Hozir yotsangiz (15 daqiqada uxlab qolasiz), quyidagi vaqtlarda uyg'onish yaxshi:";
      out = [4, 5, 6].map(n => ({ n, t: new Date(t.getTime() + n * 90 * 60000) }));
    }
    box.innerHTML = out.map(o => `<div class="cx11-time"><b>${f(o.t)}</b><small>${o.n} sikl · ${(o.n * 1.5).toString().replace(".", ",")} soat uyqu</small></div>`).join("");
  }
  sm.addEventListener("change", sleep); stime.addEventListener("input", sleep); sleep();

  /* ---------- 3. QADAM ---------- */
  function steps() {
    const s = +$("#cx11St", sec).value, ht = +$("#cx11Ht", sec).value || 170, wt = +$("#cx11Wt", sec).value || 70;
    $("#cx11StV", sec).textContent = s.toLocaleString("ru-RU");
    const km = s * ht * .415 / 100000;
    $("#cx11Km", sec).textContent = km.toFixed(1).replace(".", ","); $("#cx11Kc", sec).textContent = Math.round(km * wt * .57);
    const C = 2 * Math.PI * 68, p = Math.min(1, s / 10000);
    $("#cx11Ring", sec).setAttribute("stroke-dasharray", `${(C * p).toFixed(1)} ${C.toFixed(1)}`);
  }
  ["cx11St", "cx11Ht", "cx11Wt"].forEach(id => $("#" + id, sec).addEventListener("input", steps)); steps();

  /* ---------- 4. JAMG'ARMA REJASI ---------- */
  const pm = $("#cx11PM", sec); let cur = "usd";
  prices().forEach(p => { const o = document.createElement("option"); o.value = p.name; o.textContent = `${p.name} — ${money(p.price)}`; pm.appendChild(o); });
  const priceOf = () => (prices().find(p => p.name === pm.value) || prices()[0]).price;
  const toUSD = v => cur === "uzs" ? v / UZ_RATE : v, fmtCur = usd => cur === "uzs" ? som(usd * UZ_RATE) : money(usd);
  let planCache = null;
  function savings() {
    const price = priceOf(), monthly = toUSD(+$("#cx11Mo", sec).value || 0), have = toUSD(+$("#cx11Sv", sec).value || 0), need = Math.max(0, price - have);
    $("#cx11Mp", sec).textContent = `${pm.value}: ${money(price)}${cur === "uzs" ? " ≈ " + som(price * UZ_RATE) : ""}`;
    if (monthly <= 0) { $("#cx11Mn", sec).textContent = "—"; $("#cx11Md", sec).textContent = "Oylik summani kiriting"; $("#cx11Mw", sec).textContent = "—"; planCache = null; return; }
    if (need === 0) { $("#cx11Mn", sec).textContent = "Tayyor 🎉"; $("#cx11Md", sec).textContent = "Jamg'armangiz soat narxiga yetadi."; $("#cx11Mw", sec).textContent = "—"; planCache = null; return; }
    const months = Math.ceil(need / monthly), d = new Date(); d.setMonth(d.getMonth() + months);
    $("#cx11Mn", sec).textContent = months + " oy";
    $("#cx11Md", sec).textContent = `Taxminan ${fmtDate(d)} ga qadar`;
    $("#cx11Mw", sec).textContent = fmtCur(monthly / 4.33);
    planCache = { model: pm.value, price, months, monthlyUSD: monthly, haveUSD: have };
  }
  $$("[data-cur]", sec).forEach(b => b.onclick = () => {
    cur = b.dataset.cur; $$("[data-cur]", sec).forEach(x => x.classList.toggle("on", x === b));
    $("#cx11Mo", sec).value = cur === "uzs" ? 600000 : 50; $("#cx11Sv", sec).value = 0; savings();
  });
  pm.addEventListener("change", savings); ["cx11Mo", "cx11Sv"].forEach(id => $("#" + id, sec).addEventListener("input", savings));
  function drawPlan() {
    const p = store.get("cx11_plan", null), box = $("#cx11Plan", sec);
    if (!p) { box.innerHTML = ""; return; }
    const el = Math.max(0, (Date.now() - p.start) / (30.4 * 864e5)), saved = Math.min(p.price, p.haveUSD + p.monthlyUSD * el), pct = Math.min(100, saved / p.price * 100);
    box.innerHTML = `<div class="cx11-plan"><b>Sizning rejangiz: ${esc(p.model)}</b>
      <div class="cx11-prog"><i style="width:${pct.toFixed(0)}%"></i></div>
      <div class="cx11-note">Rejaga ko'ra hozir ≈ ${money(saved)} / ${money(p.price)} (${pct.toFixed(0)}%). Oyiga ${money(p.monthlyUSD)}, jami ${p.months} oy. Bu jamg'armangiz haqiqiy holati emas, reja bo'yicha taxminiy ko'rsatkich.</div>
      <button class="link" id="cx11Pdel" type="button">Rejani o'chirish</button></div>`;
  }
  $("#cx11Plan", sec).addEventListener("click", e => { if (e.target.id === "cx11Pdel") { store.del("cx11_plan"); drawPlan(); } });
  $("#cx11Msave", sec).onclick = () => { if (!planCache) { toast("Avval to'g'ri summa kiriting"); return; } store.set("cx11_plan", Object.assign({ start: Date.now() }, planCache)); drawPlan(); toast("Reja saqlandi ✓"); };
  $("#cx11Mics", sec).onclick = () => {
    if (!planCache) { toast("Avval to'g'ri summa kiriting"); return; }
    const d = new Date(); d.setMonth(d.getMonth() + 1); d.setHours(10, 0, 0, 0);
    const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Chronex//UZ//EN", "BEGIN:VEVENT", "UID:" + Date.now() + "@chronex-plan", "DTSTAMP:" + zdt(new Date()),
      "DTSTART:" + zdt(d), "DTEND:" + zdt(new Date(d.getTime() + 1800000)), "RRULE:FREQ=MONTHLY;COUNT=" + planCache.months,
      `SUMMARY:Chronex uchun jamg'arma: ${money(planCache.monthlyUSD)}`, `DESCRIPTION:${planCache.model} uchun oylik jamg'arma vaqti.`, "END:VEVENT", "END:VCALENDAR"];
    downloadFile("chronex-jamgarma.ics", L.join("\r\n"), "text/calendar"); toast("Kalendar fayli yuklandi ✓");
  };
  $("#cx11Mnow", sec).onclick = () => { const s = $("#model"); if (s) { s.value = pm.value; s.dispatchEvent(new Event("change")); } const o = $("#order"); if (o) o.scrollIntoView({ behavior: "smooth" }); };
  savings(); drawPlan();

  /* ---------- 5. STOL SOATI ---------- */
  const CC = ["#e8d3a0", "#7ee8ff", "#7ee8a8", "#ff8a95", "#ffffff"];
  const clk = { style: "digital", color: CC[0], sec: true };
  const swBox = $("#cx11CC", sec);
  CC.forEach((c, i) => { const b = document.createElement("button"); b.type = "button"; b.className = "cx11-sw" + (i === 0 ? " on" : ""); b.style.background = c; b.setAttribute("aria-label", "Rang " + (i + 1)); b.onclick = () => { clk.color = c; $$("button", swBox).forEach(x => x.classList.toggle("on", x === b)); drawPrev(); }; swBox.appendChild(b); });
  $("#cx11CS", sec).addEventListener("change", e => { clk.style = e.target.value; drawPrev(); });
  $("#cx11CSec", sec).addEventListener("change", e => { clk.sec = e.target.checked; drawPrev(); });
  const analogSVG = c => { let t = ""; for (let i = 0; i < 12; i++) t += `<line x1="100" y1="12" x2="100" y2="${i % 3 ? 20 : 26}" stroke="${c}" stroke-width="${i % 3 ? 2 : 4}" transform="rotate(${i * 30} 100 100)"/>`;
    return `<svg viewBox="0 0 200 200" style="width:min(70vmin,420px);height:auto"><circle cx="100" cy="100" r="94" fill="none" stroke="${c}" stroke-opacity=".35" stroke-width="2"/>${t}
      <line data-a="h" x1="100" y1="108" x2="100" y2="56" stroke="${c}" stroke-width="5" stroke-linecap="round"/><line data-a="m" x1="100" y1="112" x2="100" y2="30" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>
      <line data-a="s" x1="100" y1="118" x2="100" y2="22" stroke="#ff5a3c" stroke-width="1.6" stroke-linecap="round"/><circle cx="100" cy="100" r="5" fill="#ff5a3c"/></svg>`; };
  function paintClock(root, o, now) {
    const hm = pad(now.getHours()) + ":" + pad(now.getMinutes()), sc = pad(now.getSeconds()), date = DAYS[now.getDay()] + ", " + now.getDate() + " " + MONTHS[now.getMonth()];
    if (o.style === "analog") {
      if (!root.querySelector("svg")) root.innerHTML = analogSVG(o.color) + `<div class="d"></div>`;
      const s = now.getSeconds() + now.getMilliseconds() / 1000, m = now.getMinutes() + s / 60, h = (now.getHours() % 12) + m / 60;
      [["h", h * 30], ["m", m * 6], ["s", s * 6]].forEach(([k, a]) => { const e = root.querySelector(`[data-a="${k}"]`); if (e) e.setAttribute("transform", `rotate(${a.toFixed(1)} 100 100)`); });
      root.querySelector(".d").textContent = date;
    } else {
      const html = `<div class="t${o.style === "minimal" ? " min" : ""}" style="color:${o.color}">${hm}${o.sec && o.style !== "minimal" ? `<small>:${sc}</small>` : ""}</div>${o.style === "minimal" ? "" : `<div class="d">${date}</div>`}`;
      if (root.dataset.k !== html) { root.innerHTML = html; root.dataset.k = html; }
    }
  }
  const prev = $("#cx11Prev", sec);
  function drawPrev() { prev.innerHTML = ""; const d = document.createElement("div"); d.className = "cx11-ctn"; d.style.cssText = "display:grid;gap:8px;justify-items:center"; prev.appendChild(d); prev._d = d; paintClock(d, clk, new Date()); }
  drawPrev();
  let prevVisible = false;
  new IntersectionObserver(es => { prevVisible = es[0].isIntersecting; }, { threshold: 0 }).observe(sec);
  setInterval(() => { if (prevVisible && $(".cx11-pane.on", sec).dataset.p === "c" && prev._d) { if (clk.style !== "analog") paintClock(prev._d, clk, new Date()); else paintClock(prev._d, clk, new Date()); } }, 250);
  // oldindan ko'rishdagi analog soat uchun ranglarni yangilash
  const prevStyle = document.createElement("style"); prevStyle.textContent = ".cx11-prev .t{font-size:clamp(40px,8vw,64px);font-weight:800}.cx11-prev .t.min{font-weight:200}.cx11-prev .t small{font-size:.3em;opacity:.7}.cx11-prev .d{opacity:.7;letter-spacing:.2em;text-transform:uppercase;font-size:13px}.cx11-prev svg{width:150px!important}"; document.head.appendChild(prevStyle);

  // to'liq ekran
  let ov = null, wl = null, raf = 0, hideT = 0;
  const pomo = { on: false, mode: "work", left: 25 * 60000, end: 0, done: 0 };
  let actx = null;
  function beep() {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume();
      [0, .3, .6].forEach(d => { const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + d; o.frequency.value = 880; o.connect(g); g.connect(actx.destination);
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.25, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .25); o.start(t); o.stop(t + .27); });
    } catch (e) {}
  }
  async function lockScreen() { try { if (navigator.wakeLock) wl = await navigator.wakeLock.request("screen"); } catch (e) { wl = null; } }
  document.addEventListener("visibilitychange", () => { if (ov && document.visibilityState === "visible") lockScreen(); });
  const pomoLeft = () => pomo.on ? Math.max(0, pomo.end - Date.now()) : pomo.left;
  function pomoStep() {
    if (!pomo.on || pomoLeft() > 0) return;
    beep();
    if (pomo.mode === "work") { pomo.done++; pomo.mode = "break"; pomo.left = (pomo.done % 4 === 0 ? 15 : 5) * 60000; toast("🍅 Tanaffus vaqti!"); }
    else { pomo.mode = "work"; pomo.left = 25 * 60000; toast("🍅 Ishga qaytamiz!"); }
    pomo.end = Date.now() + pomo.left;
  }
  function openClock() {
    if (ov) return;
    ov = document.createElement("div"); ov.className = "cx11-clock"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-label", "To'liq ekran soat");
    ov.innerHTML = `<div class="cx11-ctn" id="cx11Ctn"></div><div class="p" id="cx11Pm" style="display:none;position:absolute;bottom:90px;font-size:20px;padding:8px 20px;border:1px solid currentColor;border-radius:999px"></div>
      <button class="cx11-cx" type="button" aria-label="Yopish">×</button>
      <div class="cx11-cbar"><button type="button" data-s="digital">Raqamli</button><button type="button" data-s="analog">Analog</button><button type="button" data-s="minimal">Minimal</button>
        <label style="display:flex;gap:8px;align-items:center">☀ <input type="range" id="cx11Dim" min="15" max="100" value="100" aria-label="Yorqinlik"></label>
        <button type="button" id="cx11Pt">🍅 Pomodoro</button><button type="button" id="cx11Pr" hidden>↺</button></div>`;
    document.body.appendChild(ov);
    document.body.style.overflow = "hidden";
    const ctn = $("#cx11Ctn", ov), bar = $(".cx11-cbar", ov), cx = $(".cx11-cx", ov), pm2 = $("#cx11Pm", ov), pt = $("#cx11Pt", ov), pr = $("#cx11Pr", ov);
    const mark = () => $$("[data-s]", ov).forEach(b => b.classList.toggle("on", b.dataset.s === clk.style)); mark();
    $$("[data-s]", ov).forEach(b => b.onclick = () => { clk.style = b.dataset.s; ctn.innerHTML = ""; ctn.dataset.k = ""; mark(); $("#cx11CS", sec).value = clk.style; drawPrev(); });
    $("#cx11Dim", ov).addEventListener("input", e => { ctn.style.filter = `brightness(${e.target.value / 100})`; pm2.style.filter = ctn.style.filter; });
    pt.onclick = () => {
      if (!pomo.on) { pomo.on = true; pomo.end = Date.now() + pomo.left; pt.classList.add("on"); pt.textContent = "⏸ Pauza"; pr.hidden = false; pm2.style.display = ""; beepInit(); }
      else { pomo.left = pomoLeft(); pomo.on = false; pt.classList.remove("on"); pt.textContent = "▶ Davom"; }
    };
    pr.onclick = () => { pomo.on = false; pomo.mode = "work"; pomo.left = 25 * 60000; pomo.done = 0; pt.classList.remove("on"); pt.textContent = "🍅 Pomodoro"; pr.hidden = true; pm2.style.display = "none"; };
    function beepInit() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume(); } catch (e) {} }
    const close = () => { cancelAnimationFrame(raf); clearTimeout(hideT); ov.remove(); ov = null; document.body.style.overflow = ""; if (wl) { try { wl.release(); } catch (e) {} wl = null; } if (document.fullscreenElement) { try { document.exitFullscreen(); } catch (e) {} } removeEventListener("keydown", onKey); };
    const onKey = e => { if (e.key === "Escape") close(); };
    addEventListener("keydown", onKey); cx.onclick = close;
    const showBar = () => { bar.classList.remove("hide"); cx.classList.remove("hide"); clearTimeout(hideT); hideT = setTimeout(() => { bar.classList.add("hide"); cx.classList.add("hide"); }, 4000); };
    ov.addEventListener("pointermove", showBar); ov.addEventListener("pointerdown", showBar); showBar();
    const loop = () => {
      if (!ov) return;
      paintClock(ctn, clk, new Date());
      pomoStep();
      if (pomo.on || pm2.style.display !== "none") { const l = Math.ceil(pomoLeft() / 1000); pm2.style.color = clk.color; pm2.textContent = `🍅 ${pomo.mode === "work" ? "Ish" : "Tanaffus"} · ${pad(Math.floor(l / 60))}:${pad(l % 60)} · tugagan: ${pomo.done}`; }
      raf = requestAnimationFrame(loop);
    };
    loop();
    try { if (ov.requestFullscreen) ov.requestFullscreen().catch(() => {}); } catch (e) {}
    lockScreen();
  }
  $("#cx11COpen", sec).onclick = openClock;

  /* ================================================================
     B) BUYURTMA: ULASHILADIGAN TANLOV + OXIRGI TANLOV
     ================================================================ */
  (function selection() {
    const model = $("#model"), finish = $("#finish"), qty = $("#qty"), form = $("#orderForm");
    if (!model || !finish || !qty || !form) return;
    const cur = () => ({ m: model.value, c: finish.value, q: +qty.value });
    const setQty = q => { const minus = $("#minus"), plus = $("#plus"); if (!minus || !plus) return; for (let i = 0; i < 10; i++) minus.click(); for (let i = 1; i < q; i++) plus.click(); };
    const apply = s => {
      if ([...model.options].some(o => o.value === s.m)) { model.value = s.m; model.dispatchEvent(new Event("change")); }
      if (s.c) { let o = [...finish.options].find(x => x.value === s.c || x.text === s.c); if (!o) { o = new Option(s.c, s.c); finish.add(o); } finish.value = o.value; finish.dispatchEvent(new Event("change")); }
      if (s.q >= 1 && s.q <= 10) setQty(s.q);
    };
    const box = document.createElement("div"); box.className = "cx11-share";
    box.innerHTML = `<button type="button" id="cx11Sh">🔗 Tanlovni ulashish</button><button type="button" id="cx11Rs" hidden></button>`;
    const total = $(".total", form); (total || $("button[type=submit]", form)).before(box);
    $("#cx11Sh", box).onclick = async () => {
      const s = cur(), url = location.origin && location.origin !== "null" ? location.origin + location.pathname : location.href.split("?")[0].split("#")[0];
      const link = `${url}?m=${encodeURIComponent(s.m)}&c=${encodeURIComponent(s.c)}&q=${s.q}#order`;
      try { if (navigator.share) { await navigator.share({ title: "Chronex", text: `${s.m}, ${s.c}`, url: link }); return; } } catch (e) { return; }
      try { await navigator.clipboard.writeText(link); toast("Havola nusxalandi ✓"); } catch (e) { window.prompt("Havolani nusxalang:", link); }
    };
    const sp = new URLSearchParams(location.search), shared = sp.get("m");
    if (shared) {
      apply({ m: shared, c: sp.get("c") || "", q: +sp.get("q") || 1 });
      setTimeout(() => { const o = $("#order"); if (o) o.scrollIntoView({ behavior: "smooth" }); toast("Ulashilgan tanlov qo'llandi ✓"); }, 700);
    }
    const last = store.get("cx11_last", null), rs = $("#cx11Rs", box), c0 = cur();
    if (last && !shared && (last.m !== c0.m || last.c !== c0.c || last.q !== c0.q)) { rs.hidden = false; rs.textContent = `↩ Oxirgi tanlov: ${last.m} · ${last.c} × ${last.q}`; rs.onclick = () => { apply(last); rs.hidden = true; toast("Oxirgi tanlov tiklandi ✓"); }; }
    const save = () => setTimeout(() => store.set("cx11_last", cur()), 50);
    [model, finish].forEach(e => e.addEventListener("change", save)); ["minus", "plus"].forEach(id => { const b = $("#" + id); if (b) b.addEventListener("click", save); });
  })();

  /* ================================================================
     C) BRAUZER YORLIG'IDA SOAT + SARLAVHA ESLATMASI
     ================================================================ */
  (function favicon() {
    let link = $('link[rel~="icon"]');
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.type = "image/png";
    const cv = document.createElement("canvas"); cv.width = cv.height = 64; const x = cv.getContext("2d");
    function draw() {
      const d = new Date(), s = d.getSeconds(), m = d.getMinutes() + s / 60, h = (d.getHours() % 12) + m / 60;
      x.clearRect(0, 0, 64, 64);
      x.beginPath(); x.arc(32, 32, 30, 0, 7); x.fillStyle = "#0b0b0f"; x.fill(); x.lineWidth = 5; x.strokeStyle = "#c9a86a"; x.stroke();
      x.fillStyle = "#e8d3a0"; x.fillRect(30, 8, 4, 8);
      const hand = (a, l, w, c) => { x.beginPath(); x.moveTo(32, 32); x.lineTo(32 + Math.sin(a) * l, 32 - Math.cos(a) * l); x.lineWidth = w; x.strokeStyle = c; x.lineCap = "round"; x.stroke(); };
      hand(h * Math.PI / 6, 14, 4, "#f2f3f7"); hand(m * Math.PI / 30, 21, 3, "#f2f3f7"); hand(s * Math.PI / 30, 24, 1.6, "#ff5a3c");
      link.href = cv.toDataURL("image/png");
    }
    draw(); setInterval(draw, 1000);
    const orig = document.title;
    document.addEventListener("visibilitychange", () => { document.title = document.hidden ? "⌚ Soat sizni kutmoqda | CHRONEX" : orig; });
  })();

  /* ================================================================
     D) OVOZLI QIDIRUV (chronex-pro.js qidiruv oynasida)
     ================================================================ */
  (function voice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    let tries = 0;
    const iv = setInterval(() => {
      const box = $(".cx10-pbox"), input = $("#cx10Q");
      if (++tries > 20) clearInterval(iv);
      if (!box || !input || $(".cx11-mic", box)) return;
      clearInterval(iv);
      const b = document.createElement("button"); b.type = "button"; b.className = "cx11-mic"; b.textContent = "🎤"; b.title = "Ovozli qidiruv"; b.setAttribute("aria-label", "Ovozli qidiruv");
      box.classList.add("cx11-hasmic"); box.appendChild(b);
      b.onclick = () => {
        const r = new SR(); r.lang = { uz: "uz-UZ", ru: "ru-RU", en: "en-US" }[document.documentElement.lang] || "uz-UZ"; r.interimResults = false; r.maxAlternatives = 1;
        r.onresult = e => { input.value = e.results[0][0].transcript.replace(/[.?!]$/, ""); input.dispatchEvent(new Event("input")); input.focus(); };
        r.onerror = () => toast("Ovozni eshitib bo'lmadi. Mikrofonga ruxsat bering");
        r.onend = () => b.classList.remove("on");
        b.classList.add("on"); try { r.start(); } catch (e) { b.classList.remove("on"); }
      };
    }, 500);
  })();
})();