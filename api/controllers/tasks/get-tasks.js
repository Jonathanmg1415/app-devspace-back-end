module.exports = {
  friendlyName: 'Get tasks',
  description:  'Listar todos los tasks de un proyecto.',

  inputs: {
    projectId: {
      type:     'number',
      required: true,
    },
  },

  exits: {
    success: {
      description:  'Lista de tasks.',
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
    sails.log.debug('-----> tasks/get-tasks');

    try {
      const project = await Project.findOne({ id: projectId, owner: this.req.user.id });
      if (!project) return exits.notFound();

      const items = await Task.find({ project: projectId }).sort('createdAt DESC');

      return exits.success({ tasks: items });
    } catch (error) {
      sails.log.error('Error en tasks/get-tasks', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
