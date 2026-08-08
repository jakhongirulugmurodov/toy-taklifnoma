import { json, preflight, escapeHtml } from '../_lib.js';

export const onRequestOptions = preflight;

export async function onRequestPost(ctx) {
  const { request, env } = ctx;

  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }

  // Asalarixona: bu maydonni faqat bot to'ldiradi. Unga "hammasi joyida" deymiz.
  if (body.website) return json({ ok: true });

  const name = String(body.name || '').trim().replace(/\s+/g, ' ').slice(0, 60);
  const vid = String(body.vid || '').replace(/[^\w-]/g, '').slice(0, 40);
  const answer = body.answer === 'yes' ? 'yes' : body.answer === 'no' ? 'no' : null;

  if (name.length < 2 || !answer || !vid) return json({ error: 'bad input' }, 400);

  // Mehmon vaqtiga ishonamiz, lekin faqat mantiqan yaqin bo'lsa
  const now = Date.now();
  const t = Date.parse(body.at);
  const at = (t && Math.abs(now - t) < 7 * 86400000 ? new Date(t) : new Date(now)).toISOString();

  const ip = request.headers.get('CF-Connecting-IP') || '';
  const ua = (request.headers.get('User-Agent') || '').slice(0, 200);

  // Sodda tezlik cheklovi — bitta IP soatiga 25 tadan ortiq yozuv qo'sha olmaydi
  if (ip) {
    const hit = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM rsvp WHERE ip = ? AND created_at > datetime('now','-1 hour')"
    ).bind(ip).first();
    if (hit && hit.n >= 25) return json({ error: 'too many' }, 429);
  }

  const prev = await env.DB.prepare('SELECT answer FROM rsvp WHERE vid = ?').bind(vid).first();

  await env.DB.prepare(`
    INSERT INTO rsvp (vid, name, answer, at, ip, ua)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6)
    ON CONFLICT(vid) DO UPDATE SET
      name       = excluded.name,
      answer     = excluded.answer,
      at         = excluded.at,
      ip         = excluded.ip,
      ua         = excluded.ua,
      updated_at = datetime('now')
  `).bind(vid, name, answer, at, ip, ua).run();

  // Telegram xabari javobni kutmaydi — mehmon darhol tasdiq ekranini ko'radi
  const changed = !prev || prev.answer !== answer;
  if (env.TG_TOKEN && env.TG_CHAT && changed) {
    ctx.waitUntil(notify(env, name, answer, Boolean(prev)));
  }

  return json({ ok: true, updated: Boolean(prev) });
}

async function notify(env, name, answer, isUpdate) {
  const yes = answer === 'yes';
  const counts = await env.DB.prepare(
    "SELECT SUM(answer='yes') AS y, SUM(answer='no') AS n FROM rsvp"
  ).first().catch(() => null);

  const lines = [
    `${yes ? '✅' : '❌'} <b>${escapeHtml(name)}</b>`,
    yes ? 'Kelaman' : 'Kela olmayman'
  ];
  if (isUpdate) lines.push('<i>javobini o‘zgartirdi</i>');
  if (counts) lines.push('', `Jami: ${counts.y || 0} kelaman · ${counts.n || 0} yo‘q`);

  const text = lines.join('\n');
  const sent = await send(env, env.TG_CHAT, text);

  /* Oddiy guruh superguruhga aylansa Telegram chat_id ni almashtiradi va
     eski ID ishlamay qoladi. Telegram yangi ID ni xatoning ichida beradi —
     shu bilan bir marta qayta urinamiz, xabar yo'qolib ketmasin. */
  if (sent && sent.ok === false) {
    const moved = sent.parameters && sent.parameters.migrate_to_chat_id;
    if (moved) await send(env, moved, text);
  }
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
