module.exports = {
  friendlyName: 'Get activity',
  description:  'Obtener feed de actividad de un proyecto.',

  inputs: {
    projectId: { type: 'number', required: true },
    limit:     { type: 'number', defaultsTo: 50 },
  },

  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },

  fn: async function ({ projectId, limit }, exits) {
    sails.log.debug('-----> activity/get-activity');
    try {
      const project  = await Project.findOne({ id: projectId });
      if (!project) return exits.notFound();
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: projectId, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();

      const events = await Activity.find({ project: projectId })
        .populate('actor')
        .sort('createdAt DESC')
        .limit(limit);

      return exits.success({ events });
    } catch (error) {
      sails.log.error('Error en activity/get-activity', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
