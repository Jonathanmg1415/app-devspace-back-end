module.exports = {
  friendlyName: 'Get links',
  description:  'Listar todos los links de un proyecto.',

  inputs: {
    projectId: {
      type:     'number',
      required: true,
    },
  },

  exits: {
    success: {
      description:  'Lista de links.',
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

  fn: async function ({ projectId }, exits) {
    sails.log.debug('-----> links/get-links');

    try {
      const project = await Project.findOne({ id: projectId, owner: this.req.user.id });
      if (!project) return exits.notFound();

      const items = await Link.find({ project: projectId }).sort('createdAt DESC');

      return exits.success({ links: items });
    } catch (error) {
      sails.log.error('Error en links/get-links', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
