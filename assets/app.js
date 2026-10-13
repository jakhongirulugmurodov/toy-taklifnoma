/* ══════════════════════════════════════════════════
   Taklifnoma — mantiq
   ══════════════════════════════════════════════════ */
(function () {
  'use strict';

  var CFG = window.TOY || {};

  var $ = function (id) { return document.getElementById(id); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ══════════ 0. SANA MATNLARI (config.js dan) ══════════
     Sana faqat config.js da yoziladi — sahifadagi barcha matnlar shu yerdan
     to'ldiriladi. HTML ichidagi matn faqat zaxira (skript yiqilsa). */
  var MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul',
    'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  var WEEKDAYS = ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba'];

  /* Mehmon qaysi mintaqada bo'lmasin, sana O'zbekiston bo'yicha olinadi —
     shuning uchun Date emas, ISO satrning o'zi bo'laklanadi */
  var iso = String(CFG.date || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  var D = iso ? { y: +iso[1], m: +iso[2] - 1, d: +iso[3] } : null;

  if (D) {
    var two = function (n) { return (n < 10 ? '0' : '') + n; };
    var wd = WEEKDAYS[new Date(Date.UTC(D.y, D.m, D.d)).getUTCDay()];
    var cap = function (t) { return t.charAt(0).toUpperCase() + t.slice(1); };
    var T = {
      'date-long': D.d + '-' + MONTHS[D.m] + ', ' + D.y,
      'date-dots': two(D.d) + '.' + two(D.m + 1) + '.' + D.y,
      'day-week': D.d + '-' + MONTHS[D.m] + ', ' + wd,
      'month-year': cap(MONTHS[D.m]) + ' ' + D.y
    };
    document.querySelectorAll('[data-t]').forEach(function (el) {
      var v = T[el.getAttribute('data-t')];
      if (v) el.textContent = v;
    });
  }

  /* ── Toast ─────────────────────────────────────── */
  var toastEl = $('toast'), toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 3200);
  }

  /* ══════════ 1. MUHR ══════════ */
  var seal = $('seal'), sealBtn = $('sealBtn');
  var opened = false;

  // Havolada ism bo'lsa ko'rsatamiz:  ?ism=Karimov%20oilasi
  try {
    var q = new URLSearchParams(location.search);
    var who = (q.get('ism') || q.get('name') || '').trim().slice(0, 60);
    if (who) $('sealTitle').textContent = who;
  } catch (e) { /* eski brauzer — standart matn qoladi */ }

  document.body.classList.add('is-locked');

  function buzz(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) {}
  }

  /* Xoreografiya: muhr sinadi → oltin chang → parda ikkiga ochiladi → ismlar chiqadi */
  function openInvite() {
    if (opened) return;
    opened = true;
    buzz(14);
    askGyro();                       // iOS ruxsati faqat teginish ichida so'raladi

    if (reduced) {
      seal.classList.add('is-cracking', 'is-open', 'is-gone');
      document.body.classList.remove('is-locked');
      document.body.classList.add('opened');
      seal.setAttribute('aria-hidden', 'true');
      if (pref() !== 'off') musicOn(false);
      return;
    }

    seal.classList.add('is-cracking');
    var r = sealBtn.getBoundingClientRect();
    dust(r.left + r.width / 2, r.top + r.height / 2, 30, 60, 40);

    setTimeout(function () {
      seal.classList.add('is-open');            // parda surila boshlaydi
      document.body.classList.remove('is-locked');
      document.body.classList.add('opened');    // hero xoreografiyasi start oladi
      seal.setAttribute('aria-hidden', 'true');
      if (pref() !== 'off') musicOn(false);
    }, 430);

    setTimeout(function () { seal.classList.add('is-gone'); }, 2600);
  }
  sealBtn.addEventListener('click', openInvite);
  window.__toyReady = true;

  /* ══════════ 2. MUSIQA ══════════ */
  var music = $('bgMusic'), musicBtn = $('musicBtn');
  var hasAudio = false, playing = false, fadeTimer = null, toldOnce = false;
  var VOL = 0.4, PREF = 'toy-music';

  function pref() { try { return localStorage.getItem(PREF); } catch (e) { return null; } }
  function setPref(v) { try { localStorage.setItem(PREF, v); } catch (e) {} }

  // Fayl bo'lmasa tugma ham, muhrdagi eslatma ham chiqmaydi
  var musicWanted = false;   // muhr audio tayyor bo'lishidan OLDIN bosilgan bo'lsa
  music.addEventListener('loadedmetadata', function () {
    hasAudio = true;
    musicBtn.hidden = false;
    var hint = document.querySelector('.seal__music');
    if (hint) hint.hidden = false;
    if (musicWanted && pref() !== 'off') musicOn(false);
  });
  music.addEventListener('error', function () { hasAudio = false; musicBtn.hidden = true; });
  // Sahifa yuklanib bo'lgachgina audio so'raladi (sekin internetda renderga xalaqit bermasin)
  window.addEventListener('load', function () {
    setTimeout(function () { try { music.load(); } catch (e) {} }, 600);
  });

  function paint(on) {
    playing = on;
    musicBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    musicBtn.setAttribute('aria-label', on ? "Musiqani o'chirish" : 'Musiqani yoqish');
  }

  /* Ovozni keskin emas, yumshoq ko'taradi/tushiradi */
  function fade(to, after) {
    clearInterval(fadeTimer);
    if (reduced) { music.volume = to; if (after) after(); return; }
    var step = (to - music.volume) / 14;
    fadeTimer = setInterval(function () {
      var v = music.volume + step;
      if ((step > 0 && v >= to) || (step < 0 && v <= to) || !step) {
        music.volume = Math.min(1, Math.max(0, to));
        clearInterval(fadeTimer);
        if (after) after();
      } else {
        music.volume = Math.min(1, Math.max(0, v));
      }
    }, 45);
  }

  function musicOn(quiet) {
    if (!hasAudio) { musicWanted = true; return; }   // tayyor bo'lgach o'zi boshlanadi
    music.volume = 0;
    music.play().then(function () {
      paint(true);
      setPref('on');
      fade(VOL);
      if (!quiet && !toldOnce) {
        toldOnce = true;
        toast("Musiqa yoqildi — o'chirish uchun yuqoridagi tugmani bosing");
      }
    }).catch(function () { paint(false); });
  }

  function musicOff() {
    setPref('off');
    paint(false);
    fade(0, function () { music.pause(); });
  }

  musicBtn.addEventListener('click', function () {
    if (playing) { musicOff(); } else { musicOn(true); }
  });

  /* Mehmon boshqa ilovaga o'tsa — jim turadi, qaytganda davom etadi */
  document.addEventListener('visibilitychange', function () {
    if (!hasAudio || !playing) return;
    if (document.hidden) { music.pause(); }
    else { music.play().catch(function () {}); }
  });

  /* ══════════ 3. REVEAL (navbat bilan) ══════════ */
  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      var order = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        // Bir partiyada kelganlar navbat bilan ochiladi
        if (!reduced) {
          el.style.transitionDelay = (order * 110) + 'ms';
          order++;
          el.addEventListener('transitionend', function te() {
            el.style.transitionDelay = '';
            el.removeEventListener('transitionend', te);
          });
        }
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ══════════ 4. SANOQ (raqamlar pastdan aylanib chiqadi) ══════════ */
  var target = new Date(CFG.date).getTime();
  var cdD = $('cdD'), cdH = $('cdH'), cdM = $('cdM'), cdS = $('cdS'), cdNote = $('cdNote');
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var cdTimer;

  function setNum(el, val) {
    if (el.textContent === val) return;
    el.textContent = val;
    if (reduced || !el.animate) return;
    el.animate(
      [{ transform: 'translateY(.42em)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
      { duration: 480, easing: 'cubic-bezier(.22,1,.36,1)' }
    );
  }

  function tick() {
    var diff = target - Date.now();
    if (diff <= 0) {
      cdD.textContent = cdH.textContent = cdM.textContent = cdS.textContent = '00';
      cdNote.innerHTML = 'Baxtli kun keldi <span aria-hidden="true">❤</span>';
      clearInterval(cdTimer);
      return;
    }
    setNum(cdD, pad(Math.floor(diff / 86400000)));
    setNum(cdH, pad(Math.floor(diff / 3600000) % 24));
    setNum(cdM, pad(Math.floor(diff / 60000) % 60));
    setNum(cdS, pad(Math.floor(diff / 1000) % 60));
  }
  tick();
  cdTimer = setInterval(tick, 1000);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { clearInterval(cdTimer); }
    else { tick(); cdTimer = setInterval(tick, 1000); }
  });

  /* ══════════ 5. KALENDAR (dushanbadan) ══════════ */
  (function () {
    var grid = $('calGrid');
    if (!D) return;
    var year = D.y, month = D.m, theDay = D.d;
    grid.setAttribute('aria-label', year + '-yil ' + MONTHS[month] + ' oyi');

    ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].forEach(function (name) {
      var el = document.createElement('div');
      el.className = 'cal__dow';
      el.textContent = name;
      grid.appendChild(el);
    });

    // getDay(): 0=Yakshanba → dushanbadan boshlanadigan indeksga o'giramiz
    var first = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
    var total = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    for (var i = 0; i < first; i++) {
      var gap = document.createElement('div');
      gap.className = 'cal__day cal__day--empty';
      grid.appendChild(gap);
    }
    for (var day = 1; day <= total; day++) {
      var cell = document.createElement('div');
      cell.className = 'cal__day' + (day === theDay ? ' cal__day--on' : '');
      cell.textContent = day;
      grid.appendChild(cell);
    }
  })();

  /* ══════════ 6. KALENDAR FAYLI (.ics) ══════════ */
  $('icsBtn').addEventListener('click', function () {
    var ymd = function (add) {
      var d = new Date(Date.UTC(D.y, D.m, D.d + add));
      return d.getUTCFullYear() + String(d.getUTCMonth() + 1).padStart(2, '0') + String(d.getUTCDate()).padStart(2, '0');
    };
    var fmt = function (iso) {
      return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };
    var ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ON agy//Toy//UZ', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:toy-' + target + '@onagy.app',
      'DTSTAMP:' + fmt(new Date().toISOString()),
      // Nahorgi oshning aniq vaqti yo'q — telefon kalendarida butun kunlik tadbir
      'DTSTART;VALUE=DATE:' + ymd(0),
      'DTEND;VALUE=DATE:' + ymd(1),
      'SUMMARY:' + CFG.title,
      'LOCATION:' + CFG.place,
      'DESCRIPTION:' + (CFG.note || "Nikoh to'yiga taklifnoma"),
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', "DESCRIPTION:Ertaga to'y", 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');

    var url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    var a = document.createElement('a');
    a.href = url; a.download = D ? 'toy-' + D.d + '-' + MONTHS[D.m] + '.ics' : 'toy.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast('Kalendar fayli yuklandi');
  });

  /* ══════════ 7. XARITA (kerak bo'lganda yuklanadi) ══════════ */
  (function () {
    var box = $('map'), loaded = false;
    if (!box) return;
    function load() {
      if (loaded) return;
      loaded = true;
      var f = document.createElement('iframe');
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.title = 'To\'yxona joylashuvi';
      f.src = 'https://www.google.com/maps?q=' + encodeURIComponent(CFG.mapQuery) + '&output=embed';
      f.addEventListener('load', function () {
        var s = box.querySelector('.map__skeleton');
        if (s) s.remove();
      });
      box.appendChild(f);
    }
    if ('IntersectionObserver' in window) {
      var mio = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { load(); mio.disconnect(); }
      }, { rootMargin: '300px' });
      mio.observe(box);
    } else { load(); }
  })();

  /* ── Manzildan nusxa ── */
  $('copyAddr').addEventListener('click', function () {
    var text = CFG.place || $('venueAddr').textContent;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () { toast('Manzil nusxalandi'); },
        function () { toast(text); });
    } else { toast(text); }
  });

  /* ══════════ 10. OLTIN CHANG ══════════ */
  function dust(cx, cy, n, spread, fall) {
    if (reduced || !document.body.animate) return;
    for (var i = 0; i < n; i++) {
      var p = document.createElement('i');
      p.className = 'dust';
      var size = 3 + Math.random() * 5;
      p.style.width = p.style.height = size.toFixed(1) + 'px';
      p.style.opacity = (0.35 + Math.random() * 0.5).toFixed(2);
      document.body.appendChild(p);

      var ang = Math.random() * Math.PI * 2;
      var dist = spread + Math.random() * spread * 2.6;
      p.animate([
        { transform: 'translate(' + cx + 'px,' + cy + 'px) scale(.4)', opacity: 1 },
        {
          transform: 'translate(' + (cx + Math.cos(ang) * dist) + 'px,' +
            (cy + Math.sin(ang) * dist + fall) + 'px) scale(1)', opacity: 0
        }
      ], { duration: 1400 + Math.random() * 900, easing: 'cubic-bezier(.2,.7,.4,1)' })
        .onfinish = (function (node) { return function () { node.remove(); }; })(p);
    }
  }

  /* ══════════ 11. GIRIH PARALLAKSI + OLTIN IP ══════════ */
  var threadPath = null, threadRect = null, threadLen = 0;
  var threadNodes = [], threadEnd = null;

  function buildThread() {
    var main = $('main');
    var old = main.querySelector('.thread');
    if (old) old.remove();

    var W = main.clientWidth, H = main.scrollHeight;
    var hero = $('hero');
    var startY = hero.offsetTop + hero.offsetHeight - 30;
    var secs = ['taklif', 'sanoq', 'kalendar', 'manzil']
      .map(function (id) { return $(id); })
      .filter(function (el) { return el && !el.hidden; });

    var pts = [[W / 2, startY]];
    var amp = Math.min(96, W * 0.2);

    /* Nuqtalar HAR DOIM pastga qarab borishi shart. Bo'limlar ro'yxati
       sahifadagi tartibdan farq qilsa (masalan tilaklar RSVP'dan keyin),
       saralanmagan nuqtalar ipni orqaga qaytarib, bir joyda bir nechta
       parallel chiziq hosil qiladi. */
    var ys = secs
      .map(function (sec) { return sec.offsetTop + Math.min(44, sec.offsetHeight * 0.12); })
      .filter(function (y) { return y > startY + 60; })
      .sort(function (a, b) { return a - b; });

    var side = 1;
    ys.forEach(function (y) {
      var dy = y - pts[pts.length - 1][1];
      if (dy < 90) return;                        // juda yaqin — burilish hunuk chiqadi
      var a = Math.min(amp, dy * 0.38);           // tik burilish bo'lmasin
      pts.push([W / 2 + side * a, y]);
      side = -side;
    });
    pts.push([W / 2, H - 40]);
    if (pts.length < 3) return;

    var d = 'M' + pts[0][0] + ' ' + pts[0][1];
    for (var i = 1; i < pts.length; i++) {
      var midY = (pts[i - 1][1] + pts[i][1]) / 2;
      d += ' C ' + pts[i - 1][0] + ' ' + midY + ', ' + pts[i][0] + ' ' + midY +
           ', ' + pts[i][0] + ' ' + pts[i][1];
    }

    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'thread');
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('aria-hidden', 'true');
    svg.style.height = H + 'px';

    var clip = document.createElementNS(NS, 'clipPath');
    clip.setAttribute('id', 'threadClip');
    threadRect = document.createElementNS(NS, 'rect');
    threadRect.setAttribute('x', 0);
    threadRect.setAttribute('y', 0);
    threadRect.setAttribute('width', W);
    threadRect.setAttribute('height', 0);
    clip.appendChild(threadRect);

    threadPath = document.createElementNS(NS, 'path');
    threadPath.setAttribute('class', 'thread__line');
    threadPath.setAttribute('d', d);
    threadPath.setAttribute('clip-path', 'url(#threadClip)');

    svg.appendChild(clip);
    svg.appendChild(threadPath);

    /* ── Tugunlar: ip yo'l, tugunlar bekat ──
       DIQQAT: joylashuv (translate) TASHQI <g> da, animatsiya (scale/rotate)
       ICHKI <g> da. CSS transform SVG transform atributini bekor qiladi —
       ikkalasi bitta elementda bo'lsa tugun 0,0 ga ko'chib ketadi. */
    function mk(tag, attrs) {
      var el = document.createElementNS(NS, tag);
      for (var a in attrs) el.setAttribute(a, attrs[a]);
      return el;
    }

    threadNodes = [];
    for (var k = 1; k < pts.length - 1; k++) {
      var pos = mk('g', { transform: 'translate(' + pts[k][0] + ',' + pts[k][1] + ')' });
      var node = mk('g', { 'class': 'thread__node' });
      node.appendChild(mk('circle', { r: 10, 'class': 'thread__halo' }));
      node.appendChild(mk('path', { d: 'M0 -5.5 5.5 0 0 5.5 -5.5 0Z', 'class': 'thread__dia' }));
      pos.appendChild(node);
      svg.appendChild(pos);
      node.dataset.y = pts[k][1];
      threadNodes.push(node);
    }

    /* ── Yakun: ip uzilib qolmaydi, naqsh bilan tugaydi ── */
    var last = pts[pts.length - 1];
    var endPos = mk('g', { transform: 'translate(' + last[0] + ',' + last[1] + ')' });
    var end = mk('g', { 'class': 'thread__end' });
    end.appendChild(mk('path', { d: 'M-96 0 H-39 M39 0 H96', 'class': 'thread__end-wing' }));
    end.appendChild(mk('path', { d: 'M-18 0 -27 -6 -27 6Z M18 0 27 -6 27 6Z', 'class': 'thread__end-tip' }));
    end.appendChild(mk('path', { d: 'M0 -9 9 0 0 9 -9 0Z', 'class': 'thread__end-dia' }));
    endPos.appendChild(end);
    svg.appendChild(endPos);
    end.dataset.y = last[1];
    threadEnd = end;

    main.insertBefore(svg, main.firstChild);
    threadLen = H;
    paintThread();
  }

  /* Silliqlik CSS transition zimmasida — rAF siklga bog'liq emas,
     quvvat-tejash rejimida ham sinmaydi */
  var lastThread = 0, threadTimer = null;

  /* Ip qaralayotgan joygacha "tikiladi", yetib kelgan tugunlar yonadi.
     rAF ishlatilmaydi — sahifa old planda bo'lmasa u butunlay to'xtaydi. */
  function paintThread() {
    if (!threadRect || !threadLen) return;
    var goal = Math.max(0, Math.min(threadLen,
      (window.scrollY || 0) + window.innerHeight * 0.78));
    threadRect.setAttribute('height', goal.toFixed(0));

    for (var i = 0; i < threadNodes.length; i++) {
      var n = threadNodes[i];
      if (!n.__lit && goal >= (+n.dataset.y) - 8) {
        n.__lit = true;
        n.classList.add('is-lit');
      }
    }
    if (threadEnd && !threadEnd.__lit && goal >= (+threadEnd.dataset.y) - 8) {
      threadEnd.__lit = true;
      threadEnd.classList.add('is-lit');
    }
  }

  function queueThread() {
    var now = Date.now();
    if (now - lastThread >= 100) { lastThread = now; paintThread(); return; }
    if (threadTimer) return;
    threadTimer = setTimeout(function () {
      threadTimer = null; lastThread = Date.now(); paintThread();
    }, 100);
  }

  if (!reduced) {
    window.addEventListener('scroll', queueThread, { passive: true });
    window.addEventListener('load', function () { buildThread(); });
    var rsz;
    window.addEventListener('resize', function () {
      clearTimeout(rsz);
      rsz = setTimeout(function () { buildThread(); }, 250);
    });
  }

  /* ══════════ 12. HERO ZARRALARI ══════════ */
  (function () {
    if (reduced) return;
    var hero = $('hero');
    for (var i = 0; i < 12; i++) {
      var s = document.createElement('i');
      s.className = 'spark';
      var size = (1.6 + Math.random() * 2.6).toFixed(1);
      s.style.width = s.style.height = size + 'px';
      s.style.left = (4 + Math.random() * 92).toFixed(1) + '%';
      s.style.setProperty('--sd', (9 + Math.random() * 9).toFixed(1) + 's');
      s.style.setProperty('--sdel', (-Math.random() * 14).toFixed(1) + 's');
      s.style.setProperty('--sx', ((Math.random() - 0.5) * 70).toFixed(0) + 'px');
      hero.appendChild(s);
    }
  })();

  /* ══════════ 13. GIROSKOP — mehrob illyustratsiyasi yengil suriladi ══════════ */
  var gyroBase = null;
  function onTilt(ev) {
    if (ev.beta == null || ev.gamma == null) return;
    if (gyroBase === null) gyroBase = { b: ev.beta, g: ev.gamma };
    var dx = Math.max(-9, Math.min(9, (ev.gamma - gyroBase.g) * 0.45));
    var dy = Math.max(-9, Math.min(9, (ev.beta - gyroBase.b) * 0.45));
    var img = $('archArt');
    if (!img) return;
    img.style.setProperty('--px', dx.toFixed(1) + 'px');
    img.style.setProperty('--py', dy.toFixed(1) + 'px');
  }
  function askGyro() {
    if (reduced) return;
    try {
      if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(function (st) {
          if (st === 'granted') window.addEventListener('deviceorientation', onTilt);
        }).catch(function () {});
      } else if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', onTilt);
      }
    } catch (e) {}
  }
  // Kompyuterda — sichqoncha bilan xuddi shu effekt
  if (!reduced && window.matchMedia('(hover:hover)').matches) {
    document.addEventListener('mousemove', function (ev) {
      var img = $('archArt');
      if (!img) return;
      var dx = ((ev.clientX / window.innerWidth) - 0.5) * 14;
      var dy = ((ev.clientY / window.innerHeight) - 0.5) * 14;
      img.style.setProperty('--px', dx.toFixed(1) + 'px');
      img.style.setProperty('--py', dy.toFixed(1) + 'px');
    }, { passive: true });
  }

})();
