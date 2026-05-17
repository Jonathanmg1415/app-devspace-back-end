module.exports = {
  friendlyName: 'Delete enlace',
  description:  'Eliminar un enlace.',

  inputs: {
    id: {
      type:     'number',
      required: true,
    },
  },

  exits: {
    success: {
      description:  'Link eliminado.',
      responseType: 'ok',
    },
    notFound: {
      statusCode:   404,
      description:  'Link no encontrado.',
      responseType: 'notFound',
    },
    errorGeneral: {
      statusCode:   500,
      description:  'Error interno.',
      responseType: 'serverError',
    },
  },

  fn: async function ({ id }, exits) {
    sails.log.debug('-----> links/delete-enlace');

    try {
      const exists = await Link.findOne({ id, owner: this.req.user.id });
      if (!exists) return exits.notFound();

      await Link.destroyOne({ id });

      return exits.success({ mensaje: 'Link eliminado correctamente.' });
    } catch (error) {
      sails.log.error('Error en links/delete-enlace', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
