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
    goal: 20, typeMode: false,
    cards: {}, lessons: {}
  };
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
  const t = today();
  if (p.dayStamp !== t) {
    if (p.lastDay && daysBetween(p.lastDay, t) === 1) { /* серия продолжается */ }
    else if (p.lastDay && daysBetween(p.lastDay, t) > 1) { p.streak = 0; }
    p.dayStamp = t; p.doneToday = 0; p.newToday = 0;
    save();
  }
}

function credit(n) {
  const p = P();
  const t = today();
  p.xp += n;
  p.doneToday += 1;
  if (p.lastDay !== t) {
    p.streak = (p.lastDay && daysBetween(p.lastDay, t) === 1) ? p.streak + 1 : 1;
    p.lastDay = t;
  }
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
    case 'lesson': return renderLesson();
    case 'drill':  return renderDrill();
    case 'cards':  return renderCards();
    case 'stats':  return renderStats();
    default:       return renderHome();
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

/* --- главный экран --- */

function renderHome() {
  const p = P();
  const due = dueCards().length;
  const pct = Math.min(100, Math.round(p.doneToday / p.goal * 100));

  app.innerHTML = `
    <div class="row" style="margin-bottom:16px">
      <div class="grow">
        <div class="brand"><h1>Полиглот</h1></div>
        <div style="font-size:13px;color:var(--ink-faint)">${esc(p.name)} · метод Д. Петрова</div>
      </div>
      <button class="speak" id="switchProfile">⇄</button>
    </div>

    <div class="stats">
      <div class="stat hot"><div class="v">${p.streak}</div><div class="k">дней подряд</div></div>
      <div class="stat"><div class="v">${p.doneToday}<span style="font-size:14px;color:var(--ink-faint)">/${p.goal}</span></div><div class="k">сегодня</div></div>
      <div class="stat"><div class="v">${p.xp}</div><div class="k">очков</div></div>
    </div>

    <div class="card">
      <div class="row" style="margin-bottom:10px">
        <div class="grow" style="font-size:14px;color:var(--ink-dim)">Дневная цель</div>
        <div style="font-size:14px;font-weight:600">${pct}%</div>
      </div>
      <div class="bar"><i style="width:${pct}%"></i></div>
    </div>

    <div class="btn-row">
      <button class="btn primary" id="continue">Продолжить урок ${p.unlocked}</button>
    </div>
    <div class="btn-row">
      <button class="btn" id="warmup">Разминка</button>
      <button class="btn" id="toCards">Слова ${due ? '· ' + due : ''}</button>
    </div>

    <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-faint);margin:24px 0 10px">16 уроков</h3>
    ${COURSE.map(L => {
      const locked = L.n > p.unlocked;
      const done = L.n < p.unlocked;
      const cur = L.n === p.unlocked;
      return `<div class="lesson ${locked ? 'locked' : ''} ${done ? 'done' : ''} ${cur ? 'current' : ''}" ${locked ? '' : `data-lesson="${L.n}"`}>
        <div class="num">${done ? '✓' : L.n}</div>
        <div class="grow"><div class="t">${esc(L.title)}</div><div class="g">${esc(L.goal)}</div></div>
        <div class="chev">${locked ? '🔒' : '›'}</div>
      </div>`;
    }).join('')}

    <button class="btn ghost" id="toStats" style="margin-top:14px">Статистика и настройки</button>
    <p class="footnote">Курс построен по телепрограмме «Полиглот. Выучим английский за 16 часов»<br>с Дмитрием Петровым (телеканал «Культура»).</p>`;

  document.getElementById('continue').onclick = () => go('lesson', { lesson: p.unlocked, tab: 'theory' });
  document.getElementById('warmup').onclick = () => startDrill(p.unlocked, 'warmup');
  document.getElementById('toCards').onclick = () => go('cards');
  document.getElementById('toStats').onclick = () => go('stats');
  document.getElementById('switchProfile').onclick = () => { S.active = null; save(); render(); };
  app.querySelectorAll('[data-lesson]').forEach(el =>
    el.onclick = () => go('lesson', { lesson: +el.dataset.lesson, tab: 'theory' }));
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
        <p style="margin:0;color:var(--ink-dim);font-size:15px">${EXAM_LEN} фраз без подсказок. Нужно ${Math.round(EXAM_PASS * 100)}% правильных, чтобы открыть следующий урок.</p>
      </div>
      ${best ? `<div class="card"><div class="row"><div class="grow" style="color:var(--ink-dim);font-size:14px">Лучший результат</div><b>${best}%</b></div></div>` : ''}
      <button class="btn danger" id="startExam">Сдавать экзамен</button>`;
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
  const L = COURSE[lesson - 1];
  const drill = kind === 'warmup'
    ? { ...L.drill, maxL: p.unlocked }
    : L.drill;
  session = {
    lesson, kind, drill,
    total: kind === 'exam' ? EXAM_LEN : DRILL_LEN,
    i: 0, correct: 0,
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

function renderDrill() {
  const s = session;
  if (!s) return go('home');

  if (s.i >= s.total) return renderDrillEnd();

  const p = P();
  const pct = Math.round(s.i / s.total * 100);
  const answerText = s.picked.join(' ');

  app.innerHTML = topbar(
      s.kind === 'exam' ? 'Экзамен' : s.kind === 'warmup' ? 'Разминка' : 'Тренажёр',
      'Урок ' + s.lesson) + `
    <div class="drill-top">
      <span>${s.i + 1} / ${s.total}</span>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <span>${s.correct} ✓</span>
    </div>

    <div class="prompt">
      ${s.kind === 'exam' ? '' : `<div class="hint">${esc(s.phrase.hint)}</div>`}
      <div class="ru">${esc(s.phrase.ru)}</div>
    </div>

    ${p.typeMode ? `
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

  if (!p.typeMode) {
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
    if (p.typeMode) s.picked = (document.getElementById('typed').value || '').trim().split(/\s+/).filter(Boolean);
    checkAnswer();
  };

  const skip = document.getElementById('skip');
  if (skip) skip.onclick = () => { s.picked = []; s.checked = true; s.wasRight = false; speak(s.phrase.en); renderDrill(); };

  const nx = document.getElementById('next');
  if (nx) nx.onclick = () => { s.i += 1; nextPhrase(); renderDrill(); };

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
  s.checked = true;
  s.wasRight = ok;
  if (ok) { s.correct += 1; credit(1); }
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
  p.xp += Math.round(pct / 10);
  save();

  app.innerHTML = topbar('Готово', 'Урок ' + s.lesson) + `
    <div class="flash">
      <div class="word" style="font-size:46px">${pct}%</div>
      <div class="tr">${s.correct} из ${s.total}</div>
      ${unlockedNow ? '<div style="color:var(--ok);font-weight:600">Урок ' + (s.lesson + 1) + ' открыт</div>' : ''}
      ${s.kind === 'exam' && pct < EXAM_PASS * 100 ? '<div style="color:var(--ink-dim);font-size:14px">Нужно ' + Math.round(EXAM_PASS * 100) + '%. Погоняйте тренажёр и попробуйте снова.</div>' : ''}
    </div>
    <div class="btn-row">
      <button class="btn" id="again">Ещё подход</button>
      <button class="btn primary" id="home">На главную</button>
    </div>`;

  document.getElementById('back').onclick = () => { session = null; go('home'); };
  document.getElementById('home').onclick = () => { session = null; go('home'); };
  document.getElementById('again').onclick = () => startDrill(s.lesson, s.kind);
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

  app.innerHTML = topbar('Статистика', esc(p.name)) + `
    <div class="stats">
      <div class="stat hot"><div class="v">${p.streak}</div><div class="k">дней подряд</div></div>
      <div class="stat"><div class="v">${p.xp}</div><div class="k">очков</div></div>
      <div class="stat"><div class="v">${p.unlocked}/16</div><div class="k">уроков</div></div>
    </div>

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
    <div class="card">
      <div class="row"><div class="grow">Род для фраз о себе</div>
        <button class="btn sm" id="gd">${p.gender === 'f' ? 'женский' : 'мужской'}</button>
      </div>
      <p style="margin:8px 0 0;font-size:13px;color:var(--ink-faint)">Влияет на русские подсказки: «я делал» / «я делала».</p>
    </div>

    <button class="btn ghost" id="switchP" style="margin-top:14px">Сменить человека</button>
    <button class="btn ghost" id="reset" style="margin-top:8px;color:var(--bad)">Сбросить прогресс</button>`;

  document.getElementById('back').onclick = () => go('home');
  document.getElementById('goalMinus').onclick = () => { p.goal = Math.max(5, p.goal - 5); save(); render(); };
  document.getElementById('goalPlus').onclick = () => { p.goal = Math.min(100, p.goal + 5); save(); render(); };
  document.getElementById('tm').onclick = () => { p.typeMode = !p.typeMode; save(); render(); };
  document.getElementById('gd').onclick = () => { p.gender = p.gender === 'f' ? 'm' : 'f'; save(); render(); };
  document.getElementById('switchP').onclick = () => { S.active = null; save(); render(); };
  document.getElementById('reset').onclick = () => {
    if (!confirm('Сбросить весь прогресс ' + p.name + '?')) return;
    S.profiles[S.active] = newProfile(p.name, p.gender);
    save(); go('home');
  };
}

/* ---------------- отладочный доступ (для автотестов) ---------------- */

window.Poliglot = {
  get S() { return S; },
  get session() { return session; },
  get route() { return R; }
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
