module.exports = {
  friendlyName: 'Get comments',
  description:  'Obtener comentarios de una tarea.',

  inputs: {
    taskId: { type: 'number', required: true },
  },

  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },

  fn: async function ({ taskId }, exits) {
    sails.log.debug('-----> comments/get-comments');
    try {
      const task = await Task.findOne({ id: taskId });
      if (!task) return exits.notFound();
      const isOwner  = (await Project.findOne({ id: task.project }))?.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: task.project, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();

      const comments = await TaskComment.find({ task: taskId })
        .populate('author')
        .sort('createdAt ASC');

      return exits.success({ comments });
    } catch (error) {
      sails.log.error('Error en comments/get-comments', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
