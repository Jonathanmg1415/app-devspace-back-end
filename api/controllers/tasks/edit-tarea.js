module.exports = {
  friendlyName: 'Edit tarea',
  description:  'Editar un tarea existente.',

  inputs: {
    id: {
      type:     'number',
      required: true,
    },
    title: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    status: {
      type: 'string',
      isIn: ['todo', 'in_progress', 'done'],
    },
    priority: {
      type: 'string',
      isIn: ['low', 'medium', 'high'],
    },
    dueDate: {
      type: 'ref',
    },
    tags: {
      type: 'json',
    },
    order: {
      type: 'number',
    },
  },

  exits: {
    success: {
      description:  'Task actualizado.',
      responseType: 'ok',
    },
    notFound: {
      statusCode:   404,
      description:  'Task no encontrado.',
      responseType: 'notFound',
    },
    errorGeneral: {
      statusCode:   500,
      description:  'Error interno.',
      responseType: 'serverError',
    },
  },

  fn: async function ({ id, ...fields }, exits) {
    sails.log.debug('-----> tasks/edit-tarea');

    try {
      const exists = await Task.findOne({ id, owner: this.req.user.id });
      if (!exists) return exits.notFound();

      const data = Object.fromEntries(
        Object.entries(fields).filter(([, v]) => v !== undefined)
      );

      const item = await Task.updateOne({ id }).set(data);

      return exits.success({ tarea: item });
    } catch (error) {
      sails.log.error('Error en tasks/edit-tarea', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
