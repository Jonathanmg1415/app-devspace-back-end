const { createClient } = require('@supabase/supabase-js');

module.exports = {
  friendlyName: 'Supabase client',
  description:  'Retorna una instancia del cliente de Supabase.',

  sync: true,

  inputs: {},

  exits: {
    success: { outputType: 'ref' },
  },

  fn: function (_inputs, exits) {
    const url = sails.config.custom.supabaseUrl;
    const key = sails.config.custom.supabaseKey;
    if (!url || !key) {
      throw new Error('Supabase no configurado: verifica que SUPABASE_URL y SUPABASE_SERVICE_KEY estén en las variables de entorno del servidor');
    }
    const client = createClient(url, key);
    return exits.success(client);
  },
};
