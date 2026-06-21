module.exports = {
  attributes: {
    project:  { model: 'project', required: true },
    actor:    { model: 'user',    required: true },
    action:   { type: 'string',   required: true },
    entity:   { type: 'string',   required: true },
    entityId: { type: 'number' },
    meta:     { type: 'json',     defaultsTo: {} },
  },
};
