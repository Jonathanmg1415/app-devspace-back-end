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

      // task_comment.id/task son bigint en la base (a diferencia del resto de las tablas)
      // y el autor ya lo tenemos en mano — evitamos .populate('author'), que falla por el
      // mismatch de tipo bigint-string vs el integer de user.id.
      const comment = {
        ...created,
        id:     Number(created.id),
        task:   Number(created.task),
        author: this.req.user,
      };

      // Notificaciones a quien creó y a quien está asignado (excepto el que comenta)
      const notifySet = new Set();
      if (task.createdBy && task.createdBy !== this.req.user.id) notifySet.add(task.createdBy);
      if (task.assignee  && task.assignee  !== this.req.user.id) notifySet.add(task.assignee);
      for (const uid of notifySet) {
        Notification.create({
          recipient:  uid,
          type:       'comment_added',
          title:      `${this.req.user.name} comentó en: ${task.title}`,
          body:       content.trim().slice(0, 80),
          entityType: 'task',
          entityId:   taskId,
          project:    task.project,
        }).catch(() => {});
      }

      // Log actividad
      sails.helpers.logActivity.with({
        projectId: Number(task.project),
        actorId:   this.req.user.id,
        action:    'commented',
        entity:    'task',
        entityId:  taskId,
        meta:      { taskTitle: task.title },
      }).catch((err) => sails.log.warn('logActivity falló (ignorado):', err.message));

      return exits.success({ comment });
    } catch (error) {
      sails.log.error('Error en comments/create-comment', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
