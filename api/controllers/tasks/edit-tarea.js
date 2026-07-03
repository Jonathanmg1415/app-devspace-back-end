module.exports = {
  friendlyName: 'Edit tarea',
  description:  'Editar un tarea existente.',
  inputs: {
    id:             { type: 'number',  required: true },
    title:          { type: 'string' },
    description:    { type: 'string' },
    status:         { type: 'string',  isIn: ['todo','in_progress','done'] },
    priority:       { type: 'string',  isIn: ['low','medium','high'] },
    dueDate:        { type: 'ref' },
    tags:           { type: 'json' },
    checklist:      { type: 'json' },
    estimatedHours: { type: 'number', allowNull: true },
    actualHours:    { type: 'number', allowNull: true },
    recurrence:     { type: 'string',  isIn: ['daily','weekly','monthly'], allowNull: true },
    order:          { type: 'number' },
    assignee:       { type: 'number', allowNull: true },
    clearAssignee:  { type: 'boolean' },
    clearRecurrence:{ type: 'boolean' },
  },
  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({ id, clearAssignee, clearRecurrence, ...fields }, exits) {
    sails.log.debug('-----> tasks/edit-tarea');
    try {
      const exists = await Task.findOne({ id });
      if (!exists) return exits.notFound();
      const project = await Project.findOne({ id: exists.project });
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: exists.project, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();

      const prevAssigneeId = exists.assignee;
      const prevStatus     = exists.status;
      const data = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
      if (clearAssignee)   data.assignee   = null;
      if (clearRecurrence) data.recurrence = null;

      const item     = await Task.updateOne({ id }).set(data);
      const populated = await Task.findOne({ id: item.id }).populate('assignee');

      // Notificación + email si cambia el asignado
      const newAssigneeId = populated.assignee?.id;
      const actorId = this.req.user.id;
      if (newAssigneeId && newAssigneeId !== prevAssigneeId && newAssigneeId !== actorId) {
        Notification.create({
          recipient:  newAssigneeId,
          type:       'task_assigned',
          title:      `Te asignaron: ${populated.title}`,
          body:       `En el proyecto ${project.name}`,
          entityType: 'task',
          entityId:   populated.id,
          project:    project.id,
        }).catch(() => {});

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
            .catch(err => sails.log.warn('Email no enviado:', err.message));
        }
      }

      // Recurrencia: si se marca done y tiene recurrencia, crear siguiente instancia
      if (data.status === 'done' && prevStatus !== 'done' && exists.recurrence) {
        const base = populated.dueDate ? new Date(populated.dueDate) : new Date();
        const next = new Date(base);
        if (exists.recurrence === 'daily')   next.setDate(next.getDate() + 1);
        if (exists.recurrence === 'weekly')  next.setDate(next.getDate() + 7);
        if (exists.recurrence === 'monthly') next.setMonth(next.getMonth() + 1);

        Task.create({
          title:          populated.title,
          description:    populated.description,
          status:         'todo',
          priority:       populated.priority,
          dueDate:        next,
          tags:           populated.tags,
          checklist:      (populated.checklist || []).map(i => ({ ...i, done: false })),
          estimatedHours: populated.estimatedHours,
          recurrence:     populated.recurrence,
          project:        exists.project,
          owner:          exists.owner,
          assignee:       populated.assignee?.id || null,
        }).catch(() => {});
      }

      return exits.success({ tarea: populated });
    } catch (error) {
      sails.log.error('Error en tasks/edit-tarea', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
