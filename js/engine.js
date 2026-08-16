/* ============================================================
   ПОЛИГЛОТ · Грамматический движок
   Генерирует бесконечный поток фраз «русский → английский»
   по базовой таблице Петрова.
   ============================================================ */

/* ---------- вспомогательные наборы ---------- */

/* Дополнения для предложений состояния (to be) */
const COMPS = [
  { en: 'at home',          ru: 'дома' },
  { en: 'here',             ru: 'здесь' },
  { en: 'there',            ru: 'там' },
  { en: 'at work',          ru: 'на работе' },
  { en: 'in Moscow',        ru: 'в Москве' },
  { en: 'at the office',    ru: 'в офисе' },
  { en: 'a doctor',  enPl: 'doctors',  ru: 'врач',    ru_pl: 'врачи',    ins: 'врачом',   ins_pl: 'врачами' },
  { en: 'a teacher', enPl: 'teachers', ru: 'учитель', ru_pl: 'учителя',  ins: 'учителем', ins_pl: 'учителями' },
  { en: 'a student', enPl: 'students', ru: 'студент', ru_pl: 'студенты',ins: 'студентом', ins_pl: 'студентами' },
  { en: 'a friend',  enPl: 'friends',  ru: 'друг',    ru_pl: 'друзья',   ins: 'другом',   ins_pl: 'друзьями' },
  { en: 'ready',   ru: { m:'готов',    f:'готова',    pl:'готовы' } },
  { en: 'busy',    ru: { m:'занят',    f:'занята',    pl:'заняты' } },
  { en: 'free',    ru: { m:'свободен', f:'свободна',  pl:'свободны' } },
  { en: 'happy',   ru: { m:'счастлив', f:'счастлива', pl:'счастливы' } },
  { en: 'sure',    ru: { m:'уверен',   f:'уверена',   pl:'уверены' } },
  { en: 'right',   ru: { m:'прав',     f:'права',     pl:'правы' } },
  { en: 'tired',   ru: { m:'устал',    f:'устала',    pl:'устали' } },
  { en: 'hungry',  ru: { m:'голоден',  f:'голодна',   pl:'голодны' } },
  { en: 'young',   ru: { m:'молодой',  f:'молодая',   pl:'молодые' } },
  { en: 'happy to see you', ru: { m:'рад тебя видеть', f:'рада тебя видеть', pl:'рады тебя видеть' } }
];

/* Существительные для there is / there are */
const THERE_NOUNS = [
  { en:'a book',        ru:'книга',        gen:'книги',        g:'f'  },
  { en:'a problem',     ru:'проблема',     gen:'проблемы',     g:'f'  },
  { en:'a question',    ru:'вопрос',       gen:'вопроса',      g:'m'  },
  { en:'a shop',        ru:'магазин',      gen:'магазина',     g:'m'  },
  { en:'a hotel',       ru:'отель',        gen:'отеля',        g:'m'  },
  { en:'a car',         ru:'машина',       gen:'машины',       g:'f'  },
  { en:'a window',      ru:'окно',         gen:'окна',         g:'n'  },
  { en:'water',         ru:'вода',         gen:'воды',         g:'f'  },
  { en:'two rooms',     ru:'две комнаты',  gen:'комнат',       g:'pl' },
  { en:'many people',   ru:'много людей',  gen:'людей',        g:'pl' },
  { en:'a lot of work', ru:'много работы', gen:'работы',       g:'f'  }
];

const THERE_PLACES = [
  { en:'here',           ru:'здесь' },
  { en:'there',          ru:'там' },
  { en:'in the room',    ru:'в комнате' },
  { en:'on the table',   ru:'на столе' },
  { en:'in this city',   ru:'в этом городе' },
  { en:'near my house',  ru:'рядом с моим домом' }
];

/* Модальные */
const MODALS = [
  { en:'can',    ru:['могу','можешь','может','может','можем','могут'], neg:"can't",     past:'could' },
  { en:'must',   ru:{ m:'должен', f:'должна', pl:'должны' },           neg:'must not',  isAdj:true },
  { en:'should', dat:['мне','тебе','ему','ей','нам','им'], verb:'следует', neg:'should not', noPron:true }
];

