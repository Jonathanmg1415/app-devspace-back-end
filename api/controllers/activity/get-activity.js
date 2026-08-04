module.exports = {
  friendlyName: 'Get activity',
  description:  'Obtener feed de actividad de un proyecto.',

  inputs: {
    projectId: { type: 'number', required: true },
    limit:     { type: 'number', defaultsTo: 50 },
  },

  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },

  fn: async function ({ projectId, limit }, exits) {
    sails.log.debug('-----> activity/get-activity');
    try {
      const project  = await Project.findOne({ id: projectId });
      if (!project) return exits.notFound();
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: projectId, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();

      const rows = await Activity.find({ project: projectId })
        .sort('createdAt DESC')
        .limit(limit);

      // activity.id/project/actor/entityId son bigint en la base (a diferencia del
      // resto de las tablas, que usan integer) — el driver de pg los devuelve como
      // string, lo que rompe el match interno de Waterline en `.populate()`.
      const actorIds = [...new Set(rows.map((r) => Number(r.actor)))];
      const actors    = await User.find({ id: actorIds });
      const byId      = new Map(actors.map((u) => [u.id, u]));

      const events = rows.map((r) => ({
        ...r,
        id:       Number(r.id),
        project:  Number(r.project),
        entityId: r.entityId === null ? null : Number(r.entityId),
        actor:    byId.get(Number(r.actor)) || null,
      }));

      return exits.success({ events });
    } catch (error) {
      sails.log.error('Error en activity/get-activity', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
