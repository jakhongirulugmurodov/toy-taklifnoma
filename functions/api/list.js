import { json, preflight, guard } from '../_lib.js';

export const onRequestOptions = preflight;

export async function onRequestGet({ request, env }) {
  const denied = guard(request, env);
  if (denied) return denied;

  const { results } = await env.DB.prepare(
    'SELECT id, name, answer, wish, at, created_at, updated_at FROM rsvp ORDER BY created_at DESC LIMIT 2000'
  ).all();

  return json({ items: results || [] });
}
