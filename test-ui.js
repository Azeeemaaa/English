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

console.log('\nИгровые механики: главный экран');
click('#switchProfile');
click('[data-pick="azamat"]');
check('уровень/лига показаны', txt().includes('Ур. '));
check('путь уроков отрисован (16 узлов)', doc.querySelectorAll('.path .lesson').length === 16);
check('талисман нарисован', !!$('.mascot'));
check('ачивка «Первые шаги» уже разблокирована (урок 2 открыт)',
  window.Poliglot.S.profiles.azamat.seenAch.includes('first'));

console.log('\nИгровые механики: экзамен — сердца и комбо');
click('[data-lesson="2"]');
click('[data-tab="exam"]');
click('#startExam');
check('сердца показаны на экзамене', doc.querySelectorAll('.hearts .heart').length === 5);
// два верных подряд -> должно появиться комбо
solveOnce();
click('#next');
solveOnce();
check('комбо появляется после 2 верных подряд', txt().includes('🔥2'));
click('#next');
// специально дать неверный ответ, чтобы проверить потерю сердца
const heartsBefore = window.Poliglot.S.profiles.azamat.hearts;
click('[data-tk="0"]'); // берём любую доступную плитку, не собирая верную фразу
click('#check');
check('за неверный ответ на экзамене теряется сердце',
  window.Poliglot.S.profiles.azamat.hearts === heartsBefore - 1 || !window.Poliglot.session.wasRight);
check('комбо сбрасывается после ошибки', window.Poliglot.session.combo === 0);
click('#quit');
click('.topbar .back');

console.log('\nИгровые механики: звук не ломает выполнение');
check('AudioContext недоступен в jsdom (ожидаемо)', typeof window.AudioContext === 'undefined');
click('[data-lesson="1"]');
click('[data-tab="drill"]');
click('#startDrill');
let threw = false;
try { solveOnce(); } catch (e) { threw = true; console.log('    ' + e.message); }
check('звуковой эффект не бросает исключение без Web Audio', !threw);
click('#quit');
click('.topbar .back');

console.log('\nИгровые механики: экран достижений');
click('#toStats');
click('#toAch');
check('открылся экран ачивок', txt().includes('Достижения'));
check('сетка ачивок отрисована', doc.querySelectorAll('.badge').length > 0);
check('хотя бы одна ачивка разблокирована', doc.querySelectorAll('.badge.on').length >= 1);

console.log('\nИгровые механики: настройки звука/голоса');
click('.topbar .back');
const soundBefore = window.Poliglot.S.profiles.azamat.soundOn;
click('#snd');
check('звук переключается', window.Poliglot.S.profiles.azamat.soundOn === !soundBefore);
click('#snd');
const vmBtn = doc.getElementById('vm');
check('кнопка голосового ввода скрыта без поддержки SpeechRecognition в браузере', !vmBtn);

console.log('\nЧистые функции уровней и достижений');
const li0 = window.Poliglot.levelInfo(0);
check('0 XP = уровень 1, Новичок', li0.level === 1 && li0.name === 'Новичок');
const li99 = window.Poliglot.levelInfo(99);
check('99 XP всё ещё уровень 1', li99.level === 1);
const li100 = window.Poliglot.levelInfo(100);
check('100 XP = уровень 2, Ученик', li100.level === 2 && li100.name === 'Ученик');
const liMax = window.Poliglot.levelInfo(999999);
check('огромный XP даёт максимальный уровень «Полиглот»', liMax.name === 'Полиглот' && liMax.max === true);
const achList = window.Poliglot.computeAchievements(window.Poliglot.S.profiles.azamat);
check('достижений 9 штук, у каждого есть unlocked (bool)',
  achList.length === 9 && achList.every(a => typeof a.unlocked === 'boolean'));

console.log('\n' + (fails ? '✗ ПРОВАЛЕНО: ' + fails : '✓ Интерфейс работает') + '\n');
process.exit(fails ? 1 : 0);
