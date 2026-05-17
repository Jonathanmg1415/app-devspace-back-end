module.exports = {
  friendlyName: 'Edit nota',
  description:  'Editar un nota existente.',

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
    section: {
      type: 'string',
    },
    tags: {
      type: 'json',
    },
  },

  exits: {
    success: {
      description:  'Note actualizado.',
      responseType: 'ok',
    },
    notFound: {
      statusCode:   404,
      description:  'Note no encontrado.',
      responseType: 'notFound',
    },
    errorGeneral: {
      statusCode:   500,
      description:  'Error interno.',
      responseType: 'serverError',
    },
  },

  fn: async function ({ id, ...fields }, exits) {
    sails.log.debug('-----> notes/edit-nota');

    try {
      const exists = await Note.findOne({ id, owner: this.req.user.id });
      if (!exists) return exits.notFound();

      const data = Object.fromEntries(
        Object.entries(fields).filter(([, v]) => v !== undefined)
      );

      const item = await Note.updateOne({ id }).set(data);

      return exits.success({ nota: item });
    } catch (error) {
      sails.log.error('Error en notes/edit-nota', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
