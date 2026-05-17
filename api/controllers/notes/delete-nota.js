module.exports = {
  friendlyName: 'Delete nota',
  description:  'Eliminar un nota.',

  inputs: {
    id: {
      type:     'number',
      required: true,
    },
  },

  exits: {
    success: {
      description:  'Note eliminado.',
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

  fn: async function ({ id }, exits) {
    sails.log.debug('-----> notes/delete-nota');

    try {
      const exists = await Note.findOne({ id, owner: this.req.user.id });
      if (!exists) return exits.notFound();

      await Note.destroyOne({ id });

      return exits.success({ mensaje: 'Note eliminado correctamente.' });
    } catch (error) {
      sails.log.error('Error en notes/delete-nota', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
