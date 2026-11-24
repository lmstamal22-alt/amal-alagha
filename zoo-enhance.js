/* Zoo enhancements. Pure add-on: no API keys; audio/video are static files.
   If a media file is missing the feature simply stays hidden. */
(() => {
"use strict";
const $ = id => document.getElementById(id);
const LS_MUTE = "great-zoo-muted-v1", PROGRESS = "great-zoo-unit4-progress-v1", LANG = "great-zoo-language";
const AVATAR = "<svg class=\"leo\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\" role=\"img\" aria-label=\"Leo the lion cub\">\n<g class=\"leo-body\">\n<g fill=\"#e08a2c\"><circle cx=\"50\" cy=\"12\" r=\"14\"/><circle cx=\"76\" cy=\"20\" r=\"14\"/><circle cx=\"88\" cy=\"46\" r=\"14\"/><circle cx=\"80\" cy=\"74\" r=\"14\"/><circle cx=\"50\" cy=\"88\" r=\"14\"/><circle cx=\"20\" cy=\"74\" r=\"14\"/><circle cx=\"12\" cy=\"46\" r=\"14\"/><circle cx=\"24\" cy=\"20\" r=\"14\"/></g>\n<g fill=\"#c46f1b\"><circle cx=\"50\" cy=\"16\" r=\"9\"/><circle cx=\"84\" cy=\"52\" r=\"9\"/><circle cx=\"16\" cy=\"52\" r=\"9\"/></g>\n<circle cx=\"50\" cy=\"52\" r=\"34\" fill=\"#f6c25b\"/>\n<circle cx=\"25\" cy=\"30\" r=\"9\" fill=\"#f6c25b\"/><circle cx=\"75\" cy=\"30\" r=\"9\" fill=\"#f6c25b\"/>\n<circle cx=\"25\" cy=\"30\" r=\"5\" fill=\"#f4a9a0\"/><circle cx=\"75\" cy=\"30\" r=\"5\" fill=\"#f4a9a0\"/>\n<ellipse cx=\"50\" cy=\"62\" rx=\"19\" ry=\"15\" fill=\"#fff0cf\"/>\n<g class=\"leo-eyes\"><ellipse cx=\"37\" cy=\"47\" rx=\"6.5\" ry=\"7.5\" fill=\"#fff\"/><ellipse cx=\"63\" cy=\"47\" rx=\"6.5\" ry=\"7.5\" fill=\"#fff\"/>\n<circle cx=\"38.5\" cy=\"48\" r=\"3.8\" fill=\"#3a2410\"/><circle cx=\"61.5\" cy=\"48\" r=\"3.8\" fill=\"#3a2410\"/>\n<circle cx=\"39.8\" cy=\"46.3\" r=\"1.3\" fill=\"#fff\"/><circle cx=\"62.8\" cy=\"46.3\" r=\"1.3\" fill=\"#fff\"/></g>\n<circle cx=\"29\" cy=\"60\" r=\"4.5\" fill=\"#f4a9a0\" opacity=\".7\"/><circle cx=\"71\" cy=\"60\" r=\"4.5\" fill=\"#f4a9a0\" opacity=\".7\"/>\n<path d=\"M45 55 h10 l-5 6 z\" fill=\"#d9665b\"/>\n<path d=\"M50 61 v3\" stroke=\"#7a3d2a\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n<g class=\"leo-mouth\"><path d=\"M41 65 Q50 75 59 65 Q50 70 41 65 Z\" fill=\"#7a2f2a\" stroke=\"#7a3d2a\" stroke-width=\"2\" stroke-linejoin=\"round\"/><path d=\"M44 68.5 Q50 73 56 68.5 Q50 71 44 68.5Z\" fill=\"#ec8f8f\"/></g>\n</g></svg>";
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
/* ---- per-page narration (Leo explains every lesson page) ---- */
const PAGE_LINES = {"0-0": ["Hi, I'm Leo! This is the magic zoo gate. Press play, then click next to start!", "أهلًا، أنا ليو! هذه بوابة الحديقة السحرية. اضغط تشغيل ثم التالي لنبدأ!"], "0-1": ["Look at the map! There are six stations. Win stars for your passport!", "انظر إلى الخريطة! فيها ست محطات. اربح نجومًا لجواز المستكشف!"], "1-0": ["Meet my animal friends! Click the plus buttons to hear each animal.", "تعرّف على أصدقائي الحيوانات! اضغط على زر + لتسمع كل حيوان."], "1-1": ["Listen carefully. Which animal do you hear? Click the right one.", "استمع جيدًا. أي حيوان تسمع؟ اضغط على الصحيح."], "1-2": ["I am a shadow! Who am I? Look at my shape and choose.", "أنا ظلّ! من أنا؟ انظر إلى شكلي واختر."], "1-3": ["Press record. Say the three sentences, then listen to your voice.", "اضغط تسجيل. قل الجمل الثلاث ثم استمع إلى صوتك."], "1-4": ["Show me what you know! Win three stars!", "أرني ماذا تعرف! اربح ثلاث نجوم!"], "2-0": ["Big, small and very big! Look at the animals and read the sentences.", "كبير وصغير وكبير جدًا! انظر إلى الحيوانات واقرأ الجمل."], "2-1": ["Is the animal big or small? Listen and check your answers.", "هل الحيوان كبير أم صغير؟ استمع وتحقق من إجاباتك."], "2-2": ["Let's count the legs! No legs, two legs or four legs?", "هيا نعدّ الأرجل! بلا أرجل أم رجلان أم أربع أرجل؟"], "2-3": ["Drag the words to finish the sentences. Then say them.", "اسحب الكلمات لتكمل الجمل. ثم انطقها."], "2-4": ["This is my zoo! Help me choose the right words.", "هذه حديقتي! ساعدني في اختيار الكلمات الصحيحة."], "2-5": ["Read the clues and find the animal!", "اقرأ التلميحات واعثر على الحيوان!"], "3-0": ["The zoo is full of colours and numbers! Listen and learn.", "الحديقة مليئة بالألوان والأعداد! استمع وتعلّم."], "3-1": ["Listen to the colour. Click the right circle.", "استمع إلى اللون. اضغط على الدائرة الصحيحة."], "3-2": ["What colour is the monkey? Say it, then check your answers.", "ما لون القرد؟ قلها ثم تحقق من إجاباتك."], "3-3": ["Count the animals. How many can you see?", "عُدّ الحيوانات. كم حيوانًا ترى؟"], "3-4": ["Listen, then choose the right number.", "استمع ثم اختر العدد الصحيح."], "3-5": ["Colours and numbers together! Are you ready?", "الألوان والأعداد معًا! هل أنت مستعد؟"], "4-0": ["Let's read and colour! Choose the colours for the picture.", "هيا نقرأ ونلوّن! اختر ألوان الصورة."], "4-1": ["Some letters are missing. Fill in the missing words.", "بعض الحروف ناقصة. أكمل الكلمات الناقصة."], "4-2": ["Solve the number puzzle. Fill in the missing words.", "حلّ لغز الأعداد. أكمل الكلمات الناقصة."], "4-3": ["Complete the colour words, then check your answers.", "أكمل كلمات الألوان ثم تحقق من إجاباتك."], "4-4": ["Copy my sentence in your notebook. Then write your own!", "انسخ جملتي في دفترك. ثم اكتب جملتك أنت!"], "4-5": ["Read and write! Win your stars!", "اقرأ واكتب! اربح نجومك!"], "5-0": ["Some animals are fast. Some animals are slow. Click the plus buttons!", "بعض الحيوانات سريعة وبعضها بطيء. اضغط على أزرار +!"], "5-1": ["Is the animal fast or slow? Choose the right word.", "هل الحيوان سريع أم بطيء؟ اختر الكلمة الصحيحة."], "5-2": ["Ready, steady, go! Who is faster?", "على مهلك، استعد، انطلق! من الأسرع؟"], "5-3": ["Listen and circle the right picture.", "استمع وضع دائرة حول الصورة الصحيحة."], "5-4": ["Let's sing and count with the five small monkeys!", "هيا نغنّي ونعدّ مع القرود الخمسة الصغيرة!"], "5-5": ["Listen and choose! Are you fast and ready?", "استمع واختر! هل أنت سريع ومستعد؟"], "6-0": ["This is the last mission! Let's remember our animal friends.", "هذه آخر مهمة! هيا نتذكر أصدقاءنا الحيوانات."], "6-1": ["Listen and describe the animal. Then check your answers.", "استمع وصِف الحيوان. ثم تحقق من إجاباتك."], "6-2": ["Read the clues. What am I? Fill in the missing words.", "اقرأ التلميحات. من أنا؟ أكمل الكلمات الناقصة."], "6-3": ["Put the words in the right order to make a sentence.", "رتّب الكلمات بالشكل الصحيح لتكوّن جملة."], "6-4": ["Read the clues. Who is the mystery animal?", "اقرأ التلميحات. من هو الحيوان الغامض؟"], "6-5": ["This is the final challenge! Answer all the questions.", "هذا هو التحدي الأخير! أجب عن كل الأسئلة."], "6-6": ["Congratulations! You are a Super Zoo Explorer!", "تهانينا! أنت مستكشف الحديقة الخارق!"], "sum": ["Great job! Check your score, then press the finish button.", "عمل رائع! تحقق من نتيجتك ثم اضغط زر إنهاء الحصة."]};
for (const [k, v] of Object.entries(PAGE_LINES)) CLIPS["pg-" + k] = v;
const PAGE_COUNT = { 0: 2, 1: 5, 2: 6, 3: 6, 4: 6, 5: 6, 6: 7 };
const src = name => "audio/guide/" + name + ".mp3";

/* ---- audio engine ---- */
let muted = false, interacted = false, speaking = null, token = 0;
try { muted = localStorage.getItem(LS_MUTE) === "1"; } catch {}
const player = new Audio(); player.preload = "auto";
const exists = new Map();
function probe(name) {
  if (!exists.has(name)) {
    exists.set(name, new Promise(res => {
      const a = new Audio(); let done = false;
      const fin = v => { if (!done) { done = true; a.removeAttribute("src"); res(v); } };
      a.preload = "metadata"; a.onloadedmetadata = () => fin(true); a.onerror = () => fin(false);
      setTimeout(() => fin(false), 6000); a.src = src(name);
    }));
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
guide.setAttribute("aria-label", "ليو مرافق المغامرة / Leo, your zoo guide");
guide.innerHTML = '<div class="zoo-avatar" aria-hidden="true">' + AVATAR + '</div>' +
  '<div class="zoo-bubble"><div class="zoo-name">ليو · Leo</div><p class="zoo-caption" aria-live="polite"><b></b><span></span></p>' +
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

/* ---- follow the page inside the lesson book ---- */
let lastPageKey = null, pageTimer = null, hookedDoc = null, stationNow = null;
async function onPage(key, fallback) {
  const clip = (await probe("pg-" + key)) ? "pg-" + key : fallback;
  if (interacted) say(clip); else { showCaption(CLIPS["pg-" + key] ? "pg-" + key : fallback); lastClip = CLIPS["pg-" + key] ? "pg-" + key : fallback; }
}
function currentPage() {
  if (stationNow === null) return null;
  const f = $("lesson-frame"); let d; try { d = f && f.contentDocument; } catch { return null; }
  if (!d) return null;
  if (d !== hookedDoc) { hookedDoc = d; ["pointerdown", "keydown"].forEach(ev => d.addEventListener(ev, () => { interacted = true; }, true)); }
  const st = d.querySelector(".h5p-interactive-book-status-progress-number, .h5p-interactive-book-status");
  const n = st && /(\d+)\s*\/\s*(\d+)/.exec(st.textContent); if (!n) return null;
  const station = stationNow, idx = Number(n[1]) - 1;
  return { station, key: idx >= PAGE_COUNT[station] ? "sum" : station + "-" + idx };
}
function watchPages(reset) {
  if (reset) lastPageKey = null;
  if (pageTimer) return;
  pageTimer = setInterval(() => {
    const p = currentPage();
    if (stationNow === null) { clearInterval(pageTimer); pageTimer = null; lastPageKey = null; return; }
    if (!p) return;
    const full = p.station + ":" + p.key;
    if (full !== lastPageKey) { lastPageKey = full; onPage(p.key, "lesson" + p.station); }
  }, 500);
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
    if (m) { stationNow = Number(m[1]); lastPageKey = null; showCaption("lesson" + m[1]); lastClip = "lesson" + m[1]; watchPages(true); }
    else if (/^#h5p/.test(location.hash)) { /* page turn inside a lesson */ }
    else { stationNow = null; showCaption("welcome"); lastClip = "welcome"; }
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
  { const m0 = location.hash.match(/^#lesson-([0-6])$/); if (m0) { stationNow = Number(m0[1]); watchPages(true); } }
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
