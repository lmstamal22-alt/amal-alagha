/* Zoo enhancements. Pure add-on: no API keys; audio/video are static files.
   If a media file is missing the feature simply stays hidden. */
(() => {
"use strict";
const $ = id => document.getElementById(id);
const LS_MUTE = "great-zoo-muted-v1", PROGRESS = "great-zoo-unit4-progress-v1", LANG = "great-zoo-language";
const AVATAR = "🦜";
const lang = () => document.documentElement.lang === "en" ? "en" : "ar";

/* ---- narration manifest: file -> English line + Arabic gloss ---- */
const CLIPS = {
  welcome:  ["Hello, explorer! Welcome to The Great Zoo Adventure! Let's meet the animals. Ready? Let's go!", "أهلًا أيها المستكشف! مرحبًا بك في مغامرة حديقة الحيوانات. هيا نتعرّف على الحيوانات!"],
  lesson0:  ["The magic zoo gate is open! Let's start our adventure.", "بوابة الحديقة السحرية مفتوحة! لنبدأ المغامرة."],
  lesson1:  ["Lesson one! Meet the animals. Click the plus buttons, listen, and say the names with me!", "الحصة الأولى: تعرّف على الحيوانات. اضغط على علامة +، واستمع، وكرّر الأسماء معي."],
  lesson2:  ["Lesson two! Is it big or small? Look at the animals and count with me.", "الحصة الثانية: كبير أم صغير؟ انظر إلى الحيوانات وعُدّ معي."],
  lesson3:  ["Lesson three! Colours and numbers. Listen, match, and count. You can do it!", "الحصة الثالثة: الألوان والأعداد. استمع وطابِق وعُدّ. أنت قادر!"],
  lesson4:  ["Lesson four! Read the zoo words and finish the letters. Take your time!", "الحصة الرابعة: اقرأ كلمات الحديقة وأكمل الحروف. خذ وقتك."],
  lesson5:  ["Lesson five! Fast or slow? Listen and tell me how the animals move.", "الحصة الخامسة: سريع أم بطيء؟ استمع وصف حركة الحيوانات."],
  lesson6:  ["Lesson six! The final zoo mission! Show me everything you learned. I believe in you!", "الحصة السادسة: تحدّي الحديقة الأخير! أرني ما تعلّمته. أنا أثق بك."],
  dialogue: ["Let's listen to Layan and Nour at the zoo gate. Then it's your turn!", "لنستمع إلى ليان ونور عند بوابة الحديقة، ثم يأتي دورك!"],
  cheer1:   ["Great job!", "عمل رائع!"],
  cheer2:   ["Wow, that's right!", "رائع! إجابة صحيحة!"],
  cheer3:   ["Fantastic! You're a star!", "مذهل! أنت نجم!"],
  cheer4:   ["Yes! Well done, explorer!", "أحسنت أيها المستكشف!"],
  try1:     ["Oops! Try again. You can do it!", "حاول مرة ثانية. أنت قادر!"],
  try2:     ["Almost! Listen and try one more time.", "قريب! استمع وجرّب مرة أخرى."],
  try3:     ["Not yet. Let's try again together!", "ليس بعد. لنحاول معًا!"],
  complete: ["Hooray! Lesson complete! You earned a star!", "يا سلام! أنهيتَ الحصة وربحتَ نجمة!"],
  final:    ["You finished the whole adventure! You are a real zoo explorer. Congratulations!", "أنهيتَ المغامرة كلها! أنت مستكشف حقيقي. مبروك!"]
};
const src = name => "audio/guide/" + name + ".mp3";

/* ---- audio engine ---- */
let muted = false, interacted = false, speaking = null, token = 0;
try { muted = localStorage.getItem(LS_MUTE) === "1"; } catch {}
const player = new Audio(); player.preload = "auto";
const exists = new Map();
function probe(name) {
  if (!exists.has(name)) {
    exists.set(name, fetch(src(name), { method: "HEAD" }).then(r => r.ok).catch(() => false));
  }
  return exists.get(name);
}
let lastClip = null;
async function say(name, { force = false } = {}) {
  if (!CLIPS[name]) return false;
  lastClip = name;
  showCaption(name);
  if (muted && !force) return false;
  if (!(await probe(name))) { setSpeaking(false); return false; }
  const mine = ++token;
  player.pause(); player.src = src(name); player.currentTime = 0;
  try { await player.play(); if (mine === token) setSpeaking(true); return true; }
  catch { setSpeaking(false); return false; }
}
const pick = (prefix, n) => prefix + (1 + Math.floor(Math.random() * n));
player.addEventListener("ended", () => setSpeaking(false));
player.addEventListener("pause", () => setSpeaking(false));
player.addEventListener("error", () => setSpeaking(false));

/* ---- synthesized celebration sounds (no files needed) ---- */
let ac;
function tone(freqs, { dur = .16, gap = .11, type = "triangle", vol = .13 } = {}) {
  if (muted) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach((f, i) => {
      const t0 = ac.currentTime + i * gap, o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + .02);
      g.gain.exponentialRampToValueAtTime(.0001, t0 + dur + .1);
      o.connect(g).connect(ac.destination); o.start(t0); o.stop(t0 + dur + .12);
    });
  } catch {}
}
const chimeOk = () => tone([523, 659, 784, 1047]);
const chimeNo = () => tone([330, 262], { type: "sine", gap: .18, vol: .1 });
const fanfare = () => tone([523, 523, 659, 784, 659, 784, 1047], { gap: .12, dur: .2 });

