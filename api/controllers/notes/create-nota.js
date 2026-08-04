module.exports = {
  friendlyName: 'Create nota',
  description:  'Crear un nuevo nota.',
  inputs: {
    projectId: { type: 'string', required: true },
    title:     { type: 'string', required: true },
    content:   { type: 'string', defaultsTo: '' },
    section:   { type: 'string', defaultsTo: 'General' },
    tags:      { type: 'json', defaultsTo: [] },
  },
  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function (inputs, exits) {
    sails.log.debug('-----> notes/create-nota');
    try {
      const { projectId, ...data } = inputs;
      const project  = await Project.findOne({ id: projectId });
      if (!project) return exits.notFound();
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: projectId, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();
      const item = await Note.create({ ...data, project: projectId, owner: this.req.user.id }).fetch();

      sails.helpers.logActivity.with({
        projectId: Number(projectId),
        actorId:   this.req.user.id,
        action:    'created',
        entity:    'note',
        entityId:  item.id,
        meta:      { title: item.title },
      }).catch((err) => sails.log.warn('logActivity falló (ignorado):', err.message));

      return exits.success({ nota: item });
    } catch (error) {
      sails.log.error('Error en notes/create-nota', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
