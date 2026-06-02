module.exports = {
  friendlyName: 'Edit nota',
  description:  'Editar una nota existente.',
  inputs: {
    id:      { type: 'number', required: true },
    title:   { type: 'string' },
    content: { type: 'string' },
    section: { type: 'string' },
    tags:    { type: 'json' },
  },
  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({ id, ...fields }, exits) {
    sails.log.debug('-----> notes/edit-nota');
    try {
      const exists = await Note.findOne({ id });
      if (!exists) return exits.notFound();
      const project  = await Project.findOne({ id: exists.project });
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: exists.project, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();
      const data = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
      const item = await Note.updateOne({ id }).set(data);
      return exits.success({ nota: item });
    } catch (error) {
      sails.log.error('Error en notes/edit-nota', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
