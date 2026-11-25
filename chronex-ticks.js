/* ===== CHRONEX chronex-ai.js — HABARCHI (chat yordamchi) =====
   Mijoz soatlar haqida so'raydi, yordamchi javob beradi. "Kimga yozaman?", "aloqa", "operator" kabi
   savollarda yoki javob bilmaganda Telegram @Sardorbekkk777 ni ko'rsatadi.

   IKKI REJIM
   1) TEZKOR (standart): sayt ma'lumotlari asosida ishlaydigan aqlli yordamchi. Narx, model, batareya, ekran,
      GPS, tasma, buyurtma, byudjetga qarab tavsiya va boshqa savollarga javob beradi. Hech qayerga ulanish kerak emas.
   2) AI: haqiqiy sun'iy intellekt (Claude). Buning uchun kichik server fayl kerak (ai-proxy-worker.js),
      chunki AI kalitini saytga yozib bo'lmaydi. Server manzilini quyidagi AI_ENDPOINT ga yozing.
      AI ishlamasa yoki xato bersa, yordamchi avtomatik tezkor rejimga o'tadi.

   Mavjud kodga TEGMAYDI. Alohida ulash:  <script src="./chronex-ai.js"></script>
   (chronex-all.js orqali avtomatik yuklanadi). Eski "Chronex yordamchi" chati (chronex-lab.js) yashiriladi,
   uning tugmasi ham shu yangi chatni ochadi. */
