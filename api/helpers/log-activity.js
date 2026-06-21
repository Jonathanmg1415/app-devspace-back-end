module.exports = {
  friendlyName: 'Log activity',
  description:  'Registra un evento de actividad en el proyecto (fire-and-forget).',

  inputs: {
    projectId: { type: 'number', required: true },
    actorId:   { type: 'number', required: true },
    action:    { type: 'string', required: true },
    entity:    { type: 'string', required: true },
    entityId:  { type: 'number' },
    meta:      { type: 'json', defaultsTo: {} },
  },

  exits: {
    success: { outputType: 'ref' },
    error:   { description: 'Error al registrar actividad (ignorado).' },
  },

  fn: async function ({ projectId, actorId, action, entity, entityId, meta }, exits) {
    try {
      const record = await Activity.create({
        project:  projectId,
        actor:    actorId,
        action,
        entity,
        entityId: entityId || null,
        meta:     meta || {},
      }).fetch();
      return exits.success(record);
    } catch (error) {
      sails.log.warn('log-activity error (ignorado):', error.message);
      return exits.error(error);
    }
  },
};
