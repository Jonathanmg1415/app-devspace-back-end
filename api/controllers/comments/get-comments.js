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

      const rows = await TaskComment.find({ task: taskId }).sort('createdAt ASC');

      // task_comment.author es bigint en la base (a diferencia del resto de las tablas,
      // que usan integer) — el driver de pg devuelve bigint como string en JS, lo que
      // rompe el match interno de Waterline en `.populate()`. Se resuelve a mano.
      const authorIds = [...new Set(rows.map((r) => Number(r.author)))];
      const authors    = await User.find({ id: authorIds });
      const byId       = new Map(authors.map((u) => [u.id, u]));

      const comments = rows.map((r) => ({
        ...r,
        id:     Number(r.id),
        task:   Number(r.task),
        author: byId.get(Number(r.author)) || null,
      }));

      return exits.success({ comments });
    } catch (error) {
      sails.log.error('Error en comments/get-comments', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
