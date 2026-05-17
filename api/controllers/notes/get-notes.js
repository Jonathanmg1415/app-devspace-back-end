module.exports = {
  friendlyName: 'Get notes',
  description:  'Listar todos los notes de un proyecto.',

  inputs: {
    projectId: {
      type:     'number',
      required: true,
    },
  },

  exits: {
    success: {
      description:  'Lista de notes.',
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
    sails.log.debug('-----> notes/get-notes');

    try {
      const project = await Project.findOne({ id: projectId, owner: this.req.user.id });
      if (!project) return exits.notFound();

      const items = await Note.find({ project: projectId }).sort('createdAt DESC');

      return exits.success({ notes: items });
    } catch (error) {
      sails.log.error('Error en notes/get-notes', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
