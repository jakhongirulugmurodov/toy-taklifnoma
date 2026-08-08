/* ══════════════════════════════════════════════════
   Admin panel — mantiq
   ══════════════════════════════════════════════════ */
(function () {
  'use strict';

  var CFG = window.TOY || {};
  var $ = function (id) { return document.getElementById(id); };
  var PW_KEY = 'toy-admin-pw';

  var rows = [];
  var filter = 'all';
  var query = '';
  var sortKey = 'at';
  var sortAsc = false;

  /* ── Toast ── */
  var toastEl = $('toast'), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 3000);
  }

  /* ── Backend manzili ── */
  function api(path) {
    var base = CFG.api;
    if (!base) return null;
    if (base === '/') return '/api/' + path;
    return base.replace(/\/+$/, '') + '/api/' + path;
  }
  var LOCAL = !api('list');   // backend ulanmagan bo'lsa — mahalliy rejim

  /* ══════════ KIRISH ══════════ */
  var gate = $('gate'), gateForm = $('gateForm'), gateErr = $('gateErr'), gateBtn = $('gateBtn');

  gateForm.addEventListener('submit', function (e) {
    e.preventDefault();
    gateErr.hidden = true;
    var pw = $('pw').value;
    if (!pw) return;

    gateBtn.disabled = true;
    verify(pw).then(function () {
      try { sessionStorage.setItem(PW_KEY, pw); } catch (err) {}
      gate.hidden = true;
      $('app').hidden = false;
      load();
    }).catch(function (err) {
      gateErr.textContent = err && err.message === 'auth'
        ? "Parol noto'g'ri."
        : 'Serverga ulanib bo\'lmadi. Internetni tekshiring.';
      gateErr.hidden = false;
      $('pw').select();
    }).then(function () { gateBtn.disabled = false; });
  });

  function verify(pw) {
    if (LOCAL) {
      // Backend yo'q — parol serverda tekshirilmaydi, faqat brauzerdagi yozuv ko'rsatiladi
      return Promise.resolve();
    }
    return fetch(api('list'), { headers: { 'X-Admin-Key': pw } }).then(function (r) {
      if (r.status === 401 || r.status === 403) throw new Error('auth');
      if (!r.ok) throw new Error('net');
      return r.json();
    });
  }

  /* Sessiya davom etayotgan bo'lsa — parol so'ramaymiz */
  (function () {
    var saved;
    try { saved = sessionStorage.getItem(PW_KEY); } catch (e) {}
    if (saved !== null && saved !== undefined) {
      gate.hidden = true;
      $('app').hidden = false;
      load();
    }
  })();

  $('logoutBtn').addEventListener('click', function () {
    try { sessionStorage.removeItem(PW_KEY); } catch (e) {}
    location.reload();
  });

  /* ══════════ MA'LUMOT ══════════ */
  function load() {
    if (LOCAL) {
      banner('<b>Backend ulanmagan.</b> Bu yerda faqat shu brauzerda berilgan javob ko\'rinadi. ' +
             'Barcha mehmonlar javobini yig\'ish uchun <code>assets/config.js</code> faylidagi ' +
             '<code>api</code> qatoriga server manzilini yozing.');
      var raw;
      try { raw = localStorage.getItem('toy-rsvp-v1'); } catch (e) {}
      rows = raw ? [JSON.parse(raw)] : [];
      render();
      return;
    }

    var pw;
    try { pw = sessionStorage.getItem(PW_KEY) || ''; } catch (e) { pw = ''; }

    fetch(api('list'), { headers: { 'X-Admin-Key': pw } })
      .then(function (r) {
        if (r.status === 401 || r.status === 403) { throw new Error('auth'); }
        if (!r.ok) throw new Error('net');
        return r.json();
      })
      .then(function (data) {
        rows = (data.items || data || []).slice();
        banner(null);
        render();
      })
      .catch(function (err) {
        if (err.message === 'auth') {
          try { sessionStorage.removeItem(PW_KEY); } catch (e) {}
          location.reload();
          return;
        }
        banner('Serverdan ma\'lumot olinmadi. <b>Yangilash</b> tugmasini bosib ko\'ring.');
      });
  }

  function banner(html) {
    var el = $('banner');
    if (!html) { el.hidden = true; return; }
    el.innerHTML = html;
    el.hidden = false;
  }

  $('refreshBtn').addEventListener('click', function () { load(); toast('Yangilandi'); });

  /* ══════════ CHIZISH ══════════ */
  function visible() {
    var q = query.toLowerCase();
    return rows.filter(function (r) {
      if (filter !== 'all' && r.answer !== filter) return false;
      if (!q) return true;
      return (r.name || '').toLowerCase().indexOf(q) > -1 ||
             (r.phone || '').replace(/\s/g, '').indexOf(q.replace(/\s/g, '')) > -1;
    }).sort(function (a, b) {
      var x = a[sortKey] || '', y = b[sortKey] || '';
      if (x === y) return 0;
      return (x > y ? 1 : -1) * (sortAsc ? 1 : -1);
    });
  }

  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '—';
    var now = new Date();
    var time = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    var sameDay = d.toDateString() === now.toDateString();
    var yest = new Date(now.getTime() - 86400000).toDateString() === d.toDateString();
    if (sameDay) return 'Bugun, ' + time;
    if (yest) return 'Kecha, ' + time;
    return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') +
           '.' + d.getFullYear() + ', ' + time;
  }

  function initials(name) {
    var parts = (name || '?').trim().split(/\s+/);
    return ((parts[0] || '?')[0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function render() {
    var yes = rows.filter(function (r) { return r.answer === 'yes'; }).length;
    var no = rows.filter(function (r) { return r.answer === 'no'; }).length;
    var total = rows.length;

    $('sTotal').textContent = total;
    $('sYes').textContent = yes;
    $('sNo').textContent = no;
    $('sTotalSub').textContent = total ? 'javoblar ro\'yxati quyida' : 'hali javob yo\'q';
    $('sYesSub').textContent = total ? Math.round(yes / total * 100) + '%' : '—';
    $('sNoSub').textContent = total ? Math.round(no / total * 100) + '%' : '—';

    var latest = rows.slice().sort(function (a, b) { return (b.at || '') > (a.at || '') ? 1 : -1; })[0];
    $('sLast').textContent = latest ? (latest.name || '—') : '—';
    $('sLastSub').textContent = latest ? fmtDate(latest.at) : '—';

    // Donut
    var pct = total ? Math.round(yes / total * 100) : 0;
    $('ring').style.background =
      'conic-gradient(#3B8F62 0 ' + pct + '%, #B4675B ' + pct + '% 100%)';
    if (!total) $('ring').style.background = 'conic-gradient(#E5E1D7 0 100%)';
    $('ringPct').textContent = pct + '%';
    $('kYes').textContent = yes;
    $('kNo').textContent = no;

    drawBars();
    drawTable();
  }

  function drawBars() {
    var box = $('bars');
    box.innerHTML = '';

    var days = [], counts = [], labels = [];
    var today = new Date(); today.setHours(0, 0, 0, 0);

    for (var i = 9; i >= 0; i--) {
      var d = new Date(today.getTime() - i * 86400000);
      days.push(d);
      labels.push(i === 0 ? 'Bugun'
        : String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0'));
      counts.push(0);
    }

    rows.forEach(function (r) {
      var d = new Date(r.at);
      if (isNaN(d)) return;
      d.setHours(0, 0, 0, 0);
      for (var i = 0; i < days.length; i++) {
        if (days[i].getTime() === d.getTime()) { counts[i]++; break; }
      }
    });

    var max = Math.max.apply(null, counts.concat([1]));
    counts.forEach(function (c, i) {
      var bar = document.createElement('div');
      bar.style.height = Math.max(3, Math.round(c / max * 100)) + '%';
      bar.innerHTML = (c ? '<u>' + c + '</u>' : '') + '<span>' + labels[i] + '</span>';
      bar.title = labels[i] + ': ' + c + ' ta javob';
      box.appendChild(bar);
    });
  }

  function drawTable() {
    var list = visible();
    var tb = $('tbody');
    tb.innerHTML = '';

    list.forEach(function (r) {
      var yes = r.answer === 'yes';
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><div class="who"><span class="av' + (yes ? '' : ' av--no') + '">' + esc(initials(r.name)) + '</span>' + esc(r.name || '—') + '</div></td>' +
        '<td><span class="bdg ' + (yes ? 'bdg--y">Kelaman' : 'bdg--n">Kela olmaydi') + '</span></td>' +
        '<td>' + (r.phone
          ? '<a href="tel:' + esc(r.phone.replace(/\s/g, '')) + '">' + esc(r.phone) + '</a>'
          : '<span class="muted">—</span>') + '</td>' +
        '<td class="muted">' + esc(fmtDate(r.at)) + '</td>' +
        '<td style="text-align:right">' +
          (r.id ? '<button class="del" type="button" data-id="' + esc(r.id) + '" aria-label="O\'chirish" title="O\'chirish">✕</button>' : '') +
        '</td>';
      tb.appendChild(tr);
    });

    $('empty').hidden = list.length > 0;
    $('count').textContent = list.length === rows.length
      ? rows.length + ' ta yozuv'
      : list.length + ' / ' + rows.length + ' ta yozuv';
  }

  /* ══════════ FILTR / QIDIRUV / SARALASH ══════════ */
  $('search').addEventListener('input', function (e) { query = e.target.value.trim(); drawTable(); });

  document.querySelectorAll('.pill').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.pill').forEach(function (b) { b.classList.remove('is-on'); });
      btn.classList.add('is-on');
      filter = btn.dataset.f;
      drawTable();
    });
  });

  document.querySelectorAll('th.sortable').forEach(function (th) {
    th.addEventListener('click', function () {
      var k = th.dataset.k;
      if (sortKey === k) { sortAsc = !sortAsc; } else { sortKey = k; sortAsc = true; }
      document.querySelectorAll('th').forEach(function (h) { h.classList.remove('is-sorted', 'is-asc'); });
      th.classList.add('is-sorted');
      if (sortAsc) th.classList.add('is-asc');
      drawTable();
    });
  });

  /* ══════════ O'CHIRISH ══════════ */
  $('tbody').addEventListener('click', function (e) {
    var btn = e.target.closest('.del');
    if (!btn) return;
    var id = btn.dataset.id;
    var row = rows.filter(function (r) { return String(r.id) === String(id); })[0];
    if (!confirm((row && row.name ? row.name + ' — ' : '') + 'javobni o\'chirasizmi?')) return;

    var pw;
    try { pw = sessionStorage.getItem(PW_KEY) || ''; } catch (er) { pw = ''; }

    fetch(api('delete'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': pw },
      body: JSON.stringify({ id: id })
    }).then(function (r) {
      if (!r.ok) throw new Error('net');
      rows = rows.filter(function (x) { return String(x.id) !== String(id); });
      render();
      toast('O\'chirildi');
    }).catch(function () { toast('O\'chirib bo\'lmadi'); });
  });

  /* ══════════ EKSPORT ══════════ */
  $('exportBtn').addEventListener('click', function () {
    var list = visible();
    if (!list.length) { toast('Eksport uchun yozuv yo\'q'); return; }

    var head = ['Ism', 'Javob', 'Telefon', 'Vaqt'];
    var cell = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };

    var lines = [head.map(cell).join(';')];
    list.forEach(function (r) {
      lines.push([
        r.name || '',
        r.answer === 'yes' ? 'Kelaman' : 'Kela olmaydi',
        r.phone || '',
        fmtDate(r.at)
      ].map(cell).join(';'));
    });

    // BOM — Excel kirillcha/lotincha belgilarni to'g'ri ochsin
    var blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'mehmonlar-javoblari.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast(list.length + ' ta yozuv yuklandi');
  });
})();
