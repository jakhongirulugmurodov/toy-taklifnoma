/* ══════════════════════════════════════════════════
   Taklifnoma — mantiq
   ══════════════════════════════════════════════════ */
(function () {
  'use strict';

  var CFG = window.TOY || {};
  var $ = function (id) { return document.getElementById(id); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  var target = new Date(CFG.date || '2026-08-17T19:00:00+05:00').getTime();
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
    var d = new Date(target);
    var year = d.getFullYear(), month = d.getMonth(), theDay = d.getDate();

    ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].forEach(function (name) {
      var el = document.createElement('div');
      el.className = 'cal__dow';
      el.textContent = name;
      grid.appendChild(el);
    });

    // getDay(): 0=Yakshanba → dushanbadan boshlanadigan indeksga o'giramiz
    var first = (new Date(year, month, 1).getDay() + 6) % 7;
    var total = new Date(year, month + 1, 0).getDate();

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
    var fmt = function (iso) {
      return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };
    var ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ON agy//Toy//UZ', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:toy-' + target + '@onagy.app',
      'DTSTAMP:' + fmt(new Date().toISOString()),
      'DTSTART:' + fmt(CFG.date),
      'DTEND:' + fmt(CFG.endDate || CFG.date),
      'SUMMARY:' + CFG.title,
      'LOCATION:' + CFG.place,
      "DESCRIPTION:Nikoh to'yiga taklifnoma",
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', "DESCRIPTION:Ertaga to'y", 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');

    var url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    var a = document.createElement('a');
    a.href = url; a.download = 'toy-17-avgust.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast('Kalendar fayli yuklandi');
  });

  /* ══════════ 7. XARITA (kerak bo'lganda yuklanadi) ══════════ */
  (function () {
    var box = $('map'), loaded = false;
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

  /* ══════════ 8. RASMLAR (bo'lmasa jimgina yashiriladi) ══════════ */
  (function () {
    /* Rasm keshdan darhol kelsa 'load' biz ulangunimizcha o'tib ketadi —
       shuning uchun har doim avval .complete tekshiriladi */
    function whenReady(img, ok, fail) {
      if (img.complete) {
        (img.naturalWidth > 0 ? ok : fail)();
        return;
      }
      img.addEventListener('load', ok);
      img.addEventListener('error', fail);
    }

    // Mehrob ramkasi — rasm bo'lmasa monogramma qoladi
    var arch = $('couplePhoto');
    whenReady(arch,
      function () { arch.hidden = false; $('archMono').hidden = true; },
      function () { arch.remove(); });

    // Keng lenta — rasm bo'lmasa butun bo'lim ko'rinmaydi
    var band = $('bandPhoto');
    whenReady(band,
      function () {
        $('band').hidden = false;
        if (!reduced) buildThread();
      },
      function () { $('band').remove(); });
  })();

  /* ══════════ 9. RSVP ══════════ */
  var form = $('rsvpForm'), done = $('rsvpDone');
  var nameEl = $('rsvpName'), errEl = $('rsvpErr');
  var btnYes = $('btnYes'), btnNo = $('btnNo');
  var STORE = 'toy-rsvp-v1';
  var chosen = 'yes';

  /* Har brauzerga bitta doimiy belgi — javob qayta yuborilsa yangisi
     qo'shilmay, eskisi yangilanadi (bir xil ismli ikki mehmon aralashmaydi) */
  function visitorId() {
    var k = 'toy-vid', v;
    try { v = localStorage.getItem(k); } catch (e) {}
    if (!v) {
      v = 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      try { localStorage.setItem(k, v); } catch (e) {}
    }
    return v;
  }

  btnYes.addEventListener('click', function () { chosen = 'yes'; });
  btnNo.addEventListener('click', function () { chosen = 'no'; });

  function saveLocal(rec) {
    try { localStorage.setItem(STORE, JSON.stringify(rec)); } catch (e) {}
  }
  function readLocal() {
    try { return JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) { return null; }
  }

  function showDone(rec, celebrate) {
    form.hidden = true;
    done.hidden = false;
    var yes = rec.answer === 'yes';
    var first = (rec.name || '').split(' ')[0];
    $('doneTitle').textContent = first ? 'Rahmat, ' + first + '!' : 'Rahmat!';
    $('doneText').innerHTML = yes
      ? 'Tashrifingiz biz uchun katta baxt.<br>Ko\'rishguncha ❤'
      : 'Duolaringiz biz uchun yetarli.<br>Rahmat sizga ❤';
    $('rcAnswer').textContent = yes ? 'Kelamiz' : 'Kela olmaymiz';
    $('rcName').textContent = rec.name || '—';
    syncWishUI(rec);
    if (celebrate) buzz(yes ? [12, 50, 16] : 10);
    if (yes && celebrate) goldDust();
  }

  $('rsvpEdit').addEventListener('click', function () {
    done.hidden = true;
    form.hidden = false;
    nameEl.focus();
  });

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    errEl.hidden = true;

    var name = nameEl.value.trim().replace(/\s+/g, ' ');
    var field = nameEl.closest('.field');

    if (name.length < 2) {
      field.classList.add('has-err');
      $('nameErr').hidden = false;
      nameEl.focus();
      return;
    }
    field.classList.remove('has-err');
    $('nameErr').hidden = true;

    var rec = {
      vid: visitorId(),
      name: name,
      answer: chosen,
      at: new Date().toISOString(),
      website: $('hp').value            // asalarixona — bot to'ldirsa serverda tashlanadi
    };

    btnYes.disabled = btnNo.disabled = true;
    send(rec).then(function () {
      saveLocal(rec);
      showDone(rec, true);
    }).catch(function () {
      if (navigator.onLine === false) {
        // Internet yo'q — javobni navbatga qo'yamiz, ulanganda o'zi yuboriladi
        saveLocal(rec);
        queue(rec);
        showDone(rec, true);
        return;
      }
      // Server javob bermadi. Mehmonga soxta "qabul qilindi" ko'rsatmaymiz.
      errEl.textContent = "Javob yuborilmadi. Iltimos, birozdan keyin qayta urinib ko'ring.";
      errEl.hidden = false;
    }).then(function () {
      btnYes.disabled = btnNo.disabled = false;
    });
  });

  function endpoint() {
    var base = CFG.api;
    if (!base) return null;                       // backend ulanmagan
    if (base === '/') return '/api/rsvp';         // bir xil domen
    return base.replace(/\/+$/, '') + '/api/rsvp';
  }

  function send(rec) {
    var url = endpoint();
    if (!url) return Promise.resolve();           // faqat brauzerda saqlanadi
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rec)
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json().catch(function () { return {}; });
    });
  }

  /* Internet uzilgan bo'lsa — qayta urinamiz */
  function queue(rec) {
    if (!endpoint()) return;
    try { localStorage.setItem(STORE + '-pending', JSON.stringify(rec)); } catch (e) {}
  }
  function flush() {
    if (!endpoint()) return;
    var raw;
    try { raw = localStorage.getItem(STORE + '-pending'); } catch (e) { return; }
    if (!raw) return;
    send(JSON.parse(raw)).then(function () {
      try { localStorage.removeItem(STORE + '-pending'); } catch (e) {}
    }).catch(function () {});
  }
  window.addEventListener('online', flush);
  flush();

  /* Ilgari javob bergan bo'lsa — darhol tasdiq ekrani */
  var prev = readLocal();
  if (prev && prev.answer) {
    showDone(prev, false);
    nameEl.value = prev.name || '';
    chosen = prev.answer;
  }

  /* ══════════ MAKTUBLAR — tilaklarni to'liq o'qish ══════════ */
  var UZ_OY = ['yanvar','fevral','mart','aprel','may','iyun',
               'iyul','avgust','sentabr','oktabr','noyabr','dekabr'];

  var lettersEl = $('letters'), letterCard = $('letterCard');
  var lIdx = 0, lOpen = false;

  function lDate(raw) {
    if (!raw) return '';
    // D1 "2026-08-09 05:12:33" beradi — Safari uni o'zi tushunmaydi
    var d = new Date(String(raw).replace(' ', 'T') + (String(raw).indexOf('Z') < 0 ? 'Z' : ''));
    if (isNaN(d)) return '';
    return d.getDate() + '-' + UZ_OY[d.getMonth()] + ' ' + d.getFullYear();
  }

  function lRender(dir) {
    var w = ribbonItems[lIdx];
    if (!w) return;
    var paint = function () {
      $('letterBody').textContent = w.wish || '';
      $('letterName').textContent = w.name || '—';
      $('letterDate').textContent = lDate(w.at);
      $('letterCount').textContent = (lIdx + 1) + ' / ' + ribbonItems.length;
      $('letterPrev').disabled = lIdx === 0;
      $('letterNext').disabled = lIdx === ribbonItems.length - 1;
    };

    if (!dir || reduced) { paint(); return; }
    // Eski maktub chetga chiqadi, yangisi qarama-qarshi tomondan keladi
    letterCard.classList.add(dir > 0 ? 'is-out-l' : 'is-out-r');
    setTimeout(function () {
      paint();
      letterCard.classList.remove('is-out-l', 'is-out-r');
      letterCard.classList.add(dir > 0 ? 'is-out-r' : 'is-out-l');
      void letterCard.offsetWidth;
      letterCard.classList.remove('is-out-l', 'is-out-r');
    }, 300);
  }

  function lGo(step) {
    var next = lIdx + step;
    if (next < 0 || next >= ribbonItems.length) return;
    lIdx = next;
    lRender(step);
    var hint = $('lettersHint');
    if (hint) hint.style.opacity = '0';
  }

  function lOpenAt(i) {
    if (!ribbonItems.length) return;
    lIdx = Math.max(0, Math.min(ribbonItems.length - 1, i || 0));
    lettersEl.hidden = false;
    document.body.classList.add('is-locked');
    lOpen = true;
    lRender(0);
    void lettersEl.offsetWidth;        // reflow — o'tish shu yerdan boshlanadi
    lettersEl.classList.add('is-on');  // (rAF ishlatilmaydi: fon sahifada u o'lik)
  }

  function lClose() {
    lettersEl.classList.remove('is-on');
    lOpen = false;
    document.body.classList.remove('is-locked');
    setTimeout(function () { lettersEl.hidden = true; }, reduced ? 0 : 380);
  }

  $('wishAll').addEventListener('click', function () { lOpenAt(0); });
  $('lettersX').addEventListener('click', lClose);
  $('letterPrev').addEventListener('click', function () { lGo(-1); });
  $('letterNext').addEventListener('click', function () { lGo(1); });

  document.addEventListener('keydown', function (e) {
    if (!lOpen) return;
    if (e.key === 'Escape') lClose();
    else if (e.key === 'ArrowLeft') lGo(-1);
    else if (e.key === 'ArrowRight') lGo(1);
  });

  /* Surish — maktubni varaqlash */
  (function () {
    var x0 = null, y0 = null;
    lettersEl.addEventListener('touchstart', function (e) {
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    lettersEl.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      var dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      // Tik harakat bo'lsa — bu matnni siljitish, varaqlamaymiz
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
      lGo(dx < 0 ? 1 : -1);
    }, { passive: true });
  })();

  /* Lentadagi kartaga bosilsa — o'sha tilak maktub bo'lib ochiladi */
  ['rib1', 'rib2'].forEach(function (id) {
    var row = $(id);
    if (!row) return;
    row.addEventListener('click', function (e) {
      var card = e.target.closest && e.target.closest('.wishcard');
      if (!card) return;
      var nm = card.querySelector('b');
      var key = nm ? nm.textContent : '';
      for (var i = 0; i < ribbonItems.length; i++) {
        if (ribbonItems[i].name === key) { lOpenAt(i); return; }
      }
      lOpenAt(0);
    });
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
  function goldDust() {
    var rect = done.getBoundingClientRect();
    dust(rect.left + rect.width / 2, rect.top + 60, 26, 70, 130);
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
    var secs = ['taklif', 'sanoq', 'kalendar', 'manzil', 'dastur', 'band', 'wishes', 'rsvp']
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

  /* ══════════ 13. GIROSKOP — mehrob rasmi yengil suriladi ══════════ */
  var gyroBase = null;
  function onTilt(ev) {
    if (ev.beta == null || ev.gamma == null) return;
    if (gyroBase === null) gyroBase = { b: ev.beta, g: ev.gamma };
    var dx = Math.max(-9, Math.min(9, (ev.gamma - gyroBase.g) * 0.45));
    var dy = Math.max(-9, Math.min(9, (ev.beta - gyroBase.b) * 0.45));
    var img = $('couplePhoto');
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
      var img = $('couplePhoto');
      if (!img || img.hidden) return;
      var dx = ((ev.clientX / window.innerWidth) - 0.5) * 14;
      var dy = ((ev.clientY / window.innerHeight) - 0.5) * 14;
      img.style.setProperty('--px', dx.toFixed(1) + 'px');
      img.style.setProperty('--py', dy.toFixed(1) + 'px');
    }, { passive: true });
  }

  /* ══════════ 14. TILAKLAR ══════════ */
  var wishBox = $('wishBox'), wishText = $('wishText'), wishSend = $('wishSend');
  var wishDone = $('wishDone'), wishCount = $('wishCount');

  function wishUrl(path) {
    var base = CFG.api;
    if (!base) return null;
    if (base === '/') return '/api/' + path;
    return base.replace(/\/+$/, '') + '/api/' + path;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function syncWishUI(rec) {
    if (!wishBox || !wishUrl('wish')) return;
    if (rec && rec.wish) {
      wishBox.hidden = true;
      wishDone.hidden = false;
    } else {
      wishBox.hidden = false;
      wishDone.hidden = true;
    }
  }

  if (wishText) {
    wishText.addEventListener('input', function () {
      wishCount.textContent = wishText.value.length + ' / 200';
    });
  }

  if (wishSend) {
    wishSend.addEventListener('click', function () {
      var w = wishText.value.trim().replace(/[ \t]+/g, ' ');
      if (w.length < 3) { wishText.focus(); return; }
      wishSend.disabled = true;

      fetch(wishUrl('wish'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vid: visitorId(), wish: w.slice(0, 200) })
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        var rec = readLocal() || {};
        rec.wish = w;
        saveLocal(rec);
        syncWishUI(rec);
        buzz([10, 40, 12]);
        addWishCard({ name: rec.name || '', wish: w }, true);
      }).catch(function () {
        toast("Tilak yuborilmadi — birozdan keyin urinib ko'ring");
      }).then(function () { wishSend.disabled = false; });
    });
  }

  /* ── Tilaklar lentasi ── */
  var ribbonItems = [];
  function addWishCard(item, prepend) {
    if (prepend) ribbonItems.unshift(item); else ribbonItems.push(item);
    renderRibbon();
  }
  function card(w) {
    return '<div class="wishcard"><b>' + esc(w.name) + '</b><p>' + esc(w.wish) + '</p></div>';
  }

  /* Qatorni to'ldiradi. Halqa aylanishi uchun kamida 2 nusxa,
     va kontent ekrandan 2 barobar keng bo'lishi kerak. */
  function fillRow(rowEl, trackEl, items) {
    if (!items.length) { rowEl.hidden = true; return; }
    rowEl.hidden = false;
    var one = items.map(card).join('');
    var html = one, copies = 1;
    trackEl.innerHTML = html;
    var need = (window.innerWidth || 360) * 2;
    while ((copies < 2 || (trackEl.scrollWidth && trackEl.scrollWidth < need)) && copies < 8) {
      html += one; copies++;
      trackEl.innerHTML = html;
    }
    rowEl.dataset.copies = copies;
    rowEl.dataset.unit = trackEl.scrollWidth
      ? Math.round(trackEl.scrollWidth / copies) : 0;
  }

  function renderRibbon() {
    var sec = $('wishes');
    if (!sec || !ribbonItems.length) return;

    // Avval ko'rsatamiz — yashirin holatda o'lchamlar 0 chiqadi
    var first = sec.hidden;
    if (first) sec.hidden = false;

    // 5 tagacha — bitta qator; ko'p bo'lsa juft/toq bo'lib ikki qatorga
    var a = [], b = [];
    if (ribbonItems.length <= 5) { a = ribbonItems.slice(); }
    else {
      ribbonItems.forEach(function (w, i) { (i % 2 ? b : a).push(w); });
    }
    fillRow($('rib1'), $('ribTrack1'), a);
    fillRow($('rib2'), $('ribTrack2'), b);

    var cnt = $('wishAllN');
    if (cnt) cnt.textContent = '· ' + ribbonItems.length;

    if (first) {
      if (io) { sec.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); }); }
      if (!reduced) buildThread();
      startDrift();
    }
  }

  /* ── Uzluksiz oqim + qo'l bilan surish ──
     Qator — haqiqiy scroll konteyner. Oqim HECH QACHON to'xtamaydi;
     mehmon barmog'i bilan sursa, oqim shu yangi joydan davom etaveradi —
     ya'ni tezlik yetarli bo'lmasa qo'l bilan oldinga o'tib ketish mumkin.

     Taymer (rAF emas): sur'at vaqtga bog'liq, shuning uchun kadr chastotasi
     tushsa ham bir xil qoladi; fonda brauzer taymerni o'zi siyraklashtiradi. */
  var driftOn = false;
  var SPEED = 27;            // piksel / soniya
  function startDrift() {
    if (driftOn || reduced) return;
    driftOn = true;

    var rows = [
      { el: $('rib1'), dir: 1, inited: false },
      { el: $('rib2'), dir: -1, inited: false }
    ];

    /* Ko'rinmayotgan bo'limda bekorga ishlamaymiz.
       IntersectionObserver emas, to'g'ridan-to'g'ri o'lchov: IO sahifa
       fonda bo'lganda qayta hisoblamaydi va "ko'rinmayapti"da qotib qoladi. */
    var sec = $('wishes');
    function onScreen() {
      var r = sec.getBoundingClientRect();
      return r.bottom > -120 && r.top < (window.innerHeight || 0) + 120;
    }

    var last = Date.now();
    setInterval(function () {
      var now = Date.now();
      // Fonda taymer siyraklashsa — sakramasin deb qadamni cheklaymiz
      var dt = Math.min(100, now - last);
      last = now;
      if (!onScreen()) return;

      var step = SPEED * dt / 1000;
      rows.forEach(function (r) {
        if (!r.el || r.el.hidden) return;
        // O'lcham har qadamda jonli hisoblanadi — shrift kelishi, resize,
        // panel holati o'zgarishi hech narsani buzmaydi
        var copies = parseInt(r.el.dataset.copies, 10) || 1;
        var unit = Math.round(r.el.scrollWidth / copies);
        if (!unit || r.el.scrollWidth <= r.el.clientWidth + 4) return;
        if (!r.inited) {
          r.inited = true;
          if (r.dir < 0) r.el.scrollLeft = unit;   // teskari qator o'z uchidan boshlaydi
        }
        var x = r.el.scrollLeft + r.dir * step;
        // Halqa: kontent har "unit"da takrorlanadi — sakrash sezilmaydi
        if (x >= unit) x -= unit; else if (x <= 0) x += unit;
        r.el.scrollLeft = x;
      });
    }, 30);
  }

  // Qaytgan mehmon: tilak maydoni/rahmat holatini tiklaymiz
  if (prev && prev.answer) syncWishUI(prev);

  (function loadWishes() {
    var url = wishUrl('wishes');
    if (!url) return;
    fetch(url).then(function (r) { return r.json(); }).then(function (d) {
      var items = (d.items || []).filter(function (w) { return w && w.wish; });
      if (items.length) { ribbonItems = items; renderRibbon(); }
    }).catch(function () {});
  })();
})();
