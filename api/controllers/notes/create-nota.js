module.exports = {
  friendlyName: 'Create nota',
  description:  'Crear un nuevo nota en un proyecto.',

  inputs: {
    projectId: {
      type:     'number',
      required: true,
    },
    title: {
      type:     'string',
      required: true,
    },
    content: {
      type:       'string',
      defaultsTo: '',
    },
    section: {
      type:       'string',
      defaultsTo: 'General',
    },
    tags: {
      type:       'json',
      defaultsTo: [],
    },
  },

  exits: {
    success: {
      description:  'Note creado.',
      responseType: 'ok',
    },
    notFound: {
      statusCode:   404,
      description:  'Proyecto no encontrado.',
      responseType: 'notFound',
    },
    errorGeneral: {
      statusCode:   500,
      description:  'Error interno.',
      responseType: 'serverError',
    },
  },

  fn: async function (inputs, exits) {
    sails.log.debug('-----> notes/create-nota');

    try {
      const { projectId, ...data } = inputs;

      const project = await Project.findOne({ id: projectId, owner: this.req.user.id });
      if (!project) return exits.notFound();

      const item = await Note.create({
        ...data,
        project: projectId,
        owner:   this.req.user.id,
      }).fetch();

      return exits.success({ nota: item });
    } catch (error) {
      sails.log.error('Error en notes/create-nota', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
