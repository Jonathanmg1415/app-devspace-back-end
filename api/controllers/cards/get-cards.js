module.exports = {
  friendlyName: 'Get cards',
  description:  'Listar todos los cards de un proyecto.',

  inputs: {
    projectId: {
      type:     'number',
      required: true,
    },
  },

  exits: {
    success: {
      description:  'Lista de cards.',
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
    sails.log.debug('-----> cards/get-cards');

    try {
      const project = await Project.findOne({ id: projectId, owner: this.req.user.id });
      if (!project) return exits.notFound();

      const items = await Card.find({ project: projectId }).sort('createdAt DESC');

      return exits.success({ cards: items });
    } catch (error) {
      sails.log.error('Error en cards/get-cards', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
