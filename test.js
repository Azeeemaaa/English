/* Проверка движка. Запуск: node test.js */
const fs = require('fs');
const path = require('path');

const src = ['js/data.js', 'js/course.js', 'js/engine.js']
  .map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
Object.assign(global, eval(
  src + '\n;({COURSE,VERBS,PRONOUNS,COMPS,THERE_NOUNS,MODALS,' +
        'generatePhrase,vThird,vEd,vIng,vPast,vPP,norm})'));

let fails = 0;
const check = (name, cond, extra) => {
  if (!cond) { fails++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
  else console.log('  ✓ ' + name);
};

console.log('\nСтруктура курса');
check('16 уроков', COURSE.length === 16, COURSE.length);
check('у всех уроков есть теория', COURSE.every(l => l.theory && l.theory.length > 300));
check('у всех уроков есть словарь', COURSE.every(l => l.vocab.length >= 20));
check('номера уроков идут подряд', COURSE.every((l, i) => l.n === i + 1));
const words = COURSE.reduce((n, l) => n + l.vocab.length, 0);
console.log('  · всего слов: ' + words);
console.log('  · всего глаголов в движке: ' + VERBS.length);

console.log('\nДанные глаголов');
check('у каждого глагола 6 форм настоящего', VERBS.every(v => v.ru.pres.length === 6),
  VERBS.filter(v => v.ru.pres.length !== 6).map(v => v.en).join(','));
check('у каждого глагола есть прошедшее (м/ж/мн)',
  VERBS.every(v => v.ru.pm && v.ru.pf && v.ru.pp));
check('у каждого глагола есть дополнения', VERBS.every(v => v.o && v.o.length >= 2));
check('нет дублей', new Set(VERBS.map(v => v.en)).size === VERBS.length);

console.log('\nМорфология');
check('watch → watches', vThird({ en: 'watch' }) === 'watches', vThird({ en: 'watch' }));
check('study → studies', vThird({ en: 'study' }) === 'studies', vThird({ en: 'study' }));
check('go → goes', vThird({ en: 'go' }) === 'goes', vThird({ en: 'go' }));
check('have → has', vThird({ en: 'have' }) === 'has', vThird({ en: 'have' }));
check('play → plays', vThird({ en: 'play' }) === 'plays', vThird({ en: 'play' }));
check('love → loved', vEd('love') === 'loved', vEd('love'));
check('study → studied', vEd('study') === 'studied', vEd('study'));
check('stop → stopped', vEd('stop') === 'stopped', vEd('stop'));
check('open → opened', vEd('open') === 'opened', vEd('open'));
check('work → working', vIng('work') === 'working', vIng('work'));
check('make → making', vIng('make') === 'making', vIng('make'));
check('sit → sitting', vIng('sit') === 'sitting', vIng('sit'));
check('see → saw / seen',
  vPast(VERBS.find(v => v.en === 'see')) === 'saw' && vPP(VERBS.find(v => v.en === 'see')) === 'seen');

console.log('\nГенерация фраз (по 500 на каждый урок)');
const badSamples = [];
let total = 0;
for (const L of COURSE) {
  for (let i = 0; i < 500; i++) {
    const p = generatePhrase(L.drill, i % 2 ? 'm' : 'f');
    total++;
    const problems = [];
    if (!p.en || !p.ru) problems.push('пусто');
    if (/undefined|null|NaN/.test(p.en + p.ru)) problems.push('undefined');
    if (/\s{2,}/.test(p.en) || /\s{2,}/.test(p.ru)) problems.push('двойные пробелы');
    if (!/^[A-Z]/.test(p.en)) problems.push('нет заглавной');
    if (!/[.?]$/.test(p.en)) problems.push('нет знака в конце');
    // все слова ответа должны быть среди плиток
    const need = p.en.replace(/[.?!]/g, '').split(' ');
    const bag = p.tokens.slice();
    for (const w of need) {
      const idx = bag.indexOf(w);
      if (idx === -1) { problems.push('нет плитки: ' + w); break; }
      bag.splice(idx, 1);
    }
    if (problems.length) badSamples.push({ L: L.n, p, problems });
  }
}
check('сгенерировано ' + total + ' фраз без ошибок', badSamples.length === 0,
  badSamples.length ? badSamples.length + ' проблемных' : '');
if (badSamples.length) {
  badSamples.slice(0, 8).forEach(b =>
    console.log('    урок ' + b.L + ' | ' + b.p.ru + ' → ' + b.p.en + '  [' + b.problems.join(', ') + ']'));
}

console.log('\nЕстественность речи (регресс на найденные баги)');
const BAD_RU_PATTERNS = [
  /\bследует не\b/,        // должно быть «не следует»
  /\bничего\b(?!.* не )/,  // «ничего» без «не» рядом — двойное отрицание сломано
];
const BAD_EN_PATTERNS = [
  /\bdo(es|didn't| not)? .*\bnothing\b/, // "don't ... nothing" — двойное отрицание
  /\blisten music\b/i,                   // нужно "listen to music"
];
let naturalBad = 0;
for (const L of COURSE) {
  for (let i = 0; i < 300; i++) {
    const p = generatePhrase(L.drill, i % 2 ? 'm' : 'f');
    for (const re of BAD_RU_PATTERNS) if (re.test(p.ru)) { naturalBad++; console.log('    плохой RU: ' + p.ru); }
    for (const re of BAD_EN_PATTERNS) if (re.test(p.en)) { naturalBad++; console.log('    плохой EN: ' + p.en); }
  }
}
check('нет двойных отрицаний и известных багов речи (4800 фраз)', naturalBad === 0, naturalBad);

// целевая проверка: should + отрицание всегда «не следует», не «следует не»
let shouldOk = true;
for (let i = 0; i < 100; i++) {
  const p = generatePhrase({ modes: ['modal'], tenses: ['pres'], forms: ['neg'], maxL: 16 }, 'f');
  if (/следует/.test(p.ru) && !/не следует/.test(p.ru)) { shouldOk = false; console.log('    ' + p.ru); }
}
check('«should» в отрицании даёт «не следует»', shouldOk);

// целевая проверка: профессия в прошедшем/будущем — творительный падеж
let caseOk = true;
const NOM = ['врач', 'учитель', 'студент', 'друг'];
for (let i = 0; i < 200; i++) {
  const p = generatePhrase({ modes: ['tobe'], tenses: ['past', 'fut'], forms: ['aff', 'neg'], maxL: 16 }, 'm');
  for (const w of NOM) {
    if (new RegExp('\\b' + w + '\\b').test(p.ru)) { caseOk = false; console.log('    ' + p.ru); }
  }
}
check('профессия в прошедшем/будущем — творительный падеж («буду врачом»)', caseOk);

// целевая проверка: we/they + профессия -> множественное число, без артикля "a"
let numberOk = true;
for (let i = 0; i < 300; i++) {
  const p = generatePhrase({ modes: ['tobe'], tenses: ['pres', 'past', 'fut'], forms: ['aff', 'neg', 'que'], maxL: 16 }, 'm');
  const subj = /^(we|they|do they|will they|was they|were they)\b/i.test(p.en) || /\b(we|they)\b/i.test(p.en.split(' ')[0] + ' ' + p.en.split(' ')[1]);
  if (/\b(they|we)\b/i.test(p.en) && /\ba (doctor|teacher|student|friend)\b/.test(p.en)) {
    numberOk = false; console.log('    ' + p.en);
  }
}
check('we/they с профессией — множественное число без артикля', numberOk);

console.log('\nСравнение ответов');
check('регистр и точки игнорируются',
  norm('I love you.') === norm('i love you'));
check("апостроф нормализуется", norm("I don’t know") === norm("I don't know"));

console.log('\nПримеры (урок 1)');
for (let i = 0; i < 6; i++) {
  const p = generatePhrase(COURSE[0].drill, 'm');
  console.log('  ' + p.ru.padEnd(34) + ' → ' + p.en);
}
console.log('\nПримеры (урок 16)');
for (let i = 0; i < 8; i++) {
  const p = generatePhrase(COURSE[15].drill, 'f');
  console.log('  ' + p.ru.padEnd(34) + ' → ' + p.en);
}

console.log('\n' + (fails ? '✗ ПРОВАЛЕНО: ' + fails : '✓ Все проверки пройдены') + '\n');
process.exit(fails ? 1 : 0);
