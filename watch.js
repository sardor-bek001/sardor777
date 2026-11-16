/* ===== Jonli soatlar (qo'shimcha modul) =====
   Mavjud kodga tegmaydi: bo'limni o'zi sahifaga qo'shadi
   va "Texnologiya" bo'limidan oldin joylashtiradi. */
(function () {
  const CX = 150, CY = 220;

  const WATCHES = [
    {
      id: "aero", name: "Chronex Aero", model: "Chronex Aero", price: 249,
      tag: "Titan korpus, toza dizayn. Kundalik hamroh.",
      chips: ["Titan", "50 m", "14 kun"], glow: "#8e95a8", tick: true, date: true,
      case: ["#f4f6fa", "#7d8494", "#dfe3ec"], dial: ["#fafbfd", "#bfc5d2"],
      mark: "#1a1d26", lume: "#cfe9c2", hand: "#20232d", sec: "#2b6fff",
      strap: ["#14151a", "#3a3d48"], stitch: "#6b6f7c"
    },
    {
      id: "titan", name: "Chronex Titan", model: "Chronex Titan", price: 349,
      tag: "Xronograf, sapfir oyna va GPS. Flagman.",
      chips: ["Sapfir", "GPS", "Xronograf"], glow: "#c9a86a", tick: false, subdials: true,
      case: ["#f6e6bb", "#9b7733", "#e8cb88"], dial: ["#262932", "#050608"],
      mark: "#e8d3a0", lume: "#fff3c8", hand: "#e8d3a0", sec: "#ff5a3c",
      strap: ["#0a0b0e", "#2b2e38"], stitch: "#c9a86a"
    },
    {
      id: "nova", name: "Chronex Nova", model: "Chronex Nova", price: 299,
      tag: "Nafis rose gold va haqiqiy teri tasma.",
      chips: ["Rose gold", "Teri tasma", "Ingichka"], glow: "#d79a9a", tick: false, numerals: true,
      case: ["#fbe2d8", "#b07767", "#f0c9bb"], dial: ["#fffaf3", "#e6d6c3"],
      mark: "#5e362c", lume: "#fff", hand: "#5e362c", sec: "#b5473a",
      strap: ["#3a2018", "#8a5340"], stitch: "#e9c9a8"
    }
  ];

  /* ---------- SVG yasash ---------- */
  function dialMarks(c) {
    let s = "";
    for (let i = 0; i < 60; i++) {
      const a = i * 6;
      if (i % 5 === 0) {
        if (c.numerals) continue;
        s += `<rect x="147" y="122" width="6" height="19" rx="1.5" fill="${c.mark}" stroke="${c.lume}" stroke-width=".8" transform="rotate(${a} ${CX} ${CY})"/>`;
      } else {
        s += `<rect x="149.4" y="114" width="1.2" height="5" fill="${c.mark}" opacity=".65" transform="rotate(${a} ${CX} ${CY})"/>`;
      }
    }
    if (c.numerals) {
      for (let h = 1; h <= 12; h++) {
        const r = h * Math.PI / 6;
        s += `<text x="${(CX + 80 * Math.sin(r)).toFixed(1)}" y="${(CY - 80 * Math.cos(r) + 6).toFixed(1)}" text-anchor="middle" font-family="Georgia,serif" font-size="17" fill="${c.mark}">${h}</text>`;
      }
    }
    return s;
  }

  function sunburst() {
    let s = "";
    for (let i = 0; i < 90; i++) {
      s += `<line x1="${CX}" y1="${CY}" x2="${CX}" y2="${CY - 108}" stroke="#fff" stroke-opacity=".05" stroke-width="1" transform="rotate(${i * 4} ${CX} ${CY})"/>`;
    }
    return s;
  }

  function subdial(cx, cy, kind, c) {
    let t = "";
    for (let i = 0; i < 12; i++) {
      t += `<line x1="${cx}" y1="${cy - 21}" x2="${cx}" y2="${cy - 17}" stroke="${c.mark}" stroke-width="1" transform="rotate(${i * 30} ${cx} ${cy})"/>`;
    }
    return `<circle cx="${cx}" cy="${cy}" r="24" fill="rgba(0,0,0,.25)" stroke="${c.mark}" stroke-opacity=".5"/>${t}
      <g data-${kind} data-cx="${cx}" data-cy="${cy}">
        <line x1="${cx}" y1="${cy + 5}" x2="${cx}" y2="${cy - 19}" stroke="${c.sec}" stroke-width="1.6" stroke-linecap="round"/>
      </g><circle cx="${cx}" cy="${cy}" r="2.4" fill="${c.sec}"/>`;
  }

  function watchSVG(c) {
    const i = c.id;
    const subs = c.subdials ? subdial(96, 220, "ss", c) + subdial(204, 220, "sm", c) + subdial(150, 276, "sh", c) : "";
    const date = c.date
      ? `<rect x="189" y="211" width="28" height="18" rx="2" fill="#fff" stroke="rgba(0,0,0,.3)"/>
         <text data-date x="203" y="224.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="#111">1</text>` : "";
    const texts = c.subdials
      ? `<text x="150" y="166" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" letter-spacing="4" fill="${c.mark}">CHRONEX</text>
         <text x="150" y="312" text-anchor="middle" font-family="Arial,sans-serif" font-size="6.5" letter-spacing="2.5" fill="${c.mark}" opacity=".8">CHRONOGRAPH</text>`
      : `<text x="150" y="168" text-anchor="middle" font-family="${c.numerals ? "Georgia,serif" : "Arial,sans-serif"}" font-size="11" letter-spacing="4" fill="${c.mark}">CHRONEX</text>
         <text x="150" y="${c.numerals ? 270 : 288}" text-anchor="middle" font-family="Arial,sans-serif" font-size="6.5" letter-spacing="2.5" fill="${c.mark}" opacity=".8">${c.numerals ? "NOVA" : "AUTOMATIC · 50M"}</text>`;
    const pushers = c.subdials
      ? `<rect x="268" y="158" width="14" height="14" rx="3" fill="url(#${i}-case)" transform="rotate(-28 275 165)"/>
         <rect x="268" y="268" width="14" height="14" rx="3" fill="url(#${i}-case)" transform="rotate(28 275 275)"/>` : "";

    return `<svg class="lw-svg" viewBox="0 0 300 440" role="img" aria-label="${c.name}">
<defs>
  <linearGradient id="${i}-case" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.case[0]}"/><stop offset=".5" stop-color="${c.case[1]}"/><stop offset="1" stop-color="${c.case[2]}"/></linearGradient>
  <linearGradient id="${i}-case2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.case[0]}"/><stop offset=".5" stop-color="${c.case[1]}"/><stop offset="1" stop-color="${c.case[2]}"/></linearGradient>
  <radialGradient id="${i}-dial" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="${c.dial[0]}"/><stop offset="1" stop-color="${c.dial[1]}"/></radialGradient>
  <linearGradient id="${i}-strap" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c.strap[0]}"/><stop offset=".5" stop-color="${c.strap[1]}"/><stop offset="1" stop-color="${c.strap[0]}"/></linearGradient>
  <linearGradient id="${i}-shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <clipPath id="${i}-clip"><circle cx="${CX}" cy="${CY}" r="108"/></clipPath>
</defs>

<!-- tasma -->
<path d="M108 0 H192 L197 150 H103 Z" fill="url(#${i}-strap)"/>
<path d="M115 0 L117 150 M185 0 L183 150" stroke="${c.stitch}" stroke-width="1.3" stroke-dasharray="5 4" fill="none" opacity=".8"/>
<path d="M103 290 H197 L192 440 H108 Z" fill="url(#${i}-strap)"/>
<path d="M117 290 L115 440 M183 290 L185 440" stroke="${c.stitch}" stroke-width="1.3" stroke-dasharray="5 4" fill="none" opacity=".8"/>
<g fill="#000" fill-opacity=".55"><circle cx="150" cy="335" r="3.2"/><circle cx="150" cy="357" r="3.2"/><circle cx="150" cy="379" r="3.2"/><circle cx="150" cy="401" r="3.2"/></g>

<!-- lug va tojcha -->
<rect x="102" y="94" width="96" height="34" rx="7" fill="url(#${i}-case)"/>
<rect x="102" y="312" width="96" height="34" rx="7" fill="url(#${i}-case)"/>
<rect x="274" y="205" width="17" height="30" rx="4" fill="url(#${i}-case)"/>
<g stroke="rgba(0,0,0,.35)" stroke-width="1"><line x1="279" y1="208" x2="279" y2="232"/><line x1="283" y1="208" x2="283" y2="232"/><line x1="287" y1="208" x2="287" y2="232"/></g>
${pushers}

<!-- korpus -->
<circle cx="${CX}" cy="${CY}" r="128" fill="url(#${i}-case)"/>
<circle cx="${CX}" cy="${CY}" r="120" fill="url(#${i}-case2)"/>
<circle cx="${CX}" cy="${CY}" r="114" fill="#0b0b0f"/>

<!-- siferblat -->
<circle cx="${CX}" cy="${CY}" r="108" fill="url(#${i}-dial)"/>
<g clip-path="url(#${i}-clip)">${sunburst()}</g>
${dialMarks(c)}
${texts}
${date}
${subs}

<!-- strelkalar -->
<g data-h data-cx="${CX}" data-cy="${CY}">
  <path d="M150 232 L145 214 L148 152 L150 146 L152 152 L155 214 Z" fill="${c.hand}" stroke="rgba(0,0,0,.35)" stroke-width=".6"/>
  <path d="M150 210 L149 160 L150 156 L151 160 Z" fill="${c.lume}"/>
</g>
<g data-m data-cx="${CX}" data-cy="${CY}">
  <path d="M150 238 L146 214 L148.4 124 L150 118 L151.6 124 L154 214 Z" fill="${c.hand}" stroke="rgba(0,0,0,.35)" stroke-width=".6"/>
  <path d="M150 210 L149.3 130 L150 126 L150.7 130 Z" fill="${c.lume}"/>
</g>
<g data-s data-cx="${CX}" data-cy="${CY}">
  <line x1="${CX}" y1="252" x2="${CX}" y2="116" stroke="${c.sec}" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="${CX}" cy="244" r="4.2" fill="${c.sec}"/>
  <circle cx="${CX}" cy="${CY}" r="6" fill="${c.sec}"/>
  <circle cx="${CX}" cy="${CY}" r="2.2" fill="#111"/>
</g>

<!-- shisha yaltirashi -->
<g clip-path="url(#${i}-clip)"><ellipse cx="108" cy="148" rx="100" ry="56" fill="url(#${i}-shine)" transform="rotate(-28 108 148)"/></g>
<circle cx="${CX}" cy="${CY}" r="108" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1.5"/>
</svg>`;
  }

  /* ---------- Bo'limni yaratish ---------- */
  const section = document.createElement("section");
  section.className = "section lw";
  section.id = "live-watches";
  section.innerHTML = `
    <div class="container">
      <p class="eyebrow center">Live Collection</p>
      <h2 class="center">Jonli soatlar</h2>
      <p class="center muted">Haqiqiy soatdek yurib turadi. Sichqonchani ustiga olib boring va aylantirib ko'ring.</p>
      <div class="lw-modes" role="group" aria-label="Soniya strelkasi rejimi">
        <button type="button" data-mode="sweep" class="on">Silliq yurish</button>
        <button type="button" data-mode="tick">Tik-tak</button>
      </div>
      <div class="lw-grid">
        ${WATCHES.map(c => `
          <article class="lw-card" data-watch="${c.id}" style="--glow:${c.glow}">
            <div class="lw-stage">${watchSVG(c)}<div class="lw-glare"></div></div>
            <div class="lw-info">
              <div class="lw-time" data-clock>--:--:--</div>
              <h3>${c.name}</h3>
              <p>${c.tag}</p>
              <ul class="lw-chips">${c.chips.map(x => `<li>${x}</li>`).join("")}</ul>
              <div class="lw-foot"><strong>$${c.price}</strong><button class="btn btn-sm" type="button" data-pick="${c.model}">Buyurtma</button></div>
            </div>
          </article>`).join("")}
      </div>
    </div>`;

  const anchor = document.getElementById("technology");
  if (anchor) anchor.before(section); else document.body.appendChild(section);

  // Menyuga havola qo'shish
  const menu = document.getElementById("menu");
  if (menu) {
    const a = document.createElement("a");
    a.href = "#live-watches";
    a.textContent = "Jonli soatlar";
    menu.insertBefore(a, menu.children[1] || null);
    a.addEventListener("click", () => {
      menu.classList.remove("open");
      const b = document.getElementById("burger");
      if (b) b.classList.remove("open");
    });
  }

  /* ---------- Buyurtma tugmasi: mavjud formani to'ldiradi ---------- */
  section.querySelectorAll("[data-pick]").forEach(btn => btn.addEventListener("click", () => {
    const sel = document.getElementById("model");
    if (sel) {
      sel.value = btn.dataset.pick;
      sel.dispatchEvent(new Event("change"));
    }
    const o = document.getElementById("order");
    if (o) o.scrollIntoView({ behavior: "smooth" });
  }));

  /* ---------- Rejim tugmalari ---------- */
  let mode = "sweep";
  section.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => {
    mode = b.dataset.mode;
    section.querySelectorAll("[data-mode]").forEach(x => x.classList.toggle("on", x === b));
  }));

  /* ---------- Harakat ---------- */
  const rot = (el, a) => el && el.setAttribute("transform", `rotate(${a.toFixed(2)} ${el.dataset.cx} ${el.dataset.cy})`);
  const pad = n => String(n).padStart(2, "0");

  const items = [...section.querySelectorAll(".lw-card")].map(card => {
    const cfg = WATCHES.find(w => w.id === card.dataset.watch);
    return {
      cfg, card,
      h: card.querySelector("[data-h]"), m: card.querySelector("[data-m]"), s: card.querySelector("[data-s]"),
      ss: card.querySelector("[data-ss]"), sm: card.querySelector("[data-sm]"), sh: card.querySelector("[data-sh]"),
      date: card.querySelector("[data-date]"), clock: card.querySelector("[data-clock]"), lastSec: -1
    };
  });

  let visible = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(section);

  function frame() {
    if (visible) {
      const d = new Date();
      const secRaw = d.getSeconds() + d.getMilliseconds() / 1000;
      const min = d.getMinutes() + secRaw / 60;
      const hr = (d.getHours() % 12) + min / 60;

      items.forEach(w => {
        const quartz = mode === "tick" || w.cfg.tick;
        const sec = quartz ? Math.floor(secRaw) : secRaw;
        rot(w.s, sec * 6);
        rot(w.m, min * 6);
        rot(w.h, hr * 30);
        rot(w.ss, sec * 6);
        rot(w.sm, ((d.getMinutes() % 30) + secRaw / 60) * 12);
        rot(w.sh, hr * 30);
        const si = d.getSeconds();
        if (si !== w.lastSec) {
          w.lastSec = si;
          if (w.clock) w.clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(si)}`;
          if (w.date) w.date.textContent = d.getDate();
        }
      });
    }
    requestAnimationFrame(frame);
  }
  frame();

  /* ---------- 3D tilt + yaltirash ---------- */
  items.forEach(({ card }) => {
    const stage = card.querySelector(".lw-stage");
    stage.addEventListener("mousemove", e => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      stage.classList.remove("lw-reset");
      stage.style.transform = `perspective(900px) rotateX(${((0.5 - y) * 16).toFixed(1)}deg) rotateY(${((x - 0.5) * 18).toFixed(1)}deg) scale(1.04)`;
      stage.style.setProperty("--gx", (x * 100).toFixed(0) + "%");
      stage.style.setProperty("--gy", (y * 100).toFixed(0) + "%");
    });
    stage.addEventListener("mouseleave", () => {
      stage.classList.add("lw-reset");
      stage.style.transform = "";
    });
  });

  /* ---------- Paydo bo'lish animatsiyasi ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("lw-in"); io.unobserve(e.target); }
  }), { threshold: .15 });
  items.forEach((w, i) => { w.card.style.transitionDelay = i * 120 + "ms"; io.observe(w.card); });
})();
/* ===== Jonli soatlar (qo'shimcha modul) =====
   Mavjud kodga tegmaydi: bo'limni o'zi sahifaga qo'shadi.

   YANGI RANG QO'SHISH: pastdagi WATCHES ichida kerakli soatning
   "themes" ro'yxatiga yangi qator qo'shing, masalan:
     T("Qizil", STEEL, ["#7a0f1a","#2b0408"], "#fff", "#fff", "#fff", "#ffd24a", ["#1a0306","#5a141c"], "#ff8a95")
   Tartib: nom, korpus, siferblat, belgi rangi, lume, strelka, soniya strelkasi, tasma, tikuv.
*/
(function () {
  const CX = 150, CY = 220;

  /* ---------- Korpus ranglari ---------- */
  const STEEL = ["#f4f6fa", "#7d8494", "#dfe3ec"];
  const GOLD  = ["#f6e6bb", "#9b7733", "#e8cb88"];
  const ROSE  = ["#fbe2d8", "#b07767", "#f0c9bb"];
  const BLACK = ["#5a5f6e", "#14161c", "#3a3e4b"];

  const T = (name, kase, dial, mark, lume, hand, sec, strap, stitch) =>
    ({ name, case: kase, dial, mark, lume, hand, sec, strap, stitch });

  const WATCHES = [
    {
      id: "aero", name: "Chronex Aero", model: "Chronex Aero", price: 249,
      tag: "Titan korpus, toza dizayn. Kundalik hamroh.",
      chips: ["Titan", "50 m", "14 kun"], glow: "#8e95a8", tick: true, date: true,
      themes: [
        T("Silver Steel",   STEEL, ["#fafbfd", "#bfc5d2"], "#1a1d26", "#cfe9c2", "#20232d", "#2b6fff", ["#14151a", "#3a3d48"], "#6b6f7c"),
        T("Midnight Black", BLACK, ["#2b2e38", "#07080b"], "#e9ecf5", "#cfe9c2", "#f2f3f7", "#2b6fff", ["#0a0b0e", "#2a2d36"], "#6b6f7c"),
        T("Rose Gold",      ROSE,  ["#fffaf3", "#e6d6c3"], "#5e362c", "#fff",    "#5e362c", "#b5473a", ["#3a2018", "#8a5340"], "#e9c9a8"),
        T("Ocean Blue",     STEEL, ["#2f6fd6", "#0c2a63"], "#ffffff", "#ffffff", "#ffffff", "#ffb020", ["#0b1c3d", "#2a4a8a"], "#9fc0ff")
      ]
    },
    {
      id: "titan", name: "Chronex Titan", model: "Chronex Titan", price: 349,
      tag: "Xronograf, sapfir oyna va GPS. Flagman.",
      chips: ["Sapfir", "GPS", "Xronograf"], glow: "#c9a86a", tick: false, subdials: true,
      themes: [
        T("Rose Gold",      GOLD,  ["#262932", "#050608"], "#e8d3a0", "#fff3c8", "#e8d3a0", "#ff5a3c", ["#0a0b0e", "#2b2e38"], "#c9a86a"),
        T("Midnight Black", BLACK, ["#1f2128", "#030406"], "#e9ecf5", "#dfe8ff", "#f2f3f7", "#ff5a3c", ["#0a0b0e", "#2b2e38"], "#8a8f9e"),
        T("Silver Steel",   STEEL, ["#33363f", "#0a0b0f"], "#dfe3ec", "#dfe8ff", "#e9ecf5", "#ff5a3c", ["#15171d", "#3d414d"], "#9aa0b0"),
        T("Emerald",        GOLD,  ["#1f7a57", "#06291d"], "#f3e0b0", "#fff3c8", "#f3e0b0", "#ff5a3c", ["#07150f", "#1c4a38"], "#c9a86a")
      ]
    },
    {
      id: "nova", name: "Chronex Nova", model: "Chronex Nova", price: 299,
      tag: "Nafis rose gold va haqiqiy teri tasma.",
      chips: ["Rose gold", "Teri tasma", "Ingichka"], glow: "#d79a9a", tick: false, numerals: true,
      themes: [
        T("Rose Gold",      ROSE,  ["#fffaf3", "#e6d6c3"], "#5e362c", "#fff", "#5e362c", "#b5473a", ["#3a2018", "#8a5340"], "#e9c9a8"),
        T("Silver Steel",   STEEL, ["#fbfcfe", "#d3d8e2"], "#1a1d26", "#fff", "#20232d", "#2b6fff", ["#1b1d24", "#4a4f5e"], "#9aa0b0"),
        T("Midnight Black", BLACK, ["#22242c", "#050608"], "#e9ecf5", "#fff", "#f2f3f7", "#e8c26a", ["#0a0b0e", "#2b2e38"], "#8a8f9e"),
        T("Gold",           GOLD,  ["#fffaf0", "#ecdcb8"], "#4a3a1a", "#fff", "#4a3a1a", "#a0301f", ["#2a1a10", "#6a4630"], "#e8cb88")
      ]
    }
  ];

  /* ---------- Rang yordamchilari ---------- */
  const hex2rgb = h => { h = h.replace("#", ""); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); };
  const rgb2hex = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  function shade(hex, amt) { // amt: -1 (qora) ... +1 (oq)
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    return rgb2hex(hex2rgb(hex).map(v => v + (t - v) * p));
  }
  const lum = hex => { const [r, g, b] = hex2rgb(hex); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };

  /* ---------- SVG yasash ---------- */
  function dialMarks(c) {
    let s = "";
    for (let i = 0; i < 60; i++) {
      const a = i * 6;
      if (i % 5 === 0) {
        if (c.numerals) continue;
        s += `<rect x="147" y="122" width="6" height="19" rx="1.5" fill="${c.mark}" stroke="${c.lume}" stroke-width=".8" transform="rotate(${a} ${CX} ${CY})"/>`;
      } else {
        s += `<rect x="149.4" y="114" width="1.2" height="5" fill="${c.mark}" opacity=".65" transform="rotate(${a} ${CX} ${CY})"/>`;
      }
    }
    if (c.numerals) {
      for (let h = 1; h <= 12; h++) {
        const r = h * Math.PI / 6;
        s += `<text x="${(CX + 80 * Math.sin(r)).toFixed(1)}" y="${(CY - 80 * Math.cos(r) + 6).toFixed(1)}" text-anchor="middle" font-family="Georgia,serif" font-size="17" fill="${c.mark}">${h}</text>`;
      }
    }
    return s;
  }

  function sunburst() {
    let s = "";
    for (let i = 0; i < 90; i++) {
      s += `<line x1="${CX}" y1="${CY}" x2="${CX}" y2="${CY - 108}" stroke="#fff" stroke-opacity=".05" stroke-width="1" transform="rotate(${i * 4} ${CX} ${CY})"/>`;
    }
    return s;
  }

  function subdial(cx, cy, kind, c) {
    let t = "";
    for (let i = 0; i < 12; i++) {
      t += `<line x1="${cx}" y1="${cy - 21}" x2="${cx}" y2="${cy - 17}" stroke="${c.mark}" stroke-width="1" transform="rotate(${i * 30} ${cx} ${cy})"/>`;
    }
    return `<circle cx="${cx}" cy="${cy}" r="24" fill="rgba(0,0,0,.25)" stroke="${c.mark}" stroke-opacity=".5"/>${t}
      <g data-${kind} data-cx="${cx}" data-cy="${cy}">
        <line x1="${cx}" y1="${cy + 5}" x2="${cx}" y2="${cy - 19}" stroke="${c.sec}" stroke-width="1.6" stroke-linecap="round"/>
      </g><circle cx="${cx}" cy="${cy}" r="2.4" fill="${c.sec}"/>`;
  }

  function watchSVG(c) {
    const i = c.id;
    const subs = c.subdials ? subdial(96, 220, "ss", c) + subdial(204, 220, "sm", c) + subdial(150, 276, "sh", c) : "";
    const date = c.date
      ? `<rect x="189" y="211" width="28" height="18" rx="2" fill="#fff" stroke="rgba(0,0,0,.3)"/>
         <text data-date x="203" y="224.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="#111">1</text>` : "";
    const texts = c.subdials
      ? `<text x="150" y="166" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" letter-spacing="4" fill="${c.mark}">CHRONEX</text>
         <text x="150" y="312" text-anchor="middle" font-family="Arial,sans-serif" font-size="6.5" letter-spacing="2.5" fill="${c.mark}" opacity=".8">CHRONOGRAPH</text>`
      : `<text x="150" y="168" text-anchor="middle" font-family="${c.numerals ? "Georgia,serif" : "Arial,sans-serif"}" font-size="11" letter-spacing="4" fill="${c.mark}">CHRONEX</text>
         <text x="150" y="${c.numerals ? 270 : 288}" text-anchor="middle" font-family="Arial,sans-serif" font-size="6.5" letter-spacing="2.5" fill="${c.mark}" opacity=".8">${c.numerals ? "NOVA" : "AUTOMATIC · 50M"}</text>`;
    const pushers = c.subdials
      ? `<rect x="268" y="158" width="14" height="14" rx="3" fill="url(#${i}-case)" transform="rotate(-28 275 165)"/>
         <rect x="268" y="268" width="14" height="14" rx="3" fill="url(#${i}-case)" transform="rotate(28 275 275)"/>` : "";

    return `<svg class="lw-svg" viewBox="0 0 300 440" role="img" aria-label="${c.name}">
<defs>
  <linearGradient id="${i}-case" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.case[0]}"/><stop offset=".5" stop-color="${c.case[1]}"/><stop offset="1" stop-color="${c.case[2]}"/></linearGradient>
  <linearGradient id="${i}-case2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.case[0]}"/><stop offset=".5" stop-color="${c.case[1]}"/><stop offset="1" stop-color="${c.case[2]}"/></linearGradient>
  <radialGradient id="${i}-dial" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="${c.dial[0]}"/><stop offset="1" stop-color="${c.dial[1]}"/></radialGradient>
  <linearGradient id="${i}-strap" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c.strap[0]}"/><stop offset=".5" stop-color="${c.strap[1]}"/><stop offset="1" stop-color="${c.strap[0]}"/></linearGradient>
  <linearGradient id="${i}-shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <clipPath id="${i}-clip"><circle cx="${CX}" cy="${CY}" r="108"/></clipPath>
</defs>

<path d="M108 0 H192 L197 150 H103 Z" fill="url(#${i}-strap)"/>
<path d="M115 0 L117 150 M185 0 L183 150" stroke="${c.stitch}" stroke-width="1.3" stroke-dasharray="5 4" fill="none" opacity=".8"/>
<path d="M103 290 H197 L192 440 H108 Z" fill="url(#${i}-strap)"/>
<path d="M117 290 L115 440 M183 290 L185 440" stroke="${c.stitch}" stroke-width="1.3" stroke-dasharray="5 4" fill="none" opacity=".8"/>
<g fill="#000" fill-opacity=".55"><circle cx="150" cy="335" r="3.2"/><circle cx="150" cy="357" r="3.2"/><circle cx="150" cy="379" r="3.2"/><circle cx="150" cy="401" r="3.2"/></g>

<rect x="102" y="94" width="96" height="34" rx="7" fill="url(#${i}-case)"/>
<rect x="102" y="312" width="96" height="34" rx="7" fill="url(#${i}-case)"/>
<rect x="274" y="205" width="17" height="30" rx="4" fill="url(#${i}-case)"/>
<g stroke="rgba(0,0,0,.35)" stroke-width="1"><line x1="279" y1="208" x2="279" y2="232"/><line x1="283" y1="208" x2="283" y2="232"/><line x1="287" y1="208" x2="287" y2="232"/></g>
${pushers}

<circle cx="${CX}" cy="${CY}" r="128" fill="url(#${i}-case)"/>
<circle cx="${CX}" cy="${CY}" r="120" fill="url(#${i}-case2)"/>
<circle cx="${CX}" cy="${CY}" r="114" fill="#0b0b0f"/>

<circle cx="${CX}" cy="${CY}" r="108" fill="url(#${i}-dial)"/>
<g clip-path="url(#${i}-clip)">${sunburst()}</g>
${dialMarks(c)}
${texts}
${date}
${subs}

<g data-h data-cx="${CX}" data-cy="${CY}">
  <path d="M150 232 L145 214 L148 152 L150 146 L152 152 L155 214 Z" fill="${c.hand}" stroke="rgba(0,0,0,.35)" stroke-width=".6"/>
  <path d="M150 210 L149 160 L150 156 L151 160 Z" fill="${c.lume}"/>
</g>
<g data-m data-cx="${CX}" data-cy="${CY}">
  <path d="M150 238 L146 214 L148.4 124 L150 118 L151.6 124 L154 214 Z" fill="${c.hand}" stroke="rgba(0,0,0,.35)" stroke-width=".6"/>
  <path d="M150 210 L149.3 130 L150 126 L150.7 130 Z" fill="${c.lume}"/>
</g>
<g data-s data-cx="${CX}" data-cy="${CY}">
  <line x1="${CX}" y1="252" x2="${CX}" y2="116" stroke="${c.sec}" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="${CX}" cy="244" r="4.2" fill="${c.sec}"/>
  <circle cx="${CX}" cy="${CY}" r="6" fill="${c.sec}"/>
  <circle cx="${CX}" cy="${CY}" r="2.2" fill="#111"/>
</g>

<g clip-path="url(#${i}-clip)"><ellipse cx="108" cy="148" rx="100" ry="56" fill="url(#${i}-shine)" transform="rotate(-28 108 148)"/></g>
<circle cx="${CX}" cy="${CY}" r="108" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1.5"/>
</svg>`;
  }

  /* ---------- Bo'limni yaratish ---------- */
  const swatch = (t, idx) =>
    `<button type="button" class="lw-sw${idx === 0 ? " on" : ""}" data-theme="${idx}" title="${t.name}" aria-label="${t.name}"
      style="background:linear-gradient(135deg,${t.dial[1]} 0 50%,${t.case[0]} 50% 100%)"></button>`;

  const section = document.createElement("section");
  section.className = "section lw";
  section.id = "live-watches";
  section.innerHTML = `
    <div class="container">
      <p class="eyebrow center">Live Collection</p>
      <h2 class="center">Jonli soatlar</h2>
      <p class="center muted">Soatlar doim yurib turadi. Rangni tanlang yoki o'zingiznikini yarating.</p>
      <div class="lw-modes" role="group" aria-label="Soniya strelkasi rejimi">
        <button type="button" data-mode="sweep" class="on">Silliq yurish</button>
        <button type="button" data-mode="tick">Tik-tak</button>
      </div>
      <div class="lw-grid">
        ${WATCHES.map(c => `
          <article class="lw-card" data-watch="${c.id}" style="--glow:${c.glow}">
            <div class="lw-stage lw-idle">${watchSVG(Object.assign({}, c, c.themes[0]))}<div class="lw-glare"></div></div>
            <div class="lw-info">
              <div class="lw-time" data-clock>--:--:--</div>
              <h3>${c.name}</h3>
              <p>${c.tag}</p>
              <div class="lw-colors">
                <span class="lw-label">Rang: <b data-themename>${c.themes[0].name}</b></span>
                <div class="lw-swatches">${c.themes.map(swatch).join("")}</div>
                <div class="lw-custom">
                  <label title="Siferblat rangini tanlang">Siferblat <input type="color" data-pick-dial value="${c.themes[0].dial[1]}"></label>
                  <label title="Tasma rangini tanlang">Tasma <input type="color" data-pick-strap value="${c.themes[0].strap[1]}"></label>
                </div>
              </div>
              <ul class="lw-chips">${c.chips.map(x => `<li>${x}</li>`).join("")}</ul>
              <div class="lw-foot"><strong>$${c.price}</strong><button class="btn btn-sm" type="button" data-pick="${c.model}">Buyurtma</button></div>
            </div>
          </article>`).join("")}
      </div>
    </div>`;

  const anchor = document.getElementById("technology");
  if (anchor) anchor.before(section); else document.body.appendChild(section);

  const menu = document.getElementById("menu");
  if (menu) {
    const a = document.createElement("a");
    a.href = "#live-watches";
    a.textContent = "Jonli soatlar";
    menu.insertBefore(a, menu.children[1] || null);
    a.addEventListener("click", () => {
      menu.classList.remove("open");
      const b = document.getElementById("burger");
      if (b) b.classList.remove("open");
    });
  }

  /* ---------- Holat ---------- */
  const items = [...section.querySelectorAll(".lw-card")].map(card => {
    const cfg = WATCHES.find(w => w.id === card.dataset.watch);
    const w = { cfg, card, stage: card.querySelector(".lw-stage"), theme: Object.assign({}, cfg, cfg.themes[0]), label: "", lastSec: -1 };
    w.label = cfg.themes[0].name;
    return w;
  });

  const pad = n => String(n).padStart(2, "0");
  const rot = (el, a) => el && el.setAttribute("transform", `rotate(${a.toFixed(2)} ${el.dataset.cx} ${el.dataset.cy})`);

  function bind(w) {
    const q = s => w.card.querySelector(s);
    w.h = q("[data-h]"); w.m = q("[data-m]"); w.s = q("[data-s]");
    w.ss = q("[data-ss]"); w.sm = q("[data-sm]"); w.sh = q("[data-sh]");
    w.date = q("[data-date]"); w.clock = q("[data-clock]");
    w.lastSec = -1;
  }
  function render(w) {
    w.stage.querySelector(".lw-svg").outerHTML = watchSVG(w.theme);
    bind(w);
  }
  items.forEach(bind);

  /* ---------- Rang tanlash ---------- */
  items.forEach(w => {
    const nameEl = w.card.querySelector("[data-themename]");
    const dialIn = w.card.querySelector("[data-pick-dial]");
    const strapIn = w.card.querySelector("[data-pick-strap]");

    w.card.querySelectorAll(".lw-sw").forEach(btn => btn.addEventListener("click", () => {
      const t = w.cfg.themes[+btn.dataset.theme];
      w.theme = Object.assign({}, w.cfg, t);
      w.label = t.name;
      w.card.querySelectorAll(".lw-sw").forEach(b => b.classList.toggle("on", b === btn));
      nameEl.textContent = t.name;
      dialIn.value = t.dial[1];
      strapIn.value = t.strap[1];
      render(w);
    }));

    dialIn.addEventListener("input", () => {
      const c = dialIn.value, light = lum(c) > 0.55;
      Object.assign(w.theme, {
        dial: [shade(c, 0.18), shade(c, -0.45)],
        mark: light ? "#1a1d26" : "#f2f3f7",
        hand: light ? "#20232d" : "#f2f3f7",
        lume: light ? "#cfe9c2" : "#ffffff"
      });
      w.label = `Custom (siferblat ${c}, tasma ${strapIn.value})`;
      w.card.querySelectorAll(".lw-sw").forEach(b => b.classList.remove("on"));
      nameEl.textContent = "Maxsus";
      render(w);
    });

    strapIn.addEventListener("input", () => {
      const c = strapIn.value;
      w.theme.strap = [shade(c, -0.4), c];
      w.label = `Custom (siferblat ${dialIn.value}, tasma ${c})`;
      w.card.querySelectorAll(".lw-sw").forEach(b => b.classList.remove("on"));
      nameEl.textContent = "Maxsus";
      render(w);
    });

    // "Buyurtma": model va tanlangan rangni mavjud formaga yozadi
    w.card.querySelector("[data-pick]").addEventListener("click", e => {
      const model = document.getElementById("model");
      const finish = document.getElementById("finish");
      if (model) { model.value = e.currentTarget.dataset.pick; model.dispatchEvent(new Event("change")); }
      if (finish) {
        let opt = [...finish.options].find(o => o.value === w.label || o.text === w.label);
        if (!opt) { opt = new Option(w.label, w.label); finish.add(opt); }
        finish.value = opt.value;
        finish.dispatchEvent(new Event("change"));
      }
      const o = document.getElementById("order");
      if (o) o.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- Rejim tugmalari ---------- */
  let mode = "sweep";
  section.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => {
    mode = b.dataset.mode;
    section.querySelectorAll("[data-mode]").forEach(x => x.classList.toggle("on", x === b));
  }));

  /* ---------- Harakat (doim ishlaydi) ---------- */
  let visible = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(section);

  function frame() {
    if (visible) {
      const d = new Date();
      const secRaw = d.getSeconds() + d.getMilliseconds() / 1000;
      const min = d.getMinutes() + secRaw / 60;
      const hr = (d.getHours() % 12) + min / 60;
      const si = d.getSeconds();

      items.forEach(w => {
        const quartz = mode === "tick" || w.cfg.tick;
        const sec = quartz ? Math.floor(secRaw) : secRaw;
        rot(w.s, sec * 6);
        rot(w.m, min * 6);
        rot(w.h, hr * 30);
        rot(w.ss, sec * 6);
        rot(w.sm, ((d.getMinutes() % 30) + secRaw / 60) * 12);
        rot(w.sh, hr * 30);
        if (si !== w.lastSec) {
          w.lastSec = si;
          if (w.clock) w.clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(si)}`;
          if (w.date) w.date.textContent = d.getDate();
        }
      });
    }
    requestAnimationFrame(frame);
  }
  frame();

  /* ---------- 3D tilt (sichqoncha) + o'z-o'zidan chayqalish ---------- */
  items.forEach(w => {
    const stage = w.stage;
    let hover = false, timer;
    stage.addEventListener("mouseenter", () => {
      hover = true; clearTimeout(timer);
      stage.classList.remove("lw-idle", "lw-reset");
    });
    stage.addEventListener("mousemove", e => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      stage.style.transform = `perspective(900px) rotateX(${((0.5 - y) * 16).toFixed(1)}deg) rotateY(${((x - 0.5) * 18).toFixed(1)}deg) scale(1.04)`;
      stage.style.setProperty("--gx", (x * 100).toFixed(0) + "%");
      stage.style.setProperty("--gy", (y * 100).toFixed(0) + "%");
    });
    stage.addEventListener("mouseleave", () => {
      hover = false;
      stage.classList.add("lw-reset");
      stage.style.transform = "";
      timer = setTimeout(() => {
        if (!hover) { stage.classList.remove("lw-reset"); stage.classList.add("lw-idle"); }
      }, 650);
    });
  });

  /* ---------- Paydo bo'lish ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("lw-in"); io.unobserve(e.target); }
  }), { threshold: .15 });
  items.forEach((w, i) => { w.card.style.transitionDelay = i * 120 + "ms"; io.observe(w.card); });
})();/* ===== CHRONEX extras.js — qo'shimcha modul (mavjud kodga tegmaydi) =====
   Qo'shilgan funksiyalar:
   1 Scroll progress   2 Qora/Och mavzu   3 Menyu scroll-spy   4 Savatcha (Telegram buyurtma)
   5 Sevimlilar        6 Saralash         7 Solishtirish       8 Aksiya taymeri
   9 Jahon soatlari   10 Sekundomer      11 Taymer            12 Promo kod
  13 Bo'lib to'lash   14 Sharhlar slayder 15 FAQ              16 Obuna formasi
*/
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const pad = n => String(n).padStart(2, "0");
  const money = n => "$" + (Math.round(n * 100) / 100).toLocaleString("en-US");
  const ls = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const PROMOS = { CHRONEX10: 10, UZ15: 15 };          // promo kodlar (foiz)
  const TG = () => (typeof TG_USER !== "undefined" ? TG_USER : "your_username");
  const PRICE = {};
  $$("#model option").forEach(o => PRICE[o.value] = +o.dataset.price);

  /* ---------- Toast ---------- */
  const tw = el("div", "cx-toasts"); document.body.append(tw);
  function toast(m) {
    const t = el("div", "cx-toast", m); tw.append(t);
    setTimeout(() => t.classList.add("out"), 2600); setTimeout(() => t.remove(), 3100);
  }

  /* ---------- Modal ---------- */
  function modal(html) {
    const m = el("div", "cx-modal", `<div class="cx-mbox"><button class="cx-x" aria-label="Yopish">×</button>${html}</div>`);
    const esc = e => { if (e.key === "Escape") close(); };
    const close = () => { m.remove(); removeEventListener("keydown", esc); };
    m.addEventListener("click", e => { if (e.target === m || e.target.classList.contains("cx-x")) close(); });
    addEventListener("keydown", esc);
    document.body.append(m);
    return m;
  }

  /* ---------- 1. Scroll progress ---------- */
  const bar = el("div", "cx-progress"); document.body.prepend(bar);
  addEventListener("scroll", () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + "%";
  }, { passive: true });

  /* ---------- 2. Mavzu ---------- */
  const root = document.documentElement;
  const tb = el("button", "cx-theme", "☀");
  tb.type = "button"; tb.title = "Mavzuni almashtirish"; tb.setAttribute("aria-label", "Mavzuni almashtirish");
  const nav = $(".nav"); if (nav) nav.insertBefore(tb, $("#burger"));
  function setTheme(t) { root.dataset.theme = t; tb.textContent = t === "light" ? "☾" : "☀"; ls.set("cx_theme", t); }
  setTheme(ls.get("cx_theme", "dark"));
  tb.onclick = () => setTheme(root.dataset.theme === "light" ? "dark" : "light");

  /* ---------- 3. Scroll-spy ---------- */
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    $$(".menu a").forEach(a => a.classList.toggle("act", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  ["collection", "live-watches", "technology", "story", "order"].forEach(id => { const s = document.getElementById(id); if (s) spy.observe(s); });

  /* ---------- Holat ---------- */
  let cart = ls.get("cx_cart", []), fav = ls.get("cx_fav", []), promo = ls.get("cx_promo", ""), tab = "cart", months = 6;
  const pct = () => PROMOS[promo] || 0;
  const save = () => { ls.set("cx_cart", cart); ls.set("cx_fav", fav); ls.set("cx_promo", promo); };

  /* ---------- 4/5. Dock + Drawer ---------- */
  const dock = el("div", "cx-dock", `<button id="cxCartBtn" type="button">🛒 Savatcha <b>0</b></button><button id="cxFavBtn" type="button">♥ <b>0</b></button>`);
  const veil = el("div", "cx-veil");
  const drawer = el("aside", "cx-drawer", `<div class="cx-dh"><div class="cx-tabs"><button type="button" data-t="cart">Savatcha</button><button type="button" data-t="fav">Sevimlilar</button></div><button class="cx-x" type="button" aria-label="Yopish">×</button></div><div class="cx-body"></div><div class="cx-df"></div>`);
  document.body.append(dock, veil, drawer);
  const openDrawer = t => { tab = t; draw(); drawer.classList.add("open"); veil.classList.add("open"); };
  const closeDrawer = () => { drawer.classList.remove("open"); veil.classList.remove("open"); };
  $("#cxCartBtn").onclick = () => openDrawer("cart");
  $("#cxFavBtn").onclick = () => openDrawer("fav");
  veil.onclick = closeDrawer; $(".cx-x", drawer).onclick = closeDrawer;
  addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });

  function addCart(n) {
    const i = cart.find(x => x.n === n);
    if (i) i.q = Math.min(10, i.q + 1); else cart.push({ n, q: 1 });
    save(); draw(); toast(n + " savatga qo'shildi");
  }
  function setPromo(code) {
    code = (code || "").trim().toUpperCase();
    if (!code) { promo = ""; toast("Promo kod olib tashlandi"); }
    else if (PROMOS[code]) { promo = code; toast(`Promo qo'llandi: −${PROMOS[code]}%`); }
    else { toast("Promo kod noto'g'ri"); return; }
    save(); draw();
  }

  function draw() {
    const cnt = cart.reduce((a, x) => a + x.q, 0);
    $("#cxCartBtn b").textContent = cnt; $("#cxFavBtn b").textContent = fav.length;
    $$(".cx-heart").forEach(h => h.classList.toggle("on", fav.includes(h.dataset.n)));
    $$(".cx-tabs button").forEach(b => b.classList.toggle("on", b.dataset.t === tab));
    const B = $(".cx-body", drawer), F = $(".cx-df", drawer);
    if (tab === "cart") {
      const sub = cart.reduce((a, x) => a + (PRICE[x.n] || 0) * x.q, 0), d = sub * pct() / 100;
      B.innerHTML = cart.length ? cart.map(x => `<div class="cx-row"><div><b>${x.n}</b><small>${money(PRICE[x.n] || 0)}</small></div><div class="cx-q"><button type="button" data-a="m" data-n="${x.n}">−</button><span>${x.q}</span><button type="button" data-a="p" data-n="${x.n}">+</button></div><button class="cx-rm" type="button" data-a="r" data-n="${x.n}">×</button></div>`).join("") : `<p class="cx-empty">Savatcha bo'sh. Kolleksiyadan soat tanlang.</p>`;
      F.innerHTML = cart.length ? `<div class="cx-pr"><input id="cxPromoCart" placeholder="Promo kod" value="${promo}"><button type="button" class="btn btn-sm btn-ghost" data-a="promo">OK</button></div><div class="cx-sum"><span>Oraliq jami</span><b>${money(sub)}</b></div>${d ? `<div class="cx-sum"><span>Chegirma (${pct()}%)</span><b>−${money(d)}</b></div>` : ""}<div class="cx-sum big"><span>Jami</span><b>${money(sub - d)}</b></div><button type="button" class="btn btn-block" data-a="checkout">Telegramda buyurtma berish</button><button type="button" class="link" data-a="clear">Savatchani tozalash</button>` : "";
    } else {
      B.innerHTML = fav.length ? fav.map(n => `<div class="cx-row"><div><b>${n}</b><small>${money(PRICE[n] || 0)}</small></div><button type="button" class="btn btn-sm" data-a="tocart" data-n="${n}">Savatga</button><button class="cx-rm" type="button" data-a="unfav" data-n="${n}">×</button></div>`).join("") : `<p class="cx-empty">Sevimli soatlar yo'q. Kartadagi ♥ tugmasini bosing.</p>`;
      F.innerHTML = "";
    }
    syncOrder();
  }

  drawer.addEventListener("click", e => {
    const b = e.target.closest("[data-a]"); if (b) {
      const a = b.dataset.a, n = b.dataset.n, it = cart.find(x => x.n === n);
      if (a === "tab") return;
      if (a === "p" && it) it.q = Math.min(10, it.q + 1);
      else if (a === "m" && it) { it.q--; if (it.q < 1) cart = cart.filter(x => x !== it); }
      else if (a === "r") cart = cart.filter(x => x.n !== n);
      else if (a === "clear") cart = [];
      else if (a === "promo") { setPromo($("#cxPromoCart").value); return; }
      else if (a === "tocart") { fav = fav; addCart(n); return; }
      else if (a === "unfav") fav = fav.filter(x => x !== n);
      else if (a === "checkout") {
        const sub = cart.reduce((s, x) => s + PRICE[x.n] * x.q, 0), d = sub * pct() / 100;
        const msg = `🛒 Yangi buyurtma (savatcha)\n\n${cart.map(x => `• ${x.n} × ${x.q} = ${money(PRICE[x.n] * x.q)}`).join("\n")}\n\n💰 Jami: ${money(sub - d)}${promo ? `\n🏷 Promo: ${promo} (−${pct()}%)` : ""}`;
        window.open(`https://t.me/${TG()}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
        return;
      }
      save(); draw(); return;
    }
    const t = e.target.closest("[data-t]"); if (t) { tab = t.dataset.t; draw(); }
  });

  /* Kartalarga: sevimli ♥ va "Savatga" */
  function decorate(card) {
    const h = $("h3", card), foot = $(".card-foot, .lw-foot", card);
    if (!h || !foot) return;
    const n = h.textContent.trim(); if (!(n in PRICE)) return;
    const heart = el("button", "cx-heart", "♥"); heart.type = "button"; heart.dataset.n = n; heart.title = "Sevimlilarga";
    heart.onclick = () => {
      fav = fav.includes(n) ? fav.filter(x => x !== n) : [...fav, n];
      toast(fav.includes(n) ? n + " sevimlilarga qo'shildi" : n + " sevimlilardan olib tashlandi");
      save(); draw();
    };
    card.append(heart);
    const old = $("button", foot);
    const add = el("button", "btn btn-sm btn-ghost", "🛒"); add.type = "button"; add.title = "Savatga qo'shish";
    add.onclick = () => addCart(n);
    const w = el("div", "cx-btns");
    if (old) { old.replaceWith(w); w.append(add, old); } else { foot.append(w); w.append(add); }
  }
  $$(".card, .lw-card").forEach(decorate);

  /* ---------- 6/7. Saralash + Solishtirish ---------- */
  const cards = $$("#collection .card");
  const sortRow = el("div", "cx-sort", `<button type="button" data-s="def" class="on">Standart</button><button type="button" data-s="asc">Arzon → Qimmat</button><button type="button" data-s="desc">Qimmat → Arzon</button><button type="button" data-s="cmp">⚖ Solishtirish</button>`);
  const cg = $("#collection .cards"); if (cg) cg.before(sortRow);
  const pr = c => PRICE[$("h3", c).textContent.trim()] || 0;
  sortRow.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    const s = b.dataset.s;
    if (s === "cmp") return compare();
    $$("button[data-s]", sortRow).forEach(x => x.classList.toggle("on", x === b));
    const arr = cards.map((c, i) => ({ c, i, p: pr(c) }));
    arr.sort((a, z) => s === "asc" ? a.p - z.p : s === "desc" ? z.p - a.p : a.i - z.i);
    arr.forEach((x, k) => x.c.style.order = k);
  });

  // Xususiyatlarni shu yerdan o'zgartiring
  const SPECS = [
    ["Korpus", "Yengil titan", "Titan + sapfir oyna", "Ingichka rose gold"],
    ["GPS", "—", "✓", "—"],
    ["Sapfir oyna", "—", "✓", "✓"],
    ["Yurak ritmi / SpO₂", "✓", "✓", "✓"],
    ["Suv himoyasi", "50 m", "50 m", "50 m"],
    ["Batareya", "14 kun", "14 kun", "14 kun"]
  ];
  function compare() {
    const names = ["Chronex Aero", "Chronex Titan", "Chronex Nova"];
    const m = modal(`<h3>Modellarni solishtirish</h3><div class="cx-wrap"><table class="cx-tbl"><tr><th></th>${names.map(n => `<th>${n}</th>`).join("")}</tr>${SPECS.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}<tr><td>Narx</td>${names.map(n => `<td><b>${money(PRICE[n])}</b></td>`).join("")}</tr><tr><td></td>${names.map(n => `<td><button class="btn btn-sm" type="button" data-add="${n}">Savatga</button></td>`).join("")}</tr></table></div>`);
    m.addEventListener("click", e => { const b = e.target.closest("[data-add]"); if (b) addCart(b.dataset.add); });
  }

  /* ---------- 8. Aksiya taymeri ---------- */
  const stats = $(".stats");
  const sale = el("section", "cx-sale", `<div class="container cx-sale-in"><div><b>🔥 Oylik aksiya</b><span>CHRONEX10 promo kodi bilan −10% chegirma</span></div><div class="cx-cd" id="cxCd"></div><button class="btn btn-sm" id="cxApply" type="button">Kodni qo'llash</button></div>`);
  if (stats) stats.after(sale);
  $("#cxApply").onclick = () => setPromo("CHRONEX10");
  function cd() {
    const n = new Date(), end = new Date(n.getFullYear(), n.getMonth() + 1, 1), ms = end - n;
    const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
    $("#cxCd").innerHTML = [[d, "kun"], [h, "soat"], [m, "daqiqa"], [s, "soniya"]].map(([v, l]) => `<div><b>${pad(v)}</b><small>${l}</small></div>`).join("");
  }
  cd(); setInterval(cd, 1000);

  /* ---------- 9/10/11. Jahon soatlari, Sekundomer, Taymer ---------- */
  const tools = el("section", "section dark", `<div class="container">
    <p class="eyebrow center">Chronex Tools</p><h2 class="center">Vaqt asboblari</h2>
    <p class="center muted">Jahon soatlari, sekundomer va taymer — hammasi shu yerda.</p>
    <div class="cx-wc" id="cxWc"></div>
    <div class="cx-tools">
      <div class="cx-box"><h3>Sekundomer</h3><div class="cx-big" id="cxSwT">00:00.00</div>
        <div class="cx-ctl"><button class="btn btn-sm" id="cxSwGo" type="button">Boshlash</button><button class="btn btn-sm btn-ghost" id="cxSwLap" type="button">Aylanish</button><button class="btn btn-sm btn-ghost" id="cxSwRs" type="button">Nolga</button></div>
        <ul class="cx-laps" id="cxLaps"></ul></div>
      <div class="cx-box"><h3>Taymer</h3><div class="cx-big" id="cxTmT">05:00</div>
        <div class="cx-ctl"><button class="btn btn-sm btn-ghost" data-min="1" type="button">1 daq</button><button class="btn btn-sm btn-ghost" data-min="5" type="button">5 daq</button><button class="btn btn-sm btn-ghost" data-min="10" type="button">10 daq</button><input class="cx-tm-in" id="cxTmIn" type="number" min="1" max="180" value="5" aria-label="Daqiqa"></div>
        <div class="cx-ctl" style="margin-top:14px"><button class="btn btn-sm" id="cxTmGo" type="button">Boshlash</button><button class="btn btn-sm btn-ghost" id="cxTmRs" type="button">Nolga</button></div></div>
    </div></div>`);
  tools.id = "tools";
  const story = $("#story"); if (story) story.before(tools); else document.body.append(tools);

  const ZONES = [["Toshkent", "Asia/Tashkent"], ["London", "Europe/London"], ["Nyu-York", "America/New_York"], ["Tokio", "Asia/Tokyo"], ["Dubay", "Asia/Dubai"]];
  const fmts = ZONES.map(z => new Intl.DateTimeFormat("en-GB", { timeZone: z[1], hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
  const wc = $("#cxWc");
  function wcDraw() {
    const now = new Date();
    wc.innerHTML = ZONES.map((z, i) => {
      const t = fmts[i].format(now), h = +t.slice(0, 2);
      return `<div><small>${z[0]} ${h < 6 || h >= 19 ? "🌙" : "☀️"}</small><b>${t}</b></div>`;
    }).join("");
  }
  wcDraw(); setInterval(wcDraw, 1000);

  // Sekundomer
  let swT = 0, swS = 0, swI = null, laps = [];
  const swFmt = ms => `${pad(Math.floor(ms / 6e4))}:${pad(Math.floor(ms / 1e3) % 60)}.${pad(Math.floor(ms / 10) % 100)}`;
  const swNow = () => swT + (swI ? performance.now() - swS : 0);
  const swDraw = () => { $("#cxSwT").textContent = swFmt(swNow()); };
  $("#cxSwGo").onclick = function () {
    if (swI) { swT += performance.now() - swS; clearInterval(swI); swI = null; this.textContent = "Davom ettirish"; }
    else { swS = performance.now(); swI = setInterval(swDraw, 33); this.textContent = "To'xtatish"; }
  };
  $("#cxSwLap").onclick = () => {
    if (!swI && !swT) return;
    laps.unshift(swFmt(swNow()));
    $("#cxLaps").innerHTML = laps.map((l, i) => `<li>#${laps.length - i} — ${l}</li>`).join("");
  };
  $("#cxSwRs").onclick = () => {
    clearInterval(swI); swI = null; swT = 0; laps = [];
    $("#cxLaps").innerHTML = ""; $("#cxSwGo").textContent = "Boshlash"; swDraw();
  };

  // Taymer
  let tm = 5 * 6e4, tEnd = 0, tI = null;
  const tmDraw = ms => { const s = Math.ceil(ms / 1e3); $("#cxTmT").textContent = `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; };
  function beep() {
    try {
      const a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(), g = a.createGain();
      o.connect(g); g.connect(a.destination); o.frequency.value = 880;
      g.gain.setValueAtTime(.2, a.currentTime); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + 1);
      o.start(); o.stop(a.currentTime + 1);
    } catch (e) {}
  }
  function tmStop() { clearInterval(tI); tI = null; $("#cxTmGo").textContent = "Boshlash"; }
  $("#cxTmGo").onclick = () => {
    if (tI) { tm = Math.max(0, tEnd - Date.now()); tmStop(); $("#cxTmGo").textContent = "Davom ettirish"; return; }
    if (tm <= 0) tm = (+$("#cxTmIn").value || 1) * 6e4;
    tEnd = Date.now() + tm; $("#cxTmGo").textContent = "To'xtatish";
    tI = setInterval(() => {
      const l = tEnd - Date.now();
      if (l <= 0) { tmStop(); tm = 0; tmDraw(0); beep(); toast("⏰ Taymer tugadi!"); } else tmDraw(l);
    }, 200);
  };
  $("#cxTmRs").onclick = () => { tmStop(); tm = (+$("#cxTmIn").value || 5) * 6e4; tmDraw(tm); };
  $("#cxTmIn").oninput = () => { if (!tI) { tm = Math.max(1, +$("#cxTmIn").value || 1) * 6e4; tmDraw(tm); } };
  $$("[data-min]", tools).forEach(b => b.onclick = () => {
    tmStop(); $("#cxTmIn").value = b.dataset.min; tm = b.dataset.min * 6e4; tmDraw(tm);
  });

  /* ---------- 12/13. Promo kod + Bo'lib to'lash (buyurtma formasida) ---------- */
  const totalEl = $(".total");
  if (totalEl) {
    const blk = el("div", "", `<div class="cx-promo"><input id="cxPromo" placeholder="Promo kod (masalan CHRONEX10)" aria-label="Promo kod"><button class="btn btn-sm btn-ghost" id="cxPromoBtn" type="button">Qo'llash</button></div><div class="cx-calc" id="cxCalc"></div>`);
    blk.style.display = "grid"; blk.style.gap = "12px";
    totalEl.after(blk);
    $("#cxPromoBtn").onclick = () => setPromo($("#cxPromo").value);
    $("#cxPromo").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); setPromo(e.target.value); } });
    $("#cxCalc").addEventListener("click", e => { const b = e.target.closest("[data-mo]"); if (b) { months = +b.dataset.mo; syncOrder(); } });
    ["#model"].forEach(s => $(s).addEventListener("change", syncOrder));
    ["#plus", "#minus"].forEach(s => $(s).addEventListener("click", syncOrder));
  }
  function syncOrder() {
    const m = $("#model"), q = $("#qty"), box = $("#cxCalc");
    if (!m || !q || !box) return;
    const base = (+m.selectedOptions[0].dataset.price) * (+q.value), d = base * pct() / 100, tot = base - d;
    const inp = $("#cxPromo"); if (inp && document.activeElement !== inp) inp.value = promo;
    box.innerHTML = `${d ? `<div class="cx-sum"><span>Promo ${promo} (−${pct()}%)</span><b>−${money(d)}</b></div><div class="cx-sum big"><span>Chegirma bilan jami</span><b>${money(tot)}</b></div>` : ""}<div class="cx-inst"><span>Bo'lib to'lash (taxminiy):</span>${[3, 6, 12].map(n => `<button type="button" data-mo="${n}" class="${n === months ? "on" : ""}">${n} oy</button>`).join("")}<b>${money(tot / months)}/oy</b></div>`;
  }
  // Telegram xabariga promo qo'shish (asosiy submit ishlagandan keyin)
  const form = $("#orderForm"), tgBtn = $("#tgBtn");
  if (form && tgBtn) form.addEventListener("submit", () => {
    if (!form.hidden || !pct() || tgBtn.href.indexOf("text=") < 0) return;
    const base = (+$("#model").selectedOptions[0].dataset.price) * (+$("#qty").value);
    tgBtn.href += encodeURIComponent(`\n🏷 Promo: ${promo} (−${pct()}%)\n💳 Chegirma bilan: ${money(base * (1 - pct() / 100))}`);
  });

  /* ---------- 14. Sharhlar slayderi ---------- */
  // DIQQAT: bular namunaviy matnlar — haqiqiy mijozlar fikri bilan almashtiring
  const REV = [
    ["Aziza, Samarqand", "Dizayni juda chiroyli, kun bo'yi qo'lda deyarli sezilmaydi."],
    ["Jasur, Toshkent", "Ekrani quyoshda ham ravshan ko'rinadi. Batareyasi uzoq ishlaydi."],
    ["Malika, Buxoro", "Rose gold rangi va teri tasmasi hayratlanarli darajada nafis."],
    ["Bobur, Namangan", "Sport rejimlari va yurak ritmi kuzatuvi menga juda qulay."]
  ];
  const faqSec = el("section", "section", `<div class="container narrow">
    <p class="eyebrow center">Mijozlar fikri</p><h2 class="center">Ular nima deydi</h2>
    <div class="cx-rv"><div class="cx-rv-track" id="cxRv">${REV.map(r => `<div class="cx-rv-item"><div class="cx-stars">★★★★★</div><p>“${r[1]}”</p><small>${r[0]}</small></div>`).join("")}</div></div>
    <div class="cx-dots" id="cxDots">${REV.map((_, i) => `<button type="button" data-i="${i}" aria-label="Sharh ${i + 1}"></button>`).join("")}</div>
    <h2 class="center" style="margin-top:90px">Ko'p so'raladigan savollar</h2>
    <div class="cx-faq">
      <details><summary>Buyurtmani qanday beraman?</summary><p>Modelni tanlang, savatchaga qo'shing yoki buyurtma formasini to'ldiring — xabar Telegram orqali bizga yuboriladi.</p></details>
      <details><summary>Yetkazib berish qanday amalga oshiriladi?</summary><p>Buyurtma tasdiqlangach, operator siz bilan manzil va yetkazib berish vaqtini kelishadi.</p></details>
      <details><summary>Promo kodni qayerda ishlataman?</summary><p>Savatcha yoki buyurtma formasidagi promo maydoniga kodni kiriting — jami summa avtomatik hisoblanadi.</p></details>
      <details><summary>Rangni o'zim tanlay olamanmi?</summary><p>Ha. “Jonli soatlar” bo'limida tayyor ranglarni tanlang yoki siferblat va tasma rangini o'zingiz belgilang.</p></details>
      <details><summary>Soat suvga chidamlimi?</summary><p>Barcha modellar 50 metrgacha suv himoyasiga ega.</p></details>
    </div></div>`);
  faqSec.id = "reviews";
  const footer = $(".footer"); if (footer) footer.before(faqSec); else document.body.append(faqSec);

  let ri = 0, rt;
  function rv(i) {
    ri = (i + REV.length) % REV.length;
    $("#cxRv").style.transform = `translateX(-${ri * 100}%)`;
    $$("#cxDots button").forEach((b, k) => b.classList.toggle("on", k === ri));
  }
  const auto = () => { clearInterval(rt); rt = setInterval(() => rv(ri + 1), 5000); };
  $("#cxDots").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { rv(+b.dataset.i); auto(); } });
  rv(0); auto();

  /* ---------- 16. Obuna formasi ---------- */
  const cp = $(".copy");
  if (cp) {
    const nw = el("div", "container cx-news", `<h4>Yangiliklar va aksiyalardan xabardor bo'ling</h4><form id="cxNews" novalidate><input id="cxMail" type="email" placeholder="email@misol.uz" autocomplete="email" aria-label="Email"><button class="btn btn-sm" type="submit">Obuna bo'lish</button></form>`);
    cp.before(nw);
    $("#cxNews").addEventListener("submit", e => {
      e.preventDefault();
      const v = $("#cxMail").value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { $("#cxMail").classList.add("invalid"); toast("Email noto'g'ri"); return; }
      $("#cxMail").classList.remove("invalid");
      const list = ls.get("cx_subs", []); if (!list.includes(v)) list.push(v); ls.set("cx_subs", list);
      $("#cxMail").value = ""; toast("Rahmat! Obuna qabul qilindi ✓");
    });
  }

  draw();
})();/* ===== CHRONEX: katta qo'shimchalar =====
   Mavjud kodga tegmaydi, hammasini o'zi sahifaga qo'shadi.

   TAHRIRLASH UCHUN (pastdagi "SOZLAMALAR" bo'limi):
   - PROMO_END    : aksiya tugash sanasi (tugagach chiziq va promo-kodlar o'chadi)
   - PROMOS       : promo-kodlar va foizlari
   - SPECS        : modellarni solishtirish jadvali
   - REVIEWS, FAQ : sharhlar va savol-javoblar (hozir NAMUNA matn, o'zingiznikiga almashtiring)
   Telegram username script.js dagi TG_USER dan olinadi. */
(function () {
  "use strict";

  /* ================= SOZLAMALAR ================= */
  const TG = (typeof TG_USER !== "undefined" && TG_USER) ? TG_USER : "your_username";
  const PROMO_END = new Date("2026-12-01T23:59:59+05:00").getTime();
  const PROMOS = { CHRONEX10: 10, FIRST5: 5 };

  const SPECS = {
    models: ["Chronex Aero", "Chronex Titan", "Chronex Nova"],
    prices: [249, 349, 299],
    rows: [
      ["Korpus", "Titan", "Titan + sapfir", "Rose gold po'lat"],
      ["Oyna", "Mustahkam mineral", "Sapfir", "Sapfir"],
      ["Ekran", "AMOLED 1000 nit", "AMOLED 1000 nit", "AMOLED 800 nit"],
      ["Batareya", "14 kun", "10 kun", "12 kun"],
      ["Suv himoyasi", "50 m", "50 m", "30 m"],
      ["GPS", false, true, false],
      ["Xronograf", false, true, false],
      ["Yurak ritmi va SpO₂", true, true, true],
      ["Tasma", "Kauchuk", "Kauchuk + oltin tikuv", "Haqiqiy teri"]
    ]
  };

  // NAMUNA sharhlar: haqiqiy mijoz fikrlari bilan almashtiring
  const REVIEWS = [
    { n: "Mijoz ismi", c: "Shahar", s: 5, t: "Bu yerga haqiqiy mijozning fikrini yozing. Soat haqida tajribasi, sifat va yetkazib berish haqida." },
    { n: "Mijoz ismi", c: "Shahar", s: 5, t: "Ikkinchi sharh uchun joy. Mijozdan ruxsat olib, uning haqiqiy so'zlarini qo'ying." },
    { n: "Mijoz ismi", c: "Shahar", s: 4, t: "Uchinchi sharh uchun joy. Ro'yxatni REVIEWS massivida o'zgartirishingiz mumkin." }
  ];

  // NAMUNA savol-javoblar: shartlaringizga moslab o'zgartiring
  const FAQ = [
    ["Kafolat qancha muddatga beriladi?", "Kafolat muddatini shu yerga yozing. Kafolat nimalarni qamrab olishini ham ko'rsating."],
    ["Yetkazib berish qancha vaqt oladi?", "Yetkazib berish muddati va narxini shu yerga yozing."],
    ["Qanday to'lash mumkin?", "To'lov usullarini yozing (naqd, karta, onlayn)."],
    ["Soat suvga chidaydimi?", "Suv himoyasi modelga qarab farq qiladi: Aero va Titan 50 m, Nova 30 m. Cho'milish va yomg'irda ishlatish mumkin."],
    ["Batareya qancha ishlaydi?", "Modelga qarab 10 kundan 14 kungacha (solishtirish jadvaliga qarang)."],
    ["Qaytarish yoki almashtirish mumkinmi?", "Qaytarish shartlarini shu yerga yozing."]
  ];

  /* ================= YORDAMCHILAR ================= */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = s => { const t = document.createElement("template"); t.innerHTML = s.trim(); return t.content.firstElementChild; };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = n => "$" + (Math.round(n * 100) / 100).toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const goOrder = () => { const o = $("#order"); if (o) o.scrollIntoView({ behavior: "smooth" }); };
  const lockScroll = on => { document.body.style.overflow = on ? "hidden" : ""; };

  const toastBox = html('<div class="cx-toasts" aria-live="polite"></div>');
  document.body.appendChild(toastBox);
  function toast(msg) {
    const t = document.createElement("div");
    t.className = "cx-toast"; t.textContent = msg;
    toastBox.appendChild(t);
    setTimeout(() => t.classList.add("out"), 2600);
    setTimeout(() => t.remove(), 3100);
  }

  function selectModel(name) {
    const sel = $("#model");
    if (sel) { sel.value = name; sel.dispatchEvent(new Event("change")); }
    goOrder();
  }

  /* ================= 1. PRELOADER ================= */
  const loader = html('<div id="cx-loader"><div class="cx-loader-logo">CHRONEX</div><div class="cx-loader-bar"><i></i></div></div>');
  document.body.prepend(loader);
  const hideLoader = () => { loader.classList.add("hide"); setTimeout(() => loader.remove(), 700); };
  if (document.readyState === "complete") setTimeout(hideLoader, 500);
  else addEventListener("load", () => setTimeout(hideLoader, 500));
  setTimeout(hideLoader, 3500);

  /* ================= 2. SKROLL CHIZIG'I ================= */
  const prog = html('<div class="cx-progress"><i></i></div>');
  document.body.appendChild(prog);
  const progI = prog.firstElementChild;

  /* ================= 3. AKSIYA CHIZIG'I + HISOB ================= */
  const promoActive = () => Date.now() < PROMO_END;
  if (promoActive()) {
    document.documentElement.classList.add("cx-has-bar");
    const bar = html(`<div class="cx-announce"><span>🔥 Aksiya! <b>CHRONEX10</b> promo-kod bilan <b>-10%</b> · Tugashiga: <b class="cx-cd">--</b></span><button type="button" aria-label="Yopish">×</button></div>`);
    document.body.appendChild(bar);
    const cd = $(".cx-cd", bar);
    const tickCd = () => {
      let s = Math.floor((PROMO_END - Date.now()) / 1000);
      if (s <= 0) { bar.remove(); document.documentElement.classList.remove("cx-has-bar"); clearInterval(iv); return; }
      const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
      cd.textContent = `${d}k ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    };
    const iv = setInterval(tickCd, 1000); tickCd();
    $("button", bar).onclick = () => { bar.remove(); document.documentElement.classList.remove("cx-has-bar"); };
  }

  /* ================= 4. YORUG' / QORONG'I TEMA ================= */
  const themeBtn = html('<button type="button" class="cx-fab cx-theme" aria-label="Temani almashtirish">☾</button>');
  document.body.appendChild(themeBtn);
  const applyTheme = light => {
    document.documentElement.classList.toggle("cx-light", light);
    themeBtn.textContent = light ? "☀" : "☾";
  };
  applyTheme(store.get("cx_light", false));
  themeBtn.onclick = () => { const l = !document.documentElement.classList.contains("cx-light"); applyTheme(l); store.set("cx_light", l); };

  /* ================= 5. HERO ZARRACHALARI ================= */
  const hero = $(".hero");
  if (hero) {
    const cv = document.createElement("canvas");
    cv.className = "cx-particles";
    hero.prepend(cv);
    const ctx = cv.getContext("2d");
    let W = 0, H = 0, vis = true;
    const P = Array.from({ length: 60 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.8 + .4, v: Math.random() * .0006 + .0002, a: Math.random() * .5 + .2, d: Math.random() * 6.28 }));
    const resize = () => { W = cv.width = hero.clientWidth; H = cv.height = hero.clientHeight; };
    resize(); addEventListener("resize", resize);
    new IntersectionObserver(e => { vis = e[0].isIntersecting; }).observe(hero);
    (function loop() {
      if (vis) {
        ctx.clearRect(0, 0, W, H);
        P.forEach(p => {
          p.y -= p.v; p.d += .01;
          if (p.y < -.01) { p.y = 1.01; p.x = Math.random(); }
          ctx.beginPath();
          ctx.arc((p.x + Math.sin(p.d) * .01) * W, p.y * H, p.r, 0, 6.283);
          ctx.fillStyle = `rgba(232,211,160,${p.a})`;
          ctx.fill();
        });
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ================= 6. PROMO-KOD (umumiy) ================= */
  function checkPromo(code) {
    code = (code || "").trim().toUpperCase();
    if (!code) return { ok: false, empty: true };
    if (!promoActive()) return { ok: false, msg: "Aksiya tugagan" };
    if (PROMOS[code]) return { ok: true, code, msg: `✓ Promo qo'llandi: −${PROMOS[code]}%` };
    return { ok: false, msg: "Promo-kod noto'g'ri" };
  }
  const curCode = () => store.get("cx_promo", "");
  const pct = () => (promoActive() && PROMOS[curCode()]) || 0;
  const syncHooks = [];
  function setPromo(code) { store.set("cx_promo", code || ""); syncHooks.forEach(f => f()); }

  /* ================= 7. SAVAT ================= */
  let cart = store.get("cx_cart", []);
  const saveCart = () => store.set("cx_cart", cart);
  const totals = () => {
    const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const d = sub * pct() / 100;
    return { sub, d, total: sub - d };
  };

  const cartBtn = html('<button type="button" class="cx-fab cx-cart" aria-label="Savat">🛒<span class="cx-badge" hidden>0</span></button>');
  const tgBtnF = html(`<a class="cx-fab cx-tg" href="https://t.me/${esc(TG)}" target="_blank" rel="noopener" aria-label="Telegramda yozish">✈</a>`);
  const overlay = html('<div class="cx-overlay"></div>');
  const drawer = html(`
    <aside class="cx-drawer" aria-hidden="true">
      <header><h3>Savat</h3><button type="button" class="cx-x" aria-label="Yopish">×</button></header>
      <div class="cx-items"></div>
      <div class="cx-cart-foot">
        <div class="cx-promo-row"><input class="cx-promo-in" placeholder="Promo-kod" autocomplete="off"><button type="button" class="btn btn-sm btn-ghost cx-promo-ok">Qo'llash</button></div>
        <div class="cx-sum"></div>
        <div class="cx-fields">
          <input class="cx-f-name" placeholder="Ismingiz" autocomplete="name">
          <input class="cx-f-phone" placeholder="Telefon: +998 90 123 45 67" autocomplete="tel" inputmode="tel">
          <input class="cx-f-addr" placeholder="Yetkazib berish manzili" autocomplete="street-address">
        </div>
        <button type="button" class="btn btn-block cx-checkout">Telegramda buyurtma berish</button>
      </div>
    </aside>`);
  document.body.append(cartBtn, tgBtnF, overlay, drawer);
  const badge = $(".cx-badge", cartBtn);

  function renderCart() {
    const box = $(".cx-items", drawer);
    const count = cart.reduce((s, i) => s + i.qty, 0);
    badge.textContent = count; badge.hidden = !count;
    if (!cart.length) {
      box.innerHTML = '<p class="cx-empty">Savat bo\'sh.<br>Soatni tanlang va «Savatga» tugmasini bosing.</p>';
    } else {
      box.innerHTML = cart.map((i, n) => `
        <div class="cx-item">
          <div class="cx-ico">⌚</div>
          <div class="cx-meta"><b>${esc(i.model)}</b><small>${esc(i.finish)}</small>
            <div class="cx-q"><button type="button" data-n="${n}" data-d="-1">−</button><span>${i.qty}</span><button type="button" data-n="${n}" data-d="1">+</button></div>
          </div>
          <div class="cx-price">${money(i.price * i.qty)}</div>
          <button type="button" class="cx-rm" data-n="${n}" aria-label="O'chirish">×</button>
        </div>`).join("");
    }
    const t = totals();
    $(".cx-sum", drawer).innerHTML =
      `<div><span>Oraliq summa</span><span>${money(t.sub)}</span></div>` +
      (t.d ? `<div class="cx-disc-l"><span>Promo ${esc(curCode())} (−${pct()}%)</span><span>−${money(t.d)}</span></div>` : "") +
      `<div class="cx-total"><span>Jami</span><span>${money(t.total)}</span></div>`;
    $(".cx-checkout", drawer).disabled = !cart.length;
    const pin = $(".cx-promo-in", drawer);
    if (document.activeElement !== pin) pin.value = curCode();
  }
  syncHooks.push(renderCart);

  function addToCart(model, finish, price) {
    const f = cart.find(i => i.model === model && i.finish === finish);
    if (f) f.qty = Math.min(10, f.qty + 1); else cart.push({ model, finish, price, qty: 1 });
    saveCart(); renderCart();
    toast(`${model} savatga qo'shildi`);
    cartBtn.classList.remove("bump"); void cartBtn.offsetWidth; cartBtn.classList.add("bump");
  }

  const openCart = () => { drawer.classList.add("open"); overlay.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); lockScroll(true); };
  const closeCart = () => { drawer.classList.remove("open"); overlay.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); lockScroll(false); };
  cartBtn.onclick = openCart;
  overlay.onclick = closeCart;
  $(".cx-x", drawer).onclick = closeCart;

  drawer.addEventListener("click", e => {
    const b = e.target.closest("button[data-n]");
    if (!b) return;
    const n = +b.dataset.n;
    if (b.classList.contains("cx-rm")) cart.splice(n, 1);
    else cart[n].qty = Math.max(1, Math.min(10, cart[n].qty + +b.dataset.d));
    saveCart(); renderCart();
  });

  $(".cx-promo-ok", drawer).onclick = () => {
    const v = $(".cx-promo-in", drawer).value;
    if (!v.trim()) { setPromo(""); toast("Promo-kod olib tashlandi"); return; }
    const r = checkPromo(v);
    if (r.ok) { setPromo(r.code); toast(r.msg); } else toast(r.msg);
  };

  // Telefon: +998 maskasi
  const phoneF = $(".cx-f-phone", drawer);
  phoneF.addEventListener("focus", () => { if (!phoneF.value) phoneF.value = "+998 "; });
  phoneF.addEventListener("input", () => {
    let d = phoneF.value.replace(/\D/g, "");
    if (!d.startsWith("998")) d = "998" + d.replace(/^998?/, "");
    d = d.slice(0, 12);
    phoneF.value = "+" + [d.slice(0, 3), d.slice(3, 5), d.slice(5, 8), d.slice(8, 10), d.slice(10, 12)].filter(Boolean).join(" ");
  });
  // Oldingi buyurtmadan ismni/manzilni to'ldirish
  try {
    const s = JSON.parse(localStorage.getItem("chronex_order") || "{}");
    if (s.name) $(".cx-f-name", drawer).value = s.name;
    if (s.phone) phoneF.value = s.phone;
    if (s.address) $(".cx-f-addr", drawer).value = s.address;
  } catch (e) {}

  $(".cx-checkout", drawer).onclick = () => {
    const nameF = $(".cx-f-name", drawer), addrF = $(".cx-f-addr", drawer);
    const bad = [];
    if (nameF.value.trim().length < 2) bad.push(nameF);
    if (phoneF.value.replace(/\D/g, "").length !== 12) bad.push(phoneF);
    if (addrF.value.trim().length < 5) bad.push(addrF);
    [nameF, phoneF, addrF].forEach(f => f.classList.toggle("invalid", bad.includes(f)));
    if (bad.length) { toast("Ism, telefon va manzilni to'ldiring"); bad[0].focus(); return; }

    const t = totals();
    const num = "CX" + Date.now().toString().slice(-6);
    const lines = cart.map((i, n) => `${n + 1}) ${i.model}, ${i.finish} × ${i.qty} = ${money(i.price * i.qty)}`).join("\n");
    const msg =
`🛒 Yangi buyurtma #${num}

${lines}

💰 Oraliq: ${money(t.sub)}${t.d ? `\n🎟 Promo: ${curCode()} (−${pct()}%): −${money(t.d)}` : ""}
✅ Jami: ${money(t.total)}

👤 Ism: ${nameF.value.trim()}
📞 Telefon: ${phoneF.value}
📍 Manzil: ${addrF.value.trim()}`;
    window.open(`https://t.me/${TG}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
    cart = []; saveCart(); renderCart(); closeCart();
    toast("Telegram ochildi. «Send» tugmasini bosing");
  };

  /* "Savatga" tugmalarini mavjud kartalarga qo'shish */
  const wrapBtn = (btn, onAdd) => {
    const foot = btn.parentElement;
    const wrap = html('<div class="cx-btns"></div>');
    foot.insertBefore(wrap, btn);
    const add = html('<button type="button" class="btn btn-sm btn-ghost cx-add">🛒 Savatga</button>');
    wrap.append(add, btn);
    add.onclick = onAdd;
    return foot;
  };
  const numFrom = el => parseFloat((el.textContent || "").replace(/[^\d.]/g, "")) || 0;
  const defFinish = () => { const f = $("#finish"); return f && f.options[0] ? f.options[0].text : "Midnight Black"; };

  $$(".card").forEach(card => {
    const b = $("[data-model]", card);
    if (!b) return;
    const foot = b.parentElement;
    const price = numFrom($("strong", foot));
    wrapBtn(b, () => addToCart(b.dataset.model, defFinish(), price));
  });
  $$(".lw-card").forEach(card => {
    const b = $("[data-pick]", card);
    if (!b) return;
    const price = numFrom($("strong", b.parentElement));
    wrapBtn(b, () => {
      const nm = $("[data-themename]", card).textContent;
      const fin = nm === "Maxsus" ? `Maxsus (siferblat ${$("[data-pick-dial]", card).value}, tasma ${$("[data-pick-strap]", card).value})` : nm;
      addToCart(b.dataset.pick, fin, price);
    });
  });
  renderCart();

  /* ================= 8. ASOSIY FORMADA PROMO-KOD ================= */
  const form = $("#orderForm"), totalEl = $("#total");
  if (form && totalEl && $("#note")) {
    const promoLabel = html(`<label>Promo-kod (ixtiyoriy)<input id="cxPromo" type="text" placeholder="CHRONEX10" autocomplete="off"><small class="cx-promo-msg" id="cxPromoMsg"></small></label>`);
    $("#note").closest("label").after(promoLabel);
    const pin = $("#cxPromo"), pmsg = $("#cxPromoMsg");
    const disc = html('<div class="cx-disc" id="cxDisc" hidden></div>');
    const totalBox = $(".total", form);
    (totalBox || form.lastElementChild).after(disc);

    const base = () => parseFloat(totalEl.textContent.replace(/[^\d.]/g, "")) || 0;
    const upd = () => {
      const p = pct();
      if (!p) { disc.hidden = true; return; }
      const b = base(), d = b * p / 100;
      disc.hidden = false;
      disc.textContent = `Promo ${curCode()} (−${p}%): −${money(d)}  →  To'lov: ${money(b - d)}`;
    };
    new MutationObserver(upd).observe(totalEl, { childList: true, characterData: true, subtree: true });
    syncHooks.push(() => { if (document.activeElement !== pin) pin.value = curCode(); upd(); });

    pin.addEventListener("input", () => {
      const r = checkPromo(pin.value);
      if (r.empty) { setPromo(""); pmsg.textContent = ""; pmsg.className = "cx-promo-msg"; }
      else if (r.ok) { setPromo(r.code); pmsg.textContent = r.msg; pmsg.className = "cx-promo-msg ok"; }
      else { setPromo(""); pmsg.textContent = r.msg; pmsg.className = "cx-promo-msg bad"; }
    });
    pin.value = curCode(); upd();

    // Yuborishdan keyin Telegram xabariga promo ma'lumotini qo'shish (script.js ishidan keyin ishlaydi)
    form.addEventListener("submit", () => {
      const done = $("#done"), a = $("#tgBtn");
      if (!done || done.hidden || !a || !pct()) return;
      try {
        const i = a.href.indexOf("?text=");
        const head = a.href.slice(0, i);
        const text = decodeURIComponent(a.href.slice(i + 6));
        const b = base(), d = b * pct() / 100;
        a.href = head + "?text=" + encodeURIComponent(`${text}\n\n🎟 Promo: ${curCode()} (−${pct()}%)\n💵 To'lov: ${money(b - d)}`);
      } catch (e) {}
    });
  }

  /* ================= 9. NEGA CHRONEX ================= */
  const stats = $(".stats");
  if (stats) stats.after(html(`
    <section class="cx-benefits"><div class="container cx-ben-grid">
      <div class="cx-ben"><span>🛡️</span><b>Kafolat</b><p>Har bir soatga rasmiy kafolat</p></div>
      <div class="cx-ben"><span>🚚</span><b>Yetkazib berish</b><p>Manzilingizgacha yetkazamiz</p></div>
      <div class="cx-ben"><span>↩️</span><b>Almashtirish</b><p>Shartlarga ko'ra qaytarish</p></div>
      <div class="cx-ben"><span>💬</span><b>Qo'llab-quvvatlash</b><p>Telegramda tezkor javob</p></div>
    </div></section>`));

  /* ================= 10. MODELLARNI SOLISHTIRISH ================= */
  const cards = $(".cards");
  const cmpModal = html(`
    <div class="cx-modal" aria-hidden="true">
      <div class="cx-modal-box" role="dialog" aria-label="Modellarni solishtirish">
        <button type="button" class="cx-x cx-modal-x" aria-label="Yopish">×</button>
        <h3>Modellarni solishtirish</h3>
        <div class="cx-table-wrap"><table class="cx-table"></table></div>
      </div>
    </div>`);
  document.body.appendChild(cmpModal);
  (function buildCmp() {
    const yes = '<span class="cx-yes">✓</span>', no = '<span class="cx-no">—</span>';
    const cell = v => v === true ? yes : v === false ? no : esc(v);
    $(".cx-table", cmpModal).innerHTML =
      `<thead><tr><th></th>${SPECS.models.map(m => `<th>${esc(m)}</th>`).join("")}</tr></thead><tbody>` +
      `<tr><td>Narx</td>${SPECS.prices.map(p => `<td><b>${money(p)}</b></td>`).join("")}</tr>` +
      SPECS.rows.map(r => `<tr><td>${esc(r[0])}</td>${r.slice(1).map(v => `<td>${cell(v)}</td>`).join("")}</tr>`).join("") +
      `<tr><td></td>${SPECS.models.map(m => `<td><button type="button" class="btn btn-sm" data-sel="${esc(m)}">Tanlash</button></td>`).join("")}</tr></tbody>`;
  })();
  const openCmp = () => { cmpModal.classList.add("open"); lockScroll(true); };
  const closeCmp = () => { cmpModal.classList.remove("open"); lockScroll(false); };
  cmpModal.addEventListener("click", e => {
    if (e.target === cmpModal || e.target.closest(".cx-modal-x")) closeCmp();
    const b = e.target.closest("[data-sel]");
    if (b) { closeCmp(); selectModel(b.dataset.sel); }
  });
  if (cards) {
    const w = html('<div class="center cx-cmp-wrap"><button type="button" class="btn btn-ghost">⚖ Modellarni solishtirish</button></div>');
    cards.after(w);
    $("button", w).onclick = openCmp;
  }

  /* ================= 11. SOAT TANLASH TESTI ================= */
  const QUIZ = [
    { q: "Soatni asosan qayerda taqasiz?", o: [
      ["Sport va faol hayot", { 0: 2, 1: 1 }], ["Ish va uchrashuvlar", { 2: 2, 1: 1 }], ["Har kuni, hamma joyda", { 0: 1, 2: 1, 1: 1 }]] },
    { q: "Byudjetingiz qancha?", o: [
      ["$250 gacha", { 0: 3 }], ["$250–$320", { 2: 2, 0: 1 }], ["Cheklov yo'q", { 1: 3 }]] },
    { q: "Siz uchun eng muhimi nima?", o: [
      ["Funksiyalar: GPS, xronograf", { 1: 3 }], ["Chiroyli dizayn", { 2: 3 }], ["Yengillik va uzoq batareya", { 0: 3 }]] }
  ];
  const WHY = [
    "Yengil, mustahkam va 14 kun ishlaydi. Faol hayot va kundalik taqish uchun.",
    "GPS, xronograf va sapfir oyna. Eng to'liq imkoniyatlar.",
    "Nafis rose gold va teri tasma. Ish va tadbirlar uchun ideal."
  ];
  const quiz = html(`
    <section class="section cx-quiz" id="quiz"><div class="container narrow center">
      <p class="eyebrow">Tanlashga yordam</p><h2>Sizga qaysi Chronex mos?</h2>
      <div class="cx-quiz-box"></div>
    </div></section>`);
  const tech = $("#technology");
  if (tech) tech.after(quiz); else document.body.appendChild(quiz);
  (function runQuiz() {
    const box = $(".cx-quiz-box", quiz);
    let step = 0, score = [0, 0, 0];
    const show = () => {
      if (step < QUIZ.length) {
        const q = QUIZ[step];
        box.innerHTML = `<div class="cx-q-prog"><i style="width:${step / QUIZ.length * 100}%"></i></div>
          <p class="cx-q-step">${step + 1} / ${QUIZ.length}</p><h3>${esc(q.q)}</h3>
          <div class="cx-opts">${q.o.map((o, i) => `<button type="button" class="cx-opt" data-i="${i}">${esc(o[0])}</button>`).join("")}</div>`;
      } else {
        const best = score.indexOf(Math.max(...score));
        box.innerHTML = `<div class="cx-q-prog"><i style="width:100%"></i></div>
          <p class="cx-q-step">Sizga mos model</p><h3 class="cx-res">${esc(SPECS.models[best])}</h3>
          <p class="muted">${esc(WHY[best])}</p><p class="cx-res-price">${money(SPECS.prices[best])}</p>
          <div class="cx-res-btns"><button type="button" class="btn" data-pick-res="${best}">Buyurtma berish</button>
          <button type="button" class="btn btn-ghost" data-again>Qayta boshlash</button></div>`;
      }
    };
    box.addEventListener("click", e => {
      const o = e.target.closest(".cx-opt");
      if (o) { QUIZ[step].o[+o.dataset.i][1] && Object.entries(QUIZ[step].o[+o.dataset.i][1]).forEach(([k, v]) => { score[k] += v; }); step++; show(); return; }
      const r = e.target.closest("[data-pick-res]");
      if (r) selectModel(SPECS.models[+r.dataset.pickRes]);
      if (e.target.closest("[data-again]")) { step = 0; score = [0, 0, 0]; show(); }
    });
    show();
  })();

  /* ================= 12. SHARHLAR ================= */
  const rev = html(`
    <section class="section cx-reviews" id="reviews"><div class="container narrow center">
      <p class="eyebrow">Sharhlar</p><h2>Mijozlar fikri</h2>
      <div class="cx-rev-view"><div class="cx-rev-track">${REVIEWS.map(r => `
        <figure class="cx-rev"><div class="cx-stars">${"★".repeat(r.s)}${"☆".repeat(5 - r.s)}</div>
          <blockquote>${esc(r.t)}</blockquote><figcaption><b>${esc(r.n)}</b> · ${esc(r.c)}</figcaption></figure>`).join("")}
      </div></div>
      <div class="cx-dots">${REVIEWS.map((_, i) => `<button type="button" data-i="${i}" aria-label="Sharh ${i + 1}"></button>`).join("")}</div>
    </div></section>`);
  quiz.after(rev);
  (function runReviews() {
    const track = $(".cx-rev-track", rev), dots = $$(".cx-dots button", rev), view = $(".cx-rev-view", rev);
    let i = 0, timer, hover = false;
    const go = n => { i = (n + REVIEWS.length) % REVIEWS.length; track.style.transform = `translateX(${-i * 100}%)`; dots.forEach((d, k) => d.classList.toggle("on", k === i)); };
    dots.forEach(d => d.onclick = () => go(+d.dataset.i));
    view.addEventListener("mouseenter", () => { hover = true; });
    view.addEventListener("mouseleave", () => { hover = false; });
    timer = setInterval(() => { if (!hover) go(i + 1); }, 5000);
    go(0);
  })();

  /* ================= 13. SAVOL-JAVOB ================= */
  const faq = html(`
    <section class="section cx-faq" id="faq"><div class="container narrow">
      <p class="eyebrow center">FAQ</p><h2 class="center">Ko'p so'raladigan savollar</h2>
      <div class="cx-faq-list">${FAQ.map(f => `<details><summary>${esc(f[0])}</summary><p>${esc(f[1])}</p></details>`).join("")}</div>
    </div></section>`);
  const ctaSec = $("#cta");
  if (ctaSec) ctaSec.after(faq);
  $$("details", faq).forEach(d => d.addEventListener("toggle", () => {
    if (d.open) $$("details", faq).forEach(o => { if (o !== d) o.open = false; });
  }));

  /* ================= 14. OBUNA ================= */
  const news = html(`
    <section class="cx-news"><div class="container narrow center">
      <h3>Yangiliklar va aksiyalardan xabardor bo'ling</h3>
      <p class="muted">Telegram username yoki telefon raqamingizni qoldiring.</p>
      <form class="cx-news-form"><input type="text" placeholder="@username yoki +998 ..." required><button class="btn" type="submit">Obuna bo'lish</button></form>
    </div></section>`);
  const footer = $(".footer");
  if (footer) footer.before(news); else document.body.appendChild(news);
  $("form", news).addEventListener("submit", e => {
    e.preventDefault();
    const v = $("input", news).value.trim();
    if (v.length < 4) { toast("Aloqa ma'lumotini kiriting"); return; }
    window.open(`https://t.me/${TG}?text=${encodeURIComponent("📩 Yangiliklarga obuna: " + v)}`, "_blank", "noopener");
    $("input", news).value = "";
    toast("Telegram ochildi. «Send» ni bosing");
  });

  /* ================= 15. MENYU: JORIY BO'LIM ================= */
  const links = $$("#menu a[href^='#']").filter(a => !a.classList.contains("btn"));
  const spy = () => {
    let cur = "";
    links.forEach(a => {
      const s = $(a.getAttribute("href"));
      if (s && s.getBoundingClientRect().top <= 140) cur = a.getAttribute("href");
    });
    links.forEach(a => a.classList.toggle("cx-active", a.getAttribute("href") === cur));
  };

  /* ================= UMUMIY HODISALAR ================= */
  addEventListener("scroll", () => {
    const h = document.documentElement;
    progI.style.width = (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight) * 100) + "%";
    spy();
  }, { passive: true });
  addEventListener("keydown", e => { if (e.key === "Escape") { closeCart(); closeCmp(); } });
})();/* ===== Jonli soatlar (qo'shimcha modul) =====
   Mavjud kodga tegmaydi: bo'limni o'zi sahifaga qo'shadi.

   YANGI RANG QO'SHISH: pastdagi WATCHES ichida kerakli soatning
   "themes" ro'yxatiga yangi qator qo'shing, masalan:
     T("Qizil", STEEL, ["#7a0f1a","#2b0408"], "#fff", "#fff", "#fff", "#ffd24a", ["#1a0306","#5a141c"], "#ff8a95")
   Tartib: nom, korpus, siferblat, belgi rangi, lume, strelka, soniya strelkasi, tasma, tikuv.
*/
(function () {
  const CX = 150, CY = 220;

  /* ---------- Korpus ranglari ---------- */
  const STEEL = ["#f4f6fa", "#7d8494", "#dfe3ec"];
  const GOLD  = ["#f6e6bb", "#9b7733", "#e8cb88"];
  const ROSE  = ["#fbe2d8", "#b07767", "#f0c9bb"];
  const BLACK = ["#5a5f6e", "#14161c", "#3a3e4b"];

  const T = (name, kase, dial, mark, lume, hand, sec, strap, stitch) =>
    ({ name, case: kase, dial, mark, lume, hand, sec, strap, stitch });

  const WATCHES = [
    {
      id: "aero", name: "Chronex Aero", model: "Chronex Aero", price: 249,
      tag: "Titan korpus, toza dizayn. Kundalik hamroh.",
      chips: ["Titan", "50 m", "14 kun"], glow: "#8e95a8", tick: true, date: true,
      themes: [
        T("Silver Steel",   STEEL, ["#fafbfd", "#bfc5d2"], "#1a1d26", "#cfe9c2", "#20232d", "#2b6fff", ["#14151a", "#3a3d48"], "#6b6f7c"),
        T("Midnight Black", BLACK, ["#2b2e38", "#07080b"], "#e9ecf5", "#cfe9c2", "#f2f3f7", "#2b6fff", ["#0a0b0e", "#2a2d36"], "#6b6f7c"),
        T("Rose Gold",      ROSE,  ["#fffaf3", "#e6d6c3"], "#5e362c", "#fff",    "#5e362c", "#b5473a", ["#3a2018", "#8a5340"], "#e9c9a8"),
        T("Ocean Blue",     STEEL, ["#2f6fd6", "#0c2a63"], "#ffffff", "#ffffff", "#ffffff", "#ffb020", ["#0b1c3d", "#2a4a8a"], "#9fc0ff")
      ]
    },
    {
      id: "titan", name: "Chronex Titan", model: "Chronex Titan", price: 349,
      tag: "Xronograf, sapfir oyna va GPS. Flagman.",
      chips: ["Sapfir", "GPS", "Xronograf"], glow: "#c9a86a", tick: false, subdials: true,
      themes: [
        T("Rose Gold",      GOLD,  ["#262932", "#050608"], "#e8d3a0", "#fff3c8", "#e8d3a0", "#ff5a3c", ["#0a0b0e", "#2b2e38"], "#c9a86a"),
        T("Midnight Black", BLACK, ["#1f2128", "#030406"], "#e9ecf5", "#dfe8ff", "#f2f3f7", "#ff5a3c", ["#0a0b0e", "#2b2e38"], "#8a8f9e"),
        T("Silver Steel",   STEEL, ["#33363f", "#0a0b0f"], "#dfe3ec", "#dfe8ff", "#e9ecf5", "#ff5a3c", ["#15171d", "#3d414d"], "#9aa0b0"),
        T("Emerald",        GOLD,  ["#1f7a57", "#06291d"], "#f3e0b0", "#fff3c8", "#f3e0b0", "#ff5a3c", ["#07150f", "#1c4a38"], "#c9a86a")
      ]
    },
    {
      id: "nova", name: "Chronex Nova", model: "Chronex Nova", price: 299,
      tag: "Nafis rose gold va haqiqiy teri tasma.",
      chips: ["Rose gold", "Teri tasma", "Ingichka"], glow: "#d79a9a", tick: false, numerals: true,
      themes: [
        T("Rose Gold",      ROSE,  ["#fffaf3", "#e6d6c3"], "#5e362c", "#fff", "#5e362c", "#b5473a", ["#3a2018", "#8a5340"], "#e9c9a8"),
        T("Silver Steel",   STEEL, ["#fbfcfe", "#d3d8e2"], "#1a1d26", "#fff", "#20232d", "#2b6fff", ["#1b1d24", "#4a4f5e"], "#9aa0b0"),
        T("Midnight Black", BLACK, ["#22242c", "#050608"], "#e9ecf5", "#fff", "#f2f3f7", "#e8c26a", ["#0a0b0e", "#2b2e38"], "#8a8f9e"),
        T("Gold",           GOLD,  ["#fffaf0", "#ecdcb8"], "#4a3a1a", "#fff", "#4a3a1a", "#a0301f", ["#2a1a10", "#6a4630"], "#e8cb88")
      ]
    }
  ];

  /* ---------- Rang yordamchilari ---------- */
  const hex2rgb = h => { h = h.replace("#", ""); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); };
  const rgb2hex = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  function shade(hex, amt) { // amt: -1 (qora) ... +1 (oq)
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    return rgb2hex(hex2rgb(hex).map(v => v + (t - v) * p));
  }
  const lum = hex => { const [r, g, b] = hex2rgb(hex); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };

  /* ---------- SVG yasash ---------- */
  function dialMarks(c) {
    let s = "";
    for (let i = 0; i < 60; i++) {
      const a = i * 6;
      if (i % 5 === 0) {
        if (c.numerals) continue;
        s += `<rect x="147" y="122" width="6" height="19" rx="1.5" fill="${c.mark}" stroke="${c.lume}" stroke-width=".8" transform="rotate(${a} ${CX} ${CY})"/>`;
      } else {
        s += `<rect x="149.4" y="114" width="1.2" height="5" fill="${c.mark}" opacity=".65" transform="rotate(${a} ${CX} ${CY})"/>`;
      }
    }
    if (c.numerals) {
      for (let h = 1; h <= 12; h++) {
        const r = h * Math.PI / 6;
        s += `<text x="${(CX + 80 * Math.sin(r)).toFixed(1)}" y="${(CY - 80 * Math.cos(r) + 6).toFixed(1)}" text-anchor="middle" font-family="Georgia,serif" font-size="17" fill="${c.mark}">${h}</text>`;
      }
    }
    return s;
  }

  function sunburst() {
    let s = "";
    for (let i = 0; i < 90; i++) {
      s += `<line x1="${CX}" y1="${CY}" x2="${CX}" y2="${CY - 108}" stroke="#fff" stroke-opacity=".05" stroke-width="1" transform="rotate(${i * 4} ${CX} ${CY})"/>`;
    }
    return s;
  }

  function subdial(cx, cy, kind, c) {
    let t = "";
    for (let i = 0; i < 12; i++) {
      t += `<line x1="${cx}" y1="${cy - 21}" x2="${cx}" y2="${cy - 17}" stroke="${c.mark}" stroke-width="1" transform="rotate(${i * 30} ${cx} ${cy})"/>`;
    }
    return `<circle cx="${cx}" cy="${cy}" r="24" fill="rgba(0,0,0,.25)" stroke="${c.mark}" stroke-opacity=".5"/>${t}
      <g data-${kind} data-cx="${cx}" data-cy="${cy}">
        <line x1="${cx}" y1="${cy + 5}" x2="${cx}" y2="${cy - 19}" stroke="${c.sec}" stroke-width="1.6" stroke-linecap="round"/>
      </g><circle cx="${cx}" cy="${cy}" r="2.4" fill="${c.sec}"/>`;
  }

  function watchSVG(c) {
    const i = c.id;
    const subs = c.subdials ? subdial(96, 220, "ss", c) + subdial(204, 220, "sm", c) + subdial(150, 276, "sh", c) : "";
    const date = c.date
      ? `<rect x="189" y="211" width="28" height="18" rx="2" fill="#fff" stroke="rgba(0,0,0,.3)"/>
         <text data-date x="203" y="224.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="#111">1</text>` : "";
    const texts = c.subdials
      ? `<text x="150" y="166" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" letter-spacing="4" fill="${c.mark}">CHRONEX</text>
         <text x="150" y="312" text-anchor="middle" font-family="Arial,sans-serif" font-size="6.5" letter-spacing="2.5" fill="${c.mark}" opacity=".8">CHRONOGRAPH</text>`
      : `<text x="150" y="168" text-anchor="middle" font-family="${c.numerals ? "Georgia,serif" : "Arial,sans-serif"}" font-size="11" letter-spacing="4" fill="${c.mark}">CHRONEX</text>
         <text x="150" y="${c.numerals ? 270 : 288}" text-anchor="middle" font-family="Arial,sans-serif" font-size="6.5" letter-spacing="2.5" fill="${c.mark}" opacity=".8">${c.numerals ? "NOVA" : "AUTOMATIC · 50M"}</text>`;
    const pushers = c.subdials
      ? `<rect x="268" y="158" width="14" height="14" rx="3" fill="url(#${i}-case)" transform="rotate(-28 275 165)"/>
         <rect x="268" y="268" width="14" height="14" rx="3" fill="url(#${i}-case)" transform="rotate(28 275 275)"/>` : "";

    return `<svg class="lw-svg" viewBox="0 0 300 440" role="img" aria-label="${c.name}">
<defs>
  <linearGradient id="${i}-case" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.case[0]}"/><stop offset=".5" stop-color="${c.case[1]}"/><stop offset="1" stop-color="${c.case[2]}"/></linearGradient>
  <linearGradient id="${i}-case2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.case[0]}"/><stop offset=".5" stop-color="${c.case[1]}"/><stop offset="1" stop-color="${c.case[2]}"/></linearGradient>
  <radialGradient id="${i}-dial" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="${c.dial[0]}"/><stop offset="1" stop-color="${c.dial[1]}"/></radialGradient>
  <linearGradient id="${i}-strap" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c.strap[0]}"/><stop offset=".5" stop-color="${c.strap[1]}"/><stop offset="1" stop-color="${c.strap[0]}"/></linearGradient>
  <linearGradient id="${i}-shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <clipPath id="${i}-clip"><circle cx="${CX}" cy="${CY}" r="108"/></clipPath>
</defs>

<path d="M108 0 H192 L197 150 H103 Z" fill="url(#${i}-strap)"/>
<path d="M115 0 L117 150 M185 0 L183 150" stroke="${c.stitch}" stroke-width="1.3" stroke-dasharray="5 4" fill="none" opacity=".8"/>
<path d="M103 290 H197 L192 440 H108 Z" fill="url(#${i}-strap)"/>
<path d="M117 290 L115 440 M183 290 L185 440" stroke="${c.stitch}" stroke-width="1.3" stroke-dasharray="5 4" fill="none" opacity=".8"/>
<g fill="#000" fill-opacity=".55"><circle cx="150" cy="335" r="3.2"/><circle cx="150" cy="357" r="3.2"/><circle cx="150" cy="379" r="3.2"/><circle cx="150" cy="401" r="3.2"/></g>

<rect x="102" y="94" width="96" height="34" rx="7" fill="url(#${i}-case)"/>
<rect x="102" y="312" width="96" height="34" rx="7" fill="url(#${i}-case)"/>
<rect x="274" y="205" width="17" height="30" rx="4" fill="url(#${i}-case)"/>
<g stroke="rgba(0,0,0,.35)" stroke-width="1"><line x1="279" y1="208" x2="279" y2="232"/><line x1="283" y1="208" x2="283" y2="232"/><line x1="287" y1="208" x2="287" y2="232"/></g>
${pushers}

<circle cx="${CX}" cy="${CY}" r="128" fill="url(#${i}-case)"/>
<circle cx="${CX}" cy="${CY}" r="120" fill="url(#${i}-case2)"/>
<circle cx="${CX}" cy="${CY}" r="114" fill="#0b0b0f"/>

<circle cx="${CX}" cy="${CY}" r="108" fill="url(#${i}-dial)"/>
<g clip-path="url(#${i}-clip)">${sunburst()}</g>
${dialMarks(c)}
${texts}
${date}
${subs}

<g data-h data-cx="${CX}" data-cy="${CY}">
  <path d="M150 232 L145 214 L148 152 L150 146 L152 152 L155 214 Z" fill="${c.hand}" stroke="rgba(0,0,0,.35)" stroke-width=".6"/>
  <path d="M150 210 L149 160 L150 156 L151 160 Z" fill="${c.lume}"/>
</g>
<g data-m data-cx="${CX}" data-cy="${CY}">
  <path d="M150 238 L146 214 L148.4 124 L150 118 L151.6 124 L154 214 Z" fill="${c.hand}" stroke="rgba(0,0,0,.35)" stroke-width=".6"/>
  <path d="M150 210 L149.3 130 L150 126 L150.7 130 Z" fill="${c.lume}"/>
</g>
<g data-s data-cx="${CX}" data-cy="${CY}">
  <line x1="${CX}" y1="252" x2="${CX}" y2="116" stroke="${c.sec}" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="${CX}" cy="244" r="4.2" fill="${c.sec}"/>
  <circle cx="${CX}" cy="${CY}" r="6" fill="${c.sec}"/>
  <circle cx="${CX}" cy="${CY}" r="2.2" fill="#111"/>
</g>

<g clip-path="url(#${i}-clip)"><ellipse cx="108" cy="148" rx="100" ry="56" fill="url(#${i}-shine)" transform="rotate(-28 108 148)"/></g>
<circle cx="${CX}" cy="${CY}" r="108" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1.5"/>
</svg>`;
  }

  /* ---------- Bo'limni yaratish ---------- */
  const swatch = (t, idx) =>
    `<button type="button" class="lw-sw${idx === 0 ? " on" : ""}" data-theme="${idx}" title="${t.name}" aria-label="${t.name}"
      style="background:linear-gradient(135deg,${t.dial[1]} 0 50%,${t.case[0]} 50% 100%)"></button>`;

  const section = document.createElement("section");
  section.className = "section lw";
  section.id = "live-watches";
  section.innerHTML = `
    <div class="container">
      <p class="eyebrow center">Live Collection</p>
      <h2 class="center">Jonli soatlar</h2>
      <p class="center muted">Soatlar doim yurib turadi. Rangni tanlang yoki o'zingiznikini yarating.</p>
      <div class="lw-modes" role="group" aria-label="Soniya strelkasi rejimi">
        <button type="button" data-mode="sweep" class="on">Silliq yurish</button>
        <button type="button" data-mode="tick">Tik-tak</button>
      </div>
      <div class="lw-grid">
        ${WATCHES.map(c => `
          <article class="lw-card" data-watch="${c.id}" style="--glow:${c.glow}">
            <div class="lw-stage lw-idle">${watchSVG(Object.assign({}, c, c.themes[0]))}<div class="lw-glare"></div></div>
            <div class="lw-info">
              <div class="lw-time" data-clock>--:--:--</div>
              <h3>${c.name}</h3>
              <p>${c.tag}</p>
              <div class="lw-colors">
                <span class="lw-label">Rang: <b data-themename>${c.themes[0].name}</b></span>
                <div class="lw-swatches">${c.themes.map(swatch).join("")}</div>
                <div class="lw-custom">
                  <label title="Siferblat rangini tanlang">Siferblat <input type="color" data-pick-dial value="${c.themes[0].dial[1]}"></label>
                  <label title="Tasma rangini tanlang">Tasma <input type="color" data-pick-strap value="${c.themes[0].strap[1]}"></label>
                </div>
              </div>
              <ul class="lw-chips">${c.chips.map(x => `<li>${x}</li>`).join("")}</ul>
              <div class="lw-foot"><strong>$${c.price}</strong><button class="btn btn-sm" type="button" data-pick="${c.model}">Buyurtma</button></div>
            </div>
          </article>`).join("")}
      </div>
    </div>`;

  const anchor = document.getElementById("technology");
  if (anchor) anchor.before(section); else document.body.appendChild(section);

  const menu = document.getElementById("menu");
  if (menu) {
    const a = document.createElement("a");
    a.href = "#live-watches";
    a.textContent = "Jonli soatlar";
    menu.insertBefore(a, menu.children[1] || null);
    a.addEventListener("click", () => {
      menu.classList.remove("open");
      const b = document.getElementById("burger");
      if (b) b.classList.remove("open");
    });
  }

  /* ---------- Holat ---------- */
  const items = [...section.querySelectorAll(".lw-card")].map(card => {
    const cfg = WATCHES.find(w => w.id === card.dataset.watch);
    const w = { cfg, card, stage: card.querySelector(".lw-stage"), theme: Object.assign({}, cfg, cfg.themes[0]), label: "", lastSec: -1 };
    w.label = cfg.themes[0].name;
    return w;
  });

  const pad = n => String(n).padStart(2, "0");
  const rot = (el, a) => el && el.setAttribute("transform", `rotate(${a.toFixed(2)} ${el.dataset.cx} ${el.dataset.cy})`);

  function bind(w) {
    const q = s => w.card.querySelector(s);
    w.h = q("[data-h]"); w.m = q("[data-m]"); w.s = q("[data-s]");
    w.ss = q("[data-ss]"); w.sm = q("[data-sm]"); w.sh = q("[data-sh]");
    w.date = q("[data-date]"); w.clock = q("[data-clock]");
    w.lastSec = -1;
  }
  function render(w) {
    w.stage.querySelector(".lw-svg").outerHTML = watchSVG(w.theme);
    bind(w);
  }
  items.forEach(bind);

  /* ---------- Rang tanlash ---------- */
  items.forEach(w => {
    const nameEl = w.card.querySelector("[data-themename]");
    const dialIn = w.card.querySelector("[data-pick-dial]");
    const strapIn = w.card.querySelector("[data-pick-strap]");

    w.card.querySelectorAll(".lw-sw").forEach(btn => btn.addEventListener("click", () => {
      const t = w.cfg.themes[+btn.dataset.theme];
      w.theme = Object.assign({}, w.cfg, t);
      w.label = t.name;
      w.card.querySelectorAll(".lw-sw").forEach(b => b.classList.toggle("on", b === btn));
      nameEl.textContent = t.name;
      dialIn.value = t.dial[1];
      strapIn.value = t.strap[1];
      render(w);
    }));

    dialIn.addEventListener("input", () => {
      const c = dialIn.value, light = lum(c) > 0.55;
      Object.assign(w.theme, {
        dial: [shade(c, 0.18), shade(c, -0.45)],
        mark: light ? "#1a1d26" : "#f2f3f7",
        hand: light ? "#20232d" : "#f2f3f7",
        lume: light ? "#cfe9c2" : "#ffffff"
      });
      w.label = `Custom (siferblat ${c}, tasma ${strapIn.value})`;
      w.card.querySelectorAll(".lw-sw").forEach(b => b.classList.remove("on"));
      nameEl.textContent = "Maxsus";
      render(w);
    });

    strapIn.addEventListener("input", () => {
      const c = strapIn.value;
      w.theme.strap = [shade(c, -0.4), c];
      w.label = `Custom (siferblat ${dialIn.value}, tasma ${c})`;
      w.card.querySelectorAll(".lw-sw").forEach(b => b.classList.remove("on"));
      nameEl.textContent = "Maxsus";
      render(w);
    });

    // "Buyurtma": model va tanlangan rangni mavjud formaga yozadi
    w.card.querySelector("[data-pick]").addEventListener("click", e => {
      const model = document.getElementById("model");
      const finish = document.getElementById("finish");
      if (model) { model.value = e.currentTarget.dataset.pick; model.dispatchEvent(new Event("change")); }
      if (finish) {
        let opt = [...finish.options].find(o => o.value === w.label || o.text === w.label);
        if (!opt) { opt = new Option(w.label, w.label); finish.add(opt); }
        finish.value = opt.value;
        finish.dispatchEvent(new Event("change"));
      }
      const o = document.getElementById("order");
      if (o) o.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- Rejim tugmalari ---------- */
  let mode = "sweep";
  section.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => {
    mode = b.dataset.mode;
    section.querySelectorAll("[data-mode]").forEach(x => x.classList.toggle("on", x === b));
  }));

  /* ---------- Harakat (doim ishlaydi) ---------- */
  let visible = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(section);

  function frame() {
    if (visible) {
      const d = new Date();
      const secRaw = d.getSeconds() + d.getMilliseconds() / 1000;
      const min = d.getMinutes() + secRaw / 60;
      const hr = (d.getHours() % 12) + min / 60;
      const si = d.getSeconds();

      items.forEach(w => {
        const quartz = mode === "tick" || w.cfg.tick;
        const sec = quartz ? Math.floor(secRaw) : secRaw;
        rot(w.s, sec * 6);
        rot(w.m, min * 6);
        rot(w.h, hr * 30);
        rot(w.ss, sec * 6);
        rot(w.sm, ((d.getMinutes() % 30) + secRaw / 60) * 12);
        rot(w.sh, hr * 30);
        if (si !== w.lastSec) {
          w.lastSec = si;
          if (w.clock) w.clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(si)}`;
          if (w.date) w.date.textContent = d.getDate();
        }
      });
    }
    requestAnimationFrame(frame);
  }
  frame();

  /* ---------- 3D tilt (sichqoncha) + o'z-o'zidan chayqalish ---------- */
  items.forEach(w => {
    const stage = w.stage;
    let hover = false, timer;
    stage.addEventListener("mouseenter", () => {
      hover = true; clearTimeout(timer);
      stage.classList.remove("lw-idle", "lw-reset");
    });
    stage.addEventListener("mousemove", e => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      stage.style.transform = `perspective(900px) rotateX(${((0.5 - y) * 16).toFixed(1)}deg) rotateY(${((x - 0.5) * 18).toFixed(1)}deg) scale(1.04)`;
      stage.style.setProperty("--gx", (x * 100).toFixed(0) + "%");
      stage.style.setProperty("--gy", (y * 100).toFixed(0) + "%");
    });
    stage.addEventListener("mouseleave", () => {
      hover = false;
      stage.classList.add("lw-reset");
      stage.style.transform = "";
      timer = setTimeout(() => {
        if (!hover) { stage.classList.remove("lw-reset"); stage.classList.add("lw-idle"); }
      }, 650);
    });
  });

  /* ---------- Paydo bo'lish ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("lw-in"); io.unobserve(e.target); }
  }), { threshold: .15 });
  items.forEach((w, i) => { w.card.style.transitionDelay = i * 120 + "ms"; io.observe(w.card); });
})();/* ===== Haqiqiy sayt qo'shimchalari ===== */
(function () {
  const $ = id => document.getElementById(id);
  const tg = typeof TG_USER !== "undefined" ? TG_USER : "your_username";

  const a = $("cx3Tg");
  if (a) a.href = "https://t.me/" + tg;

  const city = $("cx3City"), eta = $("cx3Eta");
  if (city) city.addEventListener("change", () => {
    eta.textContent = city.value ? "Taxminiy muddat: " + city.value + " ish kuni" : "";
  });

  const ck = $("cx3Cookie");
  let accepted = false;
  try { accepted = localStorage.getItem("cx3_cookie") === "1"; } catch (e) {}
  if (ck && !accepted) setTimeout(() => { ck.hidden = false; }, 1500);
  $("cx3Ok").onclick = () => {
    ck.hidden = true;
    try { localStorage.setItem("cx3_cookie", "1"); } catch (e) {}
  };

  // Matnlarni o'zingizning shartlaringizga almashtiring
  const LEGAL = {
    warranty: ["Kafolat va qaytarish", "Kafolat muddati va qaytarish shartlarini shu yerga yozing."],
    privacy: ["Maxfiylik", "Ism, telefon va manzil faqat buyurtmani rasmiylashtirish uchun ishlatiladi va qurilmangizda saqlanadi."]
  };
  const modal = $("cx3Modal");
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-legal]");
    if (b) {
      const [t, p] = LEGAL[b.dataset.legal];
      $("cx3Title").textContent = t; $("cx3Text").textContent = p;
      modal.hidden = false;
    } else if (e.target === modal || e.target.closest(".cx3-x")) modal.hidden = true;
  });
  addEventListener("keydown", e => { if (e.key === "Escape") modal.hidden = true; });
})();