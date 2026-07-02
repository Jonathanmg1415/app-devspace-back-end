module.exports = {
  tableName: 'calendar_member',
  attributes: {
    user:  { model: 'user', required: true },
    owner: { model: 'user', required: true },
  },
};
