/* ===== CHRONEX chronex-dock.js =====
   Telefonda (ekran kengligi 760 px gacha) pastda doimiy tugmalar paneli:
   Telegram · (ixtiyoriy) Qo'ng'iroq · (ixtiyoriy) WhatsApp · Buyurtma.
   Buyurtma bo'limi ko'ringanda va klaviatura ochilganda panel o'zi yashirinadi.
   Mavjud kodga TEGMAYDI. Alohida ulash:  <script src="./chronex-dock.js"></script>

   SOZLAMALAR: telefon raqamlarini pastda yozing. Bo'sh qoldirilsa, tegishli tugma chiqmaydi. */
(function () {
  "use strict";
  if (window.__cx18) return;
  window.__cx18 = 1;

  const CFG = {
    phone: "",      // masalan: "+998901234567"  (qo'ng'iroq tugmasi uchun)
    whatsapp: ""    // masalan: "998901234567"   (raqam faqat raqamlarda, + belgisiz)
  };

  const $ = (s, r) => (r || document).querySelector(s);
  const TG = () => (typeof TG_USER !== "undefined" && TG_USER) ? TG_USER : "your_username";
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const st = document.createElement("style");
  st.textContent = `
  .cx18{display:none}
  @media(max-width:760px){
    .cx18{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:44;gap:8px;padding:8px 10px calc(8px + env(safe-area-inset-bottom,0px));
      background:rgba(14,16,22,.94);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-top:1px solid var(--line,#222633);transition:transform .3s}
    .cx18.hide{transform:translateY(110%)}
    .cx18 a,.cx18 button{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;height:44px;border-radius:12px;border:1px solid var(--line,#222633);background:var(--card,#13161e);color:var(--text,#f2f3f7);font:inherit;font-size:14px;text-decoration:none;cursor:pointer}
    .cx18 .go{background:linear-gradient(135deg,var(--accent2,#e8d3a0),var(--accent,#c9a86a));color:#111;border-color:transparent;font-weight:700;flex:1.4}
    body.cx18-pad{padding-bottom:calc(62px + env(safe-area-inset-bottom,0px))}
    .to-top{bottom:74px!important}.cx-dock,.cx2-dock{bottom:70px!important}.cx7-bot{bottom:134px!important}.cx7-chat{bottom:196px!important}.cx4-gear{bottom:190px!important}.cx4-panel{bottom:242px!important}
    .cx-toasts{bottom:78px!important}
  }`;
  document.head.appendChild(st);

  const dock = document.createElement("div");
  dock.className = "cx18"; dock.setAttribute("role", "navigation"); dock.setAttribute("aria-label", "Tezkor tugmalar");
  const items = [`<a href="https://t.me/${esc(TG())}?text=${encodeURIComponent("Salom! Chronex haqida so'ramoqchiman.")}" target="_blank" rel="noopener" aria-label="Telegramda yozish">✈ Telegram</a>`];
  if (CFG.phone) items.push(`<a href="tel:${esc(CFG.phone.replace(/[^\d+]/g, ""))}" aria-label="Qo'ng'iroq qilish">📞 Qo'ng'iroq</a>`);
  if (CFG.whatsapp) items.push(`<a href="https://wa.me/${esc(CFG.whatsapp.replace(/\D/g, ""))}" target="_blank" rel="noopener" aria-label="WhatsApp">💬 WhatsApp</a>`);
  items.push(`<button type="button" class="go" data-go aria-label="Buyurtma berish">🛒 Buyurtma</button>`);
  dock.innerHTML = items.join("");
  document.body.appendChild(dock); document.body.classList.add("cx18-pad");
  $("[data-go]", dock).onclick = () => { const o = $("#order"); if (o) o.scrollIntoView({ behavior: "smooth" }); };

  // buyurtma bo'limi ko'ringanda yashirish
  const order = $("#order"); let inOrder = false, typing = false;
  const sync = () => dock.classList.toggle("hide", inOrder || typing);
  if (order) new IntersectionObserver(es => { inOrder = es[0].isIntersecting; sync(); }, { threshold: .15 }).observe(order);
  // klaviatura ochilganda yashirish
  document.addEventListener("focusin", e => { typing = /^(input|textarea|select)$/i.test(e.target.tagName); sync(); });
  document.addEventListener("focusout", () => { typing = false; setTimeout(sync, 50); });
  if (window.visualViewport) visualViewport.addEventListener("resize", () => { typing = visualViewport.height < innerHeight * .75; sync(); });
})();