(function () {
  "use strict";
  if (window.__cx20) return;
  window.__cx20 = 1;

  /* ================= SOZLAMALAR ================= */
  const AI_ENDPOINT = "";                  // masalan: "https://chronex-ai.sizning-nom.workers.dev"  (bo'sh = tezkor rejim)
  const TG_DEFAULT = "Sardorbekkk777";     // Telegram nomi (script.js dagi TG_USER to'g'ri yozilgan bo'lsa, o'sha ishlatiladi)
  const UZ_RATE = 12500;                   // 1 USD = ? so'm (so'mda byudjet aytilganda hisoblash uchun)

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const tg = () => (typeof TG_USER !== "undefined" && TG_USER && TG_USER !== "your_username") ? TG_USER : TG_DEFAULT;
  const endpoint = () => window.CHRONEX_AI_ENDPOINT || AI_ENDPOINT;
  const ss = {
    get(k, d) { try { const v = sessionStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const tgLink = text => `https://t.me/${tg()}${text ? "?text=" + encodeURIComponent(text) : ""}`;

  /* ================= SAYT MA'LUMOTLARI ================= */
  const models = () => {
    const l = $$("#model option").filter(o => o.dataset.price).map(o => ({ name: o.value, price: +o.dataset.price }));
    return l.length ? l : [{ name: "Chronex Aero", price: 249 }, { name: "Chronex Titan", price: 349 }, { name: "Chronex Nova", price: 299 }];
  };
  const FACTS = {
    Aero: { line: "yengil titan korpus, kundalik va sport uchun mos. Batareya 14 kungacha, suv himoyasi 50 m. Tasma kauchuk. GPS va sapfir oyna yo'q.", sty: "sport" },
    Titan: { line: "flagman: titan korpus, sapfir oyna, GPS, xronograf va yurak ritmi sensori. Suv himoyasi 50 m, batareya taxminan 10 kun. Tasma kauchuk, oltin tikuvli.", sty: "tech" },
    Nova: { line: "nafis dizayn: ingichka rose gold korpus, sapfir oyna va haqiqiy teri tasma. Suv himoyasi 30 m, batareya taxminan 12 kun. GPS yo'q.", sty: "elegant" }
  };
  const keyOf = name => Object.keys(FACTS).find(k => name.includes(k));

  /* ================= TEZKOR AQL ================= */
  const norm = s => s.toLowerCase().replace(/[ʻʼ`’‘']/g, "").replace(/[^\p{L}\p{N}$\s]/gu, " ").replace(/\s+/g, " ").trim();
  const has = (n, kws) => kws.some(k => n.includes(k));
  const INTENT = {
    contact: ["kimga yoz", "kim bilan", "kimga murojaat", "kimga qongiroq", "boglan", "bogla", "aloqa", "telefon", "raqam", "operator", "menejer", "admin", "sotuvchi", "egasi", "telegram", "whatsapp", "qongiroq", "yozsam", "murojaat", "odam bilan", "связ", "написать", "контакт", "оператор", "менеджер", "контакты", "contact", "reach you", "talk to", "human", "support", "who can i", "who should i"],
    greet: ["salom", "assalom", "hello", "hi ", "привет", "здравствуй", "qalaysiz", "xayrli", "hayrli"],
    thanks: ["rahmat", "raxmat", "thanks", "thank you", "спасибо"],
    who: ["kimsiz", "kimsan", "siz kim", "sen kim", "robot", "bot misiz", "suniy intellekt", "sun iy intellekt", "ai misiz", "odammisiz", "кто ты", "вы бот", "are you a bot", "are you ai", "who are you"],
    price: ["narx", "qancha", "turadi", "pul", "price", "cost", "цена", "сколько", "стоит", "how much"],
    list: ["modellar", "qanday soat", "qanaqa soat", "kolleksiya", "nechta model", "qaysi modellar", "what models", "какие модели", "ro yxat", "royxat"],
    recommend: ["tavsiya", "qaysi biri", "qaysi birini", "qaysini", "maslahat", "sovga", "byudjet", "budjet", "budget", "arzon", "eng yaxshi", "mos keladi", "recommend", "посоветуй", "какой выбрать", "подарок"],
    compare: ["farq", "solishtir", "taqqos", "compare", "difference", "сравн", "разниц", "qaysi yaxshi"],
    battery: ["batareya", "zaryad", "quvvat", "necha kun ishlaydi", "battery", "батаре", "заряд"],
    water: ["suv", "chomil", "yomgir", "dush", "water", "влаг", "вода", "плав"],
    display: ["ekran", "amoled", "yorqin", "display", "screen", "экран", "always on", "always-on"],
    gps: ["gps", "navigatsiya", "joylashuv", "навигац"],
    sensors: ["yurak", "puls", "sensor", "uyqu", "spo2", "kislorod", "harorat", "salomatlik", "heart", "sleep", "пульс", "сон", "датчик"],
    colors: ["rang", "color", "colour", "цвет", "silver", "black", "rose gold", "qora", "kumush"],
    strap: ["tasma", "remen", "strap", "ремеш", "teri", "kauchuk"],
    material: ["korpus", "titan korpus", "sapfir", "oyna", "material", "материал", "стекло", "сапфир"],
    sport: ["sport", "mashq", "yugur", "fitnes", "fitness", "тренир", "спорт"],
    size: ["olcham", "diametr", "mm", "bilak", "razmer", "размер", "size", "qalinlik"],
    order: ["buyurtma", "sotib", "olmoq", "olaman", "qanday olay", "order", "заказ", "купить", "how to buy"],
    unknown: ["yetkaz", "dostavka", "kafolat", "qaytar", "almashtir", "tolov", "nasiya", "muddatli", "rassrochka", "tolash", "garantiya", "оплата", "доставка", "гарантия", "возврат", "рассрочк", "delivery", "warranty", "payment", "refund", "chegirma", "aksiya", "promo", "skidka", "скидка", "акция"]
  };
  const ACTIONS = {
    tg: text => ({ label: `✈ Telegramda yozish (@${tg()})`, href: tgLink(text) }),
    order: () => ({ label: "🛒 Buyurtmaga o'tish", go: "#order" })
  };
  function modelFromText(n) { return Object.keys(FACTS).filter(k => n.includes(k.toLowerCase())); }
  function budgetFrom(text) {
    const n = text.toLowerCase().replace(/(\d)[\s,](\d{3})/g, "$1$2");
    const m = n.match(/(\d{2,9})\s*(\$|usd|dollar|dollarga|dollargacha|доллар|сум|som|so'm|sum|ming|мил|mln|million)?/);
    if (!m) return null;
    let v = +m[1]; const u = m[2] || "";
    if (/сум|som|so'm|sum/.test(u)) v = v / UZ_RATE; else if (/ming/.test(u)) v = (v * 1000) / UZ_RATE; else if (/mln|million|мил/.test(u)) v = (v * 1e6) / UZ_RATE; else if (v >= 20000) v = v / UZ_RATE;
    return v >= 50 && v <= 5000 ? v : null;
  }
  function brain(text, lastQ) {
    const n = norm(text);
    const R = (t, actions, chips) => ({ text: t, actions: actions || [], chips: chips || [] });
    const T = ACTIONS.tg(lastQ || text);
    const ms = models(), by = ms.slice().sort((a, b) => a.price - b.price);
    const mentioned = modelFromText(n);

    if (has(n, INTENT.contact)) return R(`Savol, buyurtma yoki maxsus so'rov uchun do'kon egasiga Telegramda yozing: @${tg()}.\nTugmani bosing, yozish oynasi ochiladi.`, [ACTIONS.tg("Salom! Chronex haqida savolim bor.")], ["Narxlar", "Qaysi model mos?"]);
    if (has(n, INTENT.who)) return R(endpoint() && state.aiOk ? "Men Chronex do'konining sun'iy intellekt yordamchisiman. Soatlar, narxlar va buyurtma haqida javob beraman. Murakkab savol bo'lsa, do'kon egasiga yo'naltiraman." : "Men Chronex do'konining yordamchisiman. Sayt ma'lumotlari asosida soatlar, narxlar va buyurtma haqida javob beraman. Aniq javobim bo'lmasa, do'kon egasiga yo'naltiraman.", [], ["Narxlar", "Kimga yozaman?"]);
    if (has(n, INTENT.thanks) && n.split(" ").length <= 4) return R("Marhamat! Yana savol bo'lsa, yozing 😊", [], ["Narxlar", "Buyurtma berish"]);
    if (has(n, INTENT.greet) && n.split(" ").length <= 4) return R("Assalomu alaykum! 👋 Men Chronex yordamchisiman. Soatlar, narxlar yoki buyurtma haqida so'rang.", [], ["Narxlar", "Qaysi model mos?", "Kimga yozaman?"]);
    if (has(n, INTENT.unknown)) {
      const what = has(n, ["yetkaz", "dostavka", "доставка", "delivery"]) ? "yetkazib berish" : has(n, ["kafolat", "garantiya", "гарантия", "warranty"]) ? "kafolat" : has(n, ["qaytar", "almashtir", "возврат", "refund"]) ? "qaytarish va almashtirish" : has(n, ["chegirma", "aksiya", "promo", "skidka", "скидка", "акция"]) ? "chegirma va aksiyalar" : "to'lov shartlari";
      return R(`${what[0].toUpperCase() + what.slice(1)} shartlari o'zgarib turadi, shuning uchun aniq javobni do'kon egasi beradi. Telegramda so'rang: @${tg()}.`, [ACTIONS.tg(`Salom! ${what} haqida so'ramoqchiman.`)], ["Narxlar", "Buyurtma berish"]);
    }
    if (has(n, INTENT.compare) || mentioned.length > 1) {
      const pick = mentioned.length > 1 ? mentioned : Object.keys(FACTS);
      return R("Solishtirish:\n" + pick.map(k => { const p = ms.find(x => x.name.includes(k)); return `• ${k}${p ? " ($" + p.price + ")" : ""}: ${FACTS[k].line}`; }).join("\n") + "\n\nQaysi biri mos kelishini bilish uchun byudjet yoki foydalanish uslubingizni ayting.", [ACTIONS.order()], ["Qaysi model mos?"]);
    }
    if (has(n, INTENT.recommend) || (/\d{2,}/.test(n) && has(n, ["dollar", "$", "usd", "som", "sum", "gacha", "byudjet"]))) {
      const b = budgetFrom(text);
      if (b != null) {
        const ok = ms.filter(x => x.price <= b).sort((x, y) => y.price - x.price);
        if (ok.length) { const m = ok[0], k = keyOf(m.name); return R(`$${Math.round(b)} byudjetga eng mos: ${m.name} ($${m.price}).\n${k ? FACTS[k].line[0].toUpperCase() + FACTS[k].line.slice(1) : ""}`, [ACTIONS.order()], ["Solishtirish", "Kimga yozaman?"]); }
        return R(`Eng arzon model ${by[0].name} ($${by[0].price}), u $${Math.round(b)} dan qimmatroq. Byudjetingizni moslashtirsangiz yoki Telegramda so'rasangiz, variantlarni ko'rib chiqamiz.`, [ACTIONS.tg("Salom! Byudjetim cheklangan, maslahat bera olasizmi?")], ["Narxlar"]);
      }
      if (has(n, ["sport", "faol", "yugur"])) return R("Faol hayot va sport uchun Chronex Aero mos: yengil titan korpus va kundalik taqishga qulay. GPS kerak bo'lsa, Chronex Titan.", [ACTIONS.order()], ["Solishtirish"]);
      if (has(n, ["nafis", "klassik", "ayol", "opa", "ona", "elegant"])) return R("Nafislik uchun Chronex Nova: ingichka rose gold korpus va haqiqiy teri tasma.", [ACTIONS.order()], ["Solishtirish"]);
      if (has(n, ["gps", "texnolog", "flagman", "eng yaxshi", "eng kuchli"])) return R("Eng to'liq imkoniyatlar Chronex Titan'da: sapfir oyna, GPS, xronograf va yurak ritmi sensori.", [ACTIONS.order()], ["Solishtirish"]);
      return R("Mos modelni topishim uchun ikkita narsani ayting: byudjetingiz (masalan «300 dollar») va uslubingiz (sport, nafis yoki texnologiya).\nTez variantlar:\n• Sport va kundalik: Aero\n• Nafis dizayn: Nova\n• Eng ko'p imkoniyat: Titan", [], ["300 dollargacha", "Sport uchun", "Nafis uchun"]);
    }
    if (mentioned.length === 1 && !has(n, INTENT.battery.concat(INTENT.water, INTENT.display, INTENT.gps, INTENT.sensors, INTENT.strap))) {
      const k = mentioned[0], p = ms.find(x => x.name.includes(k));
      return R(`Chronex ${k}${p ? " ($" + p.price + ")" : ""}: ${FACTS[k].line}`, [ACTIONS.order()], ["Solishtirish", "Qaysi model mos?"]);
    }
    if (has(n, INTENT.price)) {
      if (mentioned.length === 1) { const k = mentioned[0], p = ms.find(x => x.name.includes(k)); if (p) return R(`${p.name} narxi: $${p.price} (taxminan ${Math.round(p.price * UZ_RATE).toLocaleString("ru-RU")} so'm, kursga qarab).`, [ACTIONS.order()], ["Solishtirish"]); }
      return R("Narxlar:\n" + ms.map(m => `• ${m.name}: $${m.price}`).join("\n") + "\n\nQaysi biri mos kelishini ham aytib bera olaman.", [ACTIONS.order()], ["Qaysi model mos?", "Solishtirish"]);
    }
    if (has(n, INTENT.list)) return R("Uchta model bor:\n" + ms.map(m => { const k = keyOf(m.name); return `• ${m.name} ($${m.price}): ${k ? FACTS[k].line.split(".")[0] : ""}`; }).join("\n"), [ACTIONS.order()], ["Solishtirish", "Narxlar"]);
    if (has(n, INTENT.battery)) return R("Batareya modelga qarab: Aero taxminan 14 kun, Nova 12 kun, Titan 10 kun (saytdagi solishtirish jadvaliga ko'ra). Real muddat foydalanishga, ekran yorqinligiga va GPS ishlatishga bog'liq.", [], ["Narxlar", "Solishtirish"]);
    if (has(n, INTENT.water)) return R("Suv himoyasi: Aero va Titan 50 metrgacha, Nova 30 metrgacha. Yomg'irda va cho'milishda ishlatish mumkin.", [], ["Solishtirish"]);
    if (has(n, INTENT.display)) return R("Ekran AMOLED: 1000 nit gacha yorqinlik, 466×466 piksel va doimiy yoniq (always-on) rejim. Quyoshda ravshan, tunda ko'zni toliqtirmaydi. Nova modelida yorqinlik 800 nitgacha.", [], ["Solishtirish"]);
    if (has(n, INTENT.gps)) return R("GPS faqat Chronex Titan'da bor. Aero va Nova'da GPS yo'q.", [ACTIONS.order()], ["Solishtirish"]);
    if (has(n, INTENT.sensors)) return R("Hamma modellarda yurak ritmi, kislorod (SpO₂), uyqu va harorat sensorlari bor, butun kun kuzatib boradi. Bu ma'lumotlar tibbiy tashxis emas, sog'liq bo'yicha shifokorga murojaat qiling.", [], ["Narxlar"]);
    if (has(n, INTENT.colors)) return R("Ranglar: Midnight Black, Silver Steel va Rose Gold. Saytdagi «Jonli soatlar» bo'limida siferblat va tasma rangini o'zingiz ham tanlab ko'rishingiz mumkin.", [ACTIONS.order()], []);
    if (has(n, INTENT.strap)) return R("Tasma: Aero kauchuk, Titan kauchuk va oltin tikuvli, Nova haqiqiy teri.", [], ["Solishtirish"]);
    if (has(n, INTENT.material)) return R("Korpus: Aero titan, Titan titan + sapfir oyna, Nova rose gold po'lat + sapfir oyna. Aero'da mustahkam mineral oyna.", [], ["Solishtirish"]);
    if (has(n, INTENT.sport)) return R("Soatlarda 100 dan ortiq sport rejimi bor. Faol hayot uchun Aero, GPS bilan yugurish uchun Titan mos.", [], ["Solishtirish"]);
    if (has(n, INTENT.size)) return R(`Korpus diametri taxminan: Aero 42 mm, Titan 46 mm, Nova 38 mm. Bilagingizga qanday turishini sayt «Bilakda ko'rish» bo'limida ko'rsatadi. Aniq o'lcham masalalarida do'kon egasiga yozing: @${tg()}.`, [ACTIONS.tg("Salom! Soat o'lchami bo'yicha so'ramoqchiman.")], []);
    if (has(n, INTENT.order)) return R("Buyurtma berish oson:\n1) Modelni tanlang\n2) Rang va sonini belgilang\n3) Ism, telefon va manzilni yozing\n4) «Buyurtmani tayyorlash», so'ng Telegramda yuboring.\nBuyurtmani do'kon egasi tasdiqlaydi.", [ACTIONS.order(), ACTIONS.tg("Salom! Buyurtma bermoqchiman.")], ["Narxlar"]);
    return R(`Bu savolga aniq javobim yo'q. Do'kon egasi yordam beradi: @${tg()} (Telegram).`, [ACTIONS.tg(text)], ["Narxlar", "Qaysi model mos?", "Buyurtma berish"]);
  }

  /* ================= HOLAT ================= */
  const state = { aiOk: false, aiFailedOnce: false, history: ss.get("cx20_h", []), count: ss.get("cx20_n", 0), lastQ: "", busy: false };

  /* ================= CSS ================= */
  const st = document.createElement("style");
  st.textContent = `
  .cx7-bot,.cx7-chat{display:none!important}
  .cx20-bot{position:fixed;right:20px;bottom:84px;z-index:47;width:58px;height:58px;border-radius:50%;border:1px solid var(--accent,#c9a86a);background:linear-gradient(135deg,var(--accent2,#e8d3a0),var(--accent,#c9a86a));color:#111;font-size:24px;cursor:pointer;box-shadow:0 10px 28px rgba(201,168,106,.35);transition:.25s}
  .cx20-bot:hover{transform:scale(1.08)}
  .cx20-bot.has-new::after{content:"";position:absolute;top:2px;right:2px;width:12px;height:12px;border-radius:50%;background:#ff5a3c;border:2px solid var(--bg,#07080b)}
  .cx20-tip{position:fixed;right:90px;bottom:96px;z-index:47;background:var(--card,#13161e);color:var(--text,#f2f3f7);border:1px solid var(--accent,#c9a86a);border-radius:14px 14px 4px 14px;padding:10px 14px;font-size:13px;max-width:210px;box-shadow:0 10px 30px rgba(0,0,0,.4);animation:cx20In .4s}
  .cx20-chat{position:fixed;right:20px;bottom:152px;z-index:48;width:min(390px,calc(100vw - 24px));height:min(560px,76vh);background:var(--bg2,#0e1016);border:1px solid var(--line,#222633);border-radius:18px;display:none;flex-direction:column;box-shadow:0 24px 60px rgba(0,0,0,.55);overflow:hidden;color:var(--text,#f2f3f7)}
  .cx20-chat.open{display:flex;animation:cx20In .3s}
  @keyframes cx20In{from{opacity:0;transform:translateY(12px)}}
  .cx20-h{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--line,#222633);background:linear-gradient(135deg,rgba(201,168,106,.14),transparent)}
  .cx20-av{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--accent2,#e8d3a0),var(--accent,#c9a86a));display:grid;place-items:center;color:#111;font-size:18px;flex:none}
  .cx20-h b{display:block;font-size:15px;line-height:1.2}
  .cx20-h small{font-size:11px;color:var(--muted,#9097a8)}
  .cx20-badge{display:inline-block;font-size:10px;border-radius:999px;padding:1px 8px;margin-left:6px;background:rgba(126,232,168,.18);color:#7ee8a8;vertical-align:middle}
  .cx20-badge.fast{background:rgba(201,168,106,.18);color:var(--accent,#c9a86a)}
  .cx20-hb{margin-left:auto;display:flex;gap:6px}
  .cx20-hb a,.cx20-hb button{background:none;border:1px solid var(--line,#222633);color:var(--text,#f2f3f7);border-radius:999px;height:32px;padding:0 10px;cursor:pointer;font:inherit;font-size:12px;text-decoration:none;display:inline-flex;align-items:center}
  .cx20-hb a:hover,.cx20-hb button:hover{border-color:var(--accent,#c9a86a)}
  .cx20-msgs{flex:1;overflow:auto;padding:14px;display:grid;gap:10px;align-content:start}
  .cx20-m{max-width:88%;padding:10px 14px;border-radius:14px;font-size:14px;line-height:1.5;word-wrap:break-word;animation:cx20In .25s}
  .cx20-m.bot{background:var(--card,#13161e);border:1px solid var(--line,#222633);justify-self:start;border-bottom-left-radius:4px}
  .cx20-m.me{background:linear-gradient(135deg,var(--accent2,#e8d3a0),var(--accent,#c9a86a));color:#111;justify-self:end;border-bottom-right-radius:4px}
  .cx20-m a{color:var(--accent,#c9a86a);font-weight:600}
  .cx20-acts{display:grid;gap:6px;margin-top:8px}
  .cx20-act{display:block;text-align:center;text-decoration:none;border-radius:10px;padding:9px 12px;font:inherit;font-size:13px;font-weight:700;border:0;cursor:pointer;background:linear-gradient(135deg,var(--accent2,#e8d3a0),var(--accent,#c9a86a));color:#111!important}
  .cx20-dots{letter-spacing:3px;color:var(--muted,#9097a8)}
  .cx20-chips{display:flex;gap:6px;flex-wrap:wrap;padding:0 14px 10px}
  .cx20-chips button{background:none;border:1px solid var(--line,#222633);color:var(--muted,#9097a8);border-radius:999px;padding:5px 12px;cursor:pointer;font:inherit;font-size:12px}
  .cx20-chips button:hover{border-color:var(--accent,#c9a86a);color:var(--text,#f2f3f7)}
  .cx20-f{display:flex;gap:8px;padding:12px;border-top:1px solid var(--line,#222633)}
  .cx20-f input{flex:1;min-width:0}
  .cx20-note{font-size:11px;color:var(--muted,#9097a8);text-align:center;padding:0 12px 10px}
  body.cx18-pad .cx20-bot{bottom:134px}
  body.cx18-pad .cx20-tip{bottom:146px}
  @media(max-width:600px){.cx20-chat{right:8px;left:8px;width:auto;bottom:76px;height:min(80vh,600px)}body.cx18-pad .cx20-chat{bottom:136px;height:min(74vh,560px)}.cx20-bot{right:12px}}`;
  document.head.appendChild(st);

  /* ================= INTERFEYS ================= */
  const bot = document.createElement("button");
  bot.className = "cx20-bot"; bot.type = "button"; bot.textContent = "💬"; bot.setAttribute("aria-label", "Savol berish: Chronex yordamchi");
  const chat = document.createElement("div");
  chat.className = "cx20-chat"; chat.setAttribute("role", "dialog"); chat.setAttribute("aria-label", "Chronex yordamchi");
  chat.innerHTML = `<div class="cx20-h"><div class="cx20-av">⌚</div><div><b>Chronex yordamchi<span class="cx20-badge fast" id="cx20Bd">Tezkor</span></b><small>Soatlar haqida so'rang</small></div>
      <div class="cx20-hb"><a id="cx20Tg" target="_blank" rel="noopener" title="Telegramda yozish">✈ @${esc(tg())}</a><button type="button" id="cx20Clr" title="Suhbatni tozalash" aria-label="Suhbatni tozalash">🗑</button><button type="button" id="cx20X" aria-label="Yopish">✕</button></div></div>
    <div class="cx20-msgs" id="cx20M" role="log" aria-live="polite"></div><div class="cx20-chips" id="cx20C"></div>
    <form class="cx20-f" id="cx20F"><input id="cx20I" placeholder="Savolingizni yozing..." autocomplete="off" maxlength="300" aria-label="Savol"><button class="btn btn-sm" type="submit" aria-label="Yuborish">→</button></form>
    <div class="cx20-note" id="cx20N"></div>`;
  document.body.append(bot, chat);
  const msgs = $("#cx20M", chat), chips = $("#cx20C", chat), input = $("#cx20I", chat), badge = $("#cx20Bd", chat);
  $("#cx20Tg", chat).href = tgLink("Salom! Chronex haqida savolim bor.");

  function linkify(html) { return html.replace(new RegExp("@" + tg().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), m => `<a href="${tgLink()}" target="_blank" rel="noopener">${m}</a>`); }
  function fmt(t) { return linkify(esc(t).replace(/\n/g, "<br>")); }
  function addMsg(who, text, actions) {
    const m = document.createElement("div"); m.className = "cx20-m " + who; m.innerHTML = fmt(text);
    if (actions && actions.length) {
      const box = document.createElement("div"); box.className = "cx20-acts";
      actions.forEach(a => {
        if (a.href) { const el = document.createElement("a"); el.className = "cx20-act"; el.href = a.href; el.target = "_blank"; el.rel = "noopener"; el.textContent = a.label; box.appendChild(el); }
        else { const el = document.createElement("button"); el.type = "button"; el.className = "cx20-act"; el.textContent = a.label; el.onclick = () => { const t = $(a.go); if (t) { chat.classList.remove("open"); t.scrollIntoView({ behavior: "smooth" }); } }; box.appendChild(el); }
      });
      m.appendChild(box);
    }
    msgs.appendChild(m); msgs.scrollTop = msgs.scrollHeight; return m;
  }
  function setChips(list) {
    chips.innerHTML = ""; (list && list.length ? list : ["Narxlar", "Qaysi model mos?", "Kimga yozaman?"]).slice(0, 4).forEach(c => { const b = document.createElement("button"); b.type = "button"; b.textContent = c; b.onclick = () => ask(c); chips.appendChild(b); });
  }
  function setBadge() {
    const ai = !!endpoint() && state.aiOk;
    badge.textContent = ai ? "AI" : "Tezkor"; badge.className = "cx20-badge" + (ai ? "" : " fast");
    $("#cx20N", chat).textContent = ai ? "Javoblar sun'iy intellekt tomonidan beriladi va xato bo'lishi mumkin. Muhim narsalarni do'kon egasi bilan tasdiqlang." : "Tezkor javoblar sayt ma'lumotlariga asoslangan. Aniq shartlar uchun do'kon egasiga yozing.";
  }
  function saveHist() { ss.set("cx20_h", state.history.slice(-14)); ss.set("cx20_n", state.count); }

  /* ================= AI SO'ROVI ================= */
  async function callAI() {
    const ep = endpoint(); if (!ep) throw new Error("no endpoint");
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 20000);
    try {
      const res = await fetch(ep, {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: ctl.signal,
        body: JSON.stringify({ messages: state.history.slice(-10).map(m => ({ role: m.role, content: m.content })), catalog: models().map(m => ({ name: m.name, price: m.price })), lang: document.documentElement.lang || "uz" })
      });
      if (!res.ok) throw new Error("http " + res.status);
      const data = await res.json();
      if (!data || typeof data.reply !== "string" || !data.reply.trim()) throw new Error("bad reply");
      return data.reply.trim();
    } finally { clearTimeout(to); }
  }

  /* ================= SUHBAT ================= */
  async function ask(text) {
    text = String(text || "").trim().slice(0, 300);
    if (!text || state.busy) return;
    if (state.count >= 40) { addMsg("bot", `Suhbat uzunlashib ketdi. Davom etish uchun Telegramda yozing: @${tg()}.`, [ACTIONS.tg(text)]); return; }
    state.busy = true; state.count++; state.lastQ = text;
    addMsg("me", text); state.history.push({ role: "user", content: text }); saveHist();
    const typing = addMsg("bot", ""); typing.innerHTML = '<span class="cx20-dots">●●●</span>';
    let out = null;
    if (endpoint()) {
      try {
        const reply = await callAI(); state.aiOk = true;
        const mentionsTg = new RegExp("telegram|@" + tg(), "i").test(reply);
        out = { text: reply, actions: mentionsTg ? [ACTIONS.tg(text)] : [], chips: [] };
      } catch (e) {
        state.aiOk = false;
        if (!state.aiFailedOnce) { state.aiFailedOnce = true; }
      }
    }
    if (!out) { await new Promise(r => setTimeout(r, 380 + Math.random() * 380)); out = brain(text, text); }
    typing.remove();
    addMsg("bot", out.text, out.actions); setChips(out.chips); setBadge();
    state.history.push({ role: "assistant", content: out.text }); saveHist();
    state.busy = false; input.focus();
  }

  function openChat() {
    chat.classList.add("open"); bot.classList.remove("has-new"); const tip = $(".cx20-tip"); if (tip) tip.remove();
    if (!msgs.children.length) restore();
    setTimeout(() => input.focus(), 50);
  }
  function restore() {
    if (state.history.length) state.history.forEach(m => addMsg(m.role === "user" ? "me" : "bot", m.content));
    else addMsg("bot", `Assalomu alaykum! 👋 Men Chronex yordamchisiman. Soatlar, narxlar va buyurtma haqida so'rang. Kimga yozish kerakligini ham aytaman: Telegram @${tg()}.`);
    setChips(); setBadge();
  }
  bot.onclick = () => (chat.classList.contains("open") ? chat.classList.remove("open") : openChat());
  $("#cx20X", chat).onclick = () => chat.classList.remove("open");
  $("#cx20Clr", chat).onclick = () => { state.history = []; state.count = 0; saveHist(); msgs.innerHTML = ""; restore(); };
  $("#cx20F", chat).addEventListener("submit", e => { e.preventDefault(); const v = input.value; input.value = ""; ask(v); });
  addEventListener("keydown", e => { if (e.key === "Escape") chat.classList.remove("open"); });

  // eski chat tugmasi (chronex-lab.js) va qidiruv oynasidagi "chatni ochish" shu yangi chatni ochsin
  function hijack() { const old = $(".cx7-bot"); if (old) { old.onclick = openChat; } }
  hijack(); setTimeout(hijack, 800); setTimeout(hijack, 2500);
  window.addEventListener("chronex:ready", hijack);
  window.CX20 = { open: openChat, ask: text => { openChat(); ask(text); } };

  // ilk bor kelganda e'tibor tortuvchi kichik yozuv
  if (!ss.get("cx20_tip", false) && !state.history.length) {
    setTimeout(() => {
      if (chat.classList.contains("open")) return;
      ss.set("cx20_tip", true); bot.classList.add("has-new");
      const t = document.createElement("div"); t.className = "cx20-tip"; t.textContent = "Soat haqida savolingiz bormi? Men yordam beraman 👋"; t.onclick = openChat; document.body.appendChild(t);
      setTimeout(() => t.remove(), 9000);
    }, 9000);
  }
})();