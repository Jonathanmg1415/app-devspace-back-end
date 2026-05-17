module.exports = {
  friendlyName: 'Create enlace',
  description:  'Crear un nuevo enlace en un proyecto.',

  inputs: {
    projectId: {
      type:     'number',
      required: true,
    },
    title: {
      type:     'string',
      required: true,
    },
    url: {
      type:     'string',
      required: true,
      isURL:    true,
    },
    label: {
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
      description:  'Link creado.',
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
    sails.log.debug('-----> links/create-enlace');

    try {
      const { projectId, ...data } = inputs;

      const project = await Project.findOne({ id: projectId, owner: this.req.user.id });
      if (!project) return exits.notFound();

      const item = await Link.create({
        ...data,
        project: projectId,
        owner:   this.req.user.id,
      }).fetch();

      return exits.success({ enlace: item });
    } catch (error) {
      sails.log.error('Error en links/create-enlace', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
