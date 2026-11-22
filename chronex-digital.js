/* ===== CHRONEX chronex-legend.js =====
   Mavjud kodga TEGMAYDI. Alohida ulash:  <script src="./chronex-legend.js"></script>
   (yoki chronex-all.js orqali avtomatik yuklanadi)

   NIMALAR QO'SHILADI
   1) Bosh ekranda tirik "oltin suyuqlik" (WebGL): kursor atrofida to'lqin hosil qiladi
   2) "Mening Chronex'im" kartasi: buyurtmadan keyin Instagram/Telegram hikoyasi uchun rasm (1080×1920)
   3) Yutuqlar: saytdagi qiziqarli narsalarni sinab ko'rgan sari nishonlar yig'iladi (menyuda 🏆),
      hammasi yig'ilsa promo-kod ochiladi

   SOZLAMALAR: pastdagi REWARD (haqiqatan ishlaydigan kod bo'lsa yoqing) */
(function () {
  "use strict";
  if (window.__cx19) return;
  window.__cx19 = 1;

  const REWARD = { on: true, code: "CHRONEX10", pct: 10, until: "2026-12-01T23:59:59+05:00" };

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const TG = () => (typeof TG_USER !== "undefined" && TG_USER) ? TG_USER : "your_username";
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lite = (window.CHRONEX && window.CHRONEX.lite) || /[?&]lite=1/.test(location.search);
  function toast(m) {
    let box = $(".cx-toasts");
    if (!box) { box = document.createElement("div"); box.className = "cx-toasts"; document.body.appendChild(box); }
    const t = document.createElement("div"); t.className = "cx-toast"; t.textContent = m; box.appendChild(t);
    setTimeout(() => t.classList.add("out"), 3000); setTimeout(() => t.remove(), 3500);
  }
  const hex2rgb = h => { h = h.replace("#", ""); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); };
  const rgb2hex = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const shade = (hex, amt) => { const t = amt < 0 ? 0 : 255, p = Math.abs(amt); return rgb2hex(hex2rgb(hex).map(v => v + (t - v) * p)); };

  const st = document.createElement("style");
  st.textContent = `
  .cx19-gl{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}
  .hero>.container{position:relative;z-index:1}
  html.cx13-light .cx19-gl,html[data-theme=light] .cx19-gl,html.cx-light .cx19-gl{display:none}
  .cx19-tro{background:none;border:1px solid var(--line,#222633);color:var(--text,#f2f3f7);border-radius:999px;height:38px;padding:0 12px;margin-left:12px;cursor:pointer;font:inherit;font-size:13px;white-space:nowrap;transition:.2s;flex:none}
  .cx19-tro:hover{border-color:var(--accent,#c9a86a)}
  .cx19-tro.pop{animation:cx19Pop .6s}
  @keyframes cx19Pop{30%{transform:scale(1.25);border-color:var(--accent,#c9a86a)}}
  .cx19-modal{position:fixed;inset:0;z-index:740;background:rgba(0,0,0,.72);display:grid;place-items:center;padding:16px;animation:cx19In .25s}
  @keyframes cx19In{from{opacity:0}}
  .cx19-box{position:relative;width:min(520px,100%);max-height:92vh;overflow:auto;background:var(--bg2,#0e1016);border:1px solid var(--accent,#c9a86a);border-radius:var(--radius,18px);padding:28px 22px;display:grid;gap:14px;color:var(--text,#f2f3f7)}
  .cx19-box h3{margin:0;text-align:center;font-size:22px}
  .cx19-x{position:absolute;top:8px;right:14px;background:none;border:0;color:var(--text,#f2f3f7);font-size:28px;cursor:pointer;line-height:1}
  .cx19-bar{height:8px;border-radius:8px;background:var(--line,#222633);overflow:hidden}
  .cx19-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--accent2,#e8d3a0),var(--accent,#c9a86a));transition:width .5s}
  .cx19-list{display:grid;gap:8px}
  .cx19-a{display:grid;grid-template-columns:34px 1fr;gap:12px;align-items:center;background:var(--card,#13161e);border:1px solid var(--line,#222633);border-radius:12px;padding:10px 12px;opacity:.55}
  .cx19-a.ok{opacity:1;border-color:var(--accent,#c9a86a)}
  .cx19-a span{font-size:22px;text-align:center;filter:grayscale(1)}
  .cx19-a.ok span{filter:none}
  .cx19-a b{display:block;font-size:14px}
  .cx19-a small{color:var(--muted,#9097a8);font-size:12px}
  .cx19-rw{border:2px dashed var(--accent,#c9a86a);border-radius:14px;padding:14px;text-align:center;display:grid;gap:6px}
  .cx19-rw b{font-size:28px;letter-spacing:.18em;color:var(--accent2,#e8d3a0)}
  .cx19-note{font-size:12px;color:var(--muted,#9097a8);text-align:center}`;
  document.head.appendChild(st);

  /* ================================================================
     1) OLTIN SUYUQLIK (WebGL)
     ================================================================ */
  (function liquid() {
    const hero = $(".hero");
    if (!hero || lite || reduce) return;
    const cv = document.createElement("canvas"); cv.className = "cx19-gl"; cv.setAttribute("aria-hidden", "true");
    const gl = cv.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return;
    const vs = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
    const fs = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uR;uniform float uT;uniform vec2 uM;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
void main(){
  vec2 uv=gl_FragCoord.xy/uR;vec2 p=uv*vec2(uR.x/uR.y,1.)*2.4;float t=uT*.07;
  float d=distance(uv*vec2(uR.x/uR.y,1.),uM*vec2(uR.x/uR.y,1.));
  float rip=exp(-d*5.)*sin(d*38.-uT*2.6);
  vec2 q=vec2(fbm(p+t),fbm(p+vec2(5.2,1.3)-t));
  vec2 r=vec2(fbm(p+3.5*q+vec2(1.7,9.2)+.15*t),fbm(p+3.5*q+vec2(8.3,2.8)+.126*t));
  float f=fbm(p+3.5*r+rip*.12);
  vec3 dark=vec3(.027,.031,.043),g1=vec3(.79,.66,.42),g2=vec3(.97,.9,.7);
  vec3 c=mix(dark,g1,smoothstep(.32,.95,f)*.6);
  c=mix(c,g2,smoothstep(.72,1.,f)*q.x*.55);
  c+=exp(-d*4.5)*.09*g2+rip*.025;
  float v=smoothstep(1.25,.15,length(uv-vec2(.62,.5)));
  gl_FragColor=vec4(c*(.28+.5*v),1.);
}`;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
    const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return;
    const pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(pr, "uR"), uT = gl.getUniformLocation(pr, "uT"), uM = gl.getUniformLocation(pr, "uM");
    hero.prepend(cv);
    const SC = .5;
    const size = () => { cv.width = Math.max(2, Math.round(hero.clientWidth * SC)); cv.height = Math.max(2, Math.round(hero.clientHeight * SC)); gl.viewport(0, 0, cv.width, cv.height); };
    size(); addEventListener("resize", size);
    let mx = .7, my = .5, tx = .7, ty = .5, vis = true, last = 0;
    hero.addEventListener("pointermove", e => { const r = hero.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = 1 - (e.clientY - r.top) / r.height; }, { passive: true });
    new IntersectionObserver(es => { vis = es[0].isIntersecting; }, { threshold: 0 }).observe(hero);
    cv.addEventListener("webglcontextlost", e => { e.preventDefault(); cv.remove(); });
    (function frame(ts) {
      if (vis && !document.hidden && ts - last > 30) {
        last = ts; mx += (tx - mx) * .08; my += (ty - my) * .08;
        gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uT, ts / 1000); gl.uniform2f(uM, mx, my);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      requestAnimationFrame(frame);
    })(0);
  })();

  /* ================================================================
     2) "MENING CHRONEX'IM" KARTASI
     ================================================================ */
  const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  const THEMES = {
    Aero: { dial: "#cfd4df", mark: "#1a1d26", hand: "#20232d", sec: "#2b6fff", rim: ["#f4f6fa", "#7d8494", "#dfe3ec"], num: false },
    Titan: { dial: "#161820", mark: "#e8d3a0", hand: "#e8d3a0", sec: "#ff5a3c", rim: ["#f6e6bb", "#9b7733", "#e8cb88"], num: false },
    Nova: { dial: "#efe3d3", mark: "#5e362c", hand: "#5e362c", sec: "#b5473a", rim: ["#fbe2d8", "#b07767", "#f0c9bb"], num: true }
  };
  function faceImgSVG(t) {
    const d0 = shade(t.dial, .2), d1 = shade(t.dial, -.5); let m = "";
    for (let i = 0; i < 12; i++) {
      if (t.num) { const a = i * Math.PI / 6; m += `<text x="${(150 + 90 * Math.sin(a)).toFixed(1)}" y="${(150 - 90 * Math.cos(a) + 5).toFixed(1)}" text-anchor="middle" font-family="Georgia,serif" font-size="17" fill="${t.mark}">${ROMAN[i]}</text>`; }
      else m += `<rect x="146.5" y="42" width="7" height="22" rx="1.5" fill="${t.mark}" transform="rotate(${i * 30} 150 150)"/>`;
    }
    const hand = (deg, len, w, col) => `<line x1="150" y1="150" x2="${(150 + Math.sin(deg * Math.PI / 180) * len).toFixed(1)}" y2="${(150 - Math.cos(deg * Math.PI / 180) * len).toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="900" height="900"><defs>
      <linearGradient id="r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.rim[0]}"/><stop offset=".5" stop-color="${t.rim[1]}"/><stop offset="1" stop-color="${t.rim[2]}"/></linearGradient>
      <radialGradient id="d" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="${d0}"/><stop offset="1" stop-color="${d1}"/></radialGradient></defs>
      <circle cx="150" cy="150" r="148" fill="url(#r)"/><circle cx="150" cy="150" r="140" fill="#0b0b0f"/><circle cx="150" cy="150" r="132" fill="url(#d)"/>${m}
      <text x="150" y="${t.num ? 112 : 104}" text-anchor="middle" font-family="Arial" font-size="11" letter-spacing="4" fill="${t.mark}">CHRONEX</text>
      ${hand(305.2, 66, 6, t.hand)}${hand(63.5, 100, 4, t.hand)}${hand(210, 112, 1.6, t.sec)}<circle cx="150" cy="150" r="6" fill="${t.sec}"/></svg>`;
  }
  const spaced = (ctx, text, cx, y, sp) => {
    const w = [...text].reduce((a, ch) => a + ctx.measureText(ch).width + sp, -sp); let x = cx - w / 2; ctx.textAlign = "left";
    [...text].forEach(ch => { ctx.fillText(ch, x, y); x += ctx.measureText(ch).width + sp; }); ctx.textAlign = "center";
  };
  function makeCard() {
    const modelVal = ($("#model") || {}).value || "Chronex Titan", key = Object.keys(THEMES).find(k => modelVal.includes(k)) || "Titan";
    const finish = ($("#finish") || {}).value || "", name = (($("#name") || {}).value || "").trim(), m = /CX\d{6}/.exec(($("#tgBtn") || {}).href || "");
    const d = new Date(), date = d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear();
    const W = 1080, H = 1920, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
    const bg = x.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#0a0b0f"); bg.addColorStop(.6, "#14110a"); bg.addColorStop(1, "#1d160a"); x.fillStyle = bg; x.fillRect(0, 0, W, H);
    const gl2 = x.createRadialGradient(W / 2, 820, 40, W / 2, 820, 760); gl2.addColorStop(0, "rgba(201,168,106,.42)"); gl2.addColorStop(1, "rgba(201,168,106,0)"); x.fillStyle = gl2; x.fillRect(0, 0, W, H);
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 110; i++) { x.fillStyle = `rgba(232,211,160,${(rnd() * .5 + .1).toFixed(2)})`; x.beginPath(); x.arc(rnd() * W, rnd() * H, rnd() * 2.4 + .6, 0, 7); x.fill(); }
    x.textAlign = "center"; x.fillStyle = "#e8d3a0"; x.font = "800 54px Arial, sans-serif"; spaced(x, "CHRONEX", W / 2, 150, 18);
    x.fillStyle = "#9097a8"; x.font = "26px Arial, sans-serif"; spaced(x, "TIME. REDEFINED.", W / 2, 200, 8);
    const img = new Image();
    return new Promise((resolve, reject) => {
      img.onload = () => {
        x.shadowColor = "rgba(0,0,0,.6)"; x.shadowBlur = 60; x.shadowOffsetY = 30; x.drawImage(img, W / 2 - 450, 370, 900, 900); x.shadowColor = "transparent";
        x.fillStyle = "#f2f3f7"; x.font = "700 62px Arial, sans-serif"; x.fillText("Mening Chronex'im", W / 2, 1400);
        const g = x.createLinearGradient(W / 2 - 300, 0, W / 2 + 300, 0); g.addColorStop(0, "#f6e6bb"); g.addColorStop(.5, "#c9a86a"); g.addColorStop(1, "#e8cb88"); x.fillStyle = g; x.font = "800 96px Arial, sans-serif"; x.fillText(modelVal, W / 2, 1520);
        x.fillStyle = "#cfc8ba"; x.font = "40px Arial, sans-serif"; if (finish) x.fillText(finish, W / 2, 1585);
        if (name) { x.fillStyle = "#f2f3f7"; x.font = "600 50px Arial, sans-serif"; x.fillText(name, W / 2, 1690); }
        x.fillStyle = "#9097a8"; x.font = "30px Arial, sans-serif"; x.fillText(`${date}${m ? " · #" + m[0] : ""} · buyurtma so'rovi`, W / 2, 1750);
        x.strokeStyle = "rgba(201,168,106,.5)"; x.lineWidth = 3; x.strokeRect(36, 36, W - 72, H - 72);
        x.fillStyle = "#c9a86a"; x.font = "28px Arial, sans-serif"; x.fillText("@" + TG(), W / 2, 1850);
        c.toBlob(b => b ? resolve(b) : reject(new Error("blob")), "image/png");
      };
      img.onerror = () => reject(new Error("img"));
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(faceImgSVG(THEMES[key]));
    });
  }
  const done = $("#done");
  if (done && !$("#cx19Card")) {
    const b = document.createElement("button"); b.type = "button"; b.id = "cx19Card"; b.className = "link"; b.style.cssText = "display:block;margin:12px auto 0"; b.textContent = "🎴 Chronex kartamni yaratish";
    const back = $("#backBtn"); if (back) back.before(b); else done.appendChild(b);
    b.onclick = async () => {
      b.disabled = true; b.textContent = "Yaratilmoqda...";
      try {
        const blob = await makeCard(), file = new File([blob], "mening-chronex.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: "Mening Chronex'im" }); award("card"); b.disabled = false; b.textContent = "🎴 Chronex kartamni yaratish"; return; } catch (e) {} }
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "mening-chronex.png"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        toast("Karta yuklab olindi ✓"); award("card");
      } catch (e) { toast("Kartani yaratib bo'lmadi"); }
      b.disabled = false; b.textContent = "🎴 Chronex kartamni yaratish";
    };
  }

  /* ================================================================
     3) YUTUQLAR
     ================================================================ */
  // exists: shu element sahifada bo'lsagina yutuq hisobga olinadi (modul o'chirilgan bo'lsa chiqmaydi)
  const ACH = [
    { id: "lamp", ic: "💡", t: "Chiroqni yoqdi", d: "Chronex Club lampasining shnurini torting", exists: "#cx12S" },
    { id: "gears", ic: "⚙️", t: "Mexanizm ustasi", d: "O'yinxonada tishli g'ildiraklarni yig'ing", exists: "#cx16St" },
    { id: "scratch", ic: "🎟", t: "Oltin qatlam", d: "Qirib ochiladigan sovrinni oching", exists: "#cx16Cp" },
    { id: "d3", ic: "🔄", t: "Har tomondan", d: "3D soatni sudrab aylantiring", exists: "#cx10St" },
    { id: "chrono", ic: "⏱", t: "Xronograf", d: "Xronografni ishga tushiring", exists: "#cx15Go" },
    { id: "cam", ic: "📷", t: "Bilakda", d: "Kamerada yoki rasmda soatni sinang", exists: "#cx15Cam" },
    { id: "dial", ic: "🎨", t: "Dizayner", d: "Siferblat studiyasida dizayn yarating", exists: "#cx9DAdd" },
    { id: "wiz", ic: "🎁", t: "Sovg'a tanlovchi", d: "Sovg'a maslahatchisini oching", exists: "#cx14GiftBtn" },
    { id: "search", ic: "🔍", t: "Tezkor qidiruv", d: "Ctrl+K qidiruv oynasini oching", exists: ".cx10-pal" },
    { id: "cord", ic: "🌗", t: "Shnur ustasi", d: "Menyudagi shnur bilan mavzuni almashtiring", exists: ".cx13-cord" },
    { id: "dust", ic: "✨", t: "Vaqt zarrachalari", d: "Zarrachali soatni bosib sochib yuboring", exists: "#cx15Cv" },
    { id: "card", ic: "🎴", t: "Mening kartam", d: "Buyurtmadan keyin Chronex kartasini yarating", exists: "#cx19Card" }
  ];
  let got = store.get("cx19_ach", []);
  const avail = () => ACH.filter(a => $(a.exists));
  const rewardOn = () => REWARD.on && Date.now() < new Date(REWARD.until).getTime();

  const nav = $(".nav"), burger = $("#burger");
  let pill = null;
  if (nav) {
    pill = document.createElement("button"); pill.type = "button"; pill.className = "cx19-tro"; pill.setAttribute("aria-label", "Yutuqlar");
    nav.insertBefore(pill, burger || null); pill.onclick = openModal;
  }
  function paint() { if (pill) { const av = avail(); pill.textContent = `🏆 ${av.filter(a => got.includes(a.id)).length}/${av.length}`; } }
  function award(id) {
    if (got.includes(id)) return;
    const a = ACH.find(x => x.id === id); if (!a) return;
    got.push(id); store.set("cx19_ach", got); paint();
    toast(`🏆 Yutuq: ${a.t}`); if (pill) { pill.classList.remove("pop"); void pill.offsetWidth; pill.classList.add("pop"); }
    const av = avail(); if (av.length >= 4 && av.every(x => got.includes(x.id))) setTimeout(() => { toast("🎉 Hamma yutuq yig'ildi! 🏆 ni bosing"); }, 1800);
  }
  function openModal() {
    const av = avail(), n = av.filter(a => got.includes(a.id)).length, all = av.length >= 4 && n === av.length;
    const m = document.createElement("div"); m.className = "cx19-modal";
    m.innerHTML = `<div class="cx19-box" role="dialog" aria-modal="true" aria-label="Yutuqlar"><button class="cx19-x" type="button" aria-label="Yopish">×</button>
      <h3>Yutuqlar: ${n} / ${av.length}</h3><div class="cx19-bar"><i style="width:${av.length ? n / av.length * 100 : 0}%"></i></div>
      <div class="cx19-list">${av.map(a => `<div class="cx19-a${got.includes(a.id) ? " ok" : ""}"><span>${a.ic}</span><div><b>${esc(a.t)}</b><small>${esc(a.d)}</small></div></div>`).join("")}</div>
      ${all && rewardOn() ? `<div class="cx19-rw"><div>🎉 Sovrin ochildi</div><b>${esc(REWARD.code)}</b><div>−${REWARD.pct}% chegirma promo-kodi</div><button class="btn btn-sm" type="button" data-copy>Nusxalash va buyurtmaga o'tish</button></div><div class="cx19-note">Kod hammaga bir xil va ${esc(new Date(REWARD.until).toLocaleDateString("ru-RU"))} gacha amal qiladi.</div>`
        : rewardOn() ? `<div class="cx19-note">Hamma yutuqni yig'sangiz, promo-kod ochiladi.</div>` : ""}</div>`;
    document.body.appendChild(m); document.body.style.overflow = "hidden";
    const close = () => { m.remove(); document.body.style.overflow = ""; removeEventListener("keydown", onKey); };
    const onKey = e => { if (e.key === "Escape") close(); }; addEventListener("keydown", onKey);
    m.addEventListener("click", async e => {
      if (e.target === m || e.target.closest(".cx19-x")) { close(); return; }
      if (e.target.closest("[data-copy]")) { try { await navigator.clipboard.writeText(REWARD.code); toast("Kod nusxalandi ✓"); } catch (er) { toast("Kodni qo'lda nusxalang: " + REWARD.code); } close(); const o = $("#order"); if (o) o.scrollIntoView({ behavior: "smooth" }); }
    });
  }

  // aniqlash qoidalari (hodisa delegatsiyasi: boshqa fayllarga tegmaydi)
  const CLICKS = [["chrono", "#cx15Go, #chP1"], ["cam", "#cx15Cam"], ["dial", "#cx9DAdd, #cx9DPng, #cx9DRnd"], ["wiz", "#cx14GiftBtn"], ["search", ".cx10-sbtn"]];
  document.addEventListener("click", e => { CLICKS.forEach(([id, sel]) => { if (e.target.closest && e.target.closest(sel)) award(id); }); }, true);
  document.addEventListener("pointerdown", e => {
    if (e.target.closest && e.target.closest("#cx10St")) award("d3");
    if (e.target.closest && e.target.closest("#cx15Cv")) award("dust");
  }, true);
  let themeBefore = "";
  const themeState = () => document.documentElement.className + "|" + (document.documentElement.dataset.theme || "");
  document.addEventListener("pointerdown", e => { if (e.target.closest && e.target.closest(".cx13-cord")) themeBefore = themeState(); }, true);
  document.addEventListener("pointerup", e => { if (e.target.closest && e.target.closest(".cx13-cord")) setTimeout(() => { if (themeState() !== themeBefore) award("cord"); }, 450); }, true);
  addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") award("search"); }, true);
  // holat o'zgarishlarini kuzatish
  function watch(sel, opts, test, id) {
    let tries = 0;
    const iv = setInterval(() => {
      const el = $(sel); if (!el) { if (++tries > 30) clearInterval(iv); return; }
      clearInterval(iv); const mo = new MutationObserver(() => { if (test(el)) { award(id); } }); mo.observe(el, opts); if (test(el)) award(id);
    }, 500);
  }
  watch("#cx12S", { attributes: true, attributeFilter: ["data-on"] }, el => el.dataset.on === "true", "lamp");
  watch("#cx16St", { childList: true, characterData: true, subtree: true }, el => /Mexanizm ishlayapti/.test(el.textContent), "gears");
  watch("#cx16Cp", { attributes: true, attributeFilter: ["hidden"] }, el => !el.hidden, "scratch");
  addEventListener("chronex:ready", paint);
  paint(); setTimeout(paint, 1200); setTimeout(paint, 3500);
})();