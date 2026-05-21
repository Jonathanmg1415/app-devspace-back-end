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
    const client = createClient(
      sails.config.custom.supabaseUrl,
      sails.config.custom.supabaseKey
    );
    return exits.success(client);
  },
};
