module.exports = {
  friendlyName: 'Create card',
  description:  'Crear un nuevo card.',
  inputs: {
    projectId: { type: 'string', required: true },
    title:     { type: 'string', required: true },
    content:   { type: 'string', defaultsTo: '' },
    color:     { type: 'string', defaultsTo: '#ffffff' },
    tags:      { type: 'json', defaultsTo: [] },
  },
  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function (inputs, exits) {
    sails.log.debug('-----> cards/create-card');
    try {
      const { projectId, ...data } = inputs;
      const project  = await Project.findOne({ id: projectId });
      if (!project) return exits.notFound();
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: projectId, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();
      const item = await Card.create({ ...data, project: projectId, owner: this.req.user.id }).fetch();
      return exits.success({ card: item });
    } catch (error) {
      sails.log.error('Error en cards/create-card', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
