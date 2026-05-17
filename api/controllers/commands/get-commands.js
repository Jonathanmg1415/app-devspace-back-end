module.exports = {
  friendlyName: 'Get commands',
  description:  'Listar todos los commands de un proyecto.',

  inputs: {
    projectId: {
      type:     'number',
      required: true,
    },
  },

  exits: {
    success: {
      description:  'Lista de commands.',
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
    sails.log.debug('-----> commands/get-commands');

    try {
      const project = await Project.findOne({ id: projectId, owner: this.req.user.id });
      if (!project) return exits.notFound();

      const items = await Command.find({ project: projectId }).sort('createdAt DESC');

      return exits.success({ commands: items });
    } catch (error) {
      sails.log.error('Error en commands/get-commands', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
