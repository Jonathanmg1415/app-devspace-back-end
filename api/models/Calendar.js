module.exports = {
  tableName: 'calendar',
  attributes: {
    name:      { type: 'string',  required: true },
    color:     { type: 'string',  defaultsTo: '#F97316' },
    owner:     { model: 'user',   required: true },
    isDefault: { type: 'boolean', defaultsTo: false, columnName: 'is_default' },
  },
};
