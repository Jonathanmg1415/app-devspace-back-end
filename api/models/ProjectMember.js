module.exports = {
  tableName: 'project_member',
  attributes: {
    project: { model: 'project', required: true },
    user:    { model: 'user',    required: true },
    role:    { type: 'string',   defaultsTo: 'member' },
  },
};
