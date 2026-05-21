module.exports = {
  friendlyName: 'Get members',
  description:  'Listar miembros de un proyecto.',

  inputs: {
    projectId: { type: 'string', required: true },
  },

  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },

  fn: async function ({ projectId }, exits) {
    sails.log.debug('-----> members/get-members');
    try {
      const project = await Project.findOne({ id: projectId, owner: this.req.user.id });
      if (!project) return exits.notFound();

      const members = await ProjectMember.find({ project: projectId })
        .populate('user');

      return exits.success({ members });
    } catch (error) {
      sails.log.error('Error en members/get-members', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
