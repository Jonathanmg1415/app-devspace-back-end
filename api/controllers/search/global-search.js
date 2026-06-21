module.exports = {
  friendlyName: 'Global search',
  description:  'Búsqueda global sobre todos los módulos del usuario.',
  inputs: {
    q:         { type: 'string', required: true, minLength: 2 },
    projectId: { type: 'number' },
  },
  exits: {
    success:      { responseType: 'ok' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({ q, projectId }, exits) {
    sails.log.debug('-----> search/global-search');
    try {
      const userId = this.req.user.id;

      // Proyectos donde el usuario es dueño
      const ownedProjects = await Project.find({ owner: userId }).select(['id']);
      const ownedIds = ownedProjects.map(p => p.id);

      // Proyectos donde el usuario es miembro
      const memberships = await ProjectMember.find({ user: userId }).select(['project']);
      const memberIds = memberships.map(m => m.project);

      // Unión de todos los projectIds accesibles
      const allProjectIds = [...new Set([...ownedIds, ...memberIds])];

      // Si se pasa un projectId específico, verificar que el usuario tenga acceso
      let projectFilter;
      if (projectId) {
        if (!allProjectIds.includes(projectId)) {
          return exits.success({ results: [] });
        }
        projectFilter = [projectId];
      } else {
        projectFilter = allProjectIds;
      }

      if (projectFilter.length === 0) {
        return exits.success({ results: [] });
      }

      const [tasks, links, commands, notes, cards] = await Promise.all([
        Task.find({ project: { in: projectFilter }, title: { contains: q } }),
        Link.find({ project: { in: projectFilter }, title: { contains: q } }),
        Command.find({ project: { in: projectFilter }, title: { contains: q } }),
        Note.find({ project: { in: projectFilter }, title: { contains: q } }),
        Card.find({ project: { in: projectFilter }, title: { contains: q } }),
      ]);

      const results = [
        ...tasks.map(r    => ({ ...r, _type: 'task' })),
        ...links.map(r    => ({ ...r, _type: 'link' })),
        ...commands.map(r => ({ ...r, _type: 'command' })),
        ...notes.map(r    => ({ ...r, _type: 'note' })),
        ...cards.map(r    => ({ ...r, _type: 'card' })),
      ];

      return exits.success({ results });
    } catch (error) {
      sails.log.error('Error en search/global-search', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