/* ---- guide widget ---- */
const guide = document.createElement("div");
guide.className = "zoo-guide"; guide.setAttribute("role", "region");
guide.setAttribute("aria-label", "مرشدة المغامرة / Zoo guide");
guide.innerHTML = '<div class="zoo-avatar" aria-hidden="true">' + AVATAR + '</div>' +
  '<div class="zoo-bubble"><p class="zoo-caption" aria-live="polite"><b></b><span></span></p>' +
  '<div class="zoo-ctrl"><button type="button" data-a="play"></button><button type="button" data-a="replay"></button><button type="button" data-a="mute" aria-pressed="false"></button></div></div>';
const cap = guide.querySelector(".zoo-caption"), capEn = cap.querySelector("b"), capAr = cap.querySelector("span");
const btnPlay = guide.querySelector('[data-a="play"]'), btnReplay = guide.querySelector('[data-a="replay"]'), btnMute = guide.querySelector('[data-a="mute"]');
function labels() {
  const ar = lang() === "ar";
  btnPlay.textContent = player.paused ? "▶" : "⏸"; btnPlay.setAttribute("aria-label", ar ? (player.paused ? "تشغيل" : "إيقاف مؤقت") : (player.paused ? "Play" : "Pause"));
  btnReplay.textContent = "🔁"; btnReplay.setAttribute("aria-label", ar ? "إعادة الاستماع" : "Listen again");
  btnMute.textContent = muted ? "🔇" : "🔊"; btnMute.setAttribute("aria-label", ar ? (muted ? "إلغاء الكتم" : "كتم الصوت") : (muted ? "Unmute" : "Mute"));
  btnMute.setAttribute("aria-pressed", String(muted));
  capAr.hidden = lang() === "en";
}
function setSpeaking(on) { guide.dataset.speaking = String(on); labels(); }
function showCaption(name) { capEn.textContent = CLIPS[name][0]; capAr.textContent = CLIPS[name][1]; capEn.lang = "en"; }
btnPlay.addEventListener("click", () => { interacted = true; if (!player.paused) player.pause(); else if (player.src && player.currentTime > 0 && !player.ended) player.play().then(() => setSpeaking(true)).catch(() => {}); else say(lastClip || "welcome", { force: true }); });
btnReplay.addEventListener("click", () => { interacted = true; say(lastClip || "welcome", { force: true }); });
btnMute.addEventListener("click", () => {
  muted = !muted; try { localStorage.setItem(LS_MUTE, muted ? "1" : "0"); } catch {}
  if (muted) player.pause();
  labels();
});

