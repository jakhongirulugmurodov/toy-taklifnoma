import { json, preflight, guard, sameKey, escapeHtml } from '../_lib.js';

export const onRequestOptions = preflight;

export async function onRequestPost(ctx) {
  const { request, env } = ctx;

  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }

  /* ── Admin: tilakni tozalash (yozuv o'chmasin) ── */
  const key = request.headers.get('X-Admin-Key');
  if (key && body.id !== undefined) {
    const denied = guard(request, env);
    if (denied) return denied;
    const id = parseInt(body.id, 10);
    if (!Number.isInteger(id)) return json({ error: 'bad id' }, 400);
    await env.DB.prepare(
      "UPDATE rsvp SET wish = NULL, updated_at = datetime('now') WHERE id = ?"
    ).bind(id).run();
    return json({ ok: true });
  }

  /* ── Mehmon: tilak qoldirish ── */
  const vid = String(body.vid || '').replace(/[^\w-]/g, '').slice(0, 40);
  if (!vid) return json({ error: 'bad input' }, 400);

  // Nazorat belgilari olib tashlanadi, bo'shliqlar yig'iladi
  const wish = String(body.wish || '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim()
    .slice(0, 200);

  if (!wish) return json({ error: 'empty' }, 400);

  // Faqat javob bergan mehmon tilak qoldira oladi — spamga qarshi asosiy to'siq
  const row = await env.DB.prepare('SELECT name, wish FROM rsvp WHERE vid = ?').bind(vid).first();
  if (!row) return json({ error: 'not found' }, 404);

  await env.DB.prepare(
    "UPDATE rsvp SET wish = ?2, updated_at = datetime('now') WHERE vid = ?1"
  ).bind(vid, wish).run();

  if (env.TG_TOKEN && env.TG_CHAT && wish !== row.wish) {
    ctx.waitUntil(notify(env, row.name, wish));
  }

  return json({ ok: true });
}

async function notify(env, name, wish) {
  const text = `💬 <b>${escapeHtml(name)}</b>\n<i>${escapeHtml(wish)}</i>`;
  const r = await send(env, env.TG_CHAT, text);
  if (r && r.ok === false) {
    const moved = r.parameters && r.parameters.migrate_to_chat_id;
    if (moved) await send(env, moved, text);
  }
}

async function send(env, chatId, text) {
  try {
    const r = await fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId, text, parse_mode: 'HTML',
        link_preview_options: { is_disabled: true }
      })
    });
    return await r.json();
  } catch { return null; }
}
