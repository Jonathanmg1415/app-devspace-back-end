module.exports = {
  friendlyName: 'Get links',
  description:  'Listar links de un proyecto.',
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
    sails.log.debug('-----> links/get-links');
    try {
      const project  = await Project.findOne({ id: projectId });
      if (!project) return exits.notFound();
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: projectId, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();
      const [items, total] = await Promise.all([
        Link.find({ project: projectId }).sort('createdAt DESC').limit(limit).skip(skip),
        Link.count({ project: projectId }),
      ]);
      return exits.success({ links: items, total, hasMore: skip + items.length < total });
    } catch (error) {
      sails.log.error('Error en links/get-links', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
