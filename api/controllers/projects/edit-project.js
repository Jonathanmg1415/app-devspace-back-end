module.exports = {
  friendlyName: 'Edit project',
  description:  'Editar un proyecto existente.',

  inputs: {
    id: {
      type:     'number',
      required: true,
    },
    name: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    color: {
      type: 'string',
    },
    icon: {
      type: 'string',
    },
    status: {
      type:  'string',
      isIn:  ['active', 'archived'],
    },
  },

  exits: {
    success: {
      description:  'Proyecto actualizado.',
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

  fn: async function ({ id, ...fields }, exits) {
    sails.log.debug('-----> projects/edit-project');

    try {
      const exists = await Project.findOne({ id, owner: this.req.user.id });
      if (!exists) return exits.notFound();

      // Eliminar campos undefined para no pisar valores existentes
      const data = Object.fromEntries(
        Object.entries(fields).filter(([, v]) => v !== undefined)
      );

      const project = await Project.updateOne({ id }).set(data);

      return exits.success({ project });
    } catch (error) {
      sails.log.error('Error en projects/edit-project', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
