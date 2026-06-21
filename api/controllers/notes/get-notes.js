module.exports = {
  friendlyName: 'Get notes',
  description:  'Listar notes de un proyecto.',
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
  fn: async function ({ projectId }, exits) {
    sails.log.debug('-----> notes/get-notes');
    try {
      const project  = await Project.findOne({ id: projectId });
      if (!project) return exits.notFound();
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: projectId, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();
      const [items, total] = await Promise.all([
        Note.find({ project: projectId }).sort('createdAt DESC').limit(limit).skip(skip),
        Note.count({ project: projectId }),
      ]);
      return exits.success({ notes: items, total, hasMore: skip + items.length < total });
    } catch (error) {
      sails.log.error('Error en notes/get-notes', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
