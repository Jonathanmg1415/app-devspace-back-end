module.exports = {
  tableName: 'event',
  attributes: {
    title:       { type: 'string',  required: true },
    description: { type: 'string',  defaultsTo: '' },
    startDate:   { type: 'ref',     required: true, columnName: 'start_date' },
    endDate:     { type: 'ref',     columnName: 'end_date' },
    allDay:      { type: 'boolean', defaultsTo: false, columnName: 'all_day' },
    color:       { type: 'string',  defaultsTo: '#F97316' },
    owner:       { model: 'user',   required: true },
    project:     { model: 'project' },
  },
};
