module.exports = {
  friendlyName: 'Get my tasks',
  description: 'Listar todas las tareas asignadas al usuario actual en cualquier proyecto.',
  inputs: {},
  exits: {
    success:      { responseType: 'ok' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({}, exits) {
    sails.log.debug('-----> tasks/get-my-tasks');
    try {
      const userId = this.req.user.id;
      const tasks = await Task.find({ assignee: userId })
        .populate('project')
        .populate('assignee')
        .sort('createdAt DESC')
        .limit(200);
      return exits.success({ tasks });
    } catch (error) {
      sails.log.error('Error en tasks/get-my-tasks', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
