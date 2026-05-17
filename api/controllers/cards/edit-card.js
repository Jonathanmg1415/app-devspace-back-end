module.exports = {
  friendlyName: 'Edit card',
  description:  'Editar un card existente.',

  inputs: {
    id: {
      type:     'number',
      required: true,
    },
    title: {
      type: 'string',
    },
    content: {
      type: 'string',
    },
    color: {
      type: 'string',
    },
    order: {
      type: 'number',
    },
    tags: {
      type: 'json',
    },
  },

  exits: {
    success: {
      description:  'Card actualizado.',
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

  fn: async function ({ id, ...fields }, exits) {
    sails.log.debug('-----> cards/edit-card');

    try {
      const exists = await Card.findOne({ id, owner: this.req.user.id });
      if (!exists) return exits.notFound();

      const data = Object.fromEntries(
        Object.entries(fields).filter(([, v]) => v !== undefined)
      );

      const item = await Card.updateOne({ id }).set(data);

      return exits.success({ card: item });
    } catch (error) {
      sails.log.error('Error en cards/edit-card', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
