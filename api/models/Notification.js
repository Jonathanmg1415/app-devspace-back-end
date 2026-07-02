module.exports = {
  tableName: 'notification',
  attributes: {
    recipient:  { model: 'user',   required: true },
    type:       { type: 'string',  required: true },
    title:      { type: 'string',  required: true },
    body:       { type: 'string',  defaultsTo: '' },
    read:       { type: 'boolean', defaultsTo: false },
    entityType: { type: 'string',  allowNull: true, columnName: 'entity_type' },
    entityId:   { type: 'number',  allowNull: true, columnName: 'entity_id' },
    project:    { model: 'project' },
  },
};
