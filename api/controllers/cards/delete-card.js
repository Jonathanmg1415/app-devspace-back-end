module.exports = {
  friendlyName: 'Delete card',
  description:  'Eliminar un card.',

  inputs: {
    id: {
      type:     'number',
      required: true,
    },
  },

  exits: {
    success: {
      description:  'Card eliminado.',
      responseType: 'ok',
    },
    notFound: {
      statusCode:   404,
      description:  'Card no encontrado.',
      responseType: 'notFound',
    },
    errorGeneral: {
      statusCode:   500,
      description:  'Error interno.',
      responseType: 'serverError',
    },
  },

  fn: async function ({ id }, exits) {
    sails.log.debug('-----> cards/delete-card');

    try {
      const exists = await Card.findOne({ id, owner: this.req.user.id });
      if (!exists) return exits.notFound();

      await Card.destroyOne({ id });

      return exits.success({ mensaje: 'Card eliminado correctamente.' });
    } catch (error) {
      sails.log.error('Error en cards/delete-card', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
