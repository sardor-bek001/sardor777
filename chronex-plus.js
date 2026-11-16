/* ===== CHRONEX chronex-plus.js =====
   Mavjud kodga TEGMAYDI. Faqat index.html da </body> dan oldin, ENG OXIRGI skript sifatida bitta qator qo'shing:
       <script src="./chronex-plus.js"></script>
   CSS ham shu fayl ichida.

   NIMALAR QO'SHILADI
   1) Til almashtirgich UZ / RU / EN (menyuda)
   2) Sovg'a rejimi (buyurtma formasida)
   3) Buyurtma tayyor bo'lganda konfetti
   4) Kartalarda kursor yorug'ligi va asosiy tugmalarda "magnit" effekti
   5) Klaviatura uchun "Asosiy qismga o'tish" havolasi va aniq fokus chizig'i

   TARJIMA QO'SHISH: pastdagi TR ro'yxatiga yangi qator qo'shing:
       ["O'zbekcha matn (aynan shunday)", "Ruscha", "Inglizcha"]  */
(function () {
  "use strict";
  if (window.__cx8) return;
  window.__cx8 = 1;

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hoverOK = matchMedia("(hover: hover)").matches;

  /* ================= TARJIMALAR ================= */
  const TR = [
    // menyu va hero
    ["Kolleksiya", "Коллекция", "Collection"],
    ["Texnologiya", "Технологии", "Technology"],
    ["Hikoyamiz", "Наша история", "Our story"],
    ["Buyurtma", "Заказать", "Order"],
    ["Jonli soatlar", "Живые часы", "Live watches"],
    ["Yangi avlod smart-soat", "Смарт-часы нового поколения", "Next-generation smartwatch"],
    ["Har soniya uchun yaratilgan premium muhandislik.", "Премиальная инженерия, созданная для каждой секунды.", "Premium engineering built for every second."],
    ["Chronex bilan tanishing", "Познакомьтесь с Chronex", "Meet Chronex"],
    ["Hozir buyurtma", "Заказать сейчас", "Order now"],
    ["Pastga suring ↓", "Прокрутите вниз ↓", "Scroll down ↓"],
    // statistika
    ["kun batareya", "дней работы", "days of battery"],
    ["metr suv himoyasi", "метров водозащиты", "m water resistance"],
    ["nit yorqinlik", "нит яркость", "nits brightness"],
    ["+ sport rejimi", "+ спортивных режимов", "+ sport modes"],
    // kolleksiya
    ["Premium kolleksiya", "Премиум-коллекция", "Premium collection"],
    ["Premium Collection", "Премиум-коллекция", "Premium Collection"],
    ["Yengil titan korpus. Kundalik va sport uchun ideal.", "Лёгкий титановый корпус. Идеален для повседневной носки и спорта.", "Lightweight titanium case. Ideal for everyday wear and sport."],
    ["Tanlash", "Выбрать", "Select"],
    ["Eng ommabop", "Хит продаж", "Most popular"],
    ["Sapfir oyna, GPS va yurak ritmi sensori bilan flagman.", "Флагман с сапфировым стеклом, GPS и датчиком пульса.", "The flagship with sapphire glass, GPS and a heart-rate sensor."],
    ["Nafis dizayn, ingichka korpus va premium teri tasma.", "Изящный дизайн, тонкий корпус и премиальный кожаный ремешок.", "Elegant design, slim case and a premium leather strap."],
    // texnologiya
    ["Technology", "Технологии", "Technology"],
    ["Muhandislik", "Инженерия", "Engineering"],
    ["Ichkaridan yaratilgan", "Создано изнутри", "Built from the inside out"],
    ["Aviatsiya darajasidagi titan korpus, sapfir oyna va yuqori aniqlikdagi harakat mexanizmi. Yurak ritmi, kislorod (SpO₂), uyqu va harorat sensorlari butun kun davomida sizni kuzatib boradi.",
      "Титановый корпус авиационного класса, сапфировое стекло и высокоточный механизм. Датчики пульса, кислорода (SpO₂), сна и температуры следят за вами весь день.",
      "Aviation-grade titanium case, sapphire glass and a high-precision movement. Heart-rate, oxygen (SpO₂), sleep and temperature sensors keep track of you all day."],
    ["Batafsil →", "Подробнее →", "Learn more →"],
    ["Ekran", "Экран", "Display"],
    ["AMOLED Display", "AMOLED-дисплей", "AMOLED Display"],
    ["1000 nit gacha yorqinlik, 466×466 piksel aniqlik va doimiy yoniq (always-on) rejim. Quyoshda ham ravshan, tunda ham ko'zni toliqtirmaydi.",
      "Яркость до 1000 нит, разрешение 466×466 пикселей и режим always-on. Чётко виден на солнце и не утомляет глаза ночью.",
      "Up to 1000 nits of brightness, 466×466 pixels and an always-on mode. Clear in sunlight and easy on the eyes at night."],
    // hikoya
    ["Brand Story", "История бренда", "Brand story"],
    ["Bizning hikoyamiz", "Наша история", "Our story"],
    ["Chronex bir g'oyadan boshlandi: vaqt shunchaki o'lchanmasligi, balki qadrlanishi kerak. Muhandislar va dizaynerlar jamoasi klassik soatsozlik san'atini zamonaviy texnologiya bilan birlashtirib, har kuni sizga xizmat qiladigan soat yaratdi.",
      "Chronex начался с одной идеи: время нужно не просто измерять, а ценить. Команда инженеров и дизайнеров соединила классическое часовое искусство с современными технологиями и создала часы, которые служат вам каждый день.",
      "Chronex began with one idea: time should not just be measured, it should be valued. A team of engineers and designers combined classic watchmaking with modern technology to create a watch that serves you every day."],
    ["Kolleksiyani ko'rish", "Смотреть коллекцию", "View the collection"],
    ["Own Your Time", "Владейте своим временем", "Own your time"],
    ["OWN YOUR TIME.", "ВЛАДЕЙТЕ СВОИМ ВРЕМЕНЕМ.", "OWN YOUR TIME."],
    ["Chronex'ingizni bugun tanlang.", "Выберите свой Chronex сегодня.", "Choose your Chronex today."],
    ["Hozir buyurtma berish", "Заказать сейчас", "Order now"],
    // buyurtma
    ["Chronex'ga buyurtma bering", "Закажите Chronex", "Order your Chronex"],
    ["Ma'lumotlaringizni to'ldiring, so'ng buyurtmani Telegram orqali yuboring.", "Заполните данные, затем отправьте заказ через Telegram.", "Fill in your details, then send the order via Telegram."],
    ["Model", "Модель", "Model"],
    ["Rang", "Цвет", "Colour"],
    ["Soni", "Количество", "Quantity"],
    ["Ismingiz", "Ваше имя", "Your name"],
    ["Telefon raqami", "Номер телефона", "Phone number"],
    ["Yetkazib berish manzili", "Адрес доставки", "Delivery address"],
    ["Izoh (ixtiyoriy)", "Комментарий (необязательно)", "Note (optional)"],
    ["Jami:", "Итого:", "Total:"],
    ["Buyurtmani tayyorlash", "Подготовить заказ", "Prepare order"],
    ["Deyarli tayyor!", "Почти готово!", "Almost done!"],
    ["Quyidagi tugmani bosing. Telegram buyurtmangiz bilan ochiladi, faqat", "Нажмите кнопку ниже. Telegram откроется с вашим заказом, останется только нажать", "Tap the button below. Telegram will open with your order, just press"],
    ["ni bosing.", ".", "."],
    ["Telegramda yuborish", "Отправить в Telegram", "Send on Telegram"],
    ["← Ma'lumotni o'zgartirish", "← Изменить данные", "← Edit details"],
    ["Ism Familiya", "Имя и фамилия", "Full name"],
    ["Shahar, ko'cha, uy", "Город, улица, дом", "City, street, house"],
    ["Qo'shimcha istaklar...", "Дополнительные пожелания...", "Additional wishes..."],
    // sovg'a rejimi
    ["🎁 Sovg'a sifatida qadoqlansin", "🎁 Упаковать как подарок", "🎁 Wrap as a gift"],
    ["Ochiq xat matni (ixtiyoriy)", "Текст открытки (необязательно)", "Greeting card text (optional)"],
    ["Masalan: Tug'ilgan kuningiz bilan!", "Например: С днём рождения!", "For example: Happy birthday!"],
    ["Sovg'a qadoqlash shartlarini operator tasdiqlaydi.", "Условия подарочной упаковки подтверждает оператор.", "The operator confirms the gift-wrapping terms."],
    // footer
    ["Biz haqimizda", "О нас", "About us"],
    ["Mijozlarga yordam", "Поддержка клиентов", "Customer support"],
    ["Aloqa", "Контакты", "Contact"],
    ["Kafolat", "Гарантия", "Warranty"],
    ["Kuzatib boring", "Мы в соцсетях", "Follow us"],
    ["CHRONEX. Barcha huquqlar himoyalangan.", "CHRONEX. Все права защищены.", "CHRONEX. All rights reserved."],
    // aria / title
    ["Menyu", "Меню", "Menu"],
    ["Yuqoriga", "Наверх", "Back to top"],
    ["Asosiy qismga o'tish", "Перейти к содержимому", "Skip to content"]
  ];
  const D = { ru: {}, en: {} };
  TR.forEach(r => { D.ru[r[0]] = r[1]; D.en[r[0]] = r[2]; });

  /* ================= CSS ================= */
  const st = document.createElement("style");
  st.textContent = `
  .cx8-lang{display:flex;gap:4px;margin-left:14px}
  .cx8-lang button{background:none;border:1px solid var(--line,#222633);color:var(--muted,#9097a8);border-radius:999px;padding:4px 10px;font:inherit;font-size:12px;cursor:pointer;transition:.2s}
  .cx8-lang button:hover{border-color:var(--accent,#c9a86a);color:var(--text,#f2f3f7)}
  .cx8-lang button.on{background:var(--accent,#c9a86a);color:#111;border-color:var(--accent,#c9a86a);font-weight:700}
  .cx8-lang.fixed{position:fixed;top:12px;right:12px;z-index:60}
  .cx8-gift{display:grid;gap:12px;background:var(--bg,#07080b);border:1px dashed var(--line,#222633);border-radius:14px;padding:14px 16px}
  .cx8-gift[hidden],.cx8-gift [hidden]{display:none}
  .form .cx8-chk,.cx8-chk{display:flex!important;align-items:center;gap:10px;cursor:pointer;color:var(--text,#f2f3f7);font-size:15px}
  .cx8-chk input{width:18px;height:18px;padding:0;accent-color:var(--accent,#c9a86a)}
  .cx8-sp{position:relative}
  .cx8-spl{position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:1;opacity:0;transition:opacity .3s;
    background:radial-gradient(260px circle at var(--mx,50%) var(--my,50%),rgba(201,168,106,.15),transparent 70%)}
  .cx8-sp:hover>.cx8-spl{opacity:1}
  .cx8-skip{position:fixed;left:12px;top:-70px;z-index:900;background:var(--accent,#c9a86a);color:#111;padding:10px 18px;border-radius:999px;font-weight:700;transition:top .2s}
  .cx8-skip:focus{top:12px}
  a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,summary:focus-visible{outline:2px solid var(--accent,#c9a86a);outline-offset:3px}
  .cx8-conf{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:700}
  @media(max-width:900px){.cx8-lang{margin-left:8px}.cx8-lang button{padding:3px 8px}}`;
  document.head.appendChild(st);

  /* ================= 2. SOVG'A REJIMI (til tarjimasidan oldin yaratiladi) ================= */
  const note = $("#note");
  if (note && note.closest("label")) {
    const box = document.createElement("div");
    box.className = "cx8-gift";
    box.innerHTML = `<label class="cx8-chk"><input type="checkbox" id="cx8G"> 🎁 Sovg'a sifatida qadoqlansin</label>
      <div id="cx8GW" hidden style="display:grid;gap:8px">
        <label>Ochiq xat matni (ixtiyoriy)<input id="cx8GT" maxlength="120" placeholder="Masalan: Tug'ilgan kuningiz bilan!"></label>
        <small class="muted">Sovg'a qadoqlash shartlarini operator tasdiqlaydi.</small>
      </div>`;
    note.closest("label").after(box);
    const g = $("#cx8G"), w = $("#cx8GW"), t = $("#cx8GT");
    const sync = () => {
      w.hidden = !g.checked;
      const rest = note.value.replace(/^🎁 Sovg'a:[^\n]*\n?/gm, "").trim();
      const msg = t.value.trim();
      note.value = g.checked
        ? (rest ? rest + "\n" : "") + "🎁 Sovg'a: qadoqlansin" + (msg ? " · Ochiq xat: «" + msg + "»" : "")
        : rest;
    };
    g.addEventListener("change", () => { sync(); if (g.checked) t.focus(); });
    t.addEventListener("input", sync);
  }

  /* ================= 1. TIL ALMASHTIRGICH ================= */
  const orig = new WeakMap(), last = new WeakMap();
  let lang = "uz";

  function trNode(n) {
    const cur = n.nodeValue;
    if (!orig.has(n) || (cur !== orig.get(n) && cur !== last.get(n))) orig.set(n, cur); // boshqa skript o'zgartirgan bo'lsa
    const o = orig.get(n), key = o.trim();
    if (!key) return;
    let out = o;
    if (lang !== "uz") {
      const t = D[lang][key];
      if (t) {
        const lead = /^[.,;:!?]/.test(t) ? "" : o.match(/^\s*/)[0];
        out = lead + t + o.match(/\s*$/)[0];
      }
    }
    last.set(n, out);
    if (n.nodeValue !== out) n.nodeValue = out;
  }
  const ATTRS = ["placeholder", "aria-label", "title"];
  function trAttrs(el) {
    ATTRS.forEach(a => {
      if (!el.hasAttribute || !el.hasAttribute(a)) return;
      const ds = "data-cx8-" + a;
      if (!el.hasAttribute(ds)) el.setAttribute(ds, el.getAttribute(a));
      const o = el.getAttribute(ds), t = lang === "uz" ? o : (D[lang][o.trim()] || o);
      if (el.getAttribute(a) !== t) el.setAttribute(a, t);
    });
  }
  function walk(root) {
    if (root.nodeType === 3) { trNode(root); return; }
    if (root.nodeType !== 1) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const p = n.parentNode;
        if (!p || /^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/.test(p.nodeName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const list = []; while (w.nextNode()) list.push(w.currentNode);
    list.forEach(trNode);
    trAttrs(root); $$("[placeholder],[aria-label],[title]", root).forEach(trAttrs);
  }

  const bar = document.createElement("div");
  bar.className = "cx8-lang"; bar.setAttribute("aria-label", "Til / Language / Язык");
  bar.innerHTML = ["uz", "ru", "en"].map(l => `<button type="button" data-l="${l}">${l.toUpperCase()}</button>`).join("");
  const nav = $(".nav"), burger = $("#burger");
  if (nav) nav.insertBefore(bar, burger || null); else { bar.classList.add("fixed"); document.body.appendChild(bar); }

  function setLang(l, silent) {
    lang = l;
    document.documentElement.lang = l;
    $$("button", bar).forEach(b => b.classList.toggle("on", b.dataset.l === l));
    walk(document.body);
    if (!silent) store.set("cx8_lang", l);
  }
  bar.addEventListener("click", e => { const b = e.target.closest("button[data-l]"); if (b) setLang(b.dataset.l); });
  new MutationObserver(ms => {
    if (lang === "uz") return;
    ms.forEach(m => m.addedNodes.forEach(n => walk(n)));
  }).observe(document.body, { childList: true, subtree: true });
  window.cx8SetLang = setLang;
  setLang(["uz", "ru", "en"].includes(store.get("cx8_lang", "uz")) ? store.get("cx8_lang", "uz") : "uz", true);

  /* ================= 3. KONFETTI ================= */
  function confetti() {
    if (reduce) return;
    const cv = document.createElement("canvas");
    cv.className = "cx8-conf"; document.body.appendChild(cv);
    const ctx = cv.getContext("2d");
    const W = cv.width = innerWidth, H = cv.height = innerHeight;
    const cols = ["#e8d3a0", "#c9a86a", "#fff3c8", "#7ee8ff", "#ff5a6e", "#ffffff"];
    const P = Array.from({ length: 140 }, () => ({
      x: W / 2 + (Math.random() - .5) * 120, y: H * .6,
      vx: (Math.random() - .5) * 16, vy: -Math.random() * 16 - 6,
      s: Math.random() * 7 + 4, r: Math.random() * 6.28, vr: (Math.random() - .5) * .4,
      c: cols[(Math.random() * cols.length) | 0]
    }));
    const t0 = performance.now();
    (function frame(now) {
      const t = now - t0;
      ctx.clearRect(0, 0, W, H);
      P.forEach(p => {
        p.vy += .38; p.vx *= .992; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, 1 - t / 3200);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        ctx.restore();
      });
      if (t < 3200) requestAnimationFrame(frame); else cv.remove();
    })(t0);
  }
  const form = $("#orderForm"), done = $("#done");
  if (form && done) form.addEventListener("submit", () => setTimeout(() => { if (!done.hidden) confetti(); }, 80));

  /* ================= 4. KURSOR YORUG'LIGI + MAGNIT TUGMALAR ================= */
  if (hoverOK) {
    const SP = ".card, .lw-card, .cx4-card, .cx4-br, .cx7-vis, .cx-box";
    const addSpot = () => $$(SP).forEach(el => {
      if (el.classList.contains("cx8-sp")) return;
      el.classList.add("cx8-sp");
      const s = document.createElement("span"); s.className = "cx8-spl"; s.setAttribute("aria-hidden", "true");
      el.appendChild(s);
    });
    addSpot(); setTimeout(addSpot, 1500); setTimeout(addSpot, 4000);
    document.addEventListener("pointermove", e => {
      const el = e.target.closest && e.target.closest(".cx8-sp");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });

    if (!reduce) $$(".hero-actions .btn, .cta .btn").forEach(b => {
      b.addEventListener("pointermove", e => {
        const r = b.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * .22, y = (e.clientY - (r.top + r.height / 2)) * .32;
        b.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      });
      b.addEventListener("pointerleave", () => { b.style.transform = ""; });
    });
  }

  /* ================= 5. KLAVIATURA: "O'TISH" HAVOLASI ================= */
  const target = $("#collection") || $("main") || $("#order");
  if (target) {
    const a = document.createElement("a");
    a.className = "cx8-skip"; a.href = "#" + (target.id || "collection"); a.textContent = "Asosiy qismga o'tish";
    document.body.prepend(a);
    walk(a);
  }
})();