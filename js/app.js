/* ============================================================
   ПОЛИГЛОТ · приложение
   ============================================================ */

const STORE_KEY = 'poliglot.v2';
const NEW_CARDS_PER_DAY = 10;
const DRILL_LEN = 15;
const EXAM_LEN = 20;
const EXAM_PASS = 0.8;

/* ---------------- состояние ---------------- */

function today() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}
function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function newProfile(name, gender) {
  return {
    name, gender,
    unlocked: 1, xp: 0, streak: 0, lastDay: null,
    doneToday: 0, newToday: 0, dayStamp: today(),
    goal: 20, typeMode: false, voiceMode: false, soundOn: true,
    hearts: 5, heartsDay: today(), maxCombo: 0, seenAch: [],
    cards: {}, lessons: {}
  };
}

/* заполняет недостающие поля у профилей, сохранённых старой версией */
function ensureProfileDefaults(p) {
  if (p.voiceMode === undefined) p.voiceMode = false;
  if (p.soundOn === undefined) p.soundOn = true;
  if (p.hearts === undefined) p.hearts = 5;
  if (p.heartsDay === undefined) p.heartsDay = today();
  if (p.maxCombo === undefined) p.maxCombo = 0;
  if (p.seenAch === undefined) p.seenAch = [];
}

/* ---------------- уровни / лига по опыту ---------------- */

const LEVELS = [
  { name: 'Новичок',     min: 0    },
  { name: 'Ученик',      min: 100  },
  { name: 'Способный',   min: 250  },
  { name: 'Уверенный',   min: 500  },
  { name: 'Продвинутый', min: 900  },
  { name: 'Знаток',      min: 1500 },
  { name: 'Мастер',      min: 2500 },
  { name: 'Полиглот',    min: 4000 }
];

function levelInfo(xp) {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].min) idx = i;
  const cur = LEVELS[idx];
  const next = LEVELS[idx + 1];
  const span = next ? next.min - cur.min : 1;
  const into = xp - cur.min;
  const pct = next ? Math.min(100, Math.round(into / span * 100)) : 100;
  return { level: idx + 1, name: cur.name, next: next ? next.name : null, pct, into, span, max: !next };
}

let pendingLevelUp = null;

/* ---------------- достижения ---------------- */

function countLearnedWords(p) {
  return Object.values(p.cards).filter(c => c.iv >= 7).length;
}
function countTouchedWords(p) {
  return Object.keys(p.cards).length;
}
function allWordsTotal() {
  return COURSE.reduce((n, L) => n + L.vocab.length, 0);
}
function anyPerfectExam(p) {
  return Object.values(p.lessons).some(st => st.best === 100);
}
function courseComplete(p) {
  return p.unlocked >= 16 && p.lessons[16] && p.lessons[16].best >= EXAM_PASS * 100;
}

const ACHIEVEMENTS = [
  { id: 'first',    icon: '🌱', title: 'Первые шаги',   desc: 'Открой урок 2',                 test: p => p.unlocked >= 2 },
  { id: 'streak7',  icon: '🔥', title: 'Неделя подряд', desc: '7 дней занятий без пропуска',    test: p => p.streak >= 7 },
  { id: 'streak30', icon: '🏆', title: 'Месяц подряд',  desc: '30 дней занятий без пропуска',   test: p => p.streak >= 30 },
  { id: 'perfect',  icon: '💯', title: 'Отличник',      desc: 'Сдай любой экзамен на 100%',     test: anyPerfectExam },
  { id: 'combo10',  icon: '⚡', title: 'На волне',       desc: '10 верных ответов подряд',       test: p => p.maxCombo >= 10 },
  { id: 'words100', icon: '📚', title: 'Сто слов',      desc: '100 закреплённых слов',          test: p => countLearnedWords(p) >= 100 },
  { id: 'wordsAll', icon: '🗂️', title: 'Коллекционер',  desc: 'Все ' + allWordsTotal() + ' слов в работе', test: p => countTouchedWords(p) >= allWordsTotal() },
  { id: 'level5',   icon: '⭐', title: 'Продвинутый',   desc: 'Достигни 5 уровня',              test: p => levelInfo(p.xp).level >= 5 },
  { id: 'course',   icon: '🎓', title: 'Полиглот',      desc: 'Пройди все 16 уроков',           test: courseComplete }
];

function computeAchievements(p) {
  return ACHIEVEMENTS.map(a => ({ ...a, unlocked: a.test(p) }));
}

/* возвращает только что разблокированные (и отмечает их увиденными) */
function checkNewAchievements(p) {
  const fresh = [];
  for (const a of ACHIEVEMENTS) {
    if (a.test(p) && !p.seenAch.includes(a.id)) {
      p.seenAch.push(a.id);
      fresh.push(a);
    }
  }
  if (fresh.length) save();
  return fresh;
}

/* ---------------- звук ---------------- */

let actx = null;
function tone(freq, dur, type, delay, vol) {
  const p = P();
  if (!p || !p.soundOn) return;
  try {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume().catch(() => {});
    const t0 = actx.currentTime + (delay || 0);
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.15, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain); gain.connect(actx.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  } catch (e) { /* Web Audio недоступен — тихо игнорируем */ }
}
const sfxCorrect  = () => { tone(880, .10, 'sine', 0, .14); tone(1318, .14, 'sine', .06, .12); };
const sfxWrong    = () => tone(160, .22, 'sawtooth', 0, .10);
const sfxComplete = () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .18, 'sine', i * .09, .13));
const sfxLevelUp  = () => [392, 523, 659, 784, 988, 1175].forEach((f, i) => tone(f, .22, 'triangle', i * .07, .15));
const sfxHeart    = () => tone(220, .18, 'square', 0, .08);

/* ---------------- конфетти ---------------- */

function confetti(n) {
  const colors = ['#E0A155', '#C4532F', '#6FAE6B', '#F2EDE6', '#D2604F'];
  const frag = document.createDocumentFragment();
  for (let i = 0; i < (n || 26); i++) {
    const el = document.createElement('i');
    el.className = 'confetti-piece';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.background = colors[i % colors.length];
    el.style.animationDelay = (Math.random() * .3) + 's';
    el.style.animationDuration = (1.1 + Math.random() * .8) + 's';
    el.style.transform = 'rotate(' + Math.floor(Math.random() * 360) + 'deg)';
    frag.appendChild(el);
  }
  document.body.appendChild(frag);
  setTimeout(() => document.querySelectorAll('.confetti-piece').forEach(e => e.remove()), 2200);
}

/* ---------------- талисман ---------------- */

function mascotSVG(mood, size) {
  const s = size || 84;
  const eyes = {
    happy:   '<path d="M32 40q4-6 8 0M56 40q4-6 8 0" stroke="var(--ink)" stroke-width="4" fill="none" stroke-linecap="round"/>',
    sad:     '<circle cx="36" cy="42" r="3.5" fill="var(--ink)"/><circle cx="60" cy="42" r="3.5" fill="var(--ink)"/><path d="M30 56q18-10 36 0" stroke="var(--ink)" stroke-width="4" fill="none" stroke-linecap="round"/>',
    excited: '<path d="M30 38l10 8-10 8M66 38l-10 8 10 8" stroke="var(--ink)" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    neutral: '<circle cx="36" cy="42" r="3.5" fill="var(--ink)"/><circle cx="60" cy="42" r="3.5" fill="var(--ink)"/>'
  };
  const mouth = mood === 'happy' || mood === 'excited'
    ? '<path d="M38 58q10 10 20 0" stroke="var(--ink)" stroke-width="4" fill="none" stroke-linecap="round"/>'
    : (mood === 'sad' ? '' : '<path d="M42 60h12" stroke="var(--ink)" stroke-width="4" fill="none" stroke-linecap="round"/>');
  const sparkle = mood === 'excited' ? '<path d="M14 20l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="var(--accent)"/>' : '';
  return `<svg viewBox="0 0 96 96" width="${s}" height="${s}" class="mascot mood-${mood}">
    <ellipse cx="48" cy="52" rx="34" ry="30" fill="var(--card-2)" stroke="var(--line)" stroke-width="2"/>
    <path d="M20 30q6-14 16-6" fill="var(--accent)"/>
    <path d="M76 30q-6-14-16-6" fill="var(--accent)"/>
    <ellipse cx="48" cy="54" rx="24" ry="20" fill="var(--bg-2)"/>
    ${eyes[mood] || eyes.neutral}
    ${mouth}
    ${sparkle}
  </svg>`;
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* приватный режим Safari */ }
  return { active: null, profiles: {} };
}

function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); }
  catch (e) { /* нет доступа к хранилищу — работаем в памяти */ }
}

let S = load();
const P = () => S.profiles[S.active];

function rollDay() {
  const p = P(); if (!p) return;
  ensureProfileDefaults(p);
  const t = today();
  if (p.dayStamp !== t) {
    if (p.lastDay && daysBetween(p.lastDay, t) === 1) { /* серия продолжается */ }
    else if (p.lastDay && daysBetween(p.lastDay, t) > 1) { p.streak = 0; }
    p.dayStamp = t; p.doneToday = 0; p.newToday = 0;
    save();
  }
  if (p.heartsDay !== t) { p.hearts = 5; p.heartsDay = t; save(); }
}

function credit(n) {
  const p = P();
  const t = today();
  const beforeLevel = levelInfo(p.xp).level;
  p.xp += n;
  p.doneToday += 1;
  if (p.lastDay !== t) {
    p.streak = (p.lastDay && daysBetween(p.lastDay, t) === 1) ? p.streak + 1 : 1;
    p.lastDay = t;
  }
  const afterLevel = levelInfo(p.xp).level;
  if (afterLevel > beforeLevel) pendingLevelUp = levelInfo(p.xp).name;
  save();
}

/* ---------------- озвучка ---------------- */

let voices = [];
function loadVoices() { voices = window.speechSynthesis ? speechSynthesis.getVoices() : []; }
if (window.speechSynthesis) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}
function speak(text) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/[.?!]/g, ''));
  u.lang = 'en-US';
  u.rate = 0.9;
  const v = voices.find(v => /en[-_]US/i.test(v.lang) && /Samantha|Alex|Ava|Google US/i.test(v.name))
         || voices.find(v => /^en/i.test(v.lang));
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}

/* ---------------- SRS ---------------- */

function cardKey(lesson, en) { return lesson + '|' + en; }

function dueCards() {
  const p = P();
  const t = today();
  const due = [], fresh = [];
  for (let n = 1; n <= p.unlocked; n++) {
    const L = COURSE[n - 1];
    for (const [en, ru] of L.vocab) {
      const k = cardKey(n, en);
      const c = p.cards[k];
      if (!c) fresh.push({ k, en, ru, lesson: n });
      else if (c.due <= t) due.push({ k, en, ru, lesson: n, c });
    }
  }
  const room = Math.max(0, NEW_CARDS_PER_DAY - p.newToday);
  return due.concat(fresh.slice(0, room));
}

function gradeCard(k, g) {
  const p = P();
  let c = p.cards[k];
  const isNew = !c;
  if (!c) c = { ef: 2.5, iv: 0, n: 0, due: today() };
  if (g === 0) { c.n = 0; c.iv = 0; c.ef = Math.max(1.3, c.ef - 0.25); c.due = today(); }
  else {
    c.n += 1;
    if (g === 1) { c.ef = Math.max(1.3, c.ef - 0.15); c.iv = c.n === 1 ? 1 : Math.max(1, Math.round(c.iv * 1.2)); }
    else { c.ef = Math.min(3.0, c.ef + 0.1); c.iv = c.n === 1 ? 1 : c.n === 2 ? 3 : Math.round(c.iv * c.ef); }
    c.due = addDays(c.iv);
  }
  p.cards[k] = c;
  if (isNew) p.newToday += 1;
  save();
}

/* ---------------- маршрутизация ---------------- */

let R = { screen: 'home', lesson: 1, tab: 'theory' };
let session = null;

const app = document.getElementById('app');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));

function go(screen, opts = {}) {
  Object.assign(R, { screen }, opts);
  window.scrollTo(0, 0);
  render();
}

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1900);
}

/* ---------------- экраны ---------------- */

function render() {
  if (!S.active || !P()) return renderProfilePick();
  rollDay();
  switch (R.screen) {
    case 'lesson':       return renderLesson();
    case 'drill':        return renderDrill();
    case 'cards':        return renderCards();
    case 'stats':        return renderStats();
    case 'achievements': return renderAchievements();
    default:             return renderHome();
  }
}

/* --- выбор профиля --- */

function renderProfilePick() {
  const names = Object.keys(S.profiles);
  app.innerHTML = `
    <div class="brand"><h1>Полиглот</h1><span>метод Дмитрия Петрова</span></div>
    <p style="color:var(--ink-dim);margin:14px 0 0">Кто занимается?</p>
    <div class="profile-pick">
      ${names.map(k => `<button class="btn" data-pick="${esc(k)}">${esc(S.profiles[k].name)}</button>`).join('')}
      <button class="btn ghost" id="addProfile">+ Добавить человека</button>
    </div>
    <p class="footnote">Прогресс каждого хранится отдельно на этом устройстве.</p>`;

  app.querySelectorAll('[data-pick]').forEach(b =>
    b.onclick = () => { S.active = b.dataset.pick; save(); go('home'); });

  document.getElementById('addProfile').onclick = () => {
    const name = prompt('Имя');
    if (!name) return;
    const g = confirm('Женский род? ОК — женский, Отмена — мужской') ? 'f' : 'm';
    const key = 'p' + Date.now();
    S.profiles[key] = newProfile(name.trim(), g);
    S.active = key; save(); go('home');
  };
}

/* --- кольцо дневной цели (SVG) --- */

