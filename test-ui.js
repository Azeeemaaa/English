/* Прогон интерфейса в виртуальном браузере. Запуск: node test-ui.js
   Требует: npm i jsdom                                              */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, 'standalone.html'), 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'https://local.test/' });
const { window } = dom;
window.scrollTo = () => {};
const doc = window.document;

let fails = 0;
const check = (name, cond, extra) => {
  if (!cond) { fails++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
  else console.log('  ✓ ' + name);
};
const $ = sel => doc.querySelector(sel);
const txt = () => doc.getElementById('app').textContent;
const click = sel => { const e = $(sel); if (!e) throw new Error('нет элемента ' + sel); e.click(); };

console.log('\nЗапуск');
check('приложение отрисовалось', txt().includes('Полиглот'));
check('два профиля созданы по умолчанию', txt().includes('Азамат') && txt().includes('Жена'));

console.log('\nВыбор профиля');
click('[data-pick="azamat"]');
check('главный экран открылся', txt().includes('16 уроков'));
check('видны все 16 уроков', doc.querySelectorAll('.lesson').length === 16);
check('открыт только урок 1', doc.querySelectorAll('.lesson.locked').length === 15);
check('есть кнопка «Продолжить»', txt().includes('Продолжить урок 1'));

console.log('\nУрок 1');
click('[data-lesson="1"]');
check('заголовок урока', txt().includes('Базовая таблица глагола'));
check('теория загрузилась', txt().includes('9 клеток'));
check('таблица Петрова отрисована', doc.querySelectorAll('table.petrov').length >= 1);
click('[data-tab="words"]');
check('вкладка «Слова»', doc.querySelectorAll('.wordlist .w').length === 28,
  doc.querySelectorAll('.wordlist .w').length);

console.log('\nТренажёр');
click('[data-tab="drill"]');
click('#startDrill');
check('тренажёр открылся', txt().includes('1 / 15'));
check('есть русская подсказка', !!$('.prompt .ru') && $('.prompt .ru').textContent.length > 3);
const tiles = doc.querySelectorAll('.tiles .tile');
check('плитки со словами есть', tiles.length >= 3, tiles.length);

/* собираем ЗАВЕДОМО правильный ответ, читая внутреннее состояние */
function solveOnce() {
  const need = window.Poliglot.session.phrase.en.replace(/[.?!]/g, '').split(' ');
  const toks = window.Poliglot.session.phrase.tokens;
  const used = new Set();
  for (const w of need) {
    const idx = toks.findIndex((t, i) => t === w && !used.has(i));
    used.add(idx);
    doc.querySelector('[data-tk="' + idx + '"]').click();
  }
  click('#check');
}
solveOnce();
check('правильный ответ засчитан', txt().includes('Верно'));
check('счётчик верных = 1', window.Poliglot.session.correct === 1, window.Poliglot.session.correct);
click('#next');
check('перешли ко второй фразе', txt().includes('2 / 15'));

console.log('\nПрохождение подхода до конца');
for (let i = 1; i < 15; i++) { solveOnce(); click('#next'); }
check('итоговый экран', txt().includes('100%'), txt().slice(0, 60));
check('очки начислены', window.Poliglot.S.profiles.azamat.xp > 0, window.Poliglot.S.profiles.azamat.xp);
check('серия = 1 день', window.Poliglot.S.profiles.azamat.streak === 1);

console.log('\nЭкзамен и разблокировка');
click('#home');
click('[data-lesson="1"]');
click('[data-tab="exam"]');
click('#startExam');
check('экзамен на 20 фраз', txt().includes('1 / 20'));
for (let i = 0; i < 20; i++) { solveOnce(); click('#next'); }
check('урок 2 открылся', window.Poliglot.S.profiles.azamat.unlocked === 2,
  window.Poliglot.S.profiles.azamat.unlocked);
check('сообщение о разблокировке', txt().includes('Урок 2 открыт'));

console.log('\nКарточки слов');
click('#home');
click('#toCards');
check('карточка показана', !!$('.flash .word'));
click('#show');
check('перевод открылся', !!$('.flash .tr'));
const before = Object.keys(window.Poliglot.S.profiles.azamat.cards).length;
click('[data-g="2"]');
check('оценка сохранена в SRS',
  Object.keys(window.Poliglot.S.profiles.azamat.cards).length === before + 1);
check('не более 10 новых слов в день',
  window.Poliglot.S.profiles.azamat.newToday <= 10, window.Poliglot.S.profiles.azamat.newToday);

console.log('\nНастройки');
click('.topbar .back');
click('#toStats');
check('экран статистики', txt().includes('Слов в работе'));
click('#tm');
check('режим печати переключился', window.Poliglot.S.profiles.azamat.typeMode === true);
click('#gd');
check('род переключился', window.Poliglot.S.profiles.azamat.gender === 'f');
click('#gd'); click('#tm');

console.log('\nСохранение состояния');
const saved = JSON.parse(window.localStorage.getItem('poliglot.v2'));
check('прогресс записан в localStorage', saved && saved.profiles.azamat.unlocked === 2);
check('активный профиль сохранён', saved.active === 'azamat');

console.log('\nВторой профиль независим');
click('#switchP');
click('[data-pick="wife"]');
check('у жены свой прогресс', window.Poliglot.S.profiles.wife.unlocked === 1);
check('у жены женский род', window.Poliglot.S.profiles.wife.gender === 'f');

console.log('\n' + (fails ? '✗ ПРОВАЛЕНО: ' + fails : '✓ Интерфейс работает') + '\n');
process.exit(fails ? 1 : 0);
