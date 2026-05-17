module.exports = {
  friendlyName: 'Delete tarea',
  description:  'Eliminar un tarea.',

  inputs: {
    id: {
      type:     'number',
      required: true,
    },
  },

  exits: {
    success: {
      description:  'Task eliminado.',
      responseType: 'ok',
    },
    notFound: {
      statusCode:   404,
      description:  'Task no encontrado.',
      responseType: 'notFound',
    },
    errorGeneral: {
      statusCode:   500,
      description:  'Error interno.',
      responseType: 'serverError',
    },
  },

  fn: async function ({ id }, exits) {
    sails.log.debug('-----> tasks/delete-tarea');

    try {
      const exists = await Task.findOne({ id, owner: this.req.user.id });
      if (!exists) return exits.notFound();

      await Task.destroyOne({ id });

      return exits.success({ mensaje: 'Task eliminado correctamente.' });
    } catch (error) {
      sails.log.error('Error en tasks/delete-tarea', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
