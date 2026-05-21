module.exports = {
  friendlyName: 'Remove member',
  description:  'Eliminar un miembro del proyecto.',

  inputs: {
    projectId: { type: 'number', required: true },
    memberId:  { type: 'number', required: true },
  },

  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },

  fn: async function ({ projectId, memberId }, exits) {
    sails.log.debug('-----> members/remove-member');
    try {
      const project = await Project.findOne({ id: projectId, owner: this.req.user.id });
      if (!project) return exits.notFound();

      const member = await ProjectMember.findOne({ id: memberId, project: projectId });
      if (!member) return exits.notFound();

      await ProjectMember.destroyOne({ id: memberId });

      return exits.success({ mensaje: 'Miembro eliminado correctamente.' });
    } catch (error) {
      sails.log.error('Error en members/remove-member', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
