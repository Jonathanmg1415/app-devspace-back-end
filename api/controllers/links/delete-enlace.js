module.exports = {
  friendlyName: 'Delete enlace',
  description:  'Eliminar un enlace.',
  inputs: {
    id: { type: 'number', required: true },
  },
  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({ id }, exits) {
    sails.log.debug('-----> links/delete-enlace');
    try {
      const exists = await Link.findOne({ id });
      if (!exists) return exits.notFound();
      const project  = await Project.findOne({ id: exists.project });
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: exists.project, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();
      await Link.destroyOne({ id });
      return exits.success({ mensaje: 'Enlace eliminado correctamente.' });
    } catch (error) {
      sails.log.error('Error en links/delete-enlace', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
