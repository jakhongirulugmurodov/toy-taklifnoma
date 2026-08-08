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

  function openInvite() {
    if (opened) return;
    opened = true;
    sealBtn.classList.add('is-broken');
    setTimeout(function () {
      seal.classList.add('is-open');
      document.body.classList.remove('is-locked');
      seal.setAttribute('aria-hidden', 'true');
      $('main').focus && $('main').focus();
      tryMusic();
    }, reduced ? 0 : 420);
  }
  sealBtn.addEventListener('click', openInvite);

  /* ══════════ 2. MUSIQA ══════════ */
  var music = $('bgMusic'), musicBtn = $('musicBtn'), playing = false, hasAudio = false;

  // Fayl umuman yo'q bo'lsa tugmani ko'rsatmaymiz
  music.addEventListener('canplay', function () {
    hasAudio = true;
    musicBtn.hidden = false;
  });
  music.addEventListener('error', function () { musicBtn.hidden = true; });
  music.load();

  function setMusic(on) {
    playing = on;
    musicBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    musicBtn.setAttribute('aria-label', on ? "Musiqani o'chirish" : 'Musiqani yoqish');
  }
  function tryMusic() {
    if (!hasAudio) return;
    music.volume = 0.45;
    music.play().then(function () { setMusic(true); }).catch(function () { setMusic(false); });
  }
  musicBtn.addEventListener('click', function () {
    if (playing) { music.pause(); setMusic(false); }
    else { tryMusic(); }
  });

  /* ══════════ 3. REVEAL ══════════ */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ══════════ 4. SANOQ ══════════ */
  var target = new Date(CFG.date || '2026-08-17T19:00:00+05:00').getTime();
  var cdD = $('cdD'), cdH = $('cdH'), cdM = $('cdM'), cdS = $('cdS'), cdNote = $('cdNote');
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var cdTimer;

  function tick() {
    var diff = target - Date.now();
    if (diff <= 0) {
      cdD.textContent = cdH.textContent = cdM.textContent = cdS.textContent = '00';
      cdNote.innerHTML = 'Baxtli kun keldi <span aria-hidden="true">❤</span>';
      clearInterval(cdTimer);
      return;
    }
    cdD.textContent = pad(Math.floor(diff / 86400000));
    cdH.textContent = pad(Math.floor(diff / 3600000) % 24);
    cdM.textContent = pad(Math.floor(diff / 60000) % 60);
    cdS.textContent = pad(Math.floor(diff / 1000) % 60);
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

  /* ══════════ 8. RASM (bo'lmasa monogramma) ══════════ */
  (function () {
    var img = $('couplePhoto');
    img.addEventListener('load', function () {
      img.hidden = false;
      $('archMono').hidden = true;
    });
    img.addEventListener('error', function () { img.remove(); });
  })();

  /* ══════════ 9. RSVP ══════════ */
  var form = $('rsvpForm'), done = $('rsvpDone');
  var nameEl = $('rsvpName'), phoneEl = $('rsvpPhone'), errEl = $('rsvpErr');
  var btnYes = $('btnYes'), btnNo = $('btnNo');
  var STORE = 'toy-rsvp-v1';
  var chosen = 'yes';

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
      name: name,
      phone: phoneEl.value.trim(),
      answer: chosen,
      at: new Date().toISOString(),
      website: $('hp').value            // asalarixona — bot to'ldirsa serverda tashlanadi
    };

    btnYes.disabled = btnNo.disabled = true;
    send(rec).then(function () {
      saveLocal(rec);
      showDone(rec, true);
    }).catch(function () {
      // Server javob bermasa ham mehmon uchun ish tugadi — javob keyin yuboriladi
      saveLocal(rec);
      queue(rec);
      showDone(rec, true);
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
    phoneEl.value = prev.phone || '';
    chosen = prev.answer;
  }

  /* ══════════ 10. OLTIN CHANG ══════════ */
  function goldDust() {
    if (reduced || !document.body.animate) return;
    var rect = done.getBoundingClientRect();
    var cx = rect.left + rect.width / 2, cy = rect.top + 60;

    for (var i = 0; i < 26; i++) {
      var p = document.createElement('i');
      p.className = 'dust';
      var size = 3 + Math.random() * 5;
      p.style.width = p.style.height = size.toFixed(1) + 'px';
      p.style.opacity = (0.35 + Math.random() * 0.5).toFixed(2);
      document.body.appendChild(p);

      var ang = Math.random() * Math.PI * 2;
      var dist = 70 + Math.random() * 190;
      p.animate([
        { transform: 'translate(' + cx + 'px,' + cy + 'px) scale(.4)', opacity: 1 },
        {
          transform: 'translate(' + (cx + Math.cos(ang) * dist) + 'px,' +
            (cy + Math.sin(ang) * dist + 130) + 'px) scale(1)', opacity: 0
        }
      ], { duration: 1400 + Math.random() * 900, easing: 'cubic-bezier(.2,.7,.4,1)' })
        .onfinish = (function (node) { return function () { node.remove(); }; })(p);
    }
  }
})();
