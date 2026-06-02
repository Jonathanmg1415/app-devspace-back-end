module.exports = {
  friendlyName: 'Delete comando',
  description:  'Eliminar un comando.',
  inputs: {
    id: { type: 'number', required: true },
  },
  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({ id }, exits) {
    sails.log.debug('-----> commands/delete-comando');
    try {
      const exists = await Command.findOne({ id });
      if (!exists) return exits.notFound();
      const project  = await Project.findOne({ id: exists.project });
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: exists.project, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();
      await Command.destroyOne({ id });
      return exits.success({ mensaje: 'Comando eliminado correctamente.' });
    } catch (error) {
      sails.log.error('Error en commands/delete-comando', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
