/**
 * Cloudflare Pages Function: /api/visitas
 * 
 * Se compila y despliega automáticamente en Cloudflare Pages.
 * Vinculación opcional en Cloudflare Dashboard:
 * Pages -> Settings -> Functions -> KV namespace bindings -> Variable name: 'COUNTER_KV'
 */

export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Pre-flight CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const KV_KEY = 'total_visitas_web';
  const INITIAL_BASE = 8412;

  try {
    const kv = env.COUNTER_KV || env.CLUB_COUNTER_KV;
    let count = INITIAL_BASE;

    if (kv) {
      const currentVal = await kv.get(KV_KEY);
      count = currentVal ? parseInt(currentVal, 10) : INITIAL_BASE;
      if (isNaN(count)) count = INITIAL_BASE;

      if (request.method === 'POST') {
        count += 1;
        await kv.put(KV_KEY, String(count));
      }
    } else {
      // Si KV no está vinculado en el panel, responder con la base + 1 sin romper
      count = INITIAL_BASE + 1;
    }

    return new Response(JSON.stringify({
      ok: true,
      visitas: count,
      servidor: 'Cloudflare Pages Functions',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (err) {
    return new Response(JSON.stringify({
      ok: false,
      visitas: INITIAL_BASE,
      error: err.message
    }), {
      status: 200,
      headers: corsHeaders
    });
  }
}
