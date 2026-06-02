module.exports = {
  friendlyName: 'Get commands',
  description:  'Listar commands de un proyecto.',
  inputs: {
    projectId: { type: 'string', required: true },
  },
  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({ projectId }, exits) {
    sails.log.debug('-----> commands/get-commands');
    try {
      const project  = await Project.findOne({ id: projectId });
      if (!project) return exits.notFound();
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: projectId, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();
      const items = await Command.find({ project: projectId }).sort('createdAt DESC');
      return exits.success({ commands: items });
    } catch (error) {
      sails.log.error('Error en commands/get-commands', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
