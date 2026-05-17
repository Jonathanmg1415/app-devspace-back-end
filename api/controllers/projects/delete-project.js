module.exports = {
  friendlyName: 'Delete project',
  description:  'Eliminar un proyecto y todos sus recursos asociados.',

  inputs: {
    id: {
      type:     'number',
      required: true,
    },
  },

  exits: {
    success: {
      description:  'Proyecto eliminado.',
      responseType: 'ok',
    },
    notFound: {
      statusCode:   404,
      description:  'Proyecto no encontrado.',
      responseType: 'notFound',
    },
    errorGeneral: {
      statusCode:   500,
      description:  'Error interno.',
      responseType: 'serverError',
    },
  },

  fn: async function ({ id }, exits) {
    sails.log.debug('-----> projects/delete-project');

    try {
      const project = await Project.findOne({ id, owner: this.req.user.id });
      if (!project) return exits.notFound();

      // Eliminar recursos asociados en transacción
      await Project.getDatastore().transaction(async (db) => {
        await Task.destroy({ project: id }).usingConnection(db);
        await Link.destroy({ project: id }).usingConnection(db);
        await Command.destroy({ project: id }).usingConnection(db);
        await Note.destroy({ project: id }).usingConnection(db);
        await Card.destroy({ project: id }).usingConnection(db);
        await Project.destroyOne({ id }).usingConnection(db);
      });

      return exits.success({ mensaje: 'Proyecto eliminado correctamente.' });
    } catch (error) {
      sails.log.error('Error en projects/delete-project', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
