/* ===== CHRONEX chronex-wow.js =====
   Mavjud kodga TEGMAYDI. index.html da </body> dan oldin bitta qator qo'shing:
       <script src="./chronex-wow.js"></script>
   CSS ham shu fayl ichida.

   NIMALAR QO'SHILADI
   1) "Zarrachali soat": hozirgi vaqt minglab oltin zarrachadan yig'iladi, kursor zarrachalarni itaradi
   2) "Sinab ko'ring" bo'limi (3 tab):
        - Ishlaydigan xronograf (start, to'xtatish, aylanish, nolga)
        - Kamerada sinash: kamera yoki rasm ustida soatni sudrab joylashtiring va rasmga oling
        - Narx kuniga: soat necha yil xizmat qilsa, kuniga qancha turadi
   3) Model kartalarida 3D qiyshayish va yaltirash effekti

   SOZLAMALAR: UZ_RATE (so'm kursi) */
(function () {
  "use strict";
  if (window.__cx15) return;
  window.__cx15 = 1;

  const UZ_RATE = 12500; // 1 USD = ? so'm. Haqiqiy kursga almashtiring.

  /* ================= YORDAMCHILAR ================= */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const pad = n => (n < 10 ? "0" : "") + n;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hoverOK = matchMedia("(hover: hover)").matches;
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
  let actx = null;
  function tick(freq) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume();
      const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
      o.type = "square"; o.frequency.setValueAtTime(freq || 1500, t); o.frequency.exponentialRampToValueAtTime(400, t + .03);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.07, t + .002); g.gain.exponentialRampToValueAtTime(.0001, t + .06);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + .07);
    } catch (e) {}
  }

  /* ================= CSS ================= */
  const st = document.createElement("style");
  st.textContent = `
  .cx15-dust{background:var(--bg,#07080b);overflow:hidden;position:relative}
  .cx15-dust canvas{display:block;width:100%;height:clamp(200px,32vw,380px);margin-top:20px;cursor:crosshair;touch-action:pan-y}
  .cx15-cap{text-align:center;color:var(--muted,#9097a8);font-size:14px;letter-spacing:.2em;text-transform:uppercase;margin-top:8px;font-variant-numeric:tabular-nums}
  .cx15-tabs{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin:30px 0 36px}
  .cx15-tabs button{background:var(--card,#13161e);color:var(--muted,#9097a8);border:1px solid var(--line,#222633);padding:10px 20px;border-radius:999px;cursor:pointer;font:inherit;font-size:14px;transition:.25s}
  .cx15-tabs button:hover{border-color:var(--accent,#c9a86a);color:var(--text,#f2f3f7)}
  .cx15-tabs button.on{background:linear-gradient(135deg,var(--accent2,#e8d3a0),var(--accent,#c9a86a));color:#111;border-color:transparent;font-weight:700}
  .cx15-pane{display:none;grid-template-columns:1.05fr .95fr;gap:32px;align-items:center}
  .cx15-pane.on{display:grid;animation:cx15In .4s}
  @keyframes cx15In{from{opacity:0;transform:translateY(12px)}}
  .cx15-vis{background:var(--card,#13161e);border:1px solid var(--line,#222633);border-radius:var(--radius,18px);padding:20px;display:grid;place-items:center;min-height:380px;position:relative;overflow:hidden}
  .cx15-side{display:grid;gap:14px}
  .cx15-side h3{margin:0;font-size:24px}
  .cx15-side label{display:grid;gap:7px;font-size:13px;color:var(--muted,#9097a8)}
  .cx15-side input[type=range]{padding:0;border:0;background:none;accent-color:var(--accent,#c9a86a);height:24px;cursor:pointer}
  .cx15-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .cx15-how{background:var(--bg,#07080b);border:1px dashed var(--line,#222633);border-radius:14px;padding:12px 14px;font-size:13px;color:var(--muted,#9097a8)}
  .cx15-how b{color:var(--accent,#c9a86a);display:block;margin-bottom:3px}
  .cx15-chip{background:var(--card,#13161e);border:1px solid var(--line,#222633);color:var(--muted,#9097a8);border-radius:999px;padding:7px 16px;cursor:pointer;font:inherit;font-size:13px;transition:.2s}
  .cx15-chip:hover,.cx15-chip.on{border-color:var(--accent,#c9a86a);color:var(--text,#f2f3f7)}
  .cx15-chip.on{background:rgba(201,168,106,.15)}
  .cx15-big{font-size:clamp(34px,6vw,52px);font-weight:800;color:var(--accent2,#e8d3a0);font-variant-numeric:tabular-nums;line-height:1.05}
  /* xronograf */
  .cx15-chrono{display:grid;gap:12px;justify-items:center;width:100%;outline:none}
  .cx15-chrono:focus-visible{box-shadow:0 0 0 2px var(--accent,#c9a86a);border-radius:12px}
  .cx15-chrono svg{width:100%;max-width:380px;height:auto;overflow:visible;filter:drop-shadow(0 22px 28px rgba(0,0,0,.5))}
  .cx15-push{cursor:pointer;transition:transform .12s}
  .cx15-push.down rect{transform:translateX(-4px)}
  .cx15-push rect{transition:transform .12s}
  .cx15-push:focus-visible rect{stroke:#fff;stroke-width:2}
  .cx15-digi{font-size:30px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--accent2,#e8d3a0);letter-spacing:.06em}
  .cx15-laps{list-style:none;margin:0;padding:0;display:grid;gap:4px;max-height:130px;overflow:auto;width:100%;max-width:340px;font-size:14px;font-variant-numeric:tabular-nums;color:var(--muted,#9097a8)}
  .cx15-laps li{display:flex;justify-content:space-between;border-bottom:1px dashed var(--line,#222633);padding:3px 2px}
  /* kamera */
  .cx15-stage{position:relative;width:100%;max-width:380px;aspect-ratio:3/4;background:#0b0b0f;border-radius:16px;overflow:hidden;touch-action:none}
  .cx15-stage video,.cx15-stage img.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .cx15-ph{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:24px;color:var(--muted,#9097a8);font-size:14px;background:radial-gradient(circle at 50% 40%,#1a1d27,#0b0b0f)}
  .cx15-w{position:absolute;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;filter:drop-shadow(0 10px 14px rgba(0,0,0,.55))}
  .cx15-w:active{cursor:grabbing}
  .cx15-w svg{display:block;width:100%;height:auto;pointer-events:none}
  .cx15-stage [hidden]{display:none!important}
  .cx15-msg{font-size:13px;color:#e5646b;min-height:18px}
  /* 3D kartalar */
  .cx15-gl{position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .3s;z-index:2;
    background:radial-gradient(240px circle at var(--gx,50%) var(--gy,30%),rgba(255,255,255,.2),transparent 60%)}
  .card:hover>.cx15-gl{opacity:1}
  @media(max-width:900px){.cx15-pane.on{grid-template-columns:1fr}}`;
  document.head.appendChild(st);

  /* ================================================================
     1) ZARRACHALI SOAT
     ================================================================ */
  const dust = document.createElement("section");
  dust.className = "section cx15-dust"; dust.id = "cx15Dust";
  dust.innerHTML = `<div class="container"><p class="eyebrow center">Vaqt</p><h2 class="center">Vaqt zarrachalardan yaratilgan</h2>
    <p class="center muted">Kursorni zarrachalar ustida yurgizing yoki bosing. Ular qaytib yig'iladi.</p>
    <canvas id="cx15Cv" role="img" aria-label="Zarrachalardan yig'ilgan hozirgi vaqt"></canvas><div class="cx15-cap" id="cx15Cap"></div></div>`;
  const story = $("#story"), cta = $("#cta");
  if (story) story.after(dust); else if (cta) cta.before(dust); else { const a = $("#order") || $(".footer"); if (a) a.before(dust); else document.body.appendChild(dust); }

  const cv = $("#cx15Cv", dust), ctx = cv.getContext("2d");
  const DAYS = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
  let W = 0, H = 0, parts = [], mouse = { x: -999, y: -999 }, lastText = "", dvis = false;
  const timeText = () => { const d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()); };

  function sample(text) {
    const off = document.createElement("canvas"); off.width = Math.max(1, Math.floor(W)); off.height = Math.max(1, Math.floor(H));
    const o = off.getContext("2d");
    let fs = H * .95; o.font = `800 ${fs}px Arial, sans-serif`;
    while (o.measureText(text).width > W * .9 && fs > 20) { fs -= 4; o.font = `800 ${fs}px Arial, sans-serif`; }
    o.textAlign = "center"; o.textBaseline = "middle"; o.fillStyle = "#fff"; o.fillText(text, W / 2, H / 2 + fs * .04);
    const data = o.getImageData(0, 0, off.width, off.height).data, pts = [], step = 3;
    for (let y = 0; y < off.height; y += step) for (let x = 0; x < off.width; x += step) if (data[(y * off.width + x) * 4 + 3] > 128) pts.push([x, y]);
    for (let i = pts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pts[i], pts[j]] = [pts[j], pts[i]]; }
    return pts;
  }
  function retarget() {
    lastText = timeText();
    const pts = sample(lastText);
    if (!pts.length) return;
    parts.forEach((p, i) => { const t = pts[i % pts.length]; p.tx = t[0]; p.ty = t[1]; });
  }
  function resize() {
    const r = cv.getBoundingClientRect(), DPR = Math.min(2, devicePixelRatio || 1);
    W = r.width; H = r.height; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const N = W < 600 ? 1200 : 3000;
    if (parts.length !== N) { parts = Array.from({ length: N }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, tx: W / 2, ty: H / 2, s: Math.random() * 1.4 + 1.3 })); }
    const g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, "#c9a86a"); g.addColorStop(.5, "#fff3c8"); g.addColorStop(1, "#e8d3a0"); ctx.fillStyle = g;
    retarget();
  }
  cv.addEventListener("pointermove", e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  cv.addEventListener("pointerleave", () => { mouse.x = mouse.y = -999; });
  cv.addEventListener("pointerdown", () => { parts.forEach(p => { p.vx = (Math.random() - .5) * 26; p.vy = (Math.random() - .5) * 26; }); });
  let rt = 0; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
  new IntersectionObserver(es => { dvis = es[0].isIntersecting; }, { threshold: 0 }).observe(dust);

  const cap = $("#cx15Cap", dust);
  function dustFrame() {
    if (dvis && W) {
      if (timeText() !== lastText) retarget();
      ctx.clearRect(0, 0, W, H);
      const R = 90, R2 = R * R;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.vx += (p.tx - p.x) * .014; p.vy += (p.ty - p.y) * .014;
        const mx = p.x - mouse.x, my = p.y - mouse.y, d2 = mx * mx + my * my;
        if (d2 < R2 && d2 > .01) { const d = Math.sqrt(d2), f = (1 - d / R) * 5.5; p.vx += mx / d * f; p.vy += my / d * f; }
        p.vx *= .9; p.vy *= .9; p.x += p.vx; p.y += p.vy;
        ctx.fillRect(p.x, p.y, p.s, p.s);
      }
    }
    requestAnimationFrame(dustFrame);
  }
  setInterval(() => { const d = new Date(); cap.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} · ${DAYS[d.getDay()]}`; }, 500);
  resize(); requestAnimationFrame(dustFrame);

  /* ================================================================
     "SINAB KO'RING" BO'LIMI
     ================================================================ */
  const lab = document.createElement("section");
  lab.className = "section dark"; lab.id = "cx15Lab";
  lab.innerHTML = `<div class="container">
    <p class="eyebrow center">Sinab ko'ring</p><h2 class="center">Xronograf, kamera va narx hisobi</h2>
    <p class="center muted">Hammasi brauzerning o'zida ishlaydi.</p>
    <div class="cx15-tabs" role="tablist">
      <button type="button" class="on" data-t="c">⏱ Xronograf</button><button type="button" data-t="v">📷 Kamerada sinash</button><button type="button" data-t="p">💸 Narx kuniga</button>
    </div>

    <div class="cx15-pane on" data-p="c">
      <div class="cx15-vis"><div class="cx15-chrono" id="cx15Ch" tabindex="0" aria-label="Xronograf. Bo'sh joy tugmasi: boshlash yoki to'xtatish. L: aylanish. R: nolga">
        <div id="cx15ChSvg" style="width:100%;display:grid;justify-items:center"></div>
        <div class="cx15-digi" id="cx15Dg">00:00.00</div>
        <ul class="cx15-laps" id="cx15Laps"></ul></div></div>
      <div class="cx15-side"><h3>Ishlaydigan xronograf</h3>
        <div class="cx15-row"><button class="btn btn-sm" id="cx15Go" type="button">▶ Boshlash</button><button class="btn btn-sm btn-ghost" id="cx15Lap" type="button">⚑ Aylanish</button><button class="btn btn-sm btn-ghost" id="cx15Rs" type="button">↺ Nolga</button><button class="cx15-chip on" id="cx15Snd" type="button">🔊 Ovoz</button></div>
        <div class="cx15-how"><b>Qanday ishlaydi</b>Soatning o'ng tomonidagi tugmalarni (pusher) bosing yoki pastdagi tugmalardan foydalaning. Yuqorigi tugma boshlaydi va to'xtatadi, pastgisi nolga qaytaradi. Qizil strelka soniyalarni, o'ng kichik siferblat daqiqalarni, pastki soatlarni sanaydi. Klaviaturada: bo'sh joy — boshlash/to'xtatish, L — aylanish, R — nolga (to'xtagan holatda).</div></div>
    </div>

    <div class="cx15-pane" data-p="v">
      <div class="cx15-vis"><div class="cx15-stage" id="cx15St">
        <video id="cx15Vid" playsinline muted autoplay hidden></video><img class="bg" id="cx15Img" alt="" hidden>
        <div class="cx15-ph" id="cx15Ph">📷 Kamerani yoqing yoki bilagingiz rasmini yuklang, so'ng soatni sudrab joylashtiring</div>
        <div class="cx15-w" id="cx15W" hidden></div></div></div>
      <div class="cx15-side"><h3>Soatni bilagingizda ko'ring</h3>
        <label>Model<select id="cx15VM"></select></label>
        <div class="cx15-row"><button class="btn btn-sm" id="cx15Cam" type="button">📷 Kamerani yoqish</button><button class="cx15-chip" id="cx15Flip" type="button" hidden>🔄 Kamerani almashtirish</button>
          <label class="cx15-chip" style="cursor:pointer;display:inline-block">📁 Rasm yuklash<input type="file" id="cx15File" accept="image/*" hidden></label></div>
        <label>O'lcham<input type="range" id="cx15Sz" min="60" max="300" value="150"></label>
        <label>Burish<input type="range" id="cx15Rot" min="-180" max="180" value="0"></label>
        <div class="cx15-row"><button class="btn btn-sm btn-ghost" id="cx15Snap" type="button">📸 Rasmga olish</button><button class="cx15-chip" id="cx15Off" type="button" hidden>⏹ Kamerani o'chirish</button></div>
        <div class="cx15-msg" id="cx15Msg" role="alert"></div>
        <div class="cx15-how"><b>Qanday ishlaydi</b>Kamerani yoqing va bilagingizni ko'rsating, so'ng soatni barmoq yoki sichqoncha bilan bilak ustiga sudrang. «O'lcham» va «Burish» bilan moslang. Kamera bo'lmasa, bilak rasmini yuklang. «Rasmga olish» natijani PNG qilib saqlaydi. Rasm va video hech qayerga yuborilmaydi, hammasi qurilmangizda qoladi. Bu taxminiy ko'rinish: aniq o'lcham uchun «Soat laboratoriyasi» yoki «Bilakda ko'rish» ga qarang.</div></div>
    </div>

    <div class="cx15-pane" data-p="p">
      <div class="cx15-vis"><div style="text-align:center;display:grid;gap:8px"><div class="muted">Soat har kuni xizmat qilsa, kuniga</div><div class="cx15-big" id="cx15Day">—</div><div class="muted" id="cx15DayUz"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px"><div class="cx15-how" style="text-align:center"><b id="cx15Mo" style="font-size:20px">—</b>oyiga</div><div class="cx15-how" style="text-align:center"><b id="cx15Yr" style="font-size:20px">—</b>yiliga</div></div></div></div>
      <div class="cx15-side"><h3>Soat kuniga qancha turadi?</h3>
        <label>Model<select id="cx15PM"></select></label>
        <label>Necha yil taqasiz: <b id="cx15Yv" style="color:var(--accent,#c9a86a)">3</b><input type="range" id="cx15Y" min="1" max="10" value="3"></label>
        <div class="cx15-how"><b>Qanday ishlaydi</b>Soat narxi yil soniga va 365 kunga bo'linadi. Natija har kun uchun o'rtacha xarajatni ko'rsatadi. Bu oddiy arifmetika: batareya almashtirish, ta'mirlash yoki boshqa xarajatlar hisobga olinmagan.</div></div>
    </div>
  </div>`;
  const anchor = $("#story");
  if (anchor) anchor.before(lab); else { const a = $("#order") || $(".footer"); if (a) a.before(lab); else document.body.appendChild(lab); }
  $$(".cx15-tabs button", lab).forEach(b => b.onclick = () => {
    $$(".cx15-tabs button", lab).forEach(x => x.classList.toggle("on", x === b));
    $$(".cx15-pane", lab).forEach(p => p.classList.toggle("on", p.dataset.p === b.dataset.t));
  });
  const paneOn = id => { const p = $(`.cx15-pane[data-p="${id}"]`, lab); return !!p && p.classList.contains("on"); };

  /* ---------- 2a. XRONOGRAF ---------- */
  function chronoSVG() {
    let ticks = "";
    for (let i = 0; i < 60; i++) ticks += i % 5 === 0
      ? `<rect x="147.5" y="22" width="5" height="15" rx="1" fill="#e8d3a0" transform="rotate(${i * 6} 150 150)"/>`
      : `<rect x="149.5" y="22" width="1" height="6" fill="#9097a8" transform="rotate(${i * 6} 150 150)"/>`;
    const sub = (cx, cy, n, label) => { let t = ""; for (let i = 0; i < n; i++) t += `<line x1="${cx}" y1="${cy - 24}" x2="${cx}" y2="${cy - 20}" stroke="#e8d3a0" stroke-width="1.2" transform="rotate(${i * 360 / n} ${cx} ${cy})"/>`;
      return `<circle cx="${cx}" cy="${cy}" r="27" fill="rgba(0,0,0,.35)" stroke="#e8d3a0" stroke-opacity=".5"/>${t}<text x="${cx}" y="${cy + 16}" text-anchor="middle" font-family="Arial" font-size="6" fill="#9097a8" letter-spacing="1">${label}</text>`; };
    const hand = (id, len, w, col) => `<g id="${id}" transform="translate(0 0)"><line x1="0" y1="6" x2="0" y2="${-len}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/></g>`;
    return `<svg viewBox="0 0 320 300" role="img" aria-label="Xronograf soat" xmlns="http://www.w3.org/2000/svg"><defs>
      <linearGradient id="chR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e6bb"/><stop offset=".5" stop-color="#9b7733"/><stop offset="1" stop-color="#e8cb88"/></linearGradient>
      <radialGradient id="chD" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#2a2d37"/><stop offset="1" stop-color="#050608"/></radialGradient>
      <linearGradient id="chS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <clipPath id="chC"><circle cx="150" cy="150" r="132"/></clipPath></defs>
      <circle cx="150" cy="150" r="148" fill="url(#chR)"/><circle cx="150" cy="150" r="140" fill="#0b0b0f"/><circle cx="150" cy="150" r="132" fill="url(#chD)"/>
      ${ticks}
      <text x="150" y="98" text-anchor="middle" font-family="Arial" font-size="11" letter-spacing="4" fill="#e8d3a0">CHRONEX</text>
      <text x="150" y="262" text-anchor="middle" font-family="Arial" font-size="7" letter-spacing="3" fill="#9097a8">CHRONOGRAPH</text>
      ${sub(96, 150, 12, "SEK")}${sub(204, 150, 30, "DAQ")}${sub(150, 205, 12, "SOAT")}
      <g transform="translate(96 150)">${hand("chRun", 20, 1.4, "#e8d3a0")}</g><g transform="translate(204 150)">${hand("chMin", 20, 1.6, "#e8d3a0")}</g><g transform="translate(150 205)">${hand("chHr", 20, 1.6, "#e8d3a0")}</g>
      <g transform="translate(150 150)">${hand("chH", 66, 5, "#e8d3a0")}${hand("chM", 100, 3.5, "#f2f3f7")}</g>
      <g transform="translate(150 150)"><g id="chC2"><line x1="0" y1="28" x2="0" y2="-118" stroke="#ff5a3c" stroke-width="1.6" stroke-linecap="round"/><circle cy="22" r="4" fill="#ff5a3c"/></g></g>
      <circle cx="150" cy="150" r="6" fill="#ff5a3c"/><circle cx="150" cy="150" r="2.2" fill="#111"/>
      <g clip-path="url(#chC)"><ellipse cx="108" cy="80" rx="100" ry="50" fill="url(#chS)" transform="rotate(-28 108 80)"/></g>
      <g class="cx15-push" id="chP1" role="button" tabindex="0" aria-label="Boshlash yoki to'xtatish" transform="rotate(-32 150 150)"><rect x="288" y="142" width="16" height="16" rx="3" fill="url(#chR)"/></g>
      <g class="cx15-push" id="chP2" role="button" tabindex="0" aria-label="Nolga qaytarish" transform="rotate(32 150 150)"><rect x="288" y="142" width="16" height="16" rx="3" fill="url(#chR)"/></g>
      <rect x="296" y="140" width="14" height="20" rx="4" fill="url(#chR)" opacity="0"/></svg>`;
  }
  $("#cx15ChSvg", lab).innerHTML = chronoSVG();
  const chRoot = $("#cx15Ch", lab);
  const rotate = (id, a) => { const e = $("#" + id, lab); if (e) e.setAttribute("transform", `rotate(${a.toFixed(2)})`); };
  let cRun = false, cBase = 0, cT0 = 0, snd = true, laps = [];
  const elapsed = () => cBase + (cRun ? performance.now() - cT0 : 0);
  const fmt = ms => { const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60, c = Math.floor(ms / 10) % 100, h = Math.floor(ms / 3600000); return (h ? h + ":" : "") + pad(h ? m % 60 : m) + ":" + pad(s) + "." + pad(c); };
  const goBtn = $("#cx15Go", lab);
  const press = id => { const e = $("#" + id, lab); if (e) { e.classList.add("down"); setTimeout(() => e.classList.remove("down"), 140); } };
  function startStop() { press("chP1"); if (snd) tick(1500); if (cRun) { cBase += performance.now() - cT0; cRun = false; goBtn.textContent = "▶ Davom"; } else { cT0 = performance.now(); cRun = true; goBtn.textContent = "⏸ To'xtatish"; } }
  function reset() { press("chP2"); if (snd) tick(1100); if (cRun) { cBase += performance.now() - cT0; cRun = false; } cBase = 0; laps = []; goBtn.textContent = "▶ Boshlash"; drawLaps(); }
  function lap() { if (!cRun) return; if (snd) tick(1900); const e = elapsed(), prev = laps.length ? laps[0].t : 0; laps.unshift({ t: e, d: e - prev }); laps = laps.slice(0, 8); drawLaps(); }
  function drawLaps() { $("#cx15Laps", lab).innerHTML = laps.map((l, i) => `<li><span>#${laps.length - i}</span><span>${fmt(l.t)}</span><span>+${fmt(l.d)}</span></li>`).join(""); }
  goBtn.onclick = startStop; $("#cx15Rs", lab).onclick = reset; $("#cx15Lap", lab).onclick = lap;
  $("#cx15Snd", lab).onclick = function () { snd = !snd; this.classList.toggle("on", snd); this.textContent = snd ? "🔊 Ovoz" : "🔇 Ovoz"; };
  [["chP1", startStop], ["chP2", () => { if (!cRun) reset(); }]].forEach(([id, fn]) => { const e = $("#" + id, lab); e.addEventListener("click", fn); e.addEventListener("keydown", ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); ev.stopPropagation(); fn(); } }); });
  chRoot.addEventListener("keydown", e => {
    if (e.target !== chRoot) return;
    if (e.key === " ") { e.preventDefault(); startStop(); } else if (e.key.toLowerCase() === "l") lap(); else if (e.key.toLowerCase() === "r" && !cRun) reset();
  });
  let cvis = false; new IntersectionObserver(es => { cvis = es[0].isIntersecting; }, { threshold: 0 }).observe(lab);

  /* ---------- 2b. KAMERADA SINASH ---------- */
  const THEMES = {
    "Chronex Aero": { dial: "#cfd4df", mark: "#1a1d26", hand: "#20232d", sec: "#2b6fff", rim: ["#f4f6fa", "#7d8494", "#dfe3ec"], strap: ["#14151a", "#3a3d48"], num: false },
    "Chronex Titan": { dial: "#161820", mark: "#e8d3a0", hand: "#e8d3a0", sec: "#ff5a3c", rim: ["#f6e6bb", "#9b7733", "#e8cb88"], strap: ["#0a0b0e", "#2b2e38"], num: false },
    "Chronex Nova": { dial: "#efe3d3", mark: "#5e362c", hand: "#5e362c", sec: "#b5473a", rim: ["#fbe2d8", "#b07767", "#f0c9bb"], strap: ["#3a2018", "#8a5340"], num: true }
  };
  const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  function wornSVG(t) {
    const d0 = shade(t.dial, .2), d1 = shade(t.dial, -.5), now = new Date();
    const s = now.getSeconds(), m = now.getMinutes() + s / 60, h = (now.getHours() % 12) + m / 60;
    let marks = "";
    for (let i = 0; i < 12; i++) {
      if (t.num) { const a = i * Math.PI / 6; marks += `<text x="${(150 + 92 * Math.sin(a)).toFixed(1)}" y="${(300 - 92 * Math.cos(a) + 5).toFixed(1)}" text-anchor="middle" font-family="Georgia,serif" font-size="17" fill="${t.mark}">${ROMAN[i]}</text>`; }
      else marks += `<rect x="146.5" y="174" width="7" height="20" rx="1.5" fill="${t.mark}" transform="rotate(${i * 30} 150 300)"/>`;
    }
    const hand = (a, len, w) => `<line x1="150" y1="300" x2="${(150 + Math.sin(a * Math.PI / 180) * len).toFixed(1)}" y2="${(300 - Math.cos(a * Math.PI / 180) * len).toFixed(1)}" stroke="${t.hand}" stroke-width="${w}" stroke-linecap="round"/>`;
    return `<svg viewBox="0 0 300 600" xmlns="http://www.w3.org/2000/svg"><defs>
      <linearGradient id="wS" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${t.strap[0]}"/><stop offset=".5" stop-color="${t.strap[1]}"/><stop offset="1" stop-color="${t.strap[0]}"/></linearGradient>
      <linearGradient id="wR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.rim[0]}"/><stop offset=".5" stop-color="${t.rim[1]}"/><stop offset="1" stop-color="${t.rim[2]}"/></linearGradient>
      <radialGradient id="wD" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="${d0}"/><stop offset="1" stop-color="${d1}"/></radialGradient></defs>
      <rect x="104" y="0" width="92" height="190" rx="10" fill="url(#wS)"/><rect x="104" y="410" width="92" height="190" rx="10" fill="url(#wS)"/>
      <rect x="276" y="288" width="20" height="24" rx="4" fill="url(#wR)"/>
      <circle cx="150" cy="300" r="148" fill="url(#wR)"/><circle cx="150" cy="300" r="140" fill="#0b0b0f"/><circle cx="150" cy="300" r="132" fill="url(#wD)"/>
      ${marks}<text x="150" y="255" text-anchor="middle" font-family="Arial" font-size="11" letter-spacing="4" fill="${t.mark}">CHRONEX</text>
      ${hand(h * 30, 68, 6)}${hand(m * 6, 100, 4)}${hand(s * 6, 112, 1.6).replace(t.hand, t.sec)}
      <circle cx="150" cy="300" r="6" fill="${t.sec}"/></svg>`;
  }
  const stage = $("#cx15St", lab), vid = $("#cx15Vid", lab), img = $("#cx15Img", lab), ph = $("#cx15Ph", lab), wEl = $("#cx15W", lab);
  const vm = $("#cx15VM", lab), msg = $("#cx15Msg", lab), sz = $("#cx15Sz", lab), rotR = $("#cx15Rot", lab);
  Object.keys(THEMES).forEach(k => { const o = document.createElement("option"); o.value = k; o.textContent = k; vm.appendChild(o); });
  vm.value = "Chronex Titan";
  const W3 = { x: .5, y: .5, w: 150, r: 0 };       // x,y: sahnaga nisbatan 0..1
  let stream = null, facing = "environment", bgKind = "";
  function paintWatch() {
    const sw = stage.clientWidth, sh = stage.clientHeight;
    wEl.style.width = W3.w + "px"; wEl.style.left = (W3.x * sw) + "px"; wEl.style.top = (W3.y * sh) + "px";
    wEl.style.transform = `translate(-50%,-50%) rotate(${W3.r}deg)`;
  }
  function renderWatch() { wEl.innerHTML = wornSVG(THEMES[vm.value]); paintWatch(); }
  vm.addEventListener("change", renderWatch); renderWatch();
  setInterval(() => { if (!wEl.hidden && paneOn("v")) renderWatch(); }, 1000);
  sz.addEventListener("input", () => { W3.w = +sz.value; paintWatch(); }); rotR.addEventListener("input", () => { W3.r = +rotR.value; paintWatch(); });
  (function dragWatch() {
    let d = null;
    wEl.addEventListener("pointerdown", e => { d = { sx: e.clientX, sy: e.clientY, x: W3.x, y: W3.y }; try { wEl.setPointerCapture(e.pointerId); } catch (er) {} e.preventDefault(); });
    wEl.addEventListener("pointermove", e => { if (!d) return; const sw = stage.clientWidth, sh = stage.clientHeight; W3.x = clamp(d.x + (e.clientX - d.sx) / sw, 0, 1); W3.y = clamp(d.y + (e.clientY - d.sy) / sh, 0, 1); paintWatch(); });
    const end = () => { d = null; }; wEl.addEventListener("pointerup", end); wEl.addEventListener("pointercancel", end);
  })();
  const stopCam = () => { if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; } vid.srcObject = null; };
  function showBg(kind) {
    bgKind = kind; vid.hidden = kind !== "cam"; img.hidden = kind !== "img"; ph.hidden = !!kind; wEl.hidden = !kind;
    $("#cx15Off", lab).hidden = kind !== "cam"; $("#cx15Flip", lab).hidden = kind !== "cam"; paintWatch();
  }
  async function startCam() {
    msg.textContent = "";
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { msg.textContent = "Bu brauzerda yoki bu manzilda kamera mavjud emas (sayt https orqali ochilishi kerak). Rasm yuklab ko'ring."; return; }
    stopCam();
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false });
      vid.srcObject = stream; vid.style.transform = facing === "user" ? "scaleX(-1)" : ""; await vid.play().catch(() => {}); showBg("cam");
    } catch (e) { msg.textContent = "Kameraga ruxsat berilmadi yoki kamera topilmadi. Rasm yuklab ko'ring."; showBg(bgKind === "img" ? "img" : ""); }
  }
  $("#cx15Cam", lab).onclick = startCam;
  $("#cx15Flip", lab).onclick = () => { facing = facing === "user" ? "environment" : "user"; startCam(); };
  $("#cx15Off", lab).onclick = () => { stopCam(); showBg(""); };
  $("#cx15File", lab).addEventListener("change", e => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    if (!/^image\//.test(f.type)) { msg.textContent = "Faqat rasm faylini tanlang."; return; }
    stopCam(); if (img.src && img.src.startsWith("blob:")) URL.revokeObjectURL(img.src);
    img.onload = () => { showBg("img"); msg.textContent = ""; }; img.src = URL.createObjectURL(f);
  });
  $("#cx15Snap", lab).onclick = () => {
    if (!bgKind) { toast("Avval kamerani yoqing yoki rasm yuklang"); return; }
    const sw = stage.clientWidth, sh = stage.clientHeight, S = 2, c = document.createElement("canvas"); c.width = sw * S; c.height = sh * S;
    const x = c.getContext("2d"); x.scale(S, S); x.fillStyle = "#0b0b0f"; x.fillRect(0, 0, sw, sh);
    const src = bgKind === "cam" ? vid : img, iw = bgKind === "cam" ? vid.videoWidth : img.naturalWidth, ih = bgKind === "cam" ? vid.videoHeight : img.naturalHeight;
    if (iw && ih) { const k = Math.max(sw / iw, sh / ih), dw = iw * k, dh = ih * k; x.save(); if (bgKind === "cam" && facing === "user") { x.translate(sw, 0); x.scale(-1, 1); } x.drawImage(src, (sw - dw) / 2, (sh - dh) / 2, dw, dh); x.restore(); }
    const svg = new XMLSerializer().serializeToString($("svg", wEl)), wi = new Image();
    wi.onload = () => {
      const w = W3.w, h = w * 2; x.save(); x.translate(W3.x * sw, W3.y * sh); x.rotate(W3.r * Math.PI / 180); x.drawImage(wi, -w / 2, -h / 2, w, h); x.restore();
      c.toBlob(b => { if (!b) { toast("Rasmni yaratib bo'lmadi"); return; } const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "chronex-bilak.png"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast("Rasm yuklab olindi ✓"); }, "image/png");
    };
    wi.onerror = () => toast("Rasmni yaratib bo'lmadi");
    wi.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  };
  addEventListener("resize", paintWatch);

  /* ---------- 2c. NARX KUNIGA ---------- */
  const pm = $("#cx15PM", lab);
  prices().forEach(p => { const o = document.createElement("option"); o.value = p.name; o.textContent = `${p.name} ($${p.price})`; pm.appendChild(o); });
  pm.value = (prices().find(p => /Titan/.test(p.name)) || prices()[0]).name;
  function perDay() {
    const price = (prices().find(p => p.name === pm.value) || prices()[0]).price, y = +$("#cx15Y", lab).value, day = price / (y * 365);
    $("#cx15Yv", lab).textContent = y + (y === 1 ? " yil" : " yil");
    $("#cx15Day", lab).textContent = "$" + day.toFixed(2);
    $("#cx15DayUz", lab).textContent = "≈ " + Math.round(day * UZ_RATE).toLocaleString("ru-RU") + " so'm";
    $("#cx15Mo", lab).textContent = "$" + (day * 30.4).toFixed(1); $("#cx15Yr", lab).textContent = "$" + (price / y).toFixed(0);
  }
  pm.addEventListener("change", perDay); $("#cx15Y", lab).addEventListener("input", perDay); perDay();

  /* ---------- xronograf animatsiyasi ---------- */
  function labFrame() {
    if (cvis && paneOn("c")) {
      const d = new Date(), s = d.getSeconds() + d.getMilliseconds() / 1000, mi = d.getMinutes() + s / 60, h = (d.getHours() % 12) + mi / 60, e = elapsed();
      rotate("chH", h * 30); rotate("chM", mi * 6); rotate("chRun", s * 6);
      rotate("chC2", (e / 1000 % 60) * 6); rotate("chMin", (e / 60000 % 30) * 12); rotate("chHr", (e / 3600000 % 12) * 30);
      $("#cx15Dg", lab).textContent = fmt(e);
    }
    requestAnimationFrame(labFrame);
  }
  requestAnimationFrame(labFrame);

  /* ================================================================
     3) MODEL KARTALARIDA 3D QIYSHAYISH
     ================================================================ */
  if (hoverOK && !reduce) {
    $$("#collection .card").forEach(card => {
      const gl = document.createElement("i"); gl.className = "cx15-gl"; gl.setAttribute("aria-hidden", "true"); card.appendChild(gl);
      card.addEventListener("pointermove", e => {
        const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(900px) rotateX(${((.5 - y) * 10).toFixed(1)}deg) rotateY(${((x - .5) * 12).toFixed(1)}deg) translateY(-8px)`;
        card.style.setProperty("--gx", (x * 100).toFixed(0) + "%"); card.style.setProperty("--gy", (y * 100).toFixed(0) + "%");
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }
})();