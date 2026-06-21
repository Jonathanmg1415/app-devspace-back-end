module.exports = {
  friendlyName: 'Create comando',
  description:  'Crear un nuevo comando.',
  inputs: {
    projectId:   { type: 'string', required: true },
    title:       { type: 'string', required: true },
    command:     { type: 'string', required: true },
    description: { type: 'string', defaultsTo: '' },
    area:        { type: 'string', defaultsTo: '' },
    tags:        { type: 'json', defaultsTo: [] },
  },
  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function (inputs, exits) {
    sails.log.debug('-----> commands/create-comando');
    try {
      const { projectId, ...data } = inputs;
      const project  = await Project.findOne({ id: projectId });
      if (!project) return exits.notFound();
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: projectId, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();
      const item = await Command.create({ ...data, project: projectId, owner: this.req.user.id }).fetch();
      return exits.success({ comando: item });
    } catch (error) {
      sails.log.error('Error en commands/create-comando', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
