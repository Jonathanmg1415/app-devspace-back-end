module.exports = {
  friendlyName: 'Get tasks',
  description:  'Listar tasks de un proyecto.',
  inputs: {
    projectId: { type: 'string', required: true },
    limit:     { type: 'number', defaultsTo: 100 },
    skip:      { type: 'number', defaultsTo: 0 },
  },
  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({ projectId }, exits) {
    sails.log.debug('-----> tasks/get-tasks');
    try {
      const project  = await Project.findOne({ id: projectId });
      if (!project) return exits.notFound();
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: projectId, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();
      const [items, total] = await Promise.all([
        Task.find({ project: projectId }).populate('assignee').sort('createdAt DESC').limit(limit).skip(skip),
        Task.count({ project: projectId }),
      ]);
      return exits.success({ tasks: items, total, hasMore: skip + items.length < total });
    } catch (error) {
      sails.log.error('Error en tasks/get-tasks', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
