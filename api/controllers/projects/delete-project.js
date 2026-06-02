module.exports = {
  friendlyName: 'Delete project',
  description:  'Eliminar un proyecto y todos sus recursos.',

  inputs: {
    id: { type: 'number', required: true },
  },

  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },

  fn: async function ({ id }, exits) {
    sails.log.debug('-----> projects/delete-project');
    try {
      const project = await Project.findOne({ id, owner: this.req.user.id });
      if (!project) return exits.notFound();
      await Project.getDatastore().transaction(async (db) => {
        await Task.destroy({ project: id }).usingConnection(db);
        await Link.destroy({ project: id }).usingConnection(db);
        await Command.destroy({ project: id }).usingConnection(db);
        await Note.destroy({ project: id }).usingConnection(db);
        await Card.destroy({ project: id }).usingConnection(db);
        await File.destroy({ project: id }).usingConnection(db);
        await ProjectMember.destroy({ project: id }).usingConnection(db);
        await Project.destroyOne({ id }).usingConnection(db);
      });
      return exits.success({ mensaje: 'Proyecto eliminado correctamente.' });
    } catch (error) {
      sails.log.error('Error en projects/delete-project', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
