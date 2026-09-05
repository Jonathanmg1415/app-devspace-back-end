module.exports = {
  tableName: 'day_task',
  attributes: {
    title:    { type: 'string',  required: true },
    done:     { type: 'boolean', defaultsTo: false },
    date:     { type: 'ref',     required: true, columnType: 'date' },
    calendar: { model: 'calendar', required: true },
    owner:    { model: 'user',     required: true },
  },
};
