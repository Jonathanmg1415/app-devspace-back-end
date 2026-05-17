module.exports = {
  friendlyName: 'Create tarea',
  description:  'Crear un nuevo tarea en un proyecto.',

  inputs: {
    projectId: {
      type:     'number',
      required: true,
    },
    title: {
      type:     'string',
      required: true,
    },
    description: {
      type:       'string',
      defaultsTo: '',
    },
    status: {
      type:       'string',
      isIn:       ['todo', 'in_progress', 'done'],
      defaultsTo: 'todo',
    },
    priority: {
      type:       'string',
      isIn:       ['low', 'medium', 'high'],
      defaultsTo: 'medium',
    },
    dueDate: {
      type: 'ref',
    },
    tags: {
      type:       'json',
      defaultsTo: [],
    },
  },

  exits: {
    success: {
      description:  'Task creado.',
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
    sails.log.debug('-----> tasks/create-tarea');

    try {
      const { projectId, ...data } = inputs;

      const project = await Project.findOne({ id: projectId, owner: this.req.user.id });
      if (!project) return exits.notFound();

      const item = await Task.create({
        ...data,
        project: projectId,
        owner:   this.req.user.id,
      }).fetch();

      return exits.success({ tarea: item });
    } catch (error) {
      sails.log.error('Error en tasks/create-tarea', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
