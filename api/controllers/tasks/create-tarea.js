module.exports = {
  friendlyName: 'Create tarea',
  description:  'Crear un nuevo tarea.',
  inputs: {
    projectId:   { type: 'string', required: true },
    title:       { type: 'string', required: true },
    description: { type: 'string', defaultsTo: '' },
    status:      { type: 'string', isIn: ['todo','in_progress','done'], defaultsTo: 'todo' },
    priority:    { type: 'string', isIn: ['low','medium','high'], defaultsTo: 'medium' },
    dueDate:     { type: 'ref' },
    tags:        { type: 'json', defaultsTo: [] },
  },
  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function (inputs, exits) {
    sails.log.debug('-----> tasks/create-tarea');
    try {
      const { projectId, ...data } = inputs;
      const project  = await Project.findOne({ id: projectId });
      if (!project) return exits.notFound();
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: projectId, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();
      const item = await Task.create({ ...data, project: projectId, owner: this.req.user.id }).fetch();
      return exits.success({ tarea: item });
    } catch (error) {
      sails.log.error('Error en tasks/create-tarea', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
