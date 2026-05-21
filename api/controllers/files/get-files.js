module.exports = {
  friendlyName: 'Get files',
  description:  'Listar archivos de un proyecto.',

  inputs: {
    projectId: {
      type:     'number',
      required: true,
    },
  },

  exits: {
    success: {
      description:  'Lista de archivos.',
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
    sails.log.debug('-----> files/get-files');

    try {
      const project = await Project.findOne({ id: projectId, owner: this.req.user.id });
      if (!project) return exits.notFound();

      const files = await File.find({ project: projectId }).sort('createdAt DESC');

      return exits.success({ files });
    } catch (error) {
      sails.log.error('Error en files/get-files', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
