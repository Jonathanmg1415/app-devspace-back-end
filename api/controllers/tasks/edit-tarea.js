module.exports = {
  friendlyName: 'Edit tarea',
  description:  'Editar un tarea existente.',
  inputs: {
    id:          { type: 'number', required: true },
    title:       { type: 'string' },
    description: { type: 'string' },
    status:      { type: 'string', isIn: ['todo','in_progress','done'] },
    priority:    { type: 'string', isIn: ['low','medium','high'] },
    dueDate:     { type: 'ref' },
    tags:        { type: 'json' },
    order:       { type: 'number' },
    assignee:    { type: 'number' },
    clearAssignee: { type: 'boolean' },
  },
  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({ id, clearAssignee, ...fields }, exits) {
    sails.log.debug('-----> tasks/edit-tarea');
    try {
      const exists = await Task.findOne({ id });
      if (!exists) return exits.notFound();
      const project  = await Project.findOne({ id: exists.project });
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: exists.project, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();

      const prevAssigneeId = exists.assignee;
      const data = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
      if (clearAssignee) data.assignee = null;

      const item = await Task.updateOne({ id }).set(data);
      const populated = await Task.findOne({ id: item.id }).populate('assignee');

      // Enviar email si cambia el asignado (y no es el mismo que asigna)
      const newAssigneeId = populated.assignee?.id;
      const assignerId = this.req.user.id;
      if (newAssigneeId && newAssigneeId !== prevAssigneeId && newAssigneeId !== assignerId) {
        const assignee = await User.findOne({ id: newAssigneeId });
        if (assignee?.email) {
          const html = sails.helpers.templates.taskAssignedEmail({
            assigneeName: assignee.name,
            assignerName: this.req.user.name,
            taskTitle:    populated.title,
            projectName:  project.name,
            appUrl:       sails.config.custom.appUrl || 'https://devspace.app',
          });
          sails.helpers.mailer({ to: assignee.email, subject: `Te asignaron una tarea en ${project.name}`, html })
            .catch(err => sails.log.warn('Email de asignación no enviado:', err.message));
        }
      }

      return exits.success({ tarea: populated });
    } catch (error) {
      sails.log.error('Error en tasks/edit-tarea', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
