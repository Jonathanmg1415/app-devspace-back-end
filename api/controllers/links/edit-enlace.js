module.exports = {
  friendlyName: 'Edit enlace',
  description:  'Editar un enlace existente.',
  inputs: {
    id:    { type: 'number', required: true },
    title: { type: 'string' },
    url:   { type: 'string', isURL: true },
    label: { type: 'string' },
    tags:  { type: 'json' },
  },
  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({ id, ...fields }, exits) {
    sails.log.debug('-----> links/edit-enlace');
    try {
      const exists = await Link.findOne({ id });
      if (!exists) return exits.notFound();
      const project  = await Project.findOne({ id: exists.project });
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: exists.project, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();
      const data = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
      const item = await Link.updateOne({ id }).set(data);
      return exits.success({ enlace: item });
    } catch (error) {
      sails.log.error('Error en links/edit-enlace', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
