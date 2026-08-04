module.exports = {
  friendlyName: 'Delete tarea',
  description:  'Eliminar un tarea.',
  inputs: {
    id: { type: 'number', required: true },
  },
  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({ id }, exits) {
    sails.log.debug('-----> tasks/delete-tarea');
    try {
      const exists = await Task.findOne({ id });
      if (!exists) return exits.notFound();
      const project  = await Project.findOne({ id: exists.project });
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: exists.project, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();
      await TaskComment.destroy({ task: id });
      await Task.destroyOne({ id });
      return exits.success({ mensaje: 'Tarea eliminada correctamente.' });
    } catch (error) {
      sails.log.error('Error en tasks/delete-tarea', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
