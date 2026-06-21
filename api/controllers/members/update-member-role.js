module.exports = {
  friendlyName: 'Update member role',
  description: 'Cambiar el rol de un miembro del proyecto.',
  inputs: {
    projectId: { type: 'number', required: true },
    memberId:  { type: 'number', required: true },
    role:      { type: 'string', required: true, isIn: ['member', 'admin'] },
  },
  exits: {
    success:    { responseType: 'ok' },
    notFound:   { statusCode: 404, responseType: 'notFound' },
    forbidden:  { statusCode: 403, responseType: 'forbidden' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({ projectId, memberId, role }, exits) {
    sails.log.debug('-----> members/update-member-role');
    try {
      const project = await Project.findOne({ id: projectId, owner: this.req.user.id });
      if (!project) return exits.forbidden();

      const member = await ProjectMember.findOne({ id: memberId, project: projectId });
      if (!member) return exits.notFound();

      const updated = await ProjectMember.updateOne({ id: memberId }).set({ role });
      return exits.success({ member: updated });
    } catch (err) {
      sails.log.error('Error en members/update-member-role', err);
      return exits.errorGeneral({ mensaje: err.message });
    }
  },
};
