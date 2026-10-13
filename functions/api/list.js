import { json, preflight, guard, db, noDb } from '../_lib.js';

export const onRequestOptions = preflight;

/* Admin: barcha tilaklar */
export async function onRequestGet({ request, env }) {
  const denied = guard(request, env);
  if (denied) return denied;
  const DB = await db(env);
  if (!DB) return noDb();

  const { results } = await DB.prepare(
    'SELECT id, name, wish, created_at, updated_at FROM wishes ORDER BY updated_at DESC LIMIT 2000'
  ).all();
  return json({ items: results || [] });
}
