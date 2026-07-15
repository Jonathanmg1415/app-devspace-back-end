const https = require('https');
const { URL } = require('url');

function request(method, urlStr, body, extraHeaders) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const isBuffer = Buffer.isBuffer(body);
    const bodyBuf  = body
      ? (isBuffer ? body : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)))
      : null;

    const options = {
      hostname: u.hostname,
      port:     443,
      path:     u.pathname + u.search,
      method,
      headers:  {
        ...extraHeaders,
        ...(bodyBuf ? { 'Content-Length': bodyBuf.length } : {}),
      },
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ ok: res.statusCode < 300, status: res.statusCode, body: Buffer.concat(chunks).toString() }));
    });

    req.on('error', reject);
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
