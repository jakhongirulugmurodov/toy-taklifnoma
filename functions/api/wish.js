import { json, preflight, db, noDb, escapeHtml, telegram } from '../_lib.js';

export const onRequestOptions = preflight;

/* Mehmon tilagi: {vid, name, wish, website}
   Bitta brauzerdan bitta tilak — qayta yuborsa eskisi yangilanadi. */
export async function onRequestPost(ctx) {
  const { request, env } = ctx;
  const DB = await db(env);
  if (!DB) return noDb();

  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }

  // Asalarixona: bu maydonni faqat bot to'ldiradi. Unga "hammasi joyida" deymiz.
  if (body.website) return json({ ok: true });

  const vid = String(body.vid || '').replace(/[^\w-]/g, '').slice(0, 40);
  const name = String(body.name || '').trim().replace(/\s+/g, ' ').slice(0, 60);
  // Nazorat belgilari olib tashlanadi, bo'shliqlar yig'iladi
  const wish = String(body.wish || '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim()
    .slice(0, 200);

  if (!vid || name.length < 2 || wish.length < 2) return json({ error: 'bad input' }, 400);

  const ip = request.headers.get('CF-Connecting-IP') || '';
  const ua = (request.headers.get('User-Agent') || '').slice(0, 200);

  // Tezlik cheklovi — bitta IP soatiga 10 tadan ortiq tilak yoza olmaydi
  if (ip) {
    const hit = await DB.prepare(
      "SELECT COUNT(*) AS n FROM wishes WHERE ip = ? AND updated_at > datetime('now','-1 hour')"
    ).bind(ip).first();
    if (hit && hit.n >= 10) return json({ error: 'too many' }, 429);
  }

  const prev = await DB.prepare('SELECT wish FROM wishes WHERE vid = ?').bind(vid).first();

  await DB.prepare(`
    INSERT INTO wishes (vid, name, wish, ip, ua)
    VALUES (?1, ?2, ?3, ?4, ?5)
    ON CONFLICT(vid) DO UPDATE SET
      name       = excluded.name,
      wish       = excluded.wish,
      ip         = excluded.ip,
      ua         = excluded.ua,
      updated_at = datetime('now')
  `).bind(vid, name, wish, ip, ua).run();

  if (!prev || prev.wish !== wish) {
    ctx.waitUntil(telegram(env, `💬 <b>${escapeHtml(name)}</b>\n<i>${escapeHtml(wish)}</i>`));
  }

  return json({ ok: true, updated: Boolean(prev) });
}
