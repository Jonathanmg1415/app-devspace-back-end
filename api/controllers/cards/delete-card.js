module.exports = {
  friendlyName: 'Delete card',
  description:  'Eliminar una card.',
  inputs: {
    id: { type: 'number', required: true },
  },
  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({ id }, exits) {
    sails.log.debug('-----> cards/delete-card');
    try {
      const exists = await Card.findOne({ id });
      if (!exists) return exits.notFound();
      const project  = await Project.findOne({ id: exists.project });
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: exists.project, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();
      await Card.destroyOne({ id });
      return exits.success({ mensaje: 'Card eliminada correctamente.' });
    } catch (error) {
      sails.log.error('Error en cards/delete-card', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
