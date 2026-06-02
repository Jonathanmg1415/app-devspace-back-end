module.exports = {
  friendlyName: 'Edit tarea',
  description:  'Editar un tarea existente.',
  inputs: {
    id:          { type: 'number', required: true },
    title:       { type: 'string' },
    description: { type: 'string' },
    status:      { type: 'string', isIn: ['todo','in_progress','done'] },
    priority:    { type: 'string', isIn: ['low','medium','high'] },
    dueDate:     { type: 'ref' },
    tags:        { type: 'json' },
    order:       { type: 'number' },
  },
  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({ id, ...fields }, exits) {
    sails.log.debug('-----> tasks/edit-tarea');
    try {
      const exists = await Task.findOne({ id });
      if (!exists) return exits.notFound();
      const project  = await Project.findOne({ id: exists.project });
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: exists.project, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();
      const data = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
      const item = await Task.updateOne({ id }).set(data);
      return exits.success({ tarea: item });
    } catch (error) {
      sails.log.error('Error en tasks/edit-tarea', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
