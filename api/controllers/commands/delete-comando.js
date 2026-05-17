module.exports = {
  friendlyName: 'Delete comando',
  description:  'Eliminar un comando.',

  inputs: {
    id: {
      type:     'number',
      required: true,
    },
  },

  exits: {
    success: {
      description:  'Command eliminado.',
      responseType: 'ok',
    },
    notFound: {
      statusCode:   404,
      description:  'Command no encontrado.',
      responseType: 'notFound',
    },
    errorGeneral: {
      statusCode:   500,
      description:  'Error interno.',
      responseType: 'serverError',
    },
  },

  fn: async function ({ id }, exits) {
    sails.log.debug('-----> commands/delete-comando');

    try {
      const exists = await Command.findOne({ id, owner: this.req.user.id });
      if (!exists) return exits.notFound();

      await Command.destroyOne({ id });

      return exits.success({ mensaje: 'Command eliminado correctamente.' });
    } catch (error) {
      sails.log.error('Error en commands/delete-comando', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