/* Повелительное наклонение — готовые пары */
const IMPERATIVES = [
  ['Come here.','Иди сюда.'],
  ['Open the door, please.','Открой дверь, пожалуйста.'],
  ["Don't go.",'Не уходи.'],
  ["Don't worry.",'Не волнуйся.'],
  ["Let's go.",'Пойдём.'],
  ["Let's do it tomorrow.",'Давай сделаем это завтра.'],
  ['Wait a minute.','Подожди минуту.'],
  ['Tell me the truth.','Скажи мне правду.'],
  ['Show me this.','Покажи мне это.'],
  ['Give me your hand.','Дай мне руку.'],
  ["Don't tell him.",'Не говори ему.'],
  ['Let me help you.','Позволь мне помочь тебе.'],
  ['Call me tomorrow.','Позвони мне завтра.'],
  ['Close the window.','Закрой окно.'],
  ['Sit down, please.','Садись, пожалуйста.'],
  ['Be careful.','Будь осторожен.'],
  ["Don't be late.",'Не опаздывай.'],
  ['Take your time.','Не торопись.'],
  ["Let's not talk about it.",'Давай не будем об этом говорить.'],
  ['Hurry up.','Поторопись.'],
  ['Turn off the light.','Выключи свет.'],
  ['Listen to me.','Послушай меня.'],
  ['Try again.','Попробуй снова.'],
  ["Don't forget.",'Не забудь.'],
  ['Come in.','Входи.'],
  ['Have a nice day.','Хорошего дня.']
];

/* Пассивный залог — готовые пары */
const PASSIVES = [
  ['This house was built in 1990.','Этот дом был построен в 1990.'],
  ['English is spoken here.','Здесь говорят по-английски.'],
  ['The work will be done tomorrow.','Работа будет сделана завтра.'],
  ['This book was written by my friend.','Эта книга была написана моим другом.'],
  ['The door is closed.','Дверь закрыта.'],
  ['The letter was sent yesterday.','Письмо было отправлено вчера.'],
  ['Nothing was said.','Ничего не было сказано.'],
  ['It is not allowed.','Это не разрешено.'],
  ['The car was bought last year.','Машина была куплена в прошлом году.'],
  ['My question was not answered.','На мой вопрос не ответили.'],
  ['This is made in Japan.','Это сделано в Японии.'],
  ['The problem will be solved.','Проблема будет решена.'],
  ['We were invited to the party.','Нас пригласили на вечеринку.'],
  ['The room is cleaned every day.','Комнату убирают каждый день.'],
  ['He was given a new job.','Ему дали новую работу.']
];

/* ---------- морфология английского ---------- */

function vThird(v) {
  const w = v.en;
  if (w === 'have') return 'has';
  if (w === 'do') return 'does';
  if (w === 'go') return 'goes';
  if (/(s|sh|ch|x|z|o)$/.test(w)) return w + 'es';
  if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ies';
  return w + 's';
}

function vPast(v) {
  if (v.p2) return v.p2;
  return vEd(v.en);
}

function vPP(v) {
  if (v.p3) return v.p3;
  if (v.p2) return v.p2;
  return vEd(v.en);
}

function vEd(w) {
  if (/e$/.test(w)) return w + 'd';
  if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ied';
  if (/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(w)) return w + w.slice(-1) + 'ed';
  return w + 'ed';
}

function vIng(w) {
  if (w === 'be') return 'being';
  if (/ie$/.test(w)) return w.slice(0, -2) + 'ying';
  if (/[^aeiou]e$/.test(w)) return w.slice(0, -1) + 'ing';
  if (/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(w)) return w + w.slice(-1) + 'ing';
  return w + 'ing';
}

/* ---------- морфология русского ---------- */

const RU_FUT = ['буду', 'будешь', 'будет', 'будет', 'будем', 'будут'];
const RU_WAS = ['был', 'был', 'был', 'была', 'были', 'были'];

/* род для лица: 0 = «я», 1 = «ты», 2 = он, 3 = она, 4/5 = мн.ч. */
function genderOf(i, myGender) {
  const partner = myGender === 'f' ? 'm' : 'f';
  if (i === 0) return myGender;
  if (i === 1) return partner;
  if (i === 2) return 'm';
  if (i === 3) return 'f';
  return 'pl';
}

function ruPast(v, i, myGender) {
  const g = genderOf(i, myGender);
  if (g === 'f') return v.ru.pf;
  if (g === 'pl') return v.ru.pp;
  return v.ru.pm;
}

