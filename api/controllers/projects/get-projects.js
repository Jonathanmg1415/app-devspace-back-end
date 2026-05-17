module.exports = {
  friendlyName: 'Get projects',
  description:  'Listar todos los proyectos del usuario autenticado.',

  inputs: {},

  exits: {
    success: {
      description:  'Lista de proyectos.',
      responseType: 'ok',
    },
    errorGeneral: {
      statusCode:   500,
      description:  'Error interno.',
      responseType: 'serverError',
    },
  },

  fn: async function (_inputs, exits) {
    sails.log.debug('-----> projects/get-projects');

    try {
      const projects = await Project.find({ owner: this.req.user.id })
        .sort('createdAt DESC');

      return exits.success({ projects });
    } catch (error) {
      sails.log.error('Error en projects/get-projects', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
