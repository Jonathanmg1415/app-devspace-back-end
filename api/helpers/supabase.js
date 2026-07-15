module.exports = {
  friendlyName: 'Supabase storage client',
  description:  'Retorna un cliente de Supabase Storage usando fetch nativo (sin SDK).',

  sync: true,

  inputs: {},

  exits: {
    success: { outputType: 'ref' },
  },

  fn: function (_inputs, exits) {
    const url = sails.config.custom.supabaseUrl;
    const key = sails.config.custom.supabaseKey;

    if (!url || !key) {
      throw new Error('Supabase no configurado: verifica SUPABASE_URL y SUPABASE_SERVICE_KEY en las variables de entorno');
    }

    const headers = {
      apikey:        key,
      Authorization: `Bearer ${key}`,
    };

    const storage = {
      from(bucket) {
        return {
          async upload(path, buffer, opts) {
            const res = await fetch(
              `${url}/storage/v1/object/${bucket}/${path}`,
              {
                method:  'POST',
                headers: { ...headers, 'Content-Type': opts?.contentType || 'application/octet-stream' },
                body:    buffer,
              }
            );
            if (!res.ok) {
              const msg = await res.text();
              return { error: { message: msg } };
            }
            return { error: null };
          },

          async remove(paths) {
            const res = await fetch(
              `${url}/storage/v1/object/${bucket}`,
              {
                method:  'DELETE',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body:    JSON.stringify({ prefixes: paths }),
              }
            );
            if (!res.ok) {
              const msg = await res.text();
              return { error: { message: msg } };
            }
            return { error: null };
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
