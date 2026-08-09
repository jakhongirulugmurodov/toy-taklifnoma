import { json, preflight } from '../_lib.js';

export const onRequestOptions = preflight;

/* Ochiq ro'yxat — saytdagi tilaklar lentasi uchun (ism + tilak, boshqa hech narsa) */
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT name, wish, updated_at AS at FROM rsvp WHERE wish IS NOT NULL AND wish != '' ORDER BY updated_at DESC LIMIT 60"
  ).all();
  return json({ items: results || [] });
}
