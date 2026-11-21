/* ===== CHRONEX chronex-intro.js =====
   Saytga kirganda ~3 soniyalik kinematik kirish: soat halqasi chiziladi, strelkalar hozirgi vaqtga o'tadi,
   CHRONEX yozuvi paydo bo'ladi va ekran ikkiga ochilib sayt ko'rinadi.
   Har sessiyada FAQAT BIR MARTA ko'rsatiladi. Bosish yoki istalgan tugma bilan o'tkazib yuborish mumkin.
   "Harakatni kamaytirish" yoqilgan qurilmalarda va ?nointro=1 bilan ko'rsatilmaydi.
   Mavjud kodga TEGMAYDI. Alohida ulash:  <script src="./chronex-intro.js"></script> */
(function () {
  "use strict";
  if (window.__cx17) return;
  window.__cx17 = 1;
  try {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (/[?&]nointro=1/.test(location.search)) return;
    if (sessionStorage.getItem("cx17_seen")) return;
    sessionStorage.setItem("cx17_seen", "1");
  } catch (e) {}

  const css = `
  .cx17{position:fixed;inset:0;z-index:2000;overflow:hidden;font-family:Inter,system-ui,sans-serif}
  .cx17-h{position:absolute;left:0;right:0;height:50.2%;background:#07080b;transition:transform .85s cubic-bezier(.76,0,.24,1)}
  .cx17-h.t{top:0}.cx17-h.b{bottom:0}
  .cx17.go .cx17-h.t{transform:translateY(-100%)}.cx17.go .cx17-h.b{transform:translateY(100%)}
  .cx17-c{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:26px;transition:opacity .35s,transform .6s}
  .cx17.go .cx17-c{opacity:0;transform:scale(1.15)}
  .cx17 svg{width:min(46vmin,260px);height:auto;overflow:visible}
  .cx17-ring{fill:none;stroke:#c9a86a;stroke-width:3;stroke-linecap:round;stroke-dasharray:640;stroke-dashoffset:640;animation:cx17Draw 1.3s cubic-bezier(.4,0,.2,1) .1s forwards;filter:drop-shadow(0 0 8px rgba(201,168,106,.6))}
  .cx17-tk{opacity:0;animation:cx17Fade .3s ease forwards}
  .cx17-hand{transform-origin:100px 100px;transition:transform 1.6s cubic-bezier(.3,.9,.3,1)}
  .cx17-logo{color:#e8d3a0;font-weight:800;font-size:clamp(20px,5vw,34px);letter-spacing:.2em;opacity:0;animation:cx17Logo 1s cubic-bezier(.2,.8,.2,1) 1.3s forwards;text-shadow:0 0 18px rgba(201,168,106,.45)}
  .cx17-sub{color:#9097a8;font-size:12px;letter-spacing:.35em;text-transform:uppercase;opacity:0;animation:cx17Fade .8s ease 1.9s forwards;margin-top:-14px}
  .cx17-skip{position:absolute;right:18px;bottom:16px;background:none;border:1px solid rgba(255,255,255,.18);color:#9097a8;border-radius:999px;padding:6px 14px;font:inherit;font-size:12px;cursor:pointer;z-index:2}
  @keyframes cx17Draw{to{stroke-dashoffset:0}}
  @keyframes cx17Fade{to{opacity:1}}
  @keyframes cx17Logo{from{opacity:0;letter-spacing:.7em}to{opacity:1;letter-spacing:.2em}}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  let ticks = "";
  for (let i = 0; i < 12; i++) ticks += `<rect class="cx17-tk" style="animation-delay:${(0.2 + i * 0.07).toFixed(2)}s" x="${i % 3 ? 99 : 98}" y="${i % 3 ? 12 : 10}" width="${i % 3 ? 2 : 4}" height="${i % 3 ? 8 : 14}" rx="1" fill="#e8d3a0" transform="rotate(${i * 30} 100 100)"/>`;
  const el = document.createElement("div");
  el.className = "cx17"; el.setAttribute("role", "presentation");
  el.innerHTML = `<div class="cx17-h t"></div><div class="cx17-h b"></div>
    <div class="cx17-c"><svg viewBox="0 0 200 200" aria-hidden="true"><circle class="cx17-ring" cx="100" cy="100" r="94"/>${ticks}
      <g class="cx17-hand" id="cx17H"><line x1="100" y1="106" x2="100" y2="58" stroke="#e8d3a0" stroke-width="5" stroke-linecap="round"/></g>
      <g class="cx17-hand" id="cx17M"><line x1="100" y1="108" x2="100" y2="34" stroke="#f2f3f7" stroke-width="3.5" stroke-linecap="round"/></g>
      <g class="cx17-hand" id="cx17S"><line x1="100" y1="116" x2="100" y2="26" stroke="#ff5a3c" stroke-width="1.8" stroke-linecap="round"/></g>
      <circle cx="100" cy="100" r="5" fill="#ff5a3c"/></svg>
      <div class="cx17-logo">CHRONEX</div></div><div class="cx17-sub" style="position:absolute;left:0;right:0;bottom:36%;text-align:center">Time. Redefined.</div>
    <button class="cx17-skip" type="button" aria-label="Kirishni o'tkazib yuborish">O'tkazib yuborish</button>`;
  document.body.appendChild(el);
  const prevOverflow = document.body.style.overflow; document.body.style.overflow = "hidden";

  // strelkalarni hozirgi vaqtga burish
  const d = new Date(), s = d.getSeconds(), m = d.getMinutes() + s / 60, h = (d.getHours() % 12) + m / 60;
  const rot = (id, deg) => { const g = el.querySelector("#" + id); g.style.transform = "rotate(0deg)"; setTimeout(() => { g.style.transform = `rotate(${deg + 360}deg)`; }, 60); };
  rot("cx17H", h * 30); rot("cx17M", m * 6); rot("cx17S", s * 6 + 360);

  let closed = false;
  function open() {
    if (closed) return; closed = true;
    el.classList.add("go"); document.body.style.overflow = prevOverflow;
    removeEventListener("keydown", skip, true);
    setTimeout(() => { el.remove(); st.remove(); }, 1000);
  }
  const skip = () => open();
  el.addEventListener("click", skip); addEventListener("keydown", skip, true);
  setTimeout(open, 2600);
})();