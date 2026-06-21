module.exports = {
  friendlyName: 'Edit comando',
  description:  'Editar un comando existente.',
  inputs: {
    id:          { type: 'number', required: true },
    title:       { type: 'string' },
    command:     { type: 'string' },
    description: { type: 'string' },
    area:        { type: 'string' },
    tags:        { type: 'json' },
  },
  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({ id, ...fields }, exits) {
    sails.log.debug('-----> commands/edit-comando');
    try {
      const exists = await Command.findOne({ id });
      if (!exists) return exits.notFound();
      const project  = await Project.findOne({ id: exists.project });
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: exists.project, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();
      const data = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
      const item = await Command.updateOne({ id }).set(data);
      return exits.success({ comando: item });
    } catch (error) {
      sails.log.error('Error en commands/edit-comando', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
