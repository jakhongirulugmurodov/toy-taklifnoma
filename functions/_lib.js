/* Umumiy yordamchilar — barcha API funksiyalari uchun */

export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
  'Access-Control-Max-Age': '86400'
};

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...CORS }
  });
}

export const preflight = () => new Response(null, { status: 204, headers: CORS });

/* Baza ulanmagan bo'lsa — 503. Sayt buni ko'rib tilaklar bo'limini yashiradi. */
let ready = false;
export async function db(env) {
  if (!env.DB) return null;
  if (!ready) {
    // Jadval birinchi so'rovda o'zi yaratiladi — D1 konsolida SQL yurgizish shart emas
    await env.DB.batch([
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS wishes (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        vid         TEXT    NOT NULL UNIQUE,
        name        TEXT    NOT NULL,
        wish        TEXT    NOT NULL,
        ip          TEXT,
        ua          TEXT,
        created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
      )`),
      env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_wishes_updated ON wishes (updated_at DESC)'),
      env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_wishes_ip ON wishes (ip, updated_at)')
    ]);
    ready = true;
  }
  return env.DB;
}
export const noDb = () => json({ error: 'no db' }, 503);

/* Parolni vaqt-bo'yicha sizib chiqmaydigan qilib solishtiradi */
export function sameKey(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* Admin kalitini tekshiradi. To'g'ri bo'lsa null, aks holda javob qaytaradi. */
export function guard(request, env) {
  if (!env.ADMIN_KEY) return json({ error: 'ADMIN_KEY sozlanmagan' }, 500);
  if (!sameKey(request.headers.get('X-Admin-Key') || '', env.ADMIN_KEY)) {
    return json({ error: 'unauthorized' }, 401);
  }
  return null;
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

/* Telegram xabari. Guruh superguruhga aylansa chat_id o'zgaradi —
   Telegram yangi ID ni xato ichida beradi, bir marta qayta urinamiz. */
export async function telegram(env, text) {
  if (!env.TG_TOKEN || !env.TG_CHAT) return;
  const sent = await send(env, env.TG_CHAT, text);
  const moved = sent && sent.ok === false && sent.parameters && sent.parameters.migrate_to_chat_id;
  if (moved) await send(env, moved, text);
}

async function send(env, chatId, text) {
  try {
    const r = await fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true }
      })
    });
    return await r.json();
  } catch {
    return null;
  }
}
