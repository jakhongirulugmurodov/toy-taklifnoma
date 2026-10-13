import { json, preflight, guard, db, noDb } from '../_lib.js';

export const onRequestOptions = preflight;

/* Admin: noo'rin tilakni o'chirish */
export async function onRequestPost({ request, env }) {
  const denied = guard(request, env);
  if (denied) return denied;
  const DB = await db(env);
  if (!DB) return noDb();

  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }

  const id = parseInt(body.id, 10);
  if (!Number.isInteger(id)) return json({ error: 'bad id' }, 400);

  const res = await DB.prepare('DELETE FROM wishes WHERE id = ?').bind(id).run();
  return json({ ok: true, deleted: res.meta?.changes || 0 });
}
