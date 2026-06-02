module.exports = {
  friendlyName: 'Edit card',
  description:  'Editar una card existente.',
  inputs: {
    id:      { type: 'number', required: true },
    title:   { type: 'string' },
    content: { type: 'string' },
    color:   { type: 'string' },
    order:   { type: 'number' },
    tags:    { type: 'json' },
  },
  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({ id, ...fields }, exits) {
    sails.log.debug('-----> cards/edit-card');
    try {
      const exists = await Card.findOne({ id });
      if (!exists) return exits.notFound();
      const project  = await Project.findOne({ id: exists.project });
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: exists.project, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();
      const data = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
      const item = await Card.updateOne({ id }).set(data);
      return exits.success({ card: item });
    } catch (error) {
      sails.log.error('Error en cards/edit-card', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
