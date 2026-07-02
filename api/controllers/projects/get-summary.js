module.exports = {
  friendlyName: 'Get project summary',
  inputs: { projectId: { type: 'string', required: true } },
  exits: {
    success:  { responseType: 'ok' },
    notFound: { statusCode: 404, responseType: 'notFound' },
  },
  fn: async function ({ projectId }, exits) {
    const project = await Project.findOne({ id: projectId });
    if (!project) return exits.notFound();
    const isOwner  = project.owner === this.req.user.id;
    const isMember = await ProjectMember.findOne({ project: projectId, user: this.req.user.id });
    if (!isOwner && !isMember) return exits.notFound();

    const [tasks, notes, links, commands, files, members, activity] = await Promise.all([
      Task.find({ project: projectId }),
      Note.count({ project: projectId }),
      Link.count({ project: projectId }),
      Command.count({ project: projectId }),
      sails.models.file ? sails.models.file.count({ project: projectId }).catch(() => 0) : Promise.resolve(0),
      ProjectMember.find({ project: projectId }).populate('user'),
      Activity.find({ project: projectId }).sort('createdAt DESC').limit(5).populate('actor'),
    ]);

    const taskCounts = { todo: 0, in_progress: 0, done: 0, total: tasks.length };
    for (const t of tasks) taskCounts[t.status] = (taskCounts[t.status] || 0) + 1;
    const completionRate = tasks.length ? Math.round((taskCounts.done / tasks.length) * 100) : 0;

    return exits.success({
      taskCounts,
      completionRate,
      notes,
      links,
      commands,
      files,
      memberCount: members.length + 1,
      members,
      recentActivity: activity,
    });
  },
};
