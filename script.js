// ====== SOZLAMA ======
// Telegram username'ingizni shu yerga yozing (@ belgisiz)
const TG_USER = "your_username";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ====== Header, burger, to-top ======
const header = $("#header"), toTop = $("#toTop"), burger = $("#burger"), menu = $("#menu");
addEventListener("scroll", () => {
  header.classList.toggle("scrolled", scrollY > 30);
  toTop.classList.toggle("show", scrollY > 600);
}, { passive: true });
toTop.onclick = () => scrollTo({ top: 0, behavior: "smooth" });
burger.onclick = () => { burger.classList.toggle("open"); menu.classList.toggle("open"); };
$$("#menu a").forEach(a => a.onclick = () => { burger.classList.remove("open"); menu.classList.remove("open"); });
$("#year").textContent = new Date().getFullYear();

// ====== Analog soat ======
const ticks = $("#ticks");
for (let i = 0; i < 60; i++) {
  const t = document.createElement("i");
  t.style.setProperty("--r", i * 6 + "deg");
  if (i % 5 === 0) t.className = "big";
  ticks.appendChild(t);
}
const hH = $("#hHour"), hM = $("#hMin"), hS = $("#hSec"), dig = $("#digital"), amo = $("#amoledTime");
const pad = n => String(n).padStart(2, "0");
function tick() {
  const d = new Date(), s = d.getSeconds() + d.getMilliseconds() / 1000, m = d.getMinutes() + s / 60, h = (d.getHours() % 12) + m / 60;
  hS.style.transform = `rotate(${s * 6}deg)`;
  hM.style.transform = `rotate(${m * 6}deg)`;
  hH.style.transform = `rotate(${h * 30}deg)`;
  const txt = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  dig.textContent = txt; amo.textContent = txt;
  requestAnimationFrame(tick);
}
tick();

// ====== Scroll reveal ======
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: .15 });
$$(".reveal").forEach(el => io.observe(el));

// ====== Raqam animatsiyasi ======
const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 1400;
  (function step(t) {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  })(t0);
  cio.unobserve(el);
}), { threshold: .6 });
$$("[data-count]").forEach(el => cio.observe(el));

// ====== Buyurtma formasi ======
const model = $("#model"), finish = $("#finish"), qty = $("#qty"), total = $("#total");
const nameI = $("#name"), phoneI = $("#phone"), addrI = $("#address"), noteI = $("#note");
const form = $("#orderForm"), done = $("#done"), tgBtn = $("#tgBtn");

const price = () => +model.selectedOptions[0].dataset.price;
const updateTotal = () => total.textContent = "$" + (price() * +qty.value).toLocaleString("en-US");
model.onchange = updateTotal;
$("#minus").onclick = () => { qty.value = Math.max(1, +qty.value - 1); updateTotal(); };
$("#plus").onclick = () => { qty.value = Math.min(10, +qty.value + 1); updateTotal(); };

// Kartadagi "Tanlash" tugmalari
$$("[data-model]").forEach(b => b.onclick = () => {
  model.value = b.dataset.model; updateTotal();
  $("#order").scrollIntoView({ behavior: "smooth" });
});

// Telefon formati: +998 90 123 45 67
phoneI.addEventListener("input", () => {
  let d = phoneI.value.replace(/\D/g, "");
  if (!d.startsWith("998")) d = "998" + d.replace(/^998?/, "");
  d = d.slice(0, 12);
  const p = [d.slice(0, 3), d.slice(3, 5), d.slice(5, 8), d.slice(8, 10), d.slice(10, 12)].filter(Boolean);
  phoneI.value = "+" + p.join(" ");
});
phoneI.addEventListener("focus", () => { if (!phoneI.value) phoneI.value = "+998 "; });

// Saqlash (localStorage) — mijoz ma'lumoti qayta kiritilmasligi uchun
const KEY = "chronex_order";
try {
  const s = JSON.parse(localStorage.getItem(KEY) || "{}");
  if (s.name) nameI.value = s.name;
  if (s.phone) phoneI.value = s.phone;
  if (s.address) addrI.value = s.address;
} catch (e) {}
updateTotal();

function setErr(input, msg) {
  input.classList.toggle("invalid", !!msg);
  const el = $(`.err[data-for="${input.id}"]`);
  if (el) el.textContent = msg || "";
  return !msg;
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const okName = setErr(nameI, nameI.value.trim().length < 2 ? "Ismingizni kiriting" : "");
  const okPhone = setErr(phoneI, phoneI.value.replace(/\D/g, "").length !== 12 ? "To'liq telefon raqam kiriting" : "");
  const okAddr = setErr(addrI, addrI.value.trim().length < 5 ? "Manzilni kiriting" : "");
  if (!(okName && okPhone && okAddr)) return;

  try { localStorage.setItem(KEY, JSON.stringify({ name: nameI.value, phone: phoneI.value, address: addrI.value })); } catch (e) {}

  const num = "CX" + Date.now().toString().slice(-6);
  const msg =
`🛒 Yangi buyurtma #${num}

⌚ Model: ${model.value}
🎨 Rang: ${finish.value}
🔢 Soni: ${qty.value}
💰 Jami: ${total.textContent}

👤 Ism: ${nameI.value.trim()}
📞 Telefon: ${phoneI.value}
📍 Manzil: ${addrI.value.trim()}
📝 Izoh: ${noteI.value.trim() || "—"}`;

  tgBtn.href = `https://t.me/${TG_USER}?text=${encodeURIComponent(msg)}`;
  form.hidden = true; done.hidden = false;
  done.scrollIntoView({ behavior: "smooth", block: "center" });
});

$("#backBtn").onclick = () => { done.hidden = true; form.hidden = false; };
[nameI, phoneI, addrI].forEach(i => i.addEventListener("input", () => setErr(i, "")));/* ===== Jonli soatlar (qo'shimcha modul) =====
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
})();/* ===== CHRONEX add4.js — watch.js oxiriga qo'shing =====
   Mavjud kodga tegmaydi.

   SOZLAMALAR (pastda): UZS_RATE, BRANCHES
   Funksiyalar: batareya kalkulyatori, bilak o'lchami, filiallar (ochiq/yopiq),
   xabar yuborish, ulashish, sozlamalar paneli (matn o'lchami, kontrast, so'm),
   buyurtmalar tarixi (qurilmada), tezkor tugmalar, yon nuqtalar. */
