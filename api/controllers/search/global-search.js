module.exports = {
  friendlyName: 'Global search',
  description:  'Búsqueda global sobre todos los módulos del usuario.',

  inputs: {
    q: {
      type:      'string',
      required:  true,
      minLength: 2,
    },
    projectId: {
      type: 'number',
    },
  },

  exits: {
    success: {
      description:  'Resultados de búsqueda.',
      responseType: 'ok',
    },
    errorGeneral: {
      statusCode:   500,
      description:  'Error interno.',
      responseType: 'serverError',
    },
  },

  fn: async function ({ q, projectId }, exits) {
    sails.log.debug('-----> search/global-search');
    sails.log.verbose('query', q, 'projectId', projectId);

    try {
      const ownerFilter  = { owner: this.req.user.id };
      const projectFilter = projectId
        ? { project: projectId, ...ownerFilter }
        : ownerFilter;

      const [tasks, links, commands, notes, cards] = await Promise.all([
        Task.find({ ...projectFilter, title: { contains: q } }),
        Link.find({ ...projectFilter, title: { contains: q } }),
        Command.find({ ...projectFilter, title: { contains: q } }),
        Note.find({ ...projectFilter, title: { contains: q } }),
        Card.find({ ...projectFilter, title: { contains: q } }),
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