/* ---- confetti stars ---- */
function confetti(n = 70) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let c = $("zoo-confetti");
  if (!c) { c = document.createElement("canvas"); c.id = "zoo-confetti"; c.setAttribute("aria-hidden", "true"); document.body.append(c); }
  const x = c.getContext("2d"); c.width = innerWidth; c.height = innerHeight;
  const cols = ["#f0c66f", "#e9573f", "#3aa675", "#4a90d9", "#e66fa7"];
  const ps = Array.from({ length: n }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 200, y: innerHeight * .4, vx: (Math.random() - .5) * 12, vy: -Math.random() * 12 - 3, r: 6 + Math.random() * 8, a: Math.random() * 6, col: cols[Math.floor(Math.random() * cols.length)] }));
  const t0 = performance.now();
  (function frame(t) {
    const k = (t - t0) / 1900; x.clearRect(0, 0, c.width, c.height);
    if (k >= 1) return x.clearRect(0, 0, c.width, c.height);
    for (const p of ps) {
      p.vy += .35; p.x += p.vx; p.y += p.vy; p.a += .15;
      x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.globalAlpha = 1 - k; x.fillStyle = p.col; x.beginPath();
      for (let i = 0; i < 10; i++) { const rr = i % 2 ? p.r / 2.3 : p.r, ang = i * Math.PI / 5 - Math.PI / 2; x.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr); }
      x.closePath(); x.fill(); x.restore();
    }
    requestAnimationFrame(frame);
  })(t0);
}
function toast(text) { const d = document.createElement("div"); d.className = "zoo-toast"; d.setAttribute("role", "status"); d.textContent = text; document.body.append(d); setTimeout(() => d.remove(), 2700); }

/* ---- passport badges ---- */
const MEDALS = ["🦁", "🐘", "🌈", "✏️", "🐆", "🏆"];
const badges = document.createElement("div"); badges.className = "zoo-badges"; badges.setAttribute("role", "list");
function done() { try { return new Set(JSON.parse(localStorage.getItem(PROGRESS) || "[]")); } catch { return new Set(); } }
let shown = done();
function renderBadges(popIndex) {
  const d = done();
  badges.replaceChildren(...MEDALS.map((m, i) => {
    const s = document.createElement("span"); s.textContent = m; s.setAttribute("role", "listitem");
    s.dataset.on = String(d.has(i + 1));
    s.setAttribute("aria-label", (lang() === "ar" ? "وسام الحصة " : "Lesson badge ") + (i + 1) + (d.has(i + 1) ? " ✓" : ""));
    if (popIndex === i + 1) s.className = "pop";
    return s;
  }));
  shown = d; mountVideos();
}