function ruWas(i, myGender) {
  const g = genderOf(i, myGender);
  if (g === 'f') return 'была';
  if (g === 'pl') return 'были';
  return 'был';
}

function ruComp(comp, i, myGender, tense) {
  if (typeof comp.ru === 'string') {
    /* профессии и т.п.: в прошедшем/будущем при глаголе «быть»
       существительное встаёт в творительный падеж («буду врачом»),
       в настоящем — именительный, без связки («я врач»).
       С we/they — множественное число («они врачи», «мы будем врачами»). */
    const plural = (i === 4 || i === 5) && comp.ru_pl;
    if (tense && tense !== 'pres' && comp.ins) return plural ? comp.ins_pl : comp.ins;
    return plural ? comp.ru_pl : comp.ru;
  }
  const g = genderOf(i, myGender);
  return comp.ru[g] || comp.ru.m;
}

/* Английский текст дополнения с учётом числа (артикль пропадает во мн.ч.) */
function enComp(comp, i) {
  if ((i === 4 || i === 5) && comp.enPl) return comp.enPl;
  return comp.en;
}

/* ---------- утилиты ---------- */

const rnd = a => a[Math.floor(Math.random() * a.length)];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

function clean(parts) {
  return parts.filter(x => x && x.length).join(' ').replace(/\s+/g, ' ').trim();
}

