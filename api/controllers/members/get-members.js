module.exports = {
  friendlyName: 'Get members',
  description:  'Listar miembros de un proyecto.',

  inputs: {
    projectId: { type: 'string', required: true },  // ← string no number
  },

  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },

  fn: async function ({ projectId }, exits) {
    sails.log.debug('-----> members/get-members');
    try {
      const project = await Project.findOne({ id: projectId });
      if (!project) return exits.notFound();

      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: projectId, user: this.req.user.id });

      if (!isOwner && !isMember) return exits.notFound();

      const members = await ProjectMember.find({ project: projectId }).populate('user');
      return exits.success({ members });
    } catch (error) {
      sails.log.error('Error en members/get-members', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
