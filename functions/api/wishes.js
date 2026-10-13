import { json, preflight, db, noDb } from '../_lib.js';

export const onRequestOptions = preflight;

/* Ochiq ro'yxat — saytdagi tilaklar lentasi uchun (ism + tilak, boshqa hech narsa) */
export async function onRequestGet({ env }) {
  const DB = await db(env);
  if (!DB) return noDb();
  const { results } = await DB.prepare(
    'SELECT name, wish, updated_at AS at FROM wishes ORDER BY updated_at DESC LIMIT 100'
  ).all();
  return json({ items: results || [] });
}
