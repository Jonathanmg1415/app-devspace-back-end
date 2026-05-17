module.exports = {
  friendlyName: 'Create card',
  description:  'Crear un nuevo card en un proyecto.',

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
    color: {
      type:       'string',
      defaultsTo: '#ffffff',
    },
    tags: {
      type:       'json',
      defaultsTo: [],
    },
  },

  exits: {
    success: {
      description:  'Card creado.',
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
    sails.log.debug('-----> cards/create-card');

    try {
      const { projectId, ...data } = inputs;

      const project = await Project.findOne({ id: projectId, owner: this.req.user.id });
      if (!project) return exits.notFound();

      const item = await Card.create({
        ...data,
        project: projectId,
        owner:   this.req.user.id,
      }).fetch();

      return exits.success({ card: item });
    } catch (error) {
      sails.log.error('Error en cards/create-card', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