/* Нормализация для сравнения ответов */
function norm(s) {
  return s.toLowerCase()
    .replace(/[.!?,]/g, '')
    .replace(/’/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/* ---------- генераторы по режимам ---------- */

function genBase(cfg) {
  const pool = VERBS.filter(v => v.L <= cfg.maxL);
  const v = rnd(pool);
  const i = Math.floor(Math.random() * 6);
  const p = PRONOUNS[i];
  const t = rnd(cfg.tenses);
  const f = rnd(cfg.forms);
  const obj = rnd(v.o);
  const oEn = obj[0], oRu = obj[1];
  const third = p.third;

  let en, ru, q = false;

  if (t === 'pres') {
    if (f === 'aff') en = clean([p.en, third ? vThird(v) : v.en, oEn]);
    if (f === 'neg') en = clean([p.en, third ? "doesn't" : "don't", v.en, oEn]);
    if (f === 'que') { en = clean([third ? 'does' : 'do', p.en, v.en, oEn]); q = true; }
    ru = clean([p.ru, f === 'neg' ? 'не' : '', v.ru.pres[i], oRu]);
  }

  if (t === 'past') {
    if (f === 'aff') en = clean([p.en, vPast(v), oEn]);
    if (f === 'neg') en = clean([p.en, "didn't", v.en, oEn]);
    if (f === 'que') { en = clean(['did', p.en, v.en, oEn]); q = true; }
    ru = clean([p.ru, f === 'neg' ? 'не' : '', ruPast(v, i, cfg.gender), oRu]);
  }

  if (t === 'fut') {
    if (f === 'aff') en = clean([p.en, 'will', v.en, oEn]);
    if (f === 'neg') en = clean([p.en, "won't", v.en, oEn]);
    if (f === 'que') { en = clean(['will', p.en, v.en, oEn]); q = true; }
    ru = clean([p.ru, f === 'neg' ? 'не' : '', RU_FUT[i], v.ru.inf, oRu]);
  }

  if (f === 'que') q = true;
  return finish(en, ru, q, `${TENSES.find(x=>x.id===t).ru} · ${FORMS.find(x=>x.id===f).ru}`);
}

function genToBe(cfg) {
  const i = Math.floor(Math.random() * 6);
  const p = PRONOUNS[i];
  const c = rnd(COMPS);
  const t = rnd(cfg.tenses);
  const f = rnd(cfg.forms);
  const beP = i === 0 ? 'am' : (p.third ? 'is' : 'are');
  const beD = (i === 0 || p.third) ? 'was' : 'were';
  const compRu = ruComp(c, i, cfg.gender, t);
  const compEn = enComp(c, i);

  let en, ru, q = false;

  if (t === 'pres') {
    if (f === 'aff') en = clean([p.en, beP, compEn]);
    if (f === 'neg') en = clean([p.en, beP, 'not', compEn]);
    if (f === 'que') { en = clean([beP, p.en, compEn]); q = true; }
    ru = clean([p.ru, f === 'neg' ? 'не' : '', compRu]);
  }
  if (t === 'past') {
    if (f === 'aff') en = clean([p.en, beD, compEn]);
    if (f === 'neg') en = clean([p.en, beD, 'not', compEn]);
    if (f === 'que') { en = clean([beD, p.en, compEn]); q = true; }
    ru = clean([p.ru, f === 'neg' ? 'не' : '', ruWas(i, cfg.gender), compRu]);
  }
  if (t === 'fut') {
    if (f === 'aff') en = clean([p.en, 'will be', compEn]);
    if (f === 'neg') en = clean([p.en, 'will not be', compEn]);
    if (f === 'que') { en = clean(['will', p.en, 'be', compEn]); q = true; }
    ru = clean([p.ru, f === 'neg' ? 'не' : '', RU_FUT[i], compRu]);
  }

  return finish(en, ru, q, 'глагол to be · состояние');
}

function genThere(cfg) {
  const n = rnd(THERE_NOUNS);
  const pl = rnd(THERE_PLACES);
  const t = rnd(cfg.tenses);
  const f = rnd(cfg.forms);
  const many = n.g === 'pl';

  let en, ru, q = false;

  if (t === 'pres') {
    const be = many ? 'are' : 'is';
    if (f === 'aff') en = clean(['there', be, n.en, pl.en]);
    if (f === 'neg') en = clean(['there', be, 'not', n.en, pl.en]);
    if (f === 'que') { en = clean([be, 'there', n.en, pl.en]); q = true; }
    ru = f === 'neg' ? clean([cap(pl.ru), 'нет', n.gen]) : clean([cap(pl.ru), 'есть', n.ru]);
  }
  if (t === 'past') {
    const be = many ? 'were' : 'was';
    if (f === 'aff') en = clean(['there', be, n.en, pl.en]);
    if (f === 'neg') en = clean(['there', be, 'not', n.en, pl.en]);
    if (f === 'que') { en = clean([be, 'there', n.en, pl.en]); q = true; }
    const wasRu = n.g === 'f' ? 'была' : n.g === 'n' ? 'было' : n.g === 'pl' ? 'были' : 'был';
    ru = f === 'neg' ? clean([cap(pl.ru), 'не было', n.gen]) : clean([cap(pl.ru), wasRu, n.ru]);
  }
  if (t === 'fut') {
    if (f === 'aff') en = clean(['there will be', n.en, pl.en]);
    if (f === 'neg') en = clean(['there will not be', n.en, pl.en]);
    if (f === 'que') { en = clean(['will there be', n.en, pl.en]); q = true; }
    ru = f === 'neg'
      ? clean([cap(pl.ru), 'не будет', n.gen])
      : clean([cap(pl.ru), many ? 'будут' : 'будет', n.ru]);
  }

  return finish(en, ru, q, 'there is / there are');
}

function genModal(cfg) {
  const pool = VERBS.filter(v => v.L <= cfg.maxL);
  const v = rnd(pool);
  const i = Math.floor(Math.random() * 6);
  const p = PRONOUNS[i];
  const m = rnd(MODALS);
  const f = rnd(cfg.forms);
  const obj = rnd(v.o);
  let en, ru, q = false;

  if (f === 'aff') en = clean([p.en, m.en, v.en, obj[0]]);
  if (f === 'neg') en = clean([p.en, m.neg, v.en, obj[0]]);
  if (f === 'que') { en = clean([m.en, p.en, v.en, obj[0]]); q = true; }

  if (m.isAdj) {
    const g = genderOf(i, cfg.gender);
    const w = m.ru[g] || m.ru.m;
    ru = clean([p.ru, f === 'neg' ? 'не' : '', w, v.ru.inf, obj[1]]);
  } else if (m.noPron) {
    ru = clean([m.dat[i], f === 'neg' ? 'не' : '', m.verb, v.ru.inf, obj[1]]);
  } else {
    ru = clean([p.ru, f === 'neg' ? 'не' : '', m.ru[i], v.ru.inf, obj[1]]);
  }

  return finish(en, ru, q, 'модальный глагол · без do и без -s');
}

function genCont(cfg) {
  const pool = VERBS.filter(v => v.L <= cfg.maxL && !['know','understand','want','have','remember','see'].includes(v.en));
  const v = rnd(pool);
  const i = Math.floor(Math.random() * 6);
  const p = PRONOUNS[i];
  const f = rnd(cfg.forms);
  const t = Math.random() < 0.5 ? 'pres' : 'past';
  const obj = rnd(v.o);
  const ving = vIng(v.en);
  const beP = i === 0 ? 'am' : (p.third ? 'is' : 'are');
  const beD = (i === 0 || p.third) ? 'was' : 'were';
  const be = t === 'pres' ? beP : beD;
  let en, ru, q = false;

  if (f === 'aff') en = clean([p.en, be, ving, obj[0]]);
  if (f === 'neg') en = clean([p.en, be, 'not', ving, obj[0]]);
  if (f === 'que') { en = clean([be, p.en, ving, obj[0]]); q = true; }

  const marker = t === 'pres' ? 'сейчас' : 'в тот момент';
  const verbRu = t === 'pres' ? v.ru.pres[i] : ruPast(v, i, cfg.gender);
  ru = clean([p.ru, marker, f === 'neg' ? 'не' : '', verbRu, obj[1]]);

  return finish(en, ru, q, 'Continuous · to be + -ing');
}

function genPerf(cfg) {
  const pool = VERBS.filter(v => v.L <= cfg.maxL);
  const v = rnd(pool);
  const i = Math.floor(Math.random() * 6);
  const p = PRONOUNS[i];
  const f = rnd(cfg.forms);
  const obj = rnd(v.o);
  const have = p.third ? 'has' : 'have';
  const haveN = p.third ? "hasn't" : "haven't";
  const pp = vPP(v);
  let en, ru, q = false;

  if (f === 'aff') { en = clean([p.en, have, 'already', pp, obj[0]]);
                     ru = clean([p.ru, 'уже', ruPast(v, i, cfg.gender), obj[1]]); }
  if (f === 'neg') { en = clean([p.en, haveN, pp, obj[0], 'yet']);
                     ru = clean([p.ru, 'ещё не', ruPast(v, i, cfg.gender), obj[1]]); }
  if (f === 'que') { en = clean([have, p.en, 'ever', pp, obj[0]]); q = true;
                     ru = clean([p.ru, 'когда-нибудь', ruPast(v, i, cfg.gender), obj[1]]); }

  return finish(en, ru, q, 'Present Perfect · have + 3-я форма');
}

function genPairs(list, hint) {
  const pair = rnd(list);
  return {
    en: pair[0],
    ru: pair[1],
    hint,
    tokens: makeTokens(pair[0])
  };
}

/* ---------- сборка результата ---------- */

function finish(en, ru, q, hint) {
  const enFinal = cap(en) + (q ? '?' : '.');
  const ruFinal = cap(ru) + (q ? '?' : '.');
  return { en: enFinal, ru: ruFinal, hint, tokens: makeTokens(enFinal) };
}

/* Плитки: правильные слова + отвлекающие, всё перемешано */
function makeTokens(sentence) {
  const words = sentence.replace(/[.?!]/g, '').split(' ').filter(Boolean);
  const extra = [];
  const bag = DISTRACTORS.filter(d => !words.some(w => w.toLowerCase() === d));
  const need = Math.min(4, Math.max(2, Math.round(words.length / 2)));
  while (extra.length < need && bag.length) {
    const d = bag.splice(Math.floor(Math.random() * bag.length), 1)[0];
    extra.push(d);
  }
  const all = words.concat(extra);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}

/* ---------- публичная точка входа ---------- */

function generatePhrase(drill, gender) {
  const cfg = {
    tenses: drill.tenses,
    forms: drill.forms,
    maxL: drill.maxL,
    gender: gender || 'm'
  };
  const mode = rnd(drill.modes);
  switch (mode) {
    case 'tobe':  return genToBe(cfg);
    case 'there': return genThere(cfg);
    case 'modal': return genModal(cfg);
    case 'cont':  return genCont(cfg);
    case 'perf':  return genPerf(cfg);
    case 'imper': return genPairs(IMPERATIVES, 'повелительное наклонение');
    case 'pass':  return genPairs(PASSIVES, 'пассивный залог · to be + 3-я форма');
    default:      return genBase(cfg);
  }
}
