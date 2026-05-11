/**
 * Cloudflare Worker — proxy para intervals.icu API
 *
 * Despliegue:
 * 1. Ve a dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. Pega este código, dale un nombre (p.ej. "z2proxy") y haz Deploy
 * 3. Copia la URL del worker (p.ej. https://z2proxy.tuusuario.workers.dev)
 * 4. Pégala en Ajustes → "URL del proxy" dentro de la app
 */

const TARGET = 'https://intervals.icu';

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);

    // Solo permite rutas bajo /api/v1/
    if (!url.pathname.startsWith('/api/v1/')) {
      return new Response('Not found', { status: 404 });
    }

    const targetUrl = TARGET + url.pathname + url.search;

    const proxyReq = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    });

    const resp = await fetch(proxyReq);

    // Devuelve la respuesta con headers CORS
    const newResp = new Response(resp.body, resp);
    newResp.headers.set('Access-Control-Allow-Origin', '*');
    newResp.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    return newResp;
  },
};
