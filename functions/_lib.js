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
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS }
  });
}

export const preflight = () => new Response(null, { status: 204, headers: CORS });

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
