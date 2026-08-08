import { json, preflight, guard } from '../_lib.js';

export const onRequestOptions = preflight;

export async function onRequestPost({ request, env }) {
  const denied = guard(request, env);
  if (denied) return denied;

  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }

  const id = parseInt(body.id, 10);
  if (!Number.isInteger(id)) return json({ error: 'bad id' }, 400);

  const res = await env.DB.prepare('DELETE FROM rsvp WHERE id = ?').bind(id).run();
  return json({ ok: true, deleted: res.meta?.changes || 0 });
}
