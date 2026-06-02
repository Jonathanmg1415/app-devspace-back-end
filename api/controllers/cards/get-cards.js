module.exports = {
  friendlyName: 'Get cards',
  description:  'Listar cards de un proyecto.',
  inputs: {
    projectId: { type: 'string', required: true },
  },
  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({ projectId }, exits) {
    sails.log.debug('-----> cards/get-cards');
    try {
      const project  = await Project.findOne({ id: projectId });
      if (!project) return exits.notFound();
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: projectId, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();
      const items = await Card.find({ project: projectId }).sort('createdAt DESC');
      return exits.success({ cards: items });
    } catch (error) {
      sails.log.error('Error en cards/get-cards', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
