/* ===== CHRONEX chronex-order.js — buyurtmani to'g'ridan-to'g'ri yuborish =====
   Hozir mijoz buyurtmadan keyin Telegram ochib, "Send" bosishi kerak. Ko'p mijoz shu yerda to'xtab qoladi.
   Bu fayl buyurtma oynasiga "✅ Buyurtmani hozir yuborish" tugmasini qo'shadi: bosilsa, buyurtma serverga ketadi
   va DARROV SIZNING TELEGRAMINGIZGA tushadi (mijozda Telegram bo'lishi shart emas).
   Telegram orqali yuborish tugmasi o'z joyida qoladi (zaxira).

   ISHLASHI UCHUN: ai-proxy-worker.js ni Cloudflare'ga joylashtirib (fayl boshidagi 1-bosqichlar, "BUYURTMANI
   TO'G'RIDAN-TO'G'RI TELEGRAMINGIZGA QABUL QILISH" bo'limi), uning manzilini yozing:
       <script>window.CHRONEX_API = "https://sizning-worker.workers.dev";</script>      (chronex-all.js dan OLDIN)
   yoki quyidagi API_BASE ga. Manzil bo'sh bo'lsa, bu fayl hech narsa qilmaydi (Telegram havolasi avvalgidek ishlaydi).

   Mavjud kodga TEGMAYDI. Alohida ulash:  <script src="./chronex-order.js"></script> */
(function () {
  "use strict";
  if (window.__cx21) return;
  window.__cx21 = 1;

  const API_BASE = "";   // masalan "https://chronex-ai.sizning-nom.workers.dev"
  const base = () => String(window.CHRONEX_API || API_BASE || "").replace(/\/+$/, "");
  if (!base()) return;

  const $ = (s, r) => (r || document).querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function toast(m) {
    let box = $(".cx-toasts");
    if (!box) { box = document.createElement("div"); box.className = "cx-toasts"; document.body.appendChild(box); }
    const t = document.createElement("div"); t.className = "cx-toast"; t.textContent = m; box.appendChild(t);
    setTimeout(() => t.classList.add("out"), 2800); setTimeout(() => t.remove(), 3300);
  }

  const form = $("#orderForm"), done = $("#done"), tgBtn = $("#tgBtn");
  if (!form || !done || !tgBtn) return;

  const st = document.createElement("style");
  st.textContent = `
  .cx21-box{display:grid;gap:10px;margin-top:6px}
  .cx21-box .btn{margin-top:0}
  .cx21-note{font-size:12px;color:var(--muted,#9097a8)}
  .cx21-or{font-size:13px;color:var(--muted,#9097a8);text-align:center;margin:6px 0 -6px}
  .cx21-err{font-size:13px;color:#ff8a92;min-height:16px}
  .cx21-ok{border:1px solid var(--accent,#c9a86a);border-radius:14px;padding:18px;background:rgba(201,168,106,.08);display:grid;gap:6px;text-align:center}
  .cx21-ok b{font-size:20px;color:var(--accent2,#e8d3a0)}
  .cx21-hp{position:absolute!important;left:-9999px!important;width:1px;height:1px;opacity:0}`;
  document.head.appendChild(st);

  const box = document.createElement("div");
  box.className = "cx21-box";
  const initial = `<button class="btn btn-block" type="button" id="cx21Send">✅ Buyurtmani hozir yuborish</button>
    <div class="cx21-err" id="cx21Err" role="alert"></div>
    <small class="cx21-note">«Yuborish» bosilganda ismingiz, telefon raqamingiz va manzilingiz buyurtmani rasmiylashtirish uchun do'kon egasiga yuboriladi.</small>
    <input class="cx21-hp" id="cx21Hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <div class="cx21-or">yoki Telegram orqali:</div>`;
  box.innerHTML = initial;
  tgBtn.before(box);
  const para = $("p", done);

  const val = id => { const e = $("#" + id); return e ? e.value : ""; };
  const ERR = {
    invalid_name: "Ismingizni to'liq yozing va ma'lumotni tahrirlab qayta urinib ko'ring.",
    invalid_phone: "Telefon raqami noto'g'ri. «Ma'lumotni o'zgartirish» orqali tuzating.",
    invalid_address: "Manzil juda qisqa. «Ma'lumotni o'zgartirish» orqali tuzating.",
    rate_limited: "Juda ko'p urinish bo'ldi. Birozdan keyin urinib ko'ring yoki Telegram orqali yuboring.",
    orders_not_configured: "Buyurtma qabul qilish hozircha sozlanmagan. Telegram orqali yuboring.",
    forbidden_origin: "Bu sayt uchun buyurtma qabul qilish yoqilmagan. Telegram orqali yuboring."
  };

  function bind() {
    const send = $("#cx21Send", box), err = $("#cx21Err", box);
    send.onclick = async () => {
      err.textContent = "";
      const m = /CX\d{6}/.exec(tgBtn.href || "");
      const payload = {
        num: m ? m[0] : undefined, model: val("model"), finish: val("finish"), qty: +val("qty"), total: ($("#total") || {}).textContent || "",
        name: val("name").trim(), phone: val("phone"), address: val("address").trim(), note: val("note").trim(),
        lang: document.documentElement.lang || "uz", website: ($("#cx21Hp", box) || {}).value || ""
      };
      send.disabled = true; send.textContent = "Yuborilmoqda...";
      const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 15000);
      try {
        const res = await fetch(base() + "/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: ctl.signal });
        let data = null; try { data = await res.json(); } catch (e) {}
        if (res.ok && data && data.ok) {
          const num = esc(data.num || payload.num || "");
          box.innerHTML = `<div class="cx21-ok"><div style="font-size:34px">✅</div><b>Buyurtmangiz qabul qilindi!</b><div>Buyurtma raqami: <b>#${num}</b></div><div class="cx21-note">Operator tez orada siz bilan bog'lanadi va buyurtmani tasdiqlaydi.</div></div>`;
          tgBtn.style.display = "none"; if (para) para.style.display = "none";
          try { const k = "cx9_orders", list = JSON.parse(localStorage.getItem(k) || "[]"); list.forEach(o => { if (o.num === (data.num || payload.num)) o.sent = true; }); localStorage.setItem(k, JSON.stringify(list)); } catch (e) {}
          window.dispatchEvent(new CustomEvent("chronex:order-sent", { detail: { num: data.num || payload.num } }));
          toast("Buyurtma yuborildi ✓");
          return;
        }
        err.textContent = (data && ERR[data.error]) || "Yuborib bo'lmadi. Quyidagi Telegram tugmasi orqali yuboring.";
      } catch (e) {
        err.textContent = "Aloqa xatosi. Quyidagi Telegram tugmasi orqali yuboring.";
      } finally { clearTimeout(to); }
      const s2 = $("#cx21Send", box); if (s2) { s2.disabled = false; s2.textContent = "✅ Buyurtmani hozir yuborish"; }
    };
  }
  bind();
  // mijoz "Ma'lumotni o'zgartirish" bosib qayta yuborsa, hammasi boshlang'ich holatga qaytadi
  form.addEventListener("submit", () => {
    if (!$("#cx21Send", box)) { box.innerHTML = initial; bind(); }
    tgBtn.style.display = ""; if (para) para.style.display = "";
  });
})();