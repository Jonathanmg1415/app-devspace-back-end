const https = require('https');
const { URL } = require('url');

const REQUEST_TIMEOUT_MS = 30000; // uploads pueden ser grandes (hasta 15MB) — si Supabase no responde en 30s, fallar en vez de colgar la request para siempre

function request(method, urlStr, body, extraHeaders) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const isBuffer = Buffer.isBuffer(body);
    const bodyBuf  = body
      ? (isBuffer ? body : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)))
      : null;
    let settled = false;

    const options = {
      hostname: u.hostname,
      port:     443,
      path:     u.pathname + u.search,
      method,
      timeout:  REQUEST_TIMEOUT_MS,
      headers:  {
        ...extraHeaders,
        ...(bodyBuf ? { 'Content-Length': bodyBuf.length } : {}),
      },
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        if (settled) return;
        settled = true;
        resolve({ ok: res.statusCode < 300, status: res.statusCode, body: Buffer.concat(chunks).toString() });
      });
    });

    // El evento 'timeout' solo avisa que el socket está inactivo — no aborta
    // la request por sí solo, hay que destruirla a mano o queda colgada igual.
    req.on('timeout', () => {
      if (settled) return;
      settled = true;
      req.destroy();
      reject(new Error(`Supabase Storage no respondió en ${REQUEST_TIMEOUT_MS / 1000}s (timeout)`));
    });

    req.on('error', (err) => {
      if (settled) return;
      settled = true;
      reject(err);
    });

    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

module.exports = {
  friendlyName: 'Supabase storage client',
  description:  'Cliente de Supabase Storage usando https nativo (sin SDK, sin undici).',

  sync: true,
  inputs: {},
  exits: { success: { outputType: 'ref' } },

  fn: function (_inputs, exits) {
    const url = sails.config.custom.supabaseUrl;
    const key = sails.config.custom.supabaseKey;

    if (!url || !key) {
      throw new Error('Supabase no configurado: verifica SUPABASE_URL y SUPABASE_SERVICE_KEY en las variables de entorno');
    }

    const authHeaders = {
      apikey:        key,
      Authorization: `Bearer ${key}`,
    };

    const storage = {
      from(bucket) {
        return {
          async upload(path, buffer, opts) {
            const res = await request(
              'POST',
              `${url}/storage/v1/object/${bucket}/${path}`,
              buffer,
              { ...authHeaders, 'Content-Type': opts?.contentType || 'application/octet-stream' }
            );
            return res.ok ? { error: null } : { error: { message: res.body } };
          },

          async remove(paths) {
            const res = await request(
              'DELETE',
              `${url}/storage/v1/object/${bucket}`,
              JSON.stringify({ prefixes: paths }),
              { ...authHeaders, 'Content-Type': 'application/json' }
            );
            return res.ok ? { error: null } : { error: { message: res.body } };
          },

          getPublicUrl(path) {
            return {
              data: { publicUrl: `${url}/storage/v1/object/public/${bucket}/${path}` },
            };
          },
        };
      },
    };

    return exits.success({ storage });
  },
};
