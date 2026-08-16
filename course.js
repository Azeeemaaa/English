/* ============================================================
   ПОЛИГЛОТ · Курс из 16 уроков
   Структура следует телекурсу Д. Петрова «Полиглот. Английский
   за 16 часов» и его же базовой таблице глагола.

   Каждый урок:
     n        — номер
     title    — название
     goal     — что человек сможет делать после урока
     theory   — HTML-конспект
     vocab    — [[english, русский], ...]  → идёт в карточки SRS
     drill    — конфиг тренажёра фраз
     ============================================================ */

const COURSE = [

/* ---------------------------------------------------------- 1 */
{
  n: 1,
  title: 'Базовая таблица глагола',
  goal: 'Строить любое простое предложение действия в трёх временах и трёх формах.',
  theory: `
<p class="lead">Это <b>самый главный урок курса</b>. Петров говорит: «Освоил базовую таблицу — считай, освоил половину языка».</p>

<h3>Идея</h3>
<p>Любое высказывание о действии находится на пересечении двух осей:</p>
<ul>
  <li><b>Время</b> — настоящее / прошедшее / будущее</li>
  <li><b>Форма</b> — утверждение / отрицание / вопрос</li>
</ul>
<p>3 × 3 = <b>9 клеток</b>. Всё. Больше в простой речи ничего нет.</p>

<div class="table-wrap"><table class="petrov">
<tr><th></th><th>Утверждение</th><th>Отрицание</th><th>Вопрос</th></tr>
<tr><th>Настоящее</th><td>I work<br><span class="dim">he work<b>s</b></span></td><td>I <b>don't</b> work<br><span class="dim">he <b>doesn't</b> work</span></td><td><b>do</b> I work?<br><span class="dim"><b>does</b> he work?</span></td></tr>
<tr><th>Прошедшее</th><td>I work<b>ed</b><br><span class="dim">2-я форма</span></td><td>I <b>didn't</b> work</td><td><b>did</b> I work?</td></tr>
<tr><th>Будущее</th><td>I <b>will</b> work</td><td>I <b>won't</b> work</td><td><b>will</b> I work?</td></tr>
</table></div>

<h3>Что нужно запомнить</h3>
<ul>
  <li>Порядок слов в утверждении жёсткий: <b>кто → что делает → остальное</b>.</li>
  <li>В вопросе вспомогательный глагол выходит вперёд: <b>do / did / will</b> + кто + глагол.</li>
  <li>После <b>do, does, did, will</b> глагол всегда стоит в <b>базовой форме</b>. Никаких -s и -ed.</li>
  <li><b>-s</b> появляется только в одной клетке: настоящее + утверждение + <i>he / she</i>.</li>
  <li>У неправильных глаголов «сломана» тоже только одна клетка: прошедшее + утверждение (<i>see → saw</i>).</li>
</ul>

<h3>Местоимения</h3>
<p>I — я, you — ты/вы, he — он, she — она, we — мы, they — они.</p>
<p class="note">Петров: слово <b>it</b> — это не «оно», а «это». Рода в английском нет.</p>

<h3>Правильные и неправильные</h3>
<p>Правильный глагол в прошедшем просто получает <b>-ed</b>: work → worked, love → loved.</p>
<p>Неправильный имеет свою вторую форму, и она нужна <b>только в одном месте из девяти</b>:</p>
<p class="mono">see (saw) · come (came) · go (went) · know (knew)</p>
<p>Во всех остальных клетках — обычная базовая форма: <i>I didn't see</i>, <i>did you see?</i>, <i>he will see</i>.</p>

<h3>Как тренироваться</h3>
<p>Берёте глагол и «прокручиваете» его по всем девяти клеткам. Занимает 20–30 секунд. Потом берёте следующий. Цель — довести до автоматизма, чтобы форма выскакивала без раздумий.</p>
`,
  vocab: [
    ['love','любить'],['live','жить'],['work','работать'],['open','открывать'],
    ['close','закрывать'],['see (saw)','видеть'],['come (came)','приходить'],
    ['go (went)','идти, ходить'],['know (knew)','знать'],['do (did)','делать'],
    ['speak (spoke)','разговаривать'],['learn','учить'],
    ['I','я'],['you','ты, вы'],['he','он'],['she','она'],['we','мы'],['they','они'],
    ['it','это'],['not','не'],['and','и'],['yes','да'],['no','нет'],['here','здесь'],
    ['there','там'],['now','сейчас'],['today','сегодня'],['home','дом, домой']
  ],
  drill: { modes:['base'], tenses:['pres','past','fut'], forms:['aff','neg','que'], maxL:1 }
},

/* ---------------------------------------------------------- 2 */
{
  n: 2,
  title: 'Местоимения, вопросительные слова, связки',
  goal: 'Задавать вопросы «кто? что? где? когда? почему?» и связывать предложения.',
  theory: `
<h3>Объектные местоимения</h3>
<p>Если местоимение стоит <b>после</b> глагола (кого? кому?), оно меняет форму:</p>
<div class="table-wrap"><table class="pairs">
<tr><td>I → <b>me</b></td><td>меня, мне</td></tr>
<tr><td>you → <b>you</b></td><td>тебя, тебе</td></tr>
<tr><td>he → <b>him</b></td><td>его, ему</td></tr>
<tr><td>she → <b>her</b></td><td>её, ей</td></tr>
<tr><td>we → <b>us</b></td><td>нас, нам</td></tr>
<tr><td>they → <b>them</b></td><td>их, им</td></tr>
</table></div>
<p class="mono">I know him. · He doesn't know me. · Did you see them?</p>

<h3>Вопросительные слова</h3>
<p>Ставятся <b>перед</b> всей конструкцией. Дальше — обычный вопрос из таблицы.</p>
<div class="table-wrap"><table class="pairs">
<tr><td><b>what</b></td><td>что, какой</td></tr>
<tr><td><b>who</b></td><td>кто</td></tr>
<tr><td><b>where</b></td><td>где, куда</td></tr>
<tr><td><b>when</b></td><td>когда</td></tr>
<tr><td><b>why</b></td><td>почему</td></tr>
<tr><td><b>how</b></td><td>как</td></tr>
<tr><td><b>which</b></td><td>который</td></tr>
<tr><td><b>how much / how many</b></td><td>сколько</td></tr>
</table></div>
<p class="mono">Where do you live? · What did he say? · Why won't you come?</p>

<h3>+50 000 слов бесплатно</h3>
<p>Русские слова на <b>-ция / -сия</b> почти всегда превращаются в английские на <b>-tion / -sion</b>:</p>
<p class="mono">информация → information · ситуация → situation · революция → revolution · дискуссия → discussion</p>
<p>Ударение при этом падает на слог перед -tion.</p>

<h3>Слова-связки</h3>
<p class="mono">and — и · but — но · or — или · because — потому что · so — поэтому · if — если · that — что · also — тоже · then — потом</p>
`,
  vocab: [
    ['me','меня, мне'],['him','его, ему'],['her','её, ей'],['us','нас, нам'],['them','их, им'],
    ['what','что'],['who','кто'],['where','где, куда'],['when','когда'],['why','почему'],
    ['how','как'],['which','который'],['and','и'],['but','но'],['or','или'],
    ['because','потому что'],['so','поэтому'],['if','если'],['that','что, тот'],
    ['also','тоже'],['then','потом'],['read','читать'],['write (wrote)','писать'],
    ['think (thought)','думать'],['eat (ate)','есть'],['drink (drank)','пить'],
    ['watch','смотреть'],['listen','слушать'],['understand (understood)','понимать'],
    ['help','помогать'],['say (said)','говорить, сказать']
  ],
  drill: { modes:['base'], tenses:['pres','past','fut'], forms:['aff','neg','que'], maxL:2 }
},

/* ---------------------------------------------------------- 3 */
{
  n: 3,
  title: 'Глагол to be — предложения состояния',
  goal: 'Говорить кто ты, какой ты и где ты. Это вторая половина языка.',
  theory: `
<p class="lead">Есть предложения <b>действия</b> (урок 1) и предложения <b>состояния</b>. У состояния своя таблица — и она проще.</p>

<h3>Формы to be</h3>
<div class="table-wrap"><table class="pairs">
<tr><td>I <b>am</b></td><td>я есть</td></tr>
<tr><td>you / we / they <b>are</b></td><td>ты / мы / они есть</td></tr>
<tr><td>he / she / it <b>is</b></td><td>он / она есть</td></tr>
</table></div>
<p>Прошедшее: <b>was</b> (I, he, she) · <b>were</b> (you, we, they). Будущее: <b>will be</b> — для всех.</p>

<h3>Таблица состояния</h3>
<div class="table-wrap"><table class="petrov">
<tr><th></th><th>Утверждение</th><th>Отрицание</th><th>Вопрос</th></tr>
<tr><th>Настоящее</th><td>I <b>am</b> here</td><td>I <b>am not</b> here</td><td><b>am</b> I here?</td></tr>
<tr><th>Прошедшее</th><td>I <b>was</b> here</td><td>I <b>was not</b> here</td><td><b>was</b> I here?</td></tr>
<tr><th>Будущее</th><td>I <b>will be</b> here</td><td>I <b>will not be</b> here</td><td><b>will</b> I <b>be</b> here?</td></tr>
</table></div>
<p class="note">Главное отличие: здесь <b>не нужны</b> do / does / did. Сам to be выходит вперёд в вопросе и берёт not в отрицании.</p>

<h3>Русский пропускает «есть» — английский нет</h3>
<p>«Я дома» → нельзя <span class="bad">I home</span>. Только <b>I am home</b>.<br>
«Она врач» → <b>She is a doctor</b>.<br>
«Мы были заняты» → <b>We were busy</b>.</p>

<h3>Сокращения (так говорят всегда)</h3>
<p class="mono">I'm · you're · he's · she's · we're · they're · isn't · aren't · wasn't · weren't</p>

<h3>Два нужных глагола</h3>
<p><b>like</b> — нравиться, любить (что-то). <i>I like coffee. Do you like it?</i><br>
<b>want</b> — хотеть. <i>I want to go home.</i> После want идёт <b>to</b> + глагол.</p>
`,
  vocab: [
    ['am / is / are','есть (наст.)'],['was / were','был, была, были'],['will be','буду, будет'],
    ['like','нравиться'],['want','хотеть'],['have (had)','иметь'],['make (made)','создавать, делать'],
    ['take (took)','брать'],['give (gave)','давать'],['play','играть'],['ask','спрашивать'],
    ['answer','отвечать'],['good','хороший'],['bad','плохой'],['big','большой'],['small','маленький'],
    ['new','новый'],['old','старый'],['happy','счастливый'],['tired','уставший'],['busy','занятый'],
    ['ready','готовый'],['free','свободный'],['sure','уверенный'],['right','правильный'],
    ['wrong','неправильный'],['in','в'],['on','на'],['at','у, в'],['with','с'],['without','без']
  ],
  drill: { modes:['base','tobe'], tenses:['pres','past','fut'], forms:['aff','neg','que'], maxL:3 }
},

/* ---------------------------------------------------------- 4 */
{
  n: 4,
  title: 'Притяжательные местоимения. Семья',
  goal: 'Рассказать, чьё это и кто твои близкие.',
  theory: `
<h3>Чей?</h3>
<div class="table-wrap"><table class="pairs">
<tr><td><b>my</b></td><td>мой, моя, моё, мои</td></tr>
<tr><td><b>your</b></td><td>твой, ваш</td></tr>
<tr><td><b>his</b></td><td>его</td></tr>
<tr><td><b>her</b></td><td>её</td></tr>
<tr><td><b>our</b></td><td>наш</td></tr>
<tr><td><b>their</b></td><td>их</td></tr>
<tr><td><b>its</b></td><td>его (о предмете)</td></tr>
</table></div>
<p class="note">Рода нет: <b>my</b> подходит и к «мой дом», и к «моя жена», и к «мои дети».</p>

<h3>Притяжательный 's</h3>
<p>Чтобы сказать «дом Азамата» — не нужен предлог. Хозяин ставится вперёд и получает <b>'s</b>:</p>
<p class="mono">Azamat's house · my wife's name · the doctor's question</p>
<p>Если хозяев много и слово уже кончается на -s, ставится только апостроф: <i>my parents' house</i>.</p>

<h3>Артикли — коротко</h3>
<p><b>a / an</b> — «какой-то один, неизвестный». <i>a doctor, an engineer</i> (an — перед гласным звуком).<br>
<b>the</b> — «тот самый, о котором мы уже знаем». <i>Close the door.</i><br>
С именами, языками и общими понятиями артикль не ставится: <i>I speak English.</i></p>

<h3>Have / have got</h3>
<p>«У меня есть» → <b>I have</b> (he/she — <b>has</b>).</p>
<p class="mono">I have a car. · She has two children. · Do you have time? · I don't have money.</p>
`,
  vocab: [
    ['my','мой'],['your','твой, ваш'],['his','его'],['her','её'],['our','наш'],['their','их'],
    ['family','семья'],['wife','жена'],['husband','муж'],['son','сын'],['daughter','дочь'],
    ['child / children','ребёнок / дети'],['mother','мать'],['father','отец'],['parents','родители'],
    ['brother','брат'],['sister','сестра'],['friend','друг'],['name','имя'],['house','дом'],
    ['home','дом (родной)'],['city','город'],['country','страна'],['car','машина'],
    ['find (found)','находить'],['get (got)','получать'],['buy (bought)','покупать'],
    ['call','звонить'],['start','начинать'],['finish','заканчивать']
  ],
  drill: { modes:['base','tobe'], tenses:['pres','past','fut'], forms:['aff','neg','que'], maxL:4 }
},

/* ---------------------------------------------------------- 5 */
{
  n: 5,
  title: 'Профессии. Этикет. Рассказ о себе',
  goal: 'Представиться, рассказать о работе, вежливо начать и закончить разговор.',
  theory: `
<h3>Рассказ о себе — каркас</h3>
<p>Это ваш личный текст. Выучите его один раз и подставляйте свои слова.</p>
<blockquote class="mono">
My name is Azamat.<br>
I am from Kazakhstan. I live in Almaty.<br>
I am a businessman. I work in my own company.<br>
I have a wife and two children.<br>
I like travelling and reading.<br>
I am learning English because I want to speak with people from other countries.
</blockquote>

<h3>Профессии</h3>
<p class="mono">doctor · teacher · engineer · driver · manager · lawyer · builder · student · businessman · programmer · seller · cook</p>
<p>Перед профессией нужен артикль: <b>I am a doctor</b> (не «I am doctor»).</p>

<h3>Этикет</h3>
<div class="table-wrap"><table class="pairs">
<tr><td>Hello · Hi</td><td>Здравствуйте · Привет</td></tr>
<tr><td>Good morning / afternoon / evening</td><td>Доброе утро / день / вечер</td></tr>
<tr><td>How are you?</td><td>Как дела?</td></tr>
<tr><td>I'm fine, thank you. And you?</td><td>Хорошо, спасибо. А вы?</td></tr>
<tr><td>Nice to meet you.</td><td>Приятно познакомиться.</td></tr>
<tr><td>Excuse me · Sorry</td><td>Извините (обратиться) · Простите (виноват)</td></tr>
<tr><td>Please · Thank you · You're welcome</td><td>Пожалуйста · Спасибо · Не за что</td></tr>
<tr><td>See you later · Goodbye</td><td>До встречи · До свидания</td></tr>
</table></div>
<p class="note">Вежливость в английском держится на трёх словах: <b>please</b>, <b>sorry</b>, <b>thank you</b>. Их много не бывает.</p>
`,
  vocab: [
    ['doctor','врач'],['teacher','учитель'],['engineer','инженер'],['driver','водитель'],
    ['manager','менеджер'],['lawyer','юрист'],['student','студент'],['businessman','бизнесмен'],
    ['job','работа (место)'],['company','компания'],['money','деньги'],['office','офис'],
    ['hello','здравствуйте'],['goodbye','до свидания'],['please','пожалуйста'],
    ['thank you','спасибо'],['sorry','извините'],['excuse me','простите'],
    ['nice to meet you','приятно познакомиться'],['how are you?','как дела?'],
    ['meet (met)','встречать'],['sleep (slept)','спать'],['tell (told)','рассказывать'],
    ['study','изучать'],['use','использовать'],['travel','путешествовать'],
    ['from','из, от'],['about','о, об'],['for','для'],['very','очень']
  ],
  drill: { modes:['base','tobe'], tenses:['pres','past','fut'], forms:['aff','neg','que'], maxL:5 }
},

/* ---------------------------------------------------------- 6 */
{
  n: 6,
  title: 'Прилагательные и сравнение',
  goal: 'Сравнивать: больше, лучше, самый интересный.',
  theory: `
<h3>Три ступени</h3>
<p><b>Короткие слова</b> (1–2 слога) получают окончания:</p>
<p class="mono">big → big<b>ger</b> → the big<b>gest</b><br>
old → old<b>er</b> → the old<b>est</b><br>
easy → eas<b>ier</b> → the eas<b>iest</b></p>

<p><b>Длинные слова</b> (3+ слога) берут more / the most:</p>
<p class="mono">interesting → <b>more</b> interesting → <b>the most</b> interesting<br>
beautiful → <b>more</b> beautiful → <b>the most</b> beautiful</p>

<h3>Исключения — выучить наизусть</h3>
<div class="table-wrap"><table class="pairs">
<tr><td>good → <b>better</b> → the <b>best</b></td><td>хороший → лучше → лучший</td></tr>
<tr><td>bad → <b>worse</b> → the <b>worst</b></td><td>плохой → хуже → худший</td></tr>
<tr><td>much/many → <b>more</b> → the <b>most</b></td><td>много → больше → больше всего</td></tr>
<tr><td>little → <b>less</b> → the <b>least</b></td><td>мало → меньше → меньше всего</td></tr>
<tr><td>far → <b>further</b> → the <b>furthest</b></td><td>далеко → дальше → самый дальний</td></tr>
</table></div>

<h3>Чем? — than</h3>
<p class="mono">This car is <b>better than</b> that one.<br>
He speaks English <b>better than</b> me.<br>
Moscow is <b>bigger than</b> Almaty.</p>

<h3>Одинаковые — as ... as</h3>
<p class="mono">She is <b>as</b> tall <b>as</b> her sister. — Она такая же высокая, как сестра.<br>
It is <b>not as</b> easy <b>as</b> you think. — Это не так просто, как ты думаешь.</p>

<h3>Указательные</h3>
<p><b>this</b> (этот) → <b>these</b> (эти) · <b>that</b> (тот) → <b>those</b> (те)</p>
`,
  vocab: [
    ['better','лучше'],['worse','хуже'],['more','больше'],['less','меньше'],['than','чем'],
    ['this / these','этот / эти'],['that / those','тот / те'],['same','такой же'],
    ['different','другой'],['easy','лёгкий'],['difficult','трудный'],['important','важный'],
    ['interesting','интересный'],['beautiful','красивый'],['expensive','дорогой'],['cheap','дешёвый'],
    ['fast','быстрый'],['slow','медленный'],['strong','сильный'],['long','длинный'],['short','короткий'],
    ['high','высокий'],['low','низкий'],['feel (felt)','чувствовать'],['leave (left)','уезжать'],
    ['put','класть'],['sit (sat)','сидеть'],['remember','помнить'],['wait','ждать']
  ],
  drill: { modes:['base','tobe'], tenses:['pres','past','fut'], forms:['aff','neg','que'], maxL:6 }
},

/* ---------------------------------------------------------- 7 */
{
  n: 7,
  title: 'Слова-параметры. Much / many. Числа',
  goal: 'Говорить «сколько»: много, мало, немного, слишком, достаточно.',
  theory: `
<h3>Считаемое и несчитаемое</h3>
<p>Английский делит существительные на то, что можно посчитать, и то, что нельзя.</p>
<div class="table-wrap"><table class="pairs">
<tr><td><b>many</b> books</td><td>много книг (счётное)</td></tr>
<tr><td><b>much</b> water</td><td>много воды (несчётное)</td></tr>
<tr><td><b>a lot of</b> books / water</td><td>много (универсально, в утверждении)</td></tr>
<tr><td><b>a few</b> books</td><td>несколько книг</td></tr>
<tr><td><b>a little</b> water</td><td>немного воды</td></tr>
<tr><td><b>few</b> / <b>little</b></td><td>мало (и это плохо)</td></tr>
</table></div>
<p class="note">Практика: в утверждении почти всегда говорят <b>a lot of</b>. Much и many живут в вопросах и отрицаниях: <i>How much? Not many.</i></p>

<h3>Усилители</h3>
<p class="mono">very — очень · too — слишком · enough — достаточно (ставится ПОСЛЕ слова: <i>good enough</i>) · quite — довольно · almost — почти · only — только</p>

<h3>Числа</h3>
<p class="mono">1 one · 2 two · 3 three · 4 four · 5 five · 6 six · 7 seven · 8 eight · 9 nine · 10 ten</p>
<p class="mono">11 eleven · 12 twelve · 13 thirteen · … · 19 nineteen<br>
20 twenty · 30 thirty · 40 forty · 50 fifty · 60 sixty · 70 seventy · 80 eighty · 90 ninety<br>
100 a hundred · 1000 a thousand · 1 000 000 a million</p>
<p>Составные — через дефис: <b>twenty-one</b>, <b>forty-five</b>. Сотни: <b>two hundred and thirty</b>.</p>

<h3>Порядковые</h3>
<p class="mono">first · second · third · fourth · fifth · … · tenth · twentieth</p>
`,
  vocab: [
    ['much','много (несчёт.)'],['many','много (счёт.)'],['a lot of','много'],['a few','несколько'],
    ['a little','немного'],['enough','достаточно'],['too','слишком'],['very','очень'],
    ['only','только'],['almost','почти'],['all','всё, все'],['some','некоторый, немного'],
    ['any','любой, какой-нибудь'],['every','каждый'],['nothing','ничего'],['something','что-то'],
    ['everything','всё'],['nobody','никто'],['somebody','кто-то'],['everybody','все'],
    ['one','один'],['two','два'],['three','три'],['ten','десять'],['hundred','сто'],
    ['thousand','тысяча'],['first','первый'],['second','второй'],['stand (stood)','стоять'],
    ['run (ran)','бегать'],['cook','готовить'],['drive (drove)','водить'],['pay (paid)','платить']
  ],
  drill: { modes:['base','tobe'], tenses:['pres','past','fut'], forms:['aff','neg','que'], maxL:7 }
},

/* ---------------------------------------------------------- 8 */
{
  n: 8,
  title: 'Время: предлоги и параметры',
  goal: 'Назначать встречи: когда, во сколько, какого числа.',
  theory: `
<h3>Три предлога времени</h3>
<div class="table-wrap"><table class="pairs">
<tr><td><b>at</b></td><td>точка: at 5 o'clock, at night, at the weekend</td></tr>
<tr><td><b>on</b></td><td>день: on Monday, on the 5th of May, on my birthday</td></tr>
<tr><td><b>in</b></td><td>период: in May, in 2026, in the morning, in two hours</td></tr>
</table></div>
<p class="note">Мнемоника: <b>at</b> — точка, <b>on</b> — день (на календаре), <b>in</b> — внутри большого отрезка.</p>
<p>Без предлога: <b>today, tomorrow, yesterday, this week, next year, every day</b>.</p>

<h3>Дни недели</h3>
<p class="mono">Monday · Tuesday · Wednesday · Thursday · Friday · Saturday · Sunday</p>

<h3>Месяцы</h3>
<p class="mono">January · February · March · April · May · June<br>
July · August · September · October · November · December</p>

<h3>Который час</h3>
<p class="mono">What time is it? — It's five o'clock. (ровно)<br>
It's half past five. — половина шестого<br>
It's a quarter to six. — без пятнадцати шесть<br>
It's ten past five. — десять минут шестого</p>
<p>В жизни чаще говорят просто цифрами: <b>five thirty</b>, <b>nine fifteen</b>.</p>

<h3>Слова-периоды</h3>
<p class="mono">now · then · soon · already · still · yet · always · usually · often · sometimes · never · again</p>
`,
  vocab: [
    ['time','время'],['day','день'],['week','неделя'],['month','месяц'],['year','год'],
    ['hour','час'],['minute','минута'],['morning','утро'],['evening','вечер'],['night','ночь'],
    ['today','сегодня'],['tomorrow','завтра'],['yesterday','вчера'],['always','всегда'],
    ['usually','обычно'],['often','часто'],['sometimes','иногда'],['never','никогда'],
    ['already','уже'],['still','всё ещё'],['yet','ещё (в вопросах)'],['soon','скоро'],
    ['again','снова'],['Monday','понедельник'],['Friday','пятница'],['Saturday','суббота'],
    ['Sunday','воскресенье'],['send (sent)','отправлять'],['sing (sang)','петь'],
    ['teach (taught)','преподавать']
  ],
  drill: { modes:['base','tobe'], tenses:['pres','past','fut'], forms:['aff','neg','que'], maxL:8 }
},

/* ---------------------------------------------------------- 9 */
{
  n: 9,
  title: 'There is / There are',
  goal: 'Описывать, что где находится и что вообще существует.',
  theory: `
<h3>Конструкция наличия</h3>
<p>Русское «есть / имеется / находится» без хозяина переводится через <b>there is / there are</b>. Дословно — «там есть».</p>
<p class="mono">There <b>is</b> a book on the table. — На столе (есть) книга.<br>
There <b>are</b> two rooms in my flat. — В моей квартире две комнаты.</p>
<p><b>is</b> — если предмет один, <b>are</b> — если много.</p>

<h3>Все девять клеток</h3>
<div class="table-wrap"><table class="petrov">
<tr><th></th><th>Утверждение</th><th>Отрицание</th><th>Вопрос</th></tr>
<tr><th>Настоящее</th><td>there is / are</td><td>there is <b>not</b></td><td><b>is</b> there?</td></tr>
<tr><th>Прошедшее</th><td>there was / were</td><td>there was <b>not</b></td><td><b>was</b> there?</td></tr>
<tr><th>Будущее</th><td>there <b>will be</b></td><td>there <b>will not be</b></td><td><b>will</b> there <b>be</b>?</td></tr>
</table></div>

<h3>Не путать с have</h3>
<p>Если есть <b>хозяин</b> — используем have: <i>I have a car.</i><br>
Если хозяина нет, есть только <b>место</b> — there is: <i>There is a car near the house.</i></p>

<h3>Полезные обороты</h3>
<p class="mono">Is there a problem? — Есть проблема?<br>
There is nothing here. — Здесь ничего нет.<br>
There were a lot of people. — Было много людей.<br>
There will be a meeting tomorrow. — Завтра будет встреча.</p>
`,
  vocab: [
    ['there is','есть, находится'],['there are','есть (мн.ч.)'],['room','комната'],
    ['table','стол'],['chair','стул'],['door','дверь'],['window','окно'],['wall','стена'],
    ['floor','пол, этаж'],['street','улица'],['shop','магазин'],['restaurant','ресторан'],
    ['hotel','отель'],['airport','аэропорт'],['station','вокзал'],['bank','банк'],
    ['hospital','больница'],['school','школа'],['park','парк'],['problem','проблема'],
    ['question','вопрос'],['answer','ответ'],['reason','причина'],['place','место'],
    ['people','люди'],['man / men','мужчина / мужчины'],['woman / women','женщина / женщины'],
    ['thing','вещь'],['water','вода'],['food','еда']
  ],
  drill: { modes:['base','tobe','there'], tenses:['pres','past','fut'], forms:['aff','neg','que'], maxL:9 }
},

/* ---------------------------------------------------------- 10 */
{
  n: 10,
  title: 'Предлоги места и направления. Послелоги',
  goal: 'Объяснить дорогу и сказать, где что лежит.',
  theory: `
<h3>Где? (место)</h3>
<div class="table-wrap"><table class="pairs">
<tr><td><b>in</b></td><td>в (внутри): in the room, in Moscow</td></tr>
<tr><td><b>on</b></td><td>на (поверхности): on the table</td></tr>
<tr><td><b>at</b></td><td>у, при (точка): at home, at work, at the door</td></tr>
<tr><td><b>under</b></td><td>под</td></tr>
<tr><td><b>over / above</b></td><td>над</td></tr>
<tr><td><b>near / next to</b></td><td>рядом с</td></tr>
<tr><td><b>between</b></td><td>между</td></tr>
<tr><td><b>behind</b></td><td>за, позади</td></tr>
<tr><td><b>in front of</b></td><td>перед</td></tr>
<tr><td><b>inside / outside</b></td><td>внутри / снаружи</td></tr>
</table></div>

<h3>Куда? (направление)</h3>
<p class="mono">to — к, в (I go <b>to</b> work) · from — из, от · into — внутрь · out of — наружу · through — сквозь · across — через · along — вдоль · around — вокруг · up / down — вверх / вниз</p>
<p class="note">Исключение: <b>home</b> идёт без to. Правильно <i>I go home</i>, а не «to home».</p>

<h3>Послелоги — маленькие слова, меняющие смысл</h3>
<p>Это то, что Петров называет «второй половиной глагола». Глагол один, а смыслов много:</p>
<div class="table-wrap"><table class="pairs">
<tr><td>get <b>up</b></td><td>вставать</td></tr>
<tr><td>come <b>in</b></td><td>входить</td></tr>
<tr><td>go <b>out</b></td><td>выходить, гулять</td></tr>
<tr><td>look <b>for</b></td><td>искать</td></tr>
<tr><td>look <b>at</b></td><td>смотреть на</td></tr>
<tr><td>turn <b>on / off</b></td><td>включить / выключить</td></tr>
<tr><td>put <b>on</b></td><td>надевать</td></tr>
<tr><td>take <b>off</b></td><td>снимать, взлетать</td></tr>
<tr><td>give <b>up</b></td><td>сдаваться, бросать</td></tr>
<tr><td>find <b>out</b></td><td>выяснять</td></tr>
</table></div>
`,
  vocab: [
    ['under','под'],['over','над'],['near','рядом'],['next to','рядом с'],['between','между'],
    ['behind','позади'],['in front of','перед'],['inside','внутри'],['outside','снаружи'],
    ['to','к, в'],['from','из, от'],['into','внутрь'],['out of','из'],['through','сквозь'],
    ['across','через'],['around','вокруг'],['up','вверх'],['down','вниз'],['left','налево'],
    ['right','направо'],['straight','прямо'],['get up','вставать'],['come in','входить'],
    ['go out','выходить'],['look for','искать'],['look at','смотреть на'],['turn on','включить'],
    ['turn off','выключить'],['put on','надевать'],['take off','снимать'],['find out','выяснить']
  ],
  drill: { modes:['base','tobe','there'], tenses:['pres','past','fut'], forms:['aff','neg','que'], maxL:10 }
},

/* ---------------------------------------------------------- 11 */
{
  n: 11,
  title: 'Модальные глаголы: can, must, should',
  goal: 'Говорить о возможности, необходимости и совете.',
  theory: `
<p class="lead">Модальные — особая каста. Они <b>не берут -s</b>, <b>не берут do/does/did</b> и после них глагол всегда в базовой форме.</p>

<h3>Основные</h3>
<div class="table-wrap"><table class="pairs">
<tr><td><b>can</b></td><td>мочь, уметь</td></tr>
<tr><td><b>must</b></td><td>должен (жёстко, обязан)</td></tr>
<tr><td><b>should</b></td><td>следует (совет)</td></tr>
<tr><td><b>may</b></td><td>можно, возможно</td></tr>
<tr><td><b>could</b></td><td>мог бы (вежливо / прошлое от can)</td></tr>
<tr><td><b>would</b></td><td>бы</td></tr>
</table></div>

<h3>Схема — одна на все</h3>
<div class="table-wrap"><table class="petrov">
<tr><th>Утверждение</th><th>Отрицание</th><th>Вопрос</th></tr>
<tr><td>I <b>can</b> speak</td><td>I <b>cannot</b> speak<br><span class="dim">can't</span></td><td><b>can</b> I speak?</td></tr>
<tr><td>I <b>must</b> go</td><td>I <b>must not</b> go</td><td><b>must</b> I go?</td></tr>
<tr><td>I <b>should</b> know</td><td>I <b>should not</b> know</td><td><b>should</b> I know?</td></tr>
</table></div>
<p class="note">Никогда: <span class="bad">he cans</span>, <span class="bad">do you can?</span>, <span class="bad">I can to go</span>.</p>

<h3>Прошедшее и будущее у модальных</h3>
<p>У can есть прошедшее — <b>could</b>. У остальных прошедшего нет, используются замены:</p>
<p class="mono">must → <b>had to</b> (пришлось): I <b>had to</b> go.<br>
can (будущее) → <b>will be able to</b>: I <b>will be able to</b> come.</p>

<h3>Вежливость</h3>
<p class="mono">Could you help me, please? — Не могли бы вы мне помочь?<br>
May I ask you a question? — Можно задать вопрос?<br>
Would you like some coffee? — Не хотите ли кофе?</p>
`,
  vocab: [
    ['can','мочь, уметь'],["can't",'не могу'],['could','мог бы'],['must','должен'],
    ['should','следует'],['may','можно'],['would','бы'],['have to','приходится'],
    ['be able to','быть в состоянии'],['need','нужно'],['maybe','может быть'],
    ['of course','конечно'],['sure','конечно, уверен'],['probably','вероятно'],
    ['possible','возможный'],['impossible','невозможный'],['necessary','необходимый'],
    ['idea','идея'],['plan','план'],['way','путь, способ'],['help','помощь'],
    ['advice','совет'],['choice','выбор'],['chance','шанс'],['try','пытаться'],
    ['decide','решать'],['change','менять'],['stop','останавливать'],['continue','продолжать'],
    ['keep (kept)','держать, продолжать']
  ],
  drill: { modes:['base','tobe','modal'], tenses:['pres','past','fut'], forms:['aff','neg','que'], maxL:11 }
},

/* ---------------------------------------------------------- 12 */
{
  n: 12,
  title: 'Continuous — процесс, который идёт',
  goal: 'Отличать «я работаю вообще» от «я работаю прямо сейчас».',
  theory: `
<h3>Формула</h3>
<p class="lead"><b>to be</b> + глагол + <b>-ing</b></p>
<p>Continuous — это <b>не новое время</b>. Это то же состояние (урок 3), только вместо прилагательного стоит «делающий».</p>
<p class="mono">I <b>am</b> work<b>ing</b>. — Я (есть) работающий = я сейчас работаю.<br>
He <b>was</b> read<b>ing</b>. — Он читал (в тот момент).<br>
We <b>will be</b> wait<b>ing</b>. — Мы будем ждать.</p>

<h3>Все клетки</h3>
<div class="table-wrap"><table class="petrov">
<tr><th></th><th>Утверждение</th><th>Отрицание</th><th>Вопрос</th></tr>
<tr><th>Настоящее</th><td>I am doing</td><td>I am not doing</td><td>am I doing?</td></tr>
<tr><th>Прошедшее</th><td>I was doing</td><td>I was not doing</td><td>was I doing?</td></tr>
<tr><th>Будущее</th><td>I will be doing</td><td>I will not be doing</td><td>will I be doing?</td></tr>
</table></div>

<h3>Simple или Continuous?</h3>
<div class="table-wrap"><table class="pairs">
<tr><td>I work in a bank.</td><td>вообще, всегда — <b>факт</b></td></tr>
<tr><td>I am working now.</td><td>прямо сейчас — <b>процесс</b></td></tr>
<tr><td>She reads a lot.</td><td>она вообще много читает</td></tr>
<tr><td>She is reading now.</td><td>она сейчас читает</td></tr>
</table></div>

<h3>Правописание -ing</h3>
<p class="mono">work → working · make → mak<b>ing</b> (немая -e уходит) · sit → sit<b>ting</b> (согласная удваивается) · lie → l<b>ying</b></p>

<h3>Глаголы, которые не бывают в Continuous</h3>
<p>Состояние, а не действие: <b>know, understand, like, love, want, need, remember, see, hear, believe</b>.<br>
Нельзя <span class="bad">I am knowing</span> — только <b>I know</b>.</p>

<h3>Ближайшее будущее</h3>
<p>Про запланированное чаще говорят в Continuous или через going to:</p>
<p class="mono">I <b>am meeting</b> him tomorrow. · I <b>am going to</b> call her.</p>
`,
  vocab: [
    ['working','работающий'],['going','идущий'],['doing','делающий'],['coming','приходящий'],
    ['going to','собираться'],['now','сейчас'],['at the moment','в данный момент'],
    ['while','пока, в то время как'],['during','во время'],['before','до, перед'],
    ['after','после'],['until','до тех пор пока'],['since','с (какого-то момента)'],
    ['believe','верить'],['hear (heard)','слышать'],['hope','надеяться'],['seem','казаться'],
    ['happen','случаться'],['look','выглядеть, смотреть'],['sound','звучать'],
    ['wear (wore)','носить (одежду)'],['carry','нести'],['bring (brought)','приносить'],
    ['move','двигаться'],['turn','поворачивать'],['open','открывать'],['show (showed)','показывать'],
    ['build (built)','строить'],['grow (grew)','расти']
  ],
  drill: { modes:['base','tobe','modal','cont'], tenses:['pres','past','fut'], forms:['aff','neg','que'], maxL:12 }
},

/* ---------------------------------------------------------- 13 */
{
  n: 13,
  title: 'Описание людей, вещей и погоды',
  goal: 'Описать человека, место и погоду — самая частая бытовая тема.',
  theory: `
<h3>Порядок прилагательных</h3>
<p>Если прилагательных несколько, англичане ставят их в фиксированном порядке:</p>
<p class="mono">оценка → размер → возраст → цвет → происхождение → материал → существительное</p>
<p class="mono">a <b>nice big old brown Italian leather</b> bag</p>
<p class="note">На практике больше трёх подряд почти не встречается. Не переживайте.</p>

<h3>Внешность</h3>
<p class="mono">tall / short — высокий / низкий · thin / fat — худой / полный · young / old — молодой / старый · beautiful / handsome — красивая / красивый · dark / fair hair — тёмные / светлые волосы · blue eyes — голубые глаза</p>
<p><b>What does he look like?</b> — Как он выглядит?<br>
<b>He is tall and has dark hair.</b></p>

<h3>Характер</h3>
<p class="mono">kind — добрый · clever / smart — умный · funny — смешной · serious — серьёзный · calm — спокойный · friendly — дружелюбный · lazy — ленивый · honest — честный</p>
<p><b>What is he like?</b> — Какой он (по характеру)?</p>

<h3>Цвета</h3>
<p class="mono">white · black · red · blue · green · yellow · brown · grey · orange · pink</p>

<h3>Погода</h3>
<p>Погода всегда через безличное <b>it</b>:</p>
<p class="mono">It is cold / hot / warm / cool.<br>
It is raining. — Идёт дождь.<br>
It is snowing. — Идёт снег.<br>
The sun is shining. — Светит солнце.<br>
What's the weather like today? — Какая сегодня погода?</p>
`,
  vocab: [
    ['tall','высокий'],['short','низкий, короткий'],['thin','худой'],['young','молодой'],
    ['kind','добрый'],['clever','умный'],['funny','смешной'],['serious','серьёзный'],
    ['calm','спокойный'],['friendly','дружелюбный'],['lazy','ленивый'],['honest','честный'],
    ['white','белый'],['black','чёрный'],['red','красный'],['blue','синий'],['green','зелёный'],
    ['yellow','жёлтый'],['brown','коричневый'],['grey','серый'],['weather','погода'],
    ['cold','холодный'],['hot','жаркий'],['warm','тёплый'],['rain','дождь'],['snow','снег'],
    ['sun','солнце'],['wind','ветер'],['cloud','облако'],['sky','небо'],['hair','волосы'],
    ['eyes','глаза']
  ],
  drill: { modes:['base','tobe','modal','cont'], tenses:['pres','past','fut'], forms:['aff','neg','que'], maxL:13 }
},

/* ---------------------------------------------------------- 14 */
{
  n: 14,
  title: 'Present Perfect — связь прошлого с настоящим',
  goal: 'Говорить про опыт и результат: «я уже сделал», «я никогда не был».',
  theory: `
<h3>Формула</h3>
<p class="lead"><b>have / has</b> + <b>третья форма</b> глагола</p>
<p>Это не «прошедшее время». Это <b>результат сейчас</b>. Русский переводит и так, и так — смотрите на смысл.</p>
<p class="mono">I <b>have done</b> it. — Я это сделал (и вот результат).<br>
He <b>has gone</b>. — Он ушёл (его сейчас нет).<br>
Have you <b>ever been</b> to London? — Ты когда-нибудь был в Лондоне?</p>

<h3>Третья форма</h3>
<p>У правильных глаголов третья форма = вторая = <b>+ed</b>: <i>work → worked → worked</i>.<br>
У неправильных — своя, её нужно знать:</p>
<p class="mono">see – saw – <b>seen</b> · go – went – <b>gone</b> · do – did – <b>done</b> · write – wrote – <b>written</b><br>
take – took – <b>taken</b> · give – gave – <b>given</b> · speak – spoke – <b>spoken</b> · eat – ate – <b>eaten</b><br>
be – was – <b>been</b> · come – came – <b>come</b> · know – knew – <b>known</b> · drink – drank – <b>drunk</b></p>

<h3>Клетки</h3>
<div class="table-wrap"><table class="petrov">
<tr><th>Утверждение</th><th>Отрицание</th><th>Вопрос</th></tr>
<tr><td>I <b>have</b> done<br><span class="dim">he <b>has</b> done</span></td><td>I <b>have not</b> done<br><span class="dim">haven't / hasn't</span></td><td><b>have</b> I done?<br><span class="dim">has he done?</span></td></tr>
</table></div>

<h3>Слова-маркеры</h3>
<p class="mono">already — уже · just — только что · yet — ещё (в вопросах и отрицаниях) · ever — когда-либо · never — никогда · since — с (момента) · for — в течение</p>
<p class="mono">I have <b>just</b> finished. · Have you done it <b>yet</b>? · I have <b>never</b> seen this.<br>
I have lived here <b>for</b> ten years. · She has worked here <b>since</b> 2020.</p>

<h3>Perfect или Past Simple?</h3>
<div class="table-wrap"><table class="pairs">
<tr><td>I <b>saw</b> him yesterday.</td><td>есть конкретное время в прошлом → Past</td></tr>
<tr><td>I <b>have seen</b> him.</td><td>времени нет, важен факт → Perfect</td></tr>
</table></div>
<p class="note">Простое правило: если в предложении есть <b>yesterday, last year, in 2020, ago</b> — только Past Simple.</p>
`,
  vocab: [
    ['have done','сделал (результат)'],['already','уже'],['just','только что'],
    ['yet','ещё'],['ever','когда-либо'],['never','никогда'],['since','с (момента)'],
    ['for','в течение'],['ago','тому назад'],['been','был (3-я форма)'],['seen','увиденный'],
    ['gone','ушедший'],['done','сделанный'],['written','написанный'],['taken','взятый'],
    ['given','данный'],['spoken','сказанный'],['known','известный'],['eaten','съеденный'],
    ['forget (forgot)','забывать'],['lose (lost)','терять'],['win (won)','выигрывать'],
    ['break (broke)','ломать'],['choose (chose)','выбирать'],['spend (spent)','тратить'],
    ['begin (began)','начинать'],['become (became)','становиться'],['bring (brought)','приносить'],
    ['catch (caught)','ловить']
  ],
  drill: { modes:['base','tobe','modal','cont','perf'], tenses:['pres','past','fut'], forms:['aff','neg','que'], maxL:14 }
},

/* ---------------------------------------------------------- 15 */
{
  n: 15,
  title: 'Повелительное наклонение и просьбы',
  goal: 'Просить, предлагать, приказывать и запрещать.',
  theory: `
<h3>Приказ — самая простая форма в языке</h3>
<p>Берём голый глагол. Никакого местоимения.</p>
<p class="mono">Come here. — Иди сюда.<br>
Open the door. — Открой дверь.<br>
Wait a minute. — Подожди минуту.</p>

<h3>Запрет</h3>
<p><b>Don't</b> + глагол:</p>
<p class="mono">Don't go. — Не уходи.<br>
Don't worry. — Не волнуйся.<br>
Don't tell him. — Не говори ему.</p>

<h3>Предложение «давай»</h3>
<p><b>Let's</b> (= let us) + глагол:</p>
<p class="mono">Let's go. — Пойдём.<br>
Let's do it tomorrow. — Давай сделаем это завтра.<br>
Let's not talk about it. — Давай не будем об этом.</p>

<h3>Вежливые просьбы — по возрастанию вежливости</h3>
<div class="table-wrap"><table class="pairs">
<tr><td>Open the window.</td><td>приказ</td></tr>
<tr><td>Open the window, <b>please</b>.</td><td>нейтрально</td></tr>
<tr><td><b>Can you</b> open the window?</td><td>вежливо</td></tr>
<tr><td><b>Could you</b> open the window, please?</td><td>очень вежливо</td></tr>
<tr><td><b>Would you mind</b> opening the window?</td><td>максимально мягко</td></tr>
</table></div>

<h3>Let me / Let him</h3>
<p class="mono">Let me help you. — Позволь мне помочь.<br>
Let him go. — Отпусти его.</p>

<h3>Полезные обиходные фразы</h3>
<p class="mono">Take your time. — Не торопись.<br>
Come on! — Давай! Ну же!<br>
Hold on. — Подожди (по телефону).<br>
Never mind. — Ничего страшного.<br>
Look out! — Осторожно!</p>
`,
  vocab: [
    ["let's",'давай'],['let me','позволь мне'],["don't",'не (запрет)'],['come on','давай, ну же'],
    ['hold on','подожди'],['never mind','ничего страшного'],['take your time','не торопись'],
    ['look out','осторожно'],['be careful','будь осторожен'],['hurry up','поторопись'],
    ['sit down','садись'],['stand up','встань'],['come here','иди сюда'],['go away','уходи'],
    ['worry','волноваться'],['relax','расслабиться'],['listen to me','послушай меня'],
    ['tell me','скажи мне'],['show me','покажи мне'],['give me','дай мне'],['let go','отпусти'],
    ['stop','остановись'],['wait','подожди'],['try again','попробуй снова'],
    ['well done','молодец'],['good luck','удачи'],['have a nice day','хорошего дня'],
    ['take care','береги себя'],['no problem','без проблем'],['forget it','забудь']
  ],
  drill: { modes:['base','tobe','modal','cont','perf','imper'], tenses:['pres','past','fut'], forms:['aff','neg','que'], maxL:15 }
},

/* ---------------------------------------------------------- 16 */
{
  n: 16,
  title: 'Фразовые глаголы и пассивный залог. Итог',
  goal: 'Собрать всю систему воедино и заговорить свободно на бытовые темы.',
  theory: `
<h3>Пассивный залог</h3>
<p class="lead"><b>to be</b> + <b>третья форма</b></p>
<p>Когда важно не «кто сделал», а «что было сделано»:</p>
<p class="mono">This house <b>was built</b> in 1990. — Этот дом был построен в 1990.<br>
English <b>is spoken</b> here. — Здесь говорят по-английски.<br>
The work <b>will be done</b> tomorrow. — Работа будет сделана завтра.</p>
<p>Кто сделал — через <b>by</b>: <i>This book was written <b>by</b> my friend.</i></p>

<div class="table-wrap"><table class="petrov">
<tr><th></th><th>Актив</th><th>Пассив</th></tr>
<tr><th>Настоящее</th><td>they do it</td><td>it <b>is done</b></td></tr>
<tr><th>Прошедшее</th><td>they did it</td><td>it <b>was done</b></td></tr>
<tr><th>Будущее</th><td>they will do it</td><td>it <b>will be done</b></td></tr>
</table></div>

<h3>Фразовые глаголы — топ-30 на каждый день</h3>
<div class="table-wrap"><table class="pairs">
<tr><td>get up / get on / get off</td><td>вставать / садиться в / выходить из</td></tr>
<tr><td>wake up</td><td>просыпаться</td></tr>
<tr><td>look for / look after / look forward to</td><td>искать / заботиться / ждать с нетерпением</td></tr>
<tr><td>find out</td><td>выяснить</td></tr>
<tr><td>give up</td><td>сдаться, бросить</td></tr>
<tr><td>put on / take off</td><td>надеть / снять</td></tr>
<tr><td>turn on / turn off</td><td>включить / выключить</td></tr>
<tr><td>go on / go out / go back</td><td>продолжать / выходить / возвращаться</td></tr>
<tr><td>come back / come in</td><td>вернуться / войти</td></tr>
<tr><td>pick up</td><td>подобрать, забрать</td></tr>
<tr><td>set up</td><td>настроить, основать</td></tr>
<tr><td>work out</td><td>тренироваться, получаться</td></tr>
<tr><td>check in / check out</td><td>зарегистрироваться / выселиться</td></tr>
<tr><td>run out of</td><td>закончиться (о запасе)</td></tr>
<tr><td>deal with</td><td>иметь дело с</td></tr>
</table></div>

<h3>Что у вас теперь есть</h3>
<ul>
  <li>Базовая таблица глагола — 9 клеток действия</li>
  <li>Таблица to be — 9 клеток состояния</li>
  <li>Модальные — одна схема на все</li>
  <li>Continuous, Perfect, пассив — надстройки над теми же двумя таблицами</li>
  <li>~400 слов, которые покрывают 90% бытовой речи</li>
</ul>
<p class="lead">Дальше работает только одно: <b>говорить каждый день</b>. Не добирать грамматику, а гонять то, что есть, пока оно не станет автоматическим.</p>
`,
  vocab: [
    ['is done','сделано (пассив)'],['was built','был построен'],['by','кем, посредством'],
    ['wake up','просыпаться'],['get on','садиться в'],['get off','выходить из'],
    ['look after','заботиться'],['look forward to','ждать с нетерпением'],['give up','сдаться'],
    ['go on','продолжать'],['go back','возвращаться'],['come back','вернуться'],
    ['pick up','забрать, подобрать'],['set up','настроить'],['work out','тренироваться'],
    ['check in','зарегистрироваться'],['run out of','закончиться'],['deal with','иметь дело с'],
    ['take care of','заботиться о'],['make sure','убедиться'],['pay attention','обращать внимание'],
    ['make a decision','принять решение'],['have a look','взглянуть'],['take part','принять участие'],
    ['keep in touch','оставаться на связи'],['by the way','кстати'],['at least','по крайней мере'],
    ['in fact','на самом деле'],['as soon as','как только'],['instead of','вместо']
  ],
  drill: { modes:['base','tobe','modal','cont','perf','imper','pass'], tenses:['pres','past','fut'], forms:['aff','neg','que'], maxL:16 }
}

];
