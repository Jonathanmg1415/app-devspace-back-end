module.exports = {
  friendlyName: 'Create comment',
  description:  'Agregar comentario a una tarea.',

  inputs: {
    taskId:  { type: 'number', required: true },
    content: { type: 'string', required: true },
  },

  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },

  fn: async function ({ taskId, content }, exits) {
    sails.log.debug('-----> comments/create-comment');
    try {
      const task = await Task.findOne({ id: taskId });
      if (!task) return exits.notFound();
      const project  = await Project.findOne({ id: task.project });
      const isOwner  = project?.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: task.project, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();

      const created = await TaskComment.create({
        task: taskId,
        author: this.req.user.id,
        content: content.trim(),
      }).fetch();

      const comment = await TaskComment.findOne({ id: created.id }).populate('author');

      // Log actividad
      sails.helpers.logActivity({
        projectId: task.project,
        actorId:   this.req.user.id,
        action:    'commented',
        entity:    'task',
        entityId:  taskId,
        meta:      { taskTitle: task.title },
      }).catch(() => {});

      return exits.success({ comment });
    } catch (error) {
      sails.log.error('Error en comments/create-comment', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