/* ---- videos (hidden until the file exists) ---- */
const VIDEOS = {
  intro: ["video/intro.mp4", "🎬 شاهد بداية المغامرة", "🎬 Watch the adventure begin"],
  animals: ["video/animals.mp4", "🎬 تعرّف على الحيوانات", "🎬 Meet the animals"],
  final: ["video/final.mp4", "🎬 التحدّي الأخير", "🎬 The final mission"],
  certificate: ["video/certificate.mp4", "🏆 احتفال الشهادة", "🏆 Certificate celebration"]
};
async function mountVideo(key, host, before) {
  if (!host || host.querySelector('[data-zoo-video="' + key + '"]')) return;
  const [file, ar, en] = VIDEOS[key];
  if (!(await fetch(file, { method: "HEAD" }).then(r => r.ok).catch(() => false))) return;
  if (host.querySelector('[data-zoo-video="' + key + '"]')) return;
  const box = document.createElement("section"); box.className = "zoo-video"; box.dataset.zooVideo = key;
  const h = document.createElement("h3"); h.textContent = lang() === "ar" ? ar : en;
  const v = document.createElement("video"); v.controls = true; v.preload = "metadata"; v.playsInline = true; v.src = file;
  v.addEventListener("play", () => player.pause());
  box.append(h, v); before ? host.insertBefore(box, before) : host.append(box);
}
function mountVideos() {
  const hero = document.querySelector("#home .hero");
  if (hero) { mountVideo("intro", hero.parentElement, hero.nextSibling); if (done().size >= 6) mountVideo("certificate", hero.parentElement, hero.nextSibling); }
  const frame = $("lesson-frame");
  if (frame && !$("activity").hidden) {
    const cur = Number((location.hash.match(/^#lesson-(\d)$/) || [])[1]);
    document.querySelectorAll('#activity [data-zoo-video]').forEach(n => n.remove());
    if (cur === 1) mountVideo("animals", frame.parentElement, frame);
    if (cur === 6) mountVideo("final", frame.parentElement, frame);
  }
}

/* ---- wiring ---- */
function init() {
  document.body.append(guide); labels(); showCaption("welcome");
  /* animated background */
  const bg = document.createElement("div"); bg.className = "zoo-bg"; bg.setAttribute("aria-hidden", "true");
  const icons = ["🍃", "⭐", "🐾", "🦋", "🌿", "✨"];
  for (let i = 0; i < 14; i++) { const e = document.createElement("i"); e.textContent = icons[i % icons.length]; e.style.cssText = "inset-inline-start:" + (Math.random() * 96) + "%;font-size:" + (16 + Math.random() * 20) + "px;animation-duration:" + (16 + Math.random() * 18) + "s;animation-delay:-" + (Math.random() * 20) + "s"; bg.append(e); }
  document.body.prepend(bg);
  /* badges in passport */
  const passport = document.querySelector(".passport"); if (passport) passport.append(badges);
  renderBadges();
  /* first user gesture unlocks autoplay */
  addEventListener("pointerdown", () => { interacted = true; }, { once: true, capture: true });
  addEventListener("keydown", () => { interacted = true; }, { once: true, capture: true });
  /* lesson narration on route change */
  document.addEventListener("zoo:route", () => {
    const m = location.hash.match(/^#lesson-([0-6])$/);
    if (m) { if (interacted) say("lesson" + m[1]); else showCaption("lesson" + m[1]); lastClip = "lesson" + m[1]; }
    else { showCaption("welcome"); lastClip = "welcome"; }
    mountVideos(); labels();
  });
  /* replace old welcome clip when the new one exists */
  const welcome = $("welcome");
  if (welcome) welcome.addEventListener("click", async e => {
    if (await probe("welcome")) { e.stopImmediatePropagation(); if (!player.paused) player.pause(); else say("welcome", { force: true }); }
  }, true);
  /* dialogue intro + feedback */
  document.querySelectorAll('[data-dialog="dialogue"]').forEach(b => b.addEventListener("click", () => { interacted = true; say("dialogue"); }));
  const fb = $("dialogue-feedback");
  if (fb) new MutationObserver(() => {
    const s = fb.textContent;
    if (/صحيحة|Correct/i.test(s)) { chimeOk(); confetti(30); say(pick("cheer", 4)); }
    else if (/جرّب|Try again/i.test(s)) { chimeNo(); say(pick("try", 3)); }
  }).observe(fb, { childList: true, characterData: true, subtree: true });
  /* lesson complete celebration */
  const complete = $("complete");
  if (complete) complete.addEventListener("click", () => {
    if (complete.disabled) return;
    const m = location.hash.match(/^#lesson-([1-6])$/); if (!m) return;
    const n = Number(m[1]); const before = done();
    setTimeout(() => {
      if (!done().has(n) || before.has(n)) return;
      renderBadges(n); confetti(n === 6 || done().size >= 6 ? 140 : 70);
      if (done().size >= 6) { fanfare(); toast(lang() === "ar" ? "🏆 أنهيتَ المغامرة! مبروك!" : "🏆 Adventure complete! Congratulations!"); say("final"); }
      else { chimeOk(); toast(lang() === "ar" ? "⭐ حصة مكتملة! ربحتَ وسامًا!" : "⭐ Lesson complete! You earned a badge!"); say("complete"); }
    }, 60);
  }, true);
  /* language switch + reset */
  const langBtn = $("language"); if (langBtn) langBtn.addEventListener("click", () => setTimeout(() => { labels(); renderBadges(); document.querySelectorAll("[data-zoo-video]").forEach(n => n.remove()); mountVideos(); }, 80));
  const reset = $("reset"); if (reset) reset.addEventListener("click", () => setTimeout(renderBadges, 120));
  mountVideos();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
