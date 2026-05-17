module.exports = {
  friendlyName: 'Create comando',
  description:  'Crear un nuevo comando en un proyecto.',

  inputs: {
    projectId: {
      type:     'number',
      required: true,
    },
    title: {
      type:     'string',
      required: true,
    },
    command: {
      type:     'string',
      required: true,
    },
    description: {
      type:       'string',
      defaultsTo: '',
    },
    tags: {
      type:       'json',
      defaultsTo: [],
    },
  },

  exits: {
    success: {
      description:  'Command creado.',
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
    sails.log.debug('-----> commands/create-comando');

    try {
      const { projectId, ...data } = inputs;

      const project = await Project.findOne({ id: projectId, owner: this.req.user.id });
      if (!project) return exits.notFound();

      const item = await Command.create({
        ...data,
        project: projectId,
        owner:   this.req.user.id,
      }).fetch();

      return exits.success({ comando: item });
    } catch (error) {
      sails.log.error('Error en commands/create-comando', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