(function () {
  "use strict";

  /* ================= SOZLAMALAR ================= */
  const UZS_RATE = 12500; // 1 USD = ? so'm. Kursni o'zingiz yangilab turing.
  // NAMUNA filiallar: haqiqiy manzil va ish vaqtini yozing. h: [ochilish, yopilish] soat
  const BRANCHES = [
    { n: "Samarqand", a: "Manzilni shu yerga yozing", t: "09:00 – 20:00", h: [9, 20] },
    { n: "Toshkent", a: "Manzilni shu yerga yozing", t: "10:00 – 21:00", h: [10, 21] },
    { n: "Buxoro", a: "Manzilni shu yerga yozing", t: "09:00 – 19:00", h: [9, 19] }
  ];

  /* ================= YORDAMCHILAR ================= */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const g = id => document.getElementById(id);
  const TG = () => (typeof TG_USER !== "undefined" && TG_USER) ? TG_USER : "your_username";
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  function say(msg) { // mavjud toast bo'lsa shuni ishlatadi, bo'lmasa o'zimiznikini
    let box = $(".cx-toasts");
    if (!box) { box = document.createElement("div"); box.className = "cx-toasts"; document.body.appendChild(box); }
    const t = document.createElement("div");
    t.className = "cx-toast"; t.textContent = msg; box.appendChild(t);
    setTimeout(() => t.classList.add("out"), 2600); setTimeout(() => t.remove(), 3100);
  }

  /* ================= MODAL ================= */
  const modal = g("cx4Modal");
  function openModal(title, html) {
    if (!modal) return;
    g("cx4MTitle").textContent = title;
    g("cx4MBody").innerHTML = html;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }
  if (modal) modal.addEventListener("click", e => {
    if (e.target === modal || e.target.closest(".cx4-x")) closeModal();
  });

  /* ================= 1. BATAREYA KALKULYATORI ================= */
  const bat = { m: g("cx4Model"), br: g("cx4Br"), gps: g("cx4Gps"), nt: g("cx4Nt"), aod: g("cx4Aod") };
  function calcBat() {
    if (!bat.m) return;
    const base = +bat.m.value, br = +bat.br.value, gps = +bat.gps.value, nt = +bat.nt.value;
    g("cx4BrV").textContent = br; g("cx4GpsV").textContent = gps; g("cx4NtV").textContent = nt;
    const drain = 1 + (br - 50) / 200 + gps * 0.08 + (bat.aod.checked ? 0.35 : 0) + nt / 400;
    const days = Math.max(1, base / Math.max(0.4, drain));
    g("cx4Days").textContent = days.toFixed(1);
    g("cx4Meter").style.width = Math.min(100, days / base * 100 / 1.4) + "%";
  }
  Object.values(bat).forEach(el => el && el.addEventListener("input", calcBat));
  calcBat();

  /* ================= 2. BILAK O'LCHAMI ================= */
  const wr = g("cx4Wr");
  function calcWrist() {
    if (!wr) return;
    const v = +wr.value;
    g("cx4WrV").textContent = v;
    let s, t;
    if (v < 14.5) { s = "S"; t = "Kichik o'lcham. Ingichka Nova modeli yaxshi mos keladi."; }
    else if (v < 17) { s = "M"; t = "O'rta o'lcham. Barcha modellar qulay o'tiradi."; }
    else if (v < 19.5) { s = "L"; t = "Katta o'lcham. Titan yoki Aero qulay."; }
    else { s = "XL"; t = "Eng katta o'lcham. Buyurtma izohida yozib qoldiring."; }
    g("cx4Size").textContent = s; g("cx4SizeTxt").textContent = t;
  }
  if (wr) { wr.addEventListener("input", calcWrist); calcWrist(); }

  /* ================= 3. FILIALLAR ================= */
  const brBox = g("cx4Branches");
  function drawBranches() {
    if (!brBox) return;
    const h = new Date().getHours();
    brBox.innerHTML = BRANCHES.map(b => {
      const open = h >= b.h[0] && h < b.h[1];
      const map = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(b.n + " " + b.a);
      return `<article class="cx4-br"><h3>📍 ${esc(b.n)}</h3><p>${esc(b.a)}</p><p>🕘 ${esc(b.t)}</p>
        <span class="cx4-open ${open ? "on" : "off"}">${open ? "● Hozir ochiq" : "● Hozir yopiq"}</span>
        <a class="link" href="${map}" target="_blank" rel="noopener">Xaritada ko'rish →</a></article>`;
    }).join("");
  }
  drawBranches(); setInterval(drawBranches, 60000);

  /* ================= 4. XABAR YUBORISH ================= */
  const msg = g("cx4Msg");
  if (msg) {
    const f = { n: g("cx4MName"), p: g("cx4MPhone"), t: g("cx4MText") };
    const e = { n: g("cx4EName"), p: g("cx4EPhone"), t: g("cx4EText") };
    const mark = (k, text) => { f[k].classList.toggle("invalid", !!text); e[k].textContent = text || ""; return !text; };
    Object.keys(f).forEach(k => f[k].addEventListener("input", () => mark(k, "")));
    msg.addEventListener("submit", ev => {
      ev.preventDefault();
      const a = mark("n", f.n.value.trim().length < 2 ? "Ismingizni kiriting" : "");
      const b = mark("p", f.p.value.trim().length < 5 ? "Aloqa ma'lumotini kiriting" : "");
      const c = mark("t", f.t.value.trim().length < 5 ? "Xabarni yozing" : "");
      if (!(a && b && c)) return;
      const text = `💬 Yangi savol\n\n👤 ${f.n.value.trim()}\n📞 ${f.p.value.trim()}\n\n${f.t.value.trim()}`;
      window.open(`https://t.me/${TG()}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
      msg.reset(); say("Telegram ochildi. «Send» tugmasini bosing");
    });
  }

  /* ================= 5. ULASHISH ================= */
  const shareBtn = g("cx4Share"), copyBtn = g("cx4Copy");
  const shareData = { title: document.title, text: "Chronex smart-soatlari", url: location.href.split("#")[0] };
  async function copyLink() {
    try { await navigator.clipboard.writeText(shareData.url); say("Havola nusxalandi ✓"); }
    catch (e) { window.prompt("Havolani nusxalang:", shareData.url); }
  }
  if (copyBtn) copyBtn.onclick = copyLink;
  if (shareBtn) shareBtn.onclick = async () => {
    if (navigator.share) { try { await navigator.share(shareData); } catch (e) {} }
    else copyLink();
  };

  /* ================= 6. SOZLAMALAR PANELI ================= */
  const gear = g("cx4Gear"), panel = g("cx4Panel");
  const setPanel = open => {
    if (!panel) return;
    panel.hidden = !open; gear.setAttribute("aria-expanded", String(open));
  };
  if (gear) gear.onclick = () => setPanel(panel.hidden);
  document.addEventListener("click", ev => {
    if (panel && !panel.hidden && !ev.target.closest("#cx4Panel, #cx4Gear")) setPanel(false);
  });

  // Matn o'lchami (zoom: zamonaviy brauzerlarda ishlaydi)
  let zoom = store.get("cx4_zoom", 1);
  const applyZoom = () => { document.body.style.zoom = zoom === 1 ? "" : zoom; store.set("cx4_zoom", zoom); };
  if (g("cx4FPlus")) {
    g("cx4FPlus").onclick = () => { zoom = Math.min(1.3, +(zoom + 0.1).toFixed(2)); applyZoom(); };
    g("cx4FMinus").onclick = () => { zoom = Math.max(0.8, +(zoom - 0.1).toFixed(2)); applyZoom(); };
    g("cx4FReset").onclick = () => { zoom = 1; applyZoom(); };
    applyZoom();
  }

  // Yuqori kontrast
  const hcBtn = g("cx4HC");
  function setHC(on) {
    document.documentElement.classList.toggle("cx4-hc", on);
    if (hcBtn) { hcBtn.textContent = on ? "Yoqilgan" : "O'chiq"; hcBtn.setAttribute("aria-pressed", String(on)); }
    store.set("cx4_hc", on);
  }
  if (hcBtn) hcBtn.onclick = () => setHC(!document.documentElement.classList.contains("cx4-hc"));
  setHC(store.get("cx4_hc", false));

  // Narx so'mda
  const uzsBtn = g("cx4UZS");
  const fmtUZS = usd => "≈ " + Math.round(usd * UZS_RATE).toLocaleString("ru-RU") + " so'm";
  function tagPrices() {
    $$(".card-foot strong, .lw-foot strong").forEach(s => {
      const n = parseFloat(s.textContent.replace(/[^\d.]/g, ""));
      if (n) s.dataset.uzs = fmtUZS(n);
    });
    const t = g("total");
    if (t) { const n = parseFloat(t.textContent.replace(/[^\d.]/g, "")); if (n) t.dataset.uzs = fmtUZS(n); }
  }
  const totalEl = g("total");
  if (totalEl) new MutationObserver(tagPrices).observe(totalEl, { childList: true, characterData: true, subtree: true });
  function setUZS(on) {
    document.body.classList.toggle("cx4-uzs-on", on);
    if (uzsBtn) { uzsBtn.textContent = on ? "Yoqilgan" : "O'chiq"; uzsBtn.setAttribute("aria-pressed", String(on)); }
    store.set("cx4_uzs", on);
    if (on) tagPrices();
  }
  if (uzsBtn) uzsBtn.onclick = () => setUZS(!document.body.classList.contains("cx4-uzs-on"));
  tagPrices(); setTimeout(tagPrices, 1500);
  setUZS(store.get("cx4_uzs", false));

  /* ================= 7. BUYURTMALAR TARIXI (qurilmada) ================= */
  const KEY = "cx4_orders";
  const form = g("orderForm"), done = g("done"), tgBtn = g("tgBtn");
  if (form && done && tgBtn) form.addEventListener("submit", () => {
    if (done.hidden) return; // tekshiruvdan o'tmagan
    const m = /CX\d{6}/.exec(tgBtn.href);
    const num = m ? m[0] : "CX" + Date.now().toString().slice(-6);
    const list = store.get(KEY, []);
    if (list.some(o => o.num === num)) return;
    list.unshift({
      num, date: new Date().toLocaleString("uz-UZ"),
      model: g("model").value, finish: g("finish").value, qty: +g("qty").value, total: g("total").textContent
    });
    store.set(KEY, list.slice(0, 20));
  });

  function showHistory() {
    const list = store.get(KEY, []);
    const body = list.length
      ? list.map((o, i) => `<div class="cx4-ord"><div><b>${esc(o.model)}</b> × ${o.qty}<small>${esc(o.finish)}</small><small>#${esc(o.num)} · ${esc(o.date)}</small></div>
          <b class="price">${esc(o.total)}</b><button class="btn btn-sm btn-ghost cx4-again" data-i="${i}" type="button">Qayta buyurtma</button></div>`).join("")
        + `<button class="link" id="cx4ClearH" type="button">Tarixni tozalash</button>`
      : `<p class="cx4-empty">Hozircha buyurtmalar yo'q.<br>Bu ro'yxat faqat shu qurilmada saqlanadi.</p>`;
    openModal("Buyurtmalarim", body);
  }
  if (g("cx4Hist")) g("cx4Hist").onclick = () => { setPanel(false); showHistory(); };

  function reorder(o) {
    const model = g("model"), qty = g("qty");
    if (!model || !qty) return;
    model.value = o.model; model.dispatchEvent(new Event("change"));
    const minus = g("minus"), plus = g("plus");
    if (minus && plus) {
      for (let i = 0; i < 10; i++) minus.click();
      for (let i = 1; i < o.qty; i++) plus.click();
    }
    const fin = g("finish");
    if (fin) {
      let opt = [...fin.options].find(x => x.text === o.finish);
      if (!opt) { opt = new Option(o.finish, o.finish); fin.add(opt); }
      fin.value = opt.value;
    }
    closeModal();
    const sec = g("order"); if (sec) sec.scrollIntoView({ behavior: "smooth" });
  }
  if (modal) modal.addEventListener("click", ev => {
    const a = ev.target.closest(".cx4-again");
    if (a) { const o = store.get(KEY, [])[+a.dataset.i]; if (o) reorder(o); }
    if (ev.target.closest("#cx4ClearH")) { store.set(KEY, []); showHistory(); }
  });

  /* ================= 8. TEZKOR TUGMALAR ================= */
  function showKeys() {
    openModal("Tezkor tugmalar", `<div class="cx4-keys">
      <div><span>Bu oynani ochish</span><kbd>?</kbd></div>
      <div><span>Buyurtma formasiga o'tish</span><kbd>O</kbd></div>
      <div><span>Aloqa bo'limiga o'tish</span><kbd>C</kbd></div>
      <div><span>Maslahatchiga o'tish</span><kbd>M</kbd></div>
      <div><span>Sahifa boshiga qaytish</span><kbd>T</kbd></div>
      <div><span>Oynani yopish</span><kbd>Esc</kbd></div></div>`);
  }
  if (g("cx4Keys")) g("cx4Keys").onclick = () => { setPanel(false); showKeys(); };
  const go = id => { const s = g(id); if (s) s.scrollIntoView({ behavior: "smooth" }); };
  addEventListener("keydown", ev => {
    if (ev.key === "Escape") { closeModal(); setPanel(false); return; }
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const tag = (ev.target.tagName || "").toLowerCase();
    if (["input", "textarea", "select"].includes(tag) || ev.target.isContentEditable) return;
    const k = ev.key.toLowerCase();
    if (ev.key === "?") showKeys();
    else if (k === "o") go("order");
    else if (k === "c") go("message");
    else if (k === "m") go("advisor");
    else if (k === "t") scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ================= 9. YON NUQTALAR ================= */
  const SECTIONS = [
    ["top", "Bosh sahifa"], ["collection", "Kolleksiya"], ["live-watches", "Jonli soatlar"],
    ["technology", "Texnologiya"], ["advisor", "Maslahatchi"], ["story", "Hikoya"],
    ["order", "Buyurtma"], ["branches", "Manzillar"], ["message", "Aloqa"]
  ].filter(([id]) => g(id));
  if (SECTIONS.length) {
    const nav = document.createElement("nav");
    nav.className = "cx4-dots"; nav.setAttribute("aria-label", "Bo'limlar");
    nav.innerHTML = SECTIONS.map(([id, t]) => `<a href="#${id}" data-t="${t}" aria-label="${t}"></a>`).join("");
    document.body.appendChild(nav);
    const links = $$("a", nav);
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) links.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id));
    }), { rootMargin: "-45% 0px -50% 0px" });
    SECTIONS.forEach(([id]) => io.observe(g(id)));
  }
})();/* ===== CHRONEX add5.js — hero (bosh ekran) o'ng tomoniga haqiqiy, yurib turuvchi soat =====
   Mavjud kodga tegmaydi. Faqat shu faylni alohida <script src="./add5.js"></script> qilib
   </body> dan oldin, boshqa skriptlardan KEYIN qo'shing (CSS ham shu fayl ichida).
   Soat doim yuradi: "harakatni kamaytirish" yoqilgan qurilmada ham. */
(function () {
  "use strict";
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const CX = 150, CY = 220;

  /* ---------- CSS ---------- */
  const css = `
  .hero .hero-text, .hero .hero-watch { opacity:1 !important; transform:none !important; visibility:visible !important; }
  .hero-watch .watch { display:none !important; }               /* eski sodda soat o'rniga */
  .cx5-wrap { position:relative; display:flex; justify-content:center; align-items:center; width:100%; z-index:2; }
  .cx5-glow { position:absolute; width:78%; aspect-ratio:1; border-radius:50%;
    background:radial-gradient(circle, rgba(201,168,106,.38), transparent 66%); filter:blur(18px);
    animation:cx5Glow 4.5s ease-in-out infinite !important; }
  .cx5-ring { position:absolute; width:96%; aspect-ratio:1; border-radius:50%; border:1px dashed rgba(201,168,106,.35);
    animation:cx5Spin 50s linear infinite !important; }
  .cx5-ring i { position:absolute; left:50%; top:-5px; width:10px; height:10px; margin-left:-5px; border-radius:50%;
    background:#e8d3a0; box-shadow:0 0 16px #c9a86a; }
  .cx5-stage { position:relative; width:min(340px,70vw); animation:cx5Float 6s ease-in-out infinite !important; }
  .cx5-tilt { transition:transform .15s ease-out; transform-style:preserve-3d; will-change:transform; }
  .cx5-tilt.cx5-back { transition:transform .7s cubic-bezier(.2,.8,.2,1); }
  .cx5-svg { display:block; width:100%; height:auto; filter:drop-shadow(0 30px 34px rgba(0,0,0,.65)); }
  .cx5-glare { position:absolute; inset:0; pointer-events:none; border-radius:50%;
    background:radial-gradient(circle at var(--gx,40%) var(--gy,25%), rgba(255,255,255,.2), transparent 45%); opacity:0; transition:opacity .3s; }
  .cx5-tilt:hover .cx5-glare { opacity:1; }
  .cx5-lume { animation:cx5Lume 3s ease-in-out infinite !important; }
  @keyframes cx5Float { 50% { transform:translateY(-14px); } }
  @keyframes cx5Glow  { 50% { opacity:.55; transform:scale(1.08); } }
  @keyframes cx5Spin  { to { transform:rotate(360deg); } }
  @keyframes cx5Lume  { 50% { opacity:.55; } }
  @media (max-width:900px) { .cx5-stage { width:min(260px,62vw); } }
  `;
  const st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- SVG ---------- */
  let marks = "";
  for (let i = 0; i < 60; i++) {
    const a = i * 6;
    marks += (i % 5 === 0)
      ? `<rect x="146.5" y="121" width="7" height="22" rx="1.6" fill="#e8d3a0" stroke="#fff3c8" stroke-width=".8" transform="rotate(${a} ${CX} ${CY})"/>`
      : `<rect x="149.4" y="114" width="1.2" height="5" fill="#9097a8" transform="rotate(${a} ${CX} ${CY})"/>`;
  }
  let burst = "";
  for (let i = 0; i < 90; i++) {
    burst += `<line x1="${CX}" y1="${CY}" x2="${CX}" y2="${CY - 108}" stroke="#fff" stroke-opacity=".045" transform="rotate(${i * 4} ${CX} ${CY})"/>`;
  }

  const svg = `
<svg class="cx5-svg" viewBox="0 0 300 440" role="img" aria-label="Chronex jonli soat">
<defs>
  <linearGradient id="cx5Case" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e6bb"/><stop offset=".5" stop-color="#9b7733"/><stop offset="1" stop-color="#e8cb88"/></linearGradient>
  <linearGradient id="cx5Case2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e6bb"/><stop offset=".5" stop-color="#9b7733"/><stop offset="1" stop-color="#e8cb88"/></linearGradient>
  <radialGradient id="cx5Dial" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#2a2d37"/><stop offset="1" stop-color="#050608"/></radialGradient>
  <linearGradient id="cx5Strap" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0a0b0e"/><stop offset=".5" stop-color="#2b2e38"/><stop offset="1" stop-color="#0a0b0e"/></linearGradient>
  <linearGradient id="cx5Shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".36"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <clipPath id="cx5Clip"><circle cx="${CX}" cy="${CY}" r="108"/></clipPath>
</defs>

<!-- tasma -->
<path d="M108 0 H192 L197 150 H103 Z" fill="url(#cx5Strap)"/>
<path d="M115 0 L117 150 M185 0 L183 150" stroke="#c9a86a" stroke-width="1.3" stroke-dasharray="5 4" fill="none" opacity=".8"/>
<path d="M103 290 H197 L192 440 H108 Z" fill="url(#cx5Strap)"/>
<path d="M117 290 L115 440 M183 290 L185 440" stroke="#c9a86a" stroke-width="1.3" stroke-dasharray="5 4" fill="none" opacity=".8"/>
<g fill="#000" fill-opacity=".55"><circle cx="150" cy="335" r="3.2"/><circle cx="150" cy="357" r="3.2"/><circle cx="150" cy="379" r="3.2"/><circle cx="150" cy="401" r="3.2"/></g>

<!-- lug va tojcha -->
<rect x="102" y="94" width="96" height="34" rx="7" fill="url(#cx5Case)"/>
<rect x="102" y="312" width="96" height="34" rx="7" fill="url(#cx5Case)"/>
<rect x="274" y="205" width="17" height="30" rx="4" fill="url(#cx5Case)"/>
<g stroke="rgba(0,0,0,.35)"><line x1="279" y1="208" x2="279" y2="232"/><line x1="283" y1="208" x2="283" y2="232"/><line x1="287" y1="208" x2="287" y2="232"/></g>

<!-- korpus -->
<circle cx="${CX}" cy="${CY}" r="128" fill="url(#cx5Case)"/>
<circle cx="${CX}" cy="${CY}" r="120" fill="url(#cx5Case2)"/>
<circle cx="${CX}" cy="${CY}" r="114" fill="#0b0b0f"/>

<!-- siferblat -->
<circle cx="${CX}" cy="${CY}" r="108" fill="url(#cx5Dial)"/>
<g clip-path="url(#cx5Clip)">${burst}</g>
${marks}
<text x="150" y="168" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" letter-spacing="4" fill="#e8d3a0">CHRONEX</text>
<text x="150" y="288" text-anchor="middle" font-family="Arial,sans-serif" font-size="6.5" letter-spacing="2.5" fill="#9097a8">AUTOMATIC · 50M</text>
<rect x="189" y="211" width="28" height="18" rx="2" fill="#f4f1e8" stroke="rgba(0,0,0,.4)"/>
<text id="cx5Date" x="203" y="224.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="#111">1</text>

<!-- strelkalar -->
<g id="cx5H">
  <path d="M150 232 L145 214 L148 152 L150 146 L152 152 L155 214 Z" fill="#e8d3a0" stroke="rgba(0,0,0,.4)" stroke-width=".6"/>
  <path class="cx5-lume" d="M150 210 L149 160 L150 156 L151 160 Z" fill="#fff3c8"/>
</g>
<g id="cx5M">
  <path d="M150 238 L146 214 L148.4 124 L150 118 L151.6 124 L154 214 Z" fill="#f2f3f7" stroke="rgba(0,0,0,.4)" stroke-width=".6"/>
  <path class="cx5-lume" d="M150 210 L149.3 130 L150 126 L150.7 130 Z" fill="#fff3c8"/>
</g>
<g id="cx5S">
  <line x1="${CX}" y1="254" x2="${CX}" y2="116" stroke="#ff5a3c" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="${CX}" cy="244" r="4.2" fill="#ff5a3c"/>
  <circle cx="${CX}" cy="${CY}" r="6" fill="#ff5a3c"/>
  <circle cx="${CX}" cy="${CY}" r="2.2" fill="#111"/>
</g>

<!-- shisha yaltirashi -->
<g clip-path="url(#cx5Clip)"><ellipse cx="108" cy="148" rx="100" ry="56" fill="url(#cx5Shine)" transform="rotate(-28 108 148)"/></g>
<circle cx="${CX}" cy="${CY}" r="108" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1.5"/>
</svg>`;

  /* ---------- Sahifaga joylash ---------- */
  const wrap = document.createElement("div");
  wrap.className = "cx5-wrap";
  wrap.innerHTML = `<div class="cx5-glow"></div><div class="cx5-ring"><i></i></div>
    <div class="cx5-stage"><div class="cx5-tilt">${svg}<div class="cx5-glare"></div></div></div>`;

  const slot = hero.querySelector(".hero-watch");
  if (slot) slot.appendChild(wrap);
  else { // zaxira: hero ichida o'ngda
    wrap.style.cssText = "position:absolute;right:6%;top:50%;transform:translateY(-50%);width:34%;";
    hero.appendChild(wrap);
  }

  /* ---------- Yurish ---------- */
  const $ = id => document.getElementById(id);
  const hH = $("cx5H"), hM = $("cx5M"), hS = $("cx5S"), dateEl = $("cx5Date");
  const rot = (el, a) => el.setAttribute("transform", `rotate(${a.toFixed(2)} ${CX} ${CY})`);
  let lastDay = -1;

  function frame() {
    const d = new Date();
    const s = d.getSeconds() + d.getMilliseconds() / 1000;
    const m = d.getMinutes() + s / 60;
    const h = (d.getHours() % 12) + m / 60;
    rot(hS, s * 6);          // silliq yuruvchi soniya strelkasi
    rot(hM, m * 6);
    rot(hH, h * 30);
    if (d.getDate() !== lastDay) { lastDay = d.getDate(); dateEl.textContent = lastDay; }
    requestAnimationFrame(frame);
  }
  frame();

  /* ---------- 3D qiyshayish (sichqoncha) ---------- */
  const tilt = wrap.querySelector(".cx5-tilt");
  hero.addEventListener("mousemove", e => {
    const r = tilt.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (innerWidth / 2)));
    const y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (innerHeight / 2)));
    tilt.classList.remove("cx5-back");
    tilt.style.transform = `perspective(900px) rotateY(${(x * 16).toFixed(1)}deg) rotateX(${(-y * 12).toFixed(1)}deg)`;
    tilt.style.setProperty("--gx", (50 + x * 30) + "%");
    tilt.style.setProperty("--gy", (30 + y * 25) + "%");
  });
  hero.addEventListener("mouseleave", () => {
    tilt.classList.add("cx5-back");
    tilt.style.transform = "";
  });
})();/* ===== CHRONEX hero-watch.js =====
   Mavjud kodga TEGMAYDI. Faqat index.html da </body> dan oldin bitta qator qo'shing:
       <script src="./hero-watch.js"></script>
   CSS ham shu fayl ichida. Soat bosh ekranning o'ng tomoniga qo'yiladi. */
(function () {
  var CSS = "\n/* hero ichidagi matn va soat har holda ko'rinsin */\n.hero .hero-text,.hero .reveal{opacity:1!important;transform:none!important;visibility:visible!important}\n.hero .hero-watch{visibility:hidden!important}\n.cx6.cx6-abs{position:absolute;right:4%;top:50%;transform:translateY(-50%);width:min(470px,42vw);z-index:5}\n\n.cx6{--c0:#f6e6bb;--c1:#9b7733;--c2:#e8cb88;--d0:#2a2d37;--d1:#050608;--s0:#0a0b0e;--s1:#2b2e38;--st:#c9a86a;\n  --mk:#e8d3a0;--lm:#fff3c8;--hd:#e8d3a0;--hm:#f2f3f7;--sc:#ff5a3c;--glow:201,168,106;\n  position:relative;width:100%;display:flex;flex-direction:column;align-items:center;gap:16px;z-index:2;color:#f2f3f7}\n.cx6-fx{position:relative;display:flex;justify-content:center;align-items:center;width:100%;min-height:440px}\n.cx6-glow{position:absolute;width:80%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgba(var(--glow),.4),transparent 66%);\n  filter:blur(18px);animation:cx6Glow 4.5s ease-in-out infinite!important}\n.cx6-ring{position:absolute;width:92%;aspect-ratio:1;border-radius:50%;border:1px dashed rgba(var(--glow),.4);animation:cx6Spin 50s linear infinite!important}\n.cx6-ring i{position:absolute;left:50%;top:-5px;width:10px;height:10px;margin-left:-5px;border-radius:50%;background:rgb(var(--glow));box-shadow:0 0 16px rgb(var(--glow))}\n.cx6-stage{position:relative;width:min(320px,66vw);animation:cx6Float 6s ease-in-out infinite!important}\n.cx6-tilt{position:relative;transition:transform .15s ease-out;will-change:transform}\n.cx6-tilt.back{transition:transform .7s cubic-bezier(.2,.8,.2,1)}\n.cx6-svg{display:block;width:100%;height:auto;filter:drop-shadow(0 30px 34px rgba(0,0,0,.65))}\n.cx6-glare{position:absolute;inset:18% 12% 18% 12%;pointer-events:none;border-radius:50%;\n  background:radial-gradient(circle at var(--gx,40%) var(--gy,25%),rgba(255,255,255,.22),transparent 48%);opacity:.7}\n\n/* SVG ranglari (o'zgaruvchilar orqali) */\n.cx6-mk{fill:var(--mk)} .cx6-lmk{stroke:var(--lm);stroke-width:.8}\n.cx6-lmf{fill:var(--lm)} .cx6-txt{fill:var(--mk)}\n.cx6-hh{fill:var(--hd)} .cx6-hm{fill:var(--hm)}\n.cx6-sc{fill:var(--sc);stroke:var(--sc)}\n.cx6-hand{filter:drop-shadow(1px 3px 2px rgba(0,0,0,.55))}\n.cx6-pulse{animation:cx6Lume 3s ease-in-out infinite!important}\n\n/* kartochkalar */\n.cx6-card{position:absolute;background:rgba(19,22,30,.8);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);\n  border:1px solid #2b3040;border-radius:14px;padding:9px 14px;font-size:12px;display:flex;align-items:center;gap:10px;\n  animation:cx6Bob 5s ease-in-out infinite!important;z-index:3}\n.cx6-card b{font-size:18px;font-variant-numeric:tabular-nums;display:block;line-height:1.1}\n.cx6-card small{color:#9097a8;font-size:11px;display:block}\n.cx6-heart{color:#ff5a3c;font-size:22px;animation:cx6Beat .85s infinite!important;display:inline-block}\n.cx6-c1{left:0;top:10%}\n.cx6-c2{right:0;top:44%;animation-delay:-1.6s!important}\n.cx6-c3{left:2%;bottom:6%;animation-delay:-3.2s!important}\n.cx6-batt{width:34px;height:16px;border:2px solid rgb(var(--glow));border-radius:4px;padding:1px;position:relative}\n.cx6-batt::after{content:\"\";position:absolute;right:-5px;top:3px;width:3px;height:6px;background:rgb(var(--glow));border-radius:0 2px 2px 0}\n.cx6-batt i{display:block;height:100%;width:87%;background:linear-gradient(90deg,#7ee8a8,rgb(var(--glow)));border-radius:2px}\n\n/* pastki boshqaruv */\n.cx6-time{font-size:26px;font-weight:700;letter-spacing:.12em;font-variant-numeric:tabular-nums;color:#e8d3a0}\n.cx6-time small{display:block;text-align:center;font-size:11px;letter-spacing:.25em;color:#9097a8;font-weight:400;text-transform:uppercase}\n.cx6-ctl{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}\n.cx6-ctl button{background:#13161e;border:1px solid #2b3040;color:#9097a8;border-radius:999px;padding:7px 14px;cursor:pointer;font:inherit;font-size:13px;transition:.2s}\n.cx6-ctl button:hover{border-color:#c9a86a;color:#f2f3f7}\n.cx6-ctl button.on{background:linear-gradient(135deg,#e8d3a0,#c9a86a);color:#111;border-color:transparent;font-weight:700}\n.cx6-sw{width:26px;height:26px;padding:0!important;border-radius:50%!important;outline:1px solid #2b3040;outline-offset:2px}\n.cx6-sw.on{outline:2px solid #c9a86a!important}\n.cx6-note{font-size:11px;color:#6d7385}\n\n@keyframes cx6Float{50%{transform:translateY(-14px)}}\n@keyframes cx6Bob{50%{transform:translateY(-8px)}}\n@keyframes cx6Glow{50%{opacity:.55;transform:scale(1.08)}}\n@keyframes cx6Spin{to{transform:rotate(360deg)}}\n@keyframes cx6Lume{50%{opacity:.5}}\n@keyframes cx6Beat{0%,100%{transform:scale(1)}15%{transform:scale(1.3)}30%{transform:scale(1)}45%{transform:scale(1.2)}}\n@media(max-width:900px){.hero{flex-wrap:wrap;justify-content:center}.cx6.cx6-abs{position:relative;right:auto;top:auto;transform:none;width:min(420px,92%);margin:10px auto 70px}.cx6-fx{min-height:380px}}\n@media(max-width:560px){.cx6-c1,.cx6-c3{display:none}.cx6-c2{right:-4px;top:auto;bottom:8%}}\n";
  function start() {
    if (document.getElementById("cx6")) return;
    var st = document.createElement("style"); st.id = "cx6-style"; st.textContent = CSS; document.head.appendChild(st);
    run();
  }
  function run() {

(function () {
  "use strict";
  if (document.getElementById("cx6")) return;

  var CX = 150, CY = 220;

  /* ---------- Ranglar ---------- */
  var THEMES = {
    "Oltin":  { c0:"#f6e6bb", c1:"#9b7733", c2:"#e8cb88", d0:"#2a2d37", d1:"#050608", s0:"#0a0b0e", s1:"#2b2e38", st:"#c9a86a", mk:"#e8d3a0", lm:"#fff3c8", hd:"#e8d3a0", hm:"#f2f3f7", sc:"#ff5a3c", glow:"201,168,106", sw:"#c9a86a" },
    "Po'lat": { c0:"#f4f6fa", c1:"#7d8494", c2:"#dfe3ec", d0:"#33363f", d1:"#0a0b0f", s0:"#15171d", s1:"#3d414d", st:"#9aa0b0", mk:"#dfe3ec", lm:"#dfe8ff", hd:"#e9ecf5", hm:"#f2f3f7", sc:"#2b9fff", glow:"140,160,200", sw:"#aeb4c4" },
    "Qora":   { c0:"#5a5f6e", c1:"#14161c", c2:"#3a3e4b", d0:"#1f2128", d1:"#030406", s0:"#0a0b0e", s1:"#2b2e38", st:"#8a8f9e", mk:"#e9ecf5", lm:"#dfe8ff", hd:"#f2f3f7", hm:"#f2f3f7", sc:"#ff5a3c", glow:"120,120,150", sw:"#23252d" },
    "Moviy":  { c0:"#f4f6fa", c1:"#7d8494", c2:"#dfe3ec", d0:"#2f6fd6", d1:"#0c2a63", s0:"#0b1c3d", s1:"#2a4a8a", st:"#9fc0ff", mk:"#ffffff", lm:"#ffffff", hd:"#ffffff", hm:"#ffffff", sc:"#ffb020", glow:"60,120,220", sw:"#2f6fd6" },
    "Rose":   { c0:"#fbe2d8", c1:"#b07767", c2:"#f0c9bb", d0:"#fffaf3", d1:"#e6d6c3", s0:"#3a2018", s1:"#8a5340", st:"#e9c9a8", mk:"#5e362c", lm:"#ffffff", hd:"#5e362c", hm:"#5e362c", sc:"#b5473a", glow:"215,154,154", sw:"#e6bfb0" }
  };
  var ZONES = [["Mahalliy", undefined], ["Toshkent", "Asia/Tashkent"], ["London", "Europe/London"], ["Nyu-York", "America/New_York"], ["Tokio", "Asia/Tokyo"]];

  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- SVG ---------- */
  var marks = "", i;
  for (i = 0; i < 60; i++) {
    marks += (i % 5 === 0)
      ? '<rect class="cx6-mk cx6-lmk" x="146.5" y="121" width="7" height="22" rx="1.6" transform="rotate(' + (i * 6) + ' 150 220)"/>'
      : '<rect class="cx6-mk" x="149.4" y="114" width="1.2" height="5" opacity=".7" transform="rotate(' + (i * 6) + ' 150 220)"/>';
  }
  var burst = "";
  for (i = 0; i < 90; i++) burst += '<line x1="150" y1="220" x2="150" y2="112" stroke="#fff" stroke-opacity=".05" transform="rotate(' + (i * 4) + ' 150 220)"/>';
  var notch = "";
  for (i = 0; i < 120; i++) notch += '<rect x="149.2" y="93" width="1.6" height="5" fill="rgba(0,0,0,.4)" transform="rotate(' + (i * 3) + ' 150 220)"/>';

  var svg =
'<svg class="cx6-svg" viewBox="0 0 300 440" role="img" aria-label="Chronex jonli soat">' +
'<defs>' +
'<linearGradient id="cx6Case" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--c0)"/><stop offset=".5" style="stop-color:var(--c1)"/><stop offset="1" style="stop-color:var(--c2)"/></linearGradient>' +
'<linearGradient id="cx6Case2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--c0)"/><stop offset=".5" style="stop-color:var(--c1)"/><stop offset="1" style="stop-color:var(--c2)"/></linearGradient>' +
'<radialGradient id="cx6Dial" cx=".35" cy=".3" r=".9"><stop offset="0" style="stop-color:var(--d0)"/><stop offset="1" style="stop-color:var(--d1)"/></radialGradient>' +
'<linearGradient id="cx6Strap" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(--s0)"/><stop offset=".5" style="stop-color:var(--s1)"/><stop offset="1" style="stop-color:var(--s0)"/></linearGradient>' +
'<linearGradient id="cx6Shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
'<clipPath id="cx6Clip"><circle cx="150" cy="220" r="108"/></clipPath>' +
'</defs>' +
/* tasma */
'<path d="M108 0 H192 L197 150 H103 Z" fill="url(#cx6Strap)"/>' +
'<path d="M115 0 L117 150 M185 0 L183 150" style="stroke:var(--st)" stroke-width="1.3" stroke-dasharray="5 4" fill="none" opacity=".85"/>' +
'<path d="M103 290 H197 L192 440 H108 Z" fill="url(#cx6Strap)"/>' +
'<path d="M117 290 L115 440 M183 290 L185 440" style="stroke:var(--st)" stroke-width="1.3" stroke-dasharray="5 4" fill="none" opacity=".85"/>' +
'<g fill="#000" fill-opacity=".55"><circle cx="150" cy="335" r="3.2"/><circle cx="150" cy="357" r="3.2"/><circle cx="150" cy="379" r="3.2"/><circle cx="150" cy="401" r="3.2"/></g>' +
/* lug va tojcha */
'<rect x="102" y="94" width="96" height="34" rx="7" fill="url(#cx6Case)"/>' +
'<rect x="102" y="312" width="96" height="34" rx="7" fill="url(#cx6Case)"/>' +
'<rect x="274" y="205" width="17" height="30" rx="4" fill="url(#cx6Case)"/>' +
'<g stroke="rgba(0,0,0,.4)"><line x1="279" y1="208" x2="279" y2="232"/><line x1="283" y1="208" x2="283" y2="232"/><line x1="287" y1="208" x2="287" y2="232"/></g>' +
/* korpus + bezel */
'<circle cx="150" cy="220" r="128" fill="url(#cx6Case)"/>' + notch +
'<circle cx="150" cy="220" r="120" fill="url(#cx6Case2)"/>' +
'<circle cx="150" cy="220" r="114" fill="#0b0b0f"/>' +
/* siferblat */
'<circle cx="150" cy="220" r="108" fill="url(#cx6Dial)"/>' +
'<g clip-path="url(#cx6Clip)">' + burst + '</g>' +
'<circle cx="150" cy="220" r="104" fill="none" stroke="#fff" stroke-opacity=".12"/>' +
marks +
'<text class="cx6-txt" x="150" y="168" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" letter-spacing="4">CHRONEX</text>' +
'<text class="cx6-txt" x="150" y="288" text-anchor="middle" font-family="Arial,sans-serif" font-size="6.5" letter-spacing="2.5" opacity=".75">AUTOMATIC · 50M</text>' +
'<rect x="189" y="211" width="28" height="18" rx="2" fill="#f4f1e8" stroke="rgba(0,0,0,.4)"/>' +
'<text id="cx6Date" x="203" y="224.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="#111">1</text>' +
/* strelkalar */
'<g id="cx6H" class="cx6-hand"><path class="cx6-hh" d="M150 232 L145 214 L148 152 L150 146 L152 152 L155 214 Z"/><path class="cx6-lmf cx6-pulse" d="M150 210 L149 160 L150 156 L151 160 Z"/></g>' +
'<g id="cx6M" class="cx6-hand"><path class="cx6-hm" d="M150 238 L146 214 L148.4 124 L150 118 L151.6 124 L154 214 Z"/><path class="cx6-lmf cx6-pulse" d="M150 210 L149.3 130 L150 126 L150.7 130 Z"/></g>' +
'<g id="cx6S" class="cx6-hand"><line class="cx6-sc" x1="150" y1="254" x2="150" y2="116" stroke-width="1.5" stroke-linecap="round"/><circle class="cx6-sc" cx="150" cy="244" r="4.2"/><circle class="cx6-sc" cx="150" cy="220" r="6"/><circle cx="150" cy="220" r="2.2" fill="#111"/></g>' +
/* shisha */
'<g clip-path="url(#cx6Clip)"><ellipse cx="108" cy="148" rx="100" ry="56" fill="url(#cx6Shine)" transform="rotate(-28 108 148)"/></g>' +
'<circle cx="150" cy="220" r="108" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="1.5"/>' +
'</svg>';

  /* ---------- HTML ---------- */
  var root = document.createElement("div");
  root.id = "cx6"; root.className = "cx6";
  root.innerHTML =
    '<div class="cx6-fx">' +
      '<div class="cx6-glow"></div><div class="cx6-ring"><i></i></div>' +
      '<div class="cx6-stage"><div class="cx6-tilt">' + svg + '<div class="cx6-glare"></div></div></div>' +
      '<div class="cx6-card cx6-c1"><span class="cx6-heart">♥</span><div><b id="cx6Bpm">72</b><small>urish / daq</small></div></div>' +
      '<div class="cx6-card cx6-c2"><div class="cx6-batt"><i></i></div><div><b>87%</b><small>batareya</small></div></div>' +
      '<div class="cx6-card cx6-c3"><span style="font-size:20px">👟</span><div><b id="cx6Steps">6 240</b><small>qadam</small></div></div>' +
    '</div>' +
    '<div class="cx6-time"><span id="cx6Dig">--:--:--</span><small id="cx6City">Mahalliy</small></div>' +
    '<div class="cx6-ctl" id="cx6Zones"></div>' +
    '<div class="cx6-ctl"><span id="cx6Sw" class="cx6-ctl"></span>' +
      '<button type="button" id="cx6Mode">Silliq</button><button type="button" id="cx6Snd">🔇 Tik-tak</button></div>' +
    '<div class="cx6-note">Urish va qadam ko\'rsatkichlari namuna sifatida.</div>';

  var hero = document.querySelector(".hero");
  if (hero) { root.classList.add("cx6-abs"); hero.appendChild(root); }
  else { root.style.cssText = "margin:40px auto;max-width:480px;"; document.body.appendChild(root); }

  /* ---------- Rang tanlash ---------- */
  var swBox = root.querySelector("#cx6Sw");
  function applyTheme(name) {
    var t = THEMES[name]; if (!t) return;
    ["c0","c1","c2","d0","d1","s0","s1","st","mk","lm","hd","hm","sc","glow"].forEach(function (k) { root.style.setProperty("--" + k, t[k]); });
    [].forEach.call(swBox.children, function (b) { b.classList.toggle("on", b.title === name); });
    store.set("cx6_theme", name);
  }
  Object.keys(THEMES).forEach(function (n) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "cx6-sw"; b.title = n; b.setAttribute("aria-label", n + " rang");
    b.style.background = THEMES[n].sw;
    b.onclick = function () { applyTheme(n); };
    swBox.appendChild(b);
  });
  swBox.style.cssText = "display:flex;gap:10px;align-items:center";
  applyTheme(store.get("cx6_theme", "Oltin"));

  /* ---------- Shaharlar ---------- */
  var zone = 0;
  var fmts = ZONES.map(function (z) {
    return new Intl.DateTimeFormat("en-GB", { timeZone: z[1], hour: "numeric", minute: "numeric", second: "numeric", day: "numeric", hourCycle: "h23" });
  });
  var zBox = root.querySelector("#cx6Zones");
  ZONES.forEach(function (z, k) {
    var b = document.createElement("button");
    b.type = "button"; b.textContent = z[0]; if (k === 0) b.className = "on";
    b.onclick = function () {
      zone = k; cache = -1;
      [].forEach.call(zBox.children, function (x) { x.classList.toggle("on", x === b); });
      root.querySelector("#cx6City").textContent = z[0];
    };
    zBox.appendChild(b);
  });

  /* ---------- Rejim + ovoz ---------- */
  var sweep = true, sound = false, actx = null;
  var modeBtn = root.querySelector("#cx6Mode"), sndBtn = root.querySelector("#cx6Snd");
  modeBtn.onclick = function () { sweep = !sweep; modeBtn.textContent = sweep ? "Silliq" : "Tik-tak"; };
  sndBtn.onclick = function () {
    sound = !sound;
    sndBtn.textContent = (sound ? "🔊" : "🔇") + " Tik-tak";
    sndBtn.classList.toggle("on", sound);
    if (sound && !actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; } }
    if (actx && actx.state === "suspended") actx.resume();
  };
  function click() {
    if (!sound || !actx) return;
    var o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
    o.type = "square"; o.frequency.value = 1900;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.04);
  }

  /* ---------- Yurish ---------- */
  function $(id) { return root.querySelector("#" + id); }
  var hH = $("cx6H"), hM = $("cx6M"), hS = $("cx6S"), dateEl = $("cx6Date"), dig = $("cx6Dig");
  function rot(el, a) { el.setAttribute("transform", "rotate(" + a.toFixed(2) + " 150 220)"); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  var cache = -1, P = { h: 0, m: 0, s: 0, d: 1 };
  function readParts(now) {
    var o = {};
    fmts[zone].formatToParts(now).forEach(function (p) { if (p.type !== "literal") o[p.type] = +p.value; });
    P = { h: o.hour % 24, m: o.minute, s: o.second, d: o.day };
  }

  function frame() {
    var now = new Date(), sec = Math.floor(now.getTime() / 1000);
    if (sec !== cache) {
      cache = sec; readParts(now);
      dig.textContent = pad(P.h) + ":" + pad(P.m) + ":" + pad(P.s);
      dateEl.textContent = P.d;
      click();
    }
    var ms = now.getMilliseconds() / 1000;
    var s = sweep ? P.s + ms : P.s;
    var m = P.m + (P.s + ms) / 60;
    var h = (P.h % 12) + m / 60;
    rot(hS, s * 6); rot(hM, m * 6); rot(hH, h * 30);
    requestAnimationFrame(frame);
  }
  frame();

  /* ---------- Namuna ko'rsatkichlar ---------- */
  var bpm = $("cx6Bpm"), steps = $("cx6Steps"), st = 6240;
  setInterval(function () { bpm.textContent = 68 + Math.round(Math.random() * 9); }, 1800);
  setInterval(function () { st += 1 + Math.round(Math.random() * 3); steps.textContent = st.toLocaleString("ru-RU"); }, 2500);

  /* ---------- 3D qiyshayish ---------- */
  var tilt = root.querySelector(".cx6-tilt");
  addEventListener("mousemove", function (e) {
    var r = tilt.getBoundingClientRect();
    var x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (innerWidth / 2)));
    var y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (innerHeight / 2)));
    tilt.classList.remove("back");
    tilt.style.transform = "perspective(900px) rotateY(" + (x * 16).toFixed(1) + "deg) rotateX(" + (-y * 12).toFixed(1) + "deg)";
    tilt.style.setProperty("--gx", (50 + x * 30) + "%");
    tilt.style.setProperty("--gy", (30 + y * 25) + "%");
  }, { passive: true });
  document.addEventListener("mouseleave", function () { tilt.classList.add("back"); tilt.style.transform = ""; });

  /* ---------- Zaxira: .reveal va .lw-card ko'rinmay qolmasin ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in", "lw-in"); io.unobserve(e.target);
      });
    }, { threshold: 0.1 });
    [].forEach.call(document.querySelectorAll(".reveal, .lw-card"), function (el) { io.observe(el); });
  } else {
    [].forEach.call(document.querySelectorAll(".reveal, .lw-card"), function (el) { el.classList.add("in", "lw-in"); });
  }
})();

  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();