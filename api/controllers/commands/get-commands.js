module.exports = {
  friendlyName: 'Get commands',
  description:  'Listar commands de un proyecto.',
  inputs: {
    projectId: { type: 'string', required: true },
    limit:     { type: 'number', defaultsTo: 50 },
    skip:      { type: 'number', defaultsTo: 0 },
  },
  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({ projectId, limit, skip }, exits) {
    sails.log.debug('-----> commands/get-commands');
    try {
      const project  = await Project.findOne({ id: projectId });
      if (!project) return exits.notFound();
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: projectId, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();
      const [items, total] = await Promise.all([
        Command.find({ project: projectId }).sort('createdAt DESC').limit(limit).skip(skip),
        Command.count({ project: projectId }),
      ]);
      return exits.success({ commands: items, total, hasMore: skip + items.length < total });
    } catch (error) {
      sails.log.error('Error en commands/get-commands', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