function ringSVG(pct, size, stroke) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(1, pct / 100));
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="ring">
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--bg-2)" stroke-width="${stroke}"/>
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${pct >= 100 ? 'var(--ok)' : 'var(--accent)'}"
      stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"
      transform="rotate(-90 ${size/2} ${size/2})"/>
  </svg>`;
}

/* --- главный экран --- */

function renderHome() {
  const p = P();
  const due = dueCards().length;
  const pct = Math.min(100, Math.round(p.doneToday / p.goal * 100));
  const lv = levelInfo(p.xp);
  const mood = pct >= 100 ? 'excited' : (p.streak > 0 ? 'happy' : 'neutral');
  const newAch = checkNewAchievements(p);

  app.innerHTML = `
    <div class="row" style="margin-bottom:14px">
      <div class="mascot-wrap">${mascotSVG(mood, 64)}</div>
      <div class="grow">
        <div class="brand"><h1>Полиглот</h1></div>
        <div style="font-size:13px;color:var(--ink-faint)">${esc(p.name)} · метод Д. Петрова</div>
      </div>
      <button class="speak" id="switchProfile">⇄</button>
    </div>

    <div class="level-pill">
      <span class="lv-badge">Ур. ${lv.level}</span>
      <div class="grow">
        <div class="row" style="margin-bottom:4px">
          <b style="font-size:14px">${esc(lv.name)}</b>
          <span class="grow"></span>
          <span style="font-size:12px;color:var(--ink-faint)">${lv.max ? 'максимум' : lv.into + ' / ' + lv.span}</span>
        </div>
        <div class="bar"><i style="width:${lv.pct}%"></i></div>
      </div>
    </div>

    <div class="home-top">
      <div class="ring-card">
        ${ringSVG(pct, 74, 8)}
        <div class="ring-label"><b>${pct}%</b><span>цель дня</span></div>
      </div>
      <div class="stats-mini">
        <div class="stat hot"><div class="v">${p.streak}🔥</div><div class="k">дней подряд</div></div>
        <div class="stat"><div class="v">${p.xp}</div><div class="k">очков</div></div>
      </div>
    </div>

    <div class="btn-row">
      <button class="btn primary" id="continue">Продолжить урок ${p.unlocked}</button>
    </div>
    <div class="btn-row">
      <button class="btn" id="warmup">Разминка</button>
      <button class="btn" id="toCards">Слова ${due ? '· ' + due : ''}</button>
    </div>

    <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-faint);margin:24px 0 4px">16 уроков</h3>
    <div class="path">
      ${COURSE.map((L, idx) => {
        const locked = L.n > p.unlocked;
        const done = L.n < p.unlocked;
        const cur = L.n === p.unlocked;
        const side = idx % 4 < 2 ? 'l' : 'r';
        return `<div class="path-node ${side}">
          <button class="lesson node ${locked ? 'locked' : ''} ${done ? 'done' : ''} ${cur ? 'current' : ''}" ${locked ? 'disabled' : `data-lesson="${L.n}"`} title="${esc(L.title)}">
            ${done ? '✓' : (locked ? '🔒' : L.n)}
          </button>
          <div class="node-label">${cur ? esc(L.title) : ''}</div>
        </div>`;
      }).join('')}
    </div>

    <button class="btn ghost" id="toStats" style="margin-top:18px">Статистика, ачивки, настройки</button>
    <p class="footnote">Курс построен по телепрограмме «Полиглот. Выучим английский за 16 часов»<br>с Дмитрием Петровым (телеканал «Культура»).</p>`;

  document.getElementById('continue').onclick = () => go('lesson', { lesson: p.unlocked, tab: 'theory' });
  document.getElementById('warmup').onclick = () => startDrill(p.unlocked, 'warmup');
  document.getElementById('toCards').onclick = () => go('cards');
  document.getElementById('toStats').onclick = () => go('stats');
  document.getElementById('switchProfile').onclick = () => { S.active = null; save(); render(); };
  app.querySelectorAll('[data-lesson]').forEach(el =>
    el.onclick = () => go('lesson', { lesson: +el.dataset.lesson, tab: 'theory' }));

  if (newAch.length) {
    confetti(18);
    toast((newAch[0].icon || '🏅') + ' Новая ачивка: ' + newAch[0].title);
  }
}

/* --- урок --- */

function topbar(title, sub) {
  return `<div class="topbar">
    <button class="back" id="back">‹</button>
    <div class="grow"><h1>${esc(title)}</h1>${sub ? `<div class="sub">${esc(sub)}</div>` : ''}</div>
  </div>`;
}

function renderLesson() {
  const p = P();
  const L = COURSE[R.lesson - 1];
  const st = p.lessons[L.n] || {};
  const tabs = [['theory', 'Теория'], ['drill', 'Тренажёр'], ['words', 'Слова'], ['exam', 'Экзамен']];

  let body = '';

  if (R.tab === 'theory') {
    body = `<div class="theory">${L.theory}</div>
      <button class="btn primary" id="startDrill" style="margin-top:20px">К тренажёру →</button>`;
  }

  if (R.tab === 'drill') {
    body = `<div class="card">
        <p style="margin:0 0 6px;font-weight:600">Тренажёр фраз</p>
        <p style="margin:0;color:var(--ink-dim);font-size:15px">${DRILL_LEN} фраз. Собирайте английский перевод из слов. Фразы генерируются заново каждый раз — заучить набор не получится, придётся понимать.</p>
      </div>
      ${st.drills ? `<div class="card"><div class="row"><div class="grow" style="color:var(--ink-dim);font-size:14px">Пройдено подходов</div><b>${st.drills}</b></div></div>` : ''}
      <button class="btn primary" id="startDrill">Начать</button>`;
  }

  if (R.tab === 'words') {
    body = `<div class="card" style="margin-bottom:14px">
        <p style="margin:0;color:var(--ink-dim);font-size:15px">${L.vocab.length} слов этого урока. Они автоматически попадают в карточки с интервальным повторением.</p>
      </div>
      <div class="wordlist">
        ${L.vocab.map(([en, ru]) => `<div class="w" data-say="${esc(en)}"><b>${esc(en)}</b><span>${esc(ru)}</span><span style="flex:0;color:var(--ink-faint)">🔊</span></div>`).join('')}
      </div>`;
  }

  if (R.tab === 'exam') {
    const best = st.best || 0;
    body = `<div class="card">
        <p style="margin:0 0 6px;font-weight:600">Экзамен урока ${L.n}</p>
        <p style="margin:0;color:var(--ink-dim);font-size:15px">${EXAM_LEN} фраз без подсказок. Нужно ${Math.round(EXAM_PASS * 100)}% правильных, чтобы открыть следующий урок. На экзамене есть ${'❤️'.repeat(p.hearts)}${'🖤'.repeat(5 - p.hearts)} — по одному сердцу за ошибку, обновляются каждый день.</p>
      </div>
      ${best ? `<div class="card"><div class="row"><div class="grow" style="color:var(--ink-dim);font-size:14px">Лучший результат</div><b>${best}%</b></div></div>` : ''}
      <button class="btn danger" id="startExam" ${p.hearts <= 0 ? 'disabled' : ''}>${p.hearts <= 0 ? 'Сердца закончились — до завтра' : 'Сдавать экзамен'}</button>`;
  }

  app.innerHTML = topbar('Урок ' + L.n, L.title) + `
    <div class="tabs">${tabs.map(([id, t]) => `<button data-tab="${id}" class="${R.tab === id ? 'on' : ''}">${t}</button>`).join('')}</div>
    ${body}`;

  document.getElementById('back').onclick = () => go('home');
  app.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => go('lesson', { tab: b.dataset.tab }));
  const sd = document.getElementById('startDrill');
  if (sd) sd.onclick = () => startDrill(L.n, 'drill');
  const se = document.getElementById('startExam');
  if (se) se.onclick = () => startDrill(L.n, 'exam');
  app.querySelectorAll('[data-say]').forEach(el =>
    el.onclick = () => speak(el.dataset.say.replace(/\s*\(.*?\)/g, '')));
}

/* --- тренажёр --- */

function startDrill(lesson, kind) {
  const p = P();
  if (kind === 'exam' && p.hearts <= 0) return;
  const L = COURSE[lesson - 1];
  const drill = kind === 'warmup'
    ? { ...L.drill, maxL: p.unlocked }
    : L.drill;
  session = {
    lesson, kind, drill,
    total: kind === 'exam' ? EXAM_LEN : DRILL_LEN,
    i: 0, correct: 0, combo: 0, maxCombo: 0, heartsOut: false,
    phrase: null, picked: [], checked: false, wasRight: false
  };
  nextPhrase();
  go('drill');
}

function nextPhrase() {
  session.phrase = generatePhrase(session.drill, P().gender);
  session.picked = [];
  session.checked = false;
}

function speechSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function startRecognition(s) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR || s.checked) return;
  try {
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    s.recording = true; renderDrill();
    rec.onresult = e => {
      const text = (e.results && e.results[0] && e.results[0][0] && e.results[0][0].transcript) || '';
      s.picked = text.trim().split(/\s+/).filter(Boolean);
      s.recording = false;
      if (session === s) renderDrill();
    };
    rec.onerror = () => { s.recording = false; if (session === s) renderDrill(); };
    rec.onend = () => { s.recording = false; };
    rec.start();
  } catch (e) { s.recording = false; }
}

function renderDrill() {
  const s = session;
  if (!s) return go('home');

  if (s.i >= s.total) return renderDrillEnd();

  const p = P();
  const pct = Math.round(s.i / s.total * 100);
  const answerText = s.picked.join(' ');
  const useVoice = p.voiceMode && speechSupported();

  app.innerHTML = topbar(
      s.kind === 'exam' ? 'Экзамен' : s.kind === 'warmup' ? 'Разминка' : 'Тренажёр',
      'Урок ' + s.lesson) + `
    <div class="drill-top">
      <span>${s.i + 1} / ${s.total}</span>
      <div class="bar"><i style="width:${pct}%"></i></div>
      ${s.combo >= 2 ? `<span class="combo">🔥${s.combo}</span>` : `<span>${s.correct} ✓</span>`}
    </div>
    ${s.kind === 'exam' ? `<div class="hearts">${Array.from({length:5}).map((_,i)=>`<span class="heart ${i < p.hearts ? '' : 'lost'}">${i < p.hearts ? '❤️' : '🖤'}</span>`).join('')}</div>` : ''}

    <div class="prompt">
      ${s.kind === 'exam' ? '' : `<div class="hint">${esc(s.phrase.hint)}</div>`}
      <div class="ru">${esc(s.phrase.ru)}</div>
    </div>

    ${useVoice ? `
      <div class="voice-box ${s.checked ? (s.wasRight ? 'ok' : 'bad') : ''}">
        <button class="mic-btn ${s.recording ? 'rec' : ''}" id="mic" ${s.checked ? 'disabled' : ''}>${s.recording ? '●' : '🎤'}</button>
        <div class="voice-hint">${answerText ? esc(answerText) : 'нажми и произнеси фразу по-английски'}</div>
      </div>
    ` : p.typeMode ? `
      <input class="typed" id="typed" autocapitalize="off" autocorrect="off" autocomplete="off"
             spellcheck="false" placeholder="Ответ по-английски" value="${esc(answerText)}" ${s.checked ? 'disabled' : ''}>
    ` : `
      <div class="answer ${s.checked ? (s.wasRight ? 'ok' : 'bad') : ''}" id="answer">
        ${s.picked.map((w, idx) => `<button class="tile" data-un="${idx}">${esc(w)}</button>`).join('')}
      </div>
      <div class="tiles">
        ${s.phrase.tokens.map((w, idx) => `<button class="tile ${s.picked.includes(w) && countIn(s.picked, w) > countUpTo(s.phrase.tokens, w, idx) ? 'used' : ''}" data-tk="${idx}">${esc(w)}</button>`).join('')}
      </div>
    `}

    ${s.checked ? `
      <div class="feedback ${s.wasRight ? 'ok' : 'bad'}">
        <div class="label">${s.wasRight ? 'Верно' : 'Правильный ответ'}</div>
        <div class="correct">${esc(s.phrase.en)}</div>
      </div>
      <div class="btn-row">
        <button class="speak" id="say" style="width:52px;min-height:52px">🔊</button>
        <button class="btn primary" id="next">Дальше</button>
      </div>
    ` : `
      <div class="btn-row">
        <button class="btn ghost" id="skip">Не знаю</button>
        <button class="btn primary" id="check">Проверить</button>
      </div>
    `}
    <button class="btn ghost" id="quit" style="margin-top:8px">Закончить</button>`;

  document.getElementById('back').onclick = () => { session = null; go('lesson', { lesson: s.lesson }); };
  document.getElementById('quit').onclick = () => { session = null; go('lesson', { lesson: s.lesson }); };

  if (useVoice) {
    const mic = document.getElementById('mic');
    if (mic) mic.onclick = () => startRecognition(s);
  } else if (!p.typeMode) {
    app.querySelectorAll('[data-tk]').forEach(b => b.onclick = () => {
      if (s.checked) return;
      s.picked.push(s.phrase.tokens[+b.dataset.tk]);
      renderDrill();
    });
    app.querySelectorAll('[data-un]').forEach(b => b.onclick = () => {
      if (s.checked) return;
      s.picked.splice(+b.dataset.un, 1);
      renderDrill();
    });
  }

  const chk = document.getElementById('check');
  if (chk) chk.onclick = () => {
    if (p.typeMode && !useVoice) s.picked = (document.getElementById('typed').value || '').trim().split(/\s+/).filter(Boolean);
    checkAnswer();
  };

  const skip = document.getElementById('skip');
  if (skip) skip.onclick = () => { s.picked = []; applyResult(false); };

  const nx = document.getElementById('next');
  if (nx) nx.onclick = () => {
    if (s.heartsOut) { s.i = s.total; } else { s.i += 1; nextPhrase(); }
    renderDrill();
  };

  const say = document.getElementById('say');
  if (say) say.onclick = () => speak(s.phrase.en);

  const ti = document.getElementById('typed');
  if (ti && !s.checked) {
    ti.oninput = () => { s.picked = ti.value.trim().split(/\s+/).filter(Boolean); };
    ti.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); checkAnswer(); } };
  }
}

function countIn(arr, w) { return arr.filter(x => x === w).length; }
function countUpTo(arr, w, idx) { return arr.slice(0, idx + 1).filter(x => x === w).length - 1; }

function checkAnswer() {
  const s = session;
  const ok = norm(s.picked.join(' ')) === norm(s.phrase.en);
  applyResult(ok);
}

function applyResult(ok) {
  const s = session;
  const p = P();
  s.checked = true;
  s.wasRight = ok;
  if (ok) {
    s.combo += 1;
    s.maxCombo = Math.max(s.maxCombo, s.combo);
    sfxCorrect();
    s.correct += 1; credit(1);
  } else {
    s.combo = 0;
    sfxWrong();
    if (s.kind === 'exam') {
      p.hearts = Math.max(0, p.hearts - 1);
      sfxHeart();
      save();
      if (p.hearts === 0) s.heartsOut = true;
    }
  }
  speak(s.phrase.en);
  renderDrill();
}

function renderDrillEnd() {
  const s = session;
  const p = P();
  const pct = Math.round(s.correct / s.total * 100);
  const st = p.lessons[s.lesson] || (p.lessons[s.lesson] = {});

  let unlockedNow = false;
  if (s.kind === 'exam') {
    st.best = Math.max(st.best || 0, pct);
    if (pct >= EXAM_PASS * 100 && p.unlocked === s.lesson && s.lesson < 16) {
      p.unlocked = s.lesson + 1;
      unlockedNow = true;
    }
  } else {
    st.drills = (st.drills || 0) + 1;
  }
  p.maxCombo = Math.max(p.maxCombo, s.maxCombo);
  const beforeLevel = levelInfo(p.xp).level;
  p.xp += Math.round(pct / 10);
  const afterLevel = levelInfo(p.xp).level;
  const leveledUp = afterLevel > beforeLevel ? levelInfo(p.xp).name : null;
  save();

  const newAch = checkNewAchievements(p);
  const failed = s.kind === 'exam' && pct < EXAM_PASS * 100;
  const mood = s.heartsOut ? 'sad' : (pct === 100 ? 'excited' : (failed ? 'sad' : 'happy'));

  if (pct === 100 || unlockedNow || leveledUp) confetti(unlockedNow || leveledUp ? 34 : 24);
  if (unlockedNow || pct === 100) sfxComplete();
  if (leveledUp) setTimeout(sfxLevelUp, 260);

  app.innerHTML = topbar('Готово', 'Урок ' + s.lesson) + `
    <div class="flash">
      <div class="mascot-wrap" style="margin:0 auto 6px">${mascotSVG(mood, 72)}</div>
      <div class="word" style="font-size:46px">${pct}%</div>
      <div class="tr">${s.correct} из ${s.total}</div>
      ${s.maxCombo >= 3 ? `<div style="color:var(--accent);font-weight:600">🔥 лучшая серия: ${s.maxCombo}</div>` : ''}
      ${s.heartsOut ? '<div style="color:var(--bad);font-weight:600">Сердца закончились — попробуйте завтра или потренируйтесь без экзамена</div>' : ''}
      ${unlockedNow ? '<div style="color:var(--ok);font-weight:600">Урок ' + (s.lesson + 1) + ' открыт</div>' : ''}
      ${failed && !s.heartsOut ? '<div style="color:var(--ink-dim);font-size:14px">Нужно ' + Math.round(EXAM_PASS * 100) + '%. Погоняйте тренажёр и попробуйте снова.</div>' : ''}
      ${leveledUp ? `<div class="levelup">⭐ Новый уровень: ${esc(leveledUp)}</div>` : ''}
      ${newAch.map(a => `<div class="ach-unlock">${a.icon} Ачивка: ${esc(a.title)}</div>`).join('')}
    </div>
    <div class="btn-row">
      <button class="btn" id="again" ${s.kind === 'exam' && p.hearts <= 0 ? 'disabled' : ''}>Ещё подход</button>
      <button class="btn primary" id="home">На главную</button>
    </div>`;

  document.getElementById('back').onclick = () => { session = null; go('home'); };
  document.getElementById('home').onclick = () => { session = null; go('home'); };
  const again = document.getElementById('again');
  if (again) again.onclick = () => startDrill(s.lesson, s.kind);
}

/* --- карточки слов --- */

let cardQueue = null;
let cardShown = false;

function renderCards() {
  if (!cardQueue) cardQueue = shuffle(dueCards());

  if (!cardQueue.length) {
    app.innerHTML = topbar('Слова') + `
      <div class="empty"><div class="big">✓</div>
        <p>На сегодня всё повторено.<br>Возвращайтесь завтра — интервалы работают только так.</p></div>
      <button class="btn primary" id="home">На главную</button>`;
    document.getElementById('back').onclick = () => { cardQueue = null; go('home'); };
    document.getElementById('home').onclick = () => { cardQueue = null; go('home'); };
    return;
  }

  const c = cardQueue[0];
  const clean = c.en.replace(/\s*\(.*?\)/g, '');

  app.innerHTML = topbar('Слова', 'осталось ' + cardQueue.length) + `
    <div class="flash" id="flash">
      <div class="word">${esc(c.en)}</div>
      ${cardShown ? `<div class="tr">${esc(c.ru)}</div>` : '<div class="tap">нажмите, чтобы увидеть перевод</div>'}
    </div>
    ${cardShown ? `
      <div class="grade">
        <button class="btn" data-g="0">Не помню</button>
        <button class="btn" data-g="1">Трудно</button>
        <button class="btn primary" data-g="2">Легко</button>
      </div>` : `
      <button class="btn primary" id="show">Показать перевод</button>`}
    <button class="btn ghost" id="sayw" style="margin-top:10px">🔊 Произнести</button>`;

  document.getElementById('back').onclick = () => { cardQueue = null; cardShown = false; go('home'); };
  document.getElementById('sayw').onclick = () => speak(clean);
  document.getElementById('flash').onclick = () => { cardShown = true; speak(clean); renderCards(); };
  const sh = document.getElementById('show');
  if (sh) sh.onclick = () => { cardShown = true; speak(clean); renderCards(); };

  app.querySelectorAll('[data-g]').forEach(b => b.onclick = () => {
    const g = +b.dataset.g;
    if (g === 2) sfxCorrect(); else if (g === 0) sfxWrong();
    gradeCard(c.k, g);
    credit(1);
    cardQueue.shift();
    if (g === 0) cardQueue.push(c);
    cardShown = false;
    renderCards();
  });
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* --- статистика и настройки --- */

function renderStats() {
  const p = P();
  const totalCards = Object.keys(p.cards).length;
  const learned = Object.values(p.cards).filter(c => c.iv >= 7).length;
  const allWords = COURSE.reduce((n, L) => n + L.vocab.length, 0);
  const lv = levelInfo(p.xp);
  const ach = computeAchievements(p);
  const gotAch = ach.filter(a => a.unlocked).length;
  const voiceOk = speechSupported();

  app.innerHTML = topbar('Статистика', esc(p.name)) + `
    <div class="level-pill" style="margin-bottom:14px">
      <span class="lv-badge">Ур. ${lv.level}</span>
      <div class="grow"><b style="font-size:14px">${esc(lv.name)}</b></div>
    </div>

    <div class="stats">
      <div class="stat hot"><div class="v">${p.streak}</div><div class="k">дней подряд</div></div>
      <div class="stat"><div class="v">${p.xp}</div><div class="k">очков</div></div>
      <div class="stat"><div class="v">${p.unlocked}/16</div><div class="k">уроков</div></div>
    </div>

    <button class="card" id="toAch" style="width:100%;text-align:left;cursor:pointer">
      <div class="row"><div class="grow"><b>🏅 Достижения</b></div><div style="color:var(--ink-faint)">${gotAch}/${ach.length} ›</div></div>
    </button>

    <div class="card">
      <div class="row"><div class="grow">Слов в работе</div><b>${totalCards} / ${allWords}</b></div>
    </div>
    <div class="card">
      <div class="row"><div class="grow">Закреплено (интервал ≥ 7 дней)</div><b>${learned}</b></div>
    </div>
    <div class="card">
      <div class="row"><div class="grow">Дневная цель</div>
        <button class="btn sm" id="goalMinus">−</button>
        <b style="min-width:34px;text-align:center">${p.goal}</b>
        <button class="btn sm" id="goalPlus">+</button>
      </div>
    </div>
    <div class="card">
      <div class="row"><div class="grow">Вводить ответ с клавиатуры</div>
        <button class="btn sm" id="tm">${p.typeMode ? 'вкл' : 'выкл'}</button>
      </div>
      <p style="margin:8px 0 0;font-size:13px;color:var(--ink-faint)">Выключено — собираете фразу из плиток. Включено — печатаете сами, это сложнее и полезнее.</p>
    </div>
    ${voiceOk ? `
    <div class="card">
      <div class="row"><div class="grow">Отвечать голосом</div>
        <button class="btn sm" id="vm">${p.voiceMode ? 'вкл' : 'выкл'}</button>
      </div>
      <p style="margin:8px 0 0;font-size:13px;color:var(--ink-faint)">Произносишь фразу вслух вместо набора текста — как в ELSA Speak.</p>
    </div>` : ''}
    <div class="card">
      <div class="row"><div class="grow">Звуковые эффекты</div>
        <button class="btn sm" id="snd">${p.soundOn ? 'вкл' : 'выкл'}</button>
      </div>
    </div>
    <div class="card">
      <div class="row"><div class="grow">Род для фраз о себе</div>
        <button class="btn sm" id="gd">${p.gender === 'f' ? 'женский' : 'мужской'}</button>
      </div>
      <p style="margin:8px 0 0;font-size:13px;color:var(--ink-faint)">Влияет на русские подсказки: «я делал» / «я делала».</p>
    </div>

    <button class="btn ghost" id="switchP" style="margin-top:14px">Сменить человека</button>
    <button class="btn ghost" id="reset" style="margin-top:8px;color:var(--bad)">Сбросить прогресс</button>`;

  document.getElementById('back').onclick = () => go('home');
  document.getElementById('toAch').onclick = () => go('achievements');
  document.getElementById('goalMinus').onclick = () => { p.goal = Math.max(5, p.goal - 5); save(); render(); };
  document.getElementById('goalPlus').onclick = () => { p.goal = Math.min(100, p.goal + 5); save(); render(); };
  document.getElementById('tm').onclick = () => { p.typeMode = !p.typeMode; save(); render(); };
  const vm = document.getElementById('vm');
  if (vm) vm.onclick = () => { p.voiceMode = !p.voiceMode; save(); render(); };
  document.getElementById('snd').onclick = () => { p.soundOn = !p.soundOn; save(); render(); if (p.soundOn) sfxCorrect(); };
  document.getElementById('gd').onclick = () => { p.gender = p.gender === 'f' ? 'm' : 'f'; save(); render(); };
  document.getElementById('switchP').onclick = () => { S.active = null; save(); render(); };
  document.getElementById('reset').onclick = () => {
    if (!confirm('Сбросить весь прогресс ' + p.name + '?')) return;
    S.profiles[S.active] = newProfile(p.name, p.gender);
    save(); go('home');
  };
}

/* --- достижения --- */

function renderAchievements() {
  const p = P();
  const ach = computeAchievements(p);

  app.innerHTML = topbar('Достижения', esc(p.name)) + `
    <div class="badge-grid">
      ${ach.map(a => `
        <div class="badge ${a.unlocked ? 'on' : ''}">
          <div class="badge-icon">${a.unlocked ? a.icon : '🔒'}</div>
          <div class="badge-title">${esc(a.title)}</div>
          <div class="badge-desc">${esc(a.desc)}</div>
        </div>`).join('')}
    </div>
    <p class="footnote">Открывай новые достижения, занимаясь регулярно — за это и держится метод Петрова.</p>`;

  document.getElementById('back').onclick = () => go('stats');
}

/* ---------------- отладочный доступ (для автотестов) ---------------- */

window.Poliglot = {
  get S() { return S; },
  get session() { return session; },
  get route() { return R; },
  levelInfo, computeAchievements
};

/* ---------------- старт ---------------- */

(function init() {
  if (!Object.keys(S.profiles).length) {
    S.profiles.azamat = newProfile('Азамат', 'm');
    S.profiles.wife = newProfile('Жена', 'f');
    save();
  }
  render();

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
