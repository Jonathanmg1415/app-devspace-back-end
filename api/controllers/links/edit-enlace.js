module.exports = {
  friendlyName: 'Edit enlace',
  description:  'Editar un enlace existente.',

  inputs: {
    id: {
      type:     'number',
      required: true,
    },
    title: {
      type: 'string',
    },
    url: {
      type:  'string',
      isURL: true,
    },
    label: {
      type: 'string',
    },
    tags: {
      type: 'json',
    },
  },

  exits: {
    success: {
      description:  'Link actualizado.',
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

  fn: async function ({ id, ...fields }, exits) {
    sails.log.debug('-----> links/edit-enlace');

    try {
      const exists = await Link.findOne({ id, owner: this.req.user.id });
      if (!exists) return exits.notFound();

      const data = Object.fromEntries(
        Object.entries(fields).filter(([, v]) => v !== undefined)
      );

      const item = await Link.updateOne({ id }).set(data);

      return exits.success({ enlace: item });
    } catch (error) {
      sails.log.error('Error en links/edit-enlace', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
