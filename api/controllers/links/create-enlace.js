module.exports = {
  friendlyName: 'Create enlace',
  description:  'Crear un nuevo enlace.',
  inputs: {
    projectId: { type: 'string', required: true },
    title:     { type: 'string', required: true },
    url:       { type: 'string', required: true, isURL: true },
    label:     { type: 'string', defaultsTo: '' },
    tags:      { type: 'json', defaultsTo: [] },
  },
  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function (inputs, exits) {
    sails.log.debug('-----> links/create-enlace');
    try {
      const { projectId, ...data } = inputs;
      const project  = await Project.findOne({ id: projectId });
      if (!project) return exits.notFound();
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: projectId, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();
      const item = await Link.create({ ...data, project: projectId, owner: this.req.user.id }).fetch();
      return exits.success({ enlace: item });
    } catch (error) {
      sails.log.error('Error en links/create-enlace', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
