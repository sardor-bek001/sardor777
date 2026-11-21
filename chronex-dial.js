/* ===== CHRONEX chronex-all.js =====
   BITTA QATOR hamma qo'shimchalarni to'g'ri tartibda yuklaydi:
       <script src="./chronex-all.js"></script>        (</body> dan oldin, script.js dan KEYIN)

   Ikkita eski skript tegi o'rniga shu bittasi yetadi. Hamma fayllar shu fayl bilan bir papkada bo'lishi kerak.

   MODULLARNI O'CHIRISH: tegga data-off yozing, masalan
       <script src="./chronex-all.js" data-off="wow,epic,intro"></script>
   Modul nomlari: intro, hero, lab, plus, max, flow, pro, ultra, wow, epic, lamp, cord, dock, tgfix

   AVTOMATIK YENGIL REJIM: zaif qurilmada (kam xotira/protsessor, trafik tejash yoqilgan) yoki ?lite=1 bilan
   og'ir modullar (intro, wow, epic) yuklanmaydi. ?lite=0 yozsangiz, har doim to'liq yuklanadi.
   TEKSHIRUV: manzilga ?debug=1 qo'shsangiz, pastda qaysi modul yuklangani ko'rsatiladi. */
(function () {
  "use strict";
  if (window.CHRONEX) return;

  const me = document.currentScript, src = (me && me.src) || "", base = src ? src.replace(/[^\/]*$/, "") : "./";
  const off = ((me && me.getAttribute("data-off")) || "").split(",").map(s => s.trim()).filter(Boolean);
  const q = new URLSearchParams(location.search);
  const forceFull = q.get("lite") === "0";
  const lite = !forceFull && (q.get("lite") === "1" || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) ||
    (navigator.deviceMemory && navigator.deviceMemory <= 2) || !!(navigator.connection && navigator.connection.saveData));
  const debug = q.get("debug") === "1";

  // [nom, fayl, og'ir]
  const MODULES = [
    ["intro", "chronex-intro.js", true], ["hero", "hero-watch.js", false], ["lab", "chronex-lab.js", false], ["plus", "chronex-plus.js", false],
    ["max", "chronex-max.js", false], ["flow", "chronex-flow.js", false], ["pro", "chronex-pro.js", false], ["ultra", "chronex-ultra.js", false],
    ["wow", "chronex-wow.js", true], ["epic", "chronex-epic.js", true], ["lamp", "chronex-lamp.js", false], ["cord", "chronex-cord.js", false],
    ["dock", "chronex-dock.js", false], ["tgfix", "tg-fix.js", false]
  ];
  const state = { loaded: [], failed: [], skipped: [], lite: lite, base: base };
  window.CHRONEX = state;

  const todo = MODULES.filter(m => {
    if (off.includes(m[0])) { state.skipped.push(m[0] + " (o'chirilgan)"); return false; }
    if (lite && m[2]) { state.skipped.push(m[0] + " (yengil rejim)"); return false; }
    return true;
  });

  // Bo'limlar tartibi: modullar qo'shgan bo'limlarni mantiqiy joyga qo'yadi
  function arrange() {
    const SLOTS = [
      ["collection", ["cx16Cine"]],
      ["technology", ["cx14Build", "cx9Studio", "cx10Viewer", "cx15Lab", "advisor", "lab", "cx11Tools"]],
      ["story", ["cx15Dust"]],
      ["cta", ["cx16Game", "cx12Club"]]
    ];
    SLOTS.forEach(([anchor, ids]) => {
      let prev = document.getElementById(anchor); if (!prev) return;
      ids.forEach(id => { const el = document.getElementById(id); if (el && el !== prev) { prev.after(el); prev = el; } });
    });
  }

  let left = todo.length;
  function done() {
    if (--left > 0) return;
    try { arrange(); } catch (e) { console.warn("[Chronex] bo'limlarni tartiblashda xato", e); }
    if (state.failed.length) console.warn("[Chronex] yuklanmagan fayllar:", state.failed.join(", "), "— fayllar", base, "papkasida bo'lishi kerak.");
    window.dispatchEvent(new CustomEvent("chronex:ready", { detail: state }));
    if (debug) panel();
  }
  function panel() {
    const p = document.createElement("div");
    p.style.cssText = "position:fixed;left:10px;bottom:10px;z-index:3000;max-width:340px;background:#0e1016;color:#f2f3f7;border:1px solid #c9a86a;border-radius:12px;padding:12px 14px;font:12px/1.5 monospace";
    p.innerHTML = `<b>Chronex</b> (${lite ? "yengil rejim" : "to'liq"})<br>✔ ${state.loaded.join(", ") || "—"}<br>${state.failed.length ? "✖ " + state.failed.join(", ") + "<br>" : ""}${state.skipped.length ? "⏭ " + state.skipped.join(", ") : ""}`;
    p.onclick = () => p.remove(); document.body.appendChild(p);
  }
  if (!todo.length) { done.call(null); }
  todo.forEach(m => {
    const s = document.createElement("script");
    s.src = base + m[1]; s.async = false;           // parallel yuklanadi, lekin tartib bilan ishga tushadi
    s.onload = () => { state.loaded.push(m[0]); done(); };
    s.onerror = () => { state.failed.push(m[1]); done(); };
    document.body.appendChild(s);
  });
})();