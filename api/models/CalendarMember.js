module.exports = {
  tableName: 'calendar_member',
  attributes: {
    calendar: { model: 'calendar', required: true },
    user:     { model: 'user',     required: true },
  },
};
