module.exports = {
  attributes: {
    title:       { type: 'string', required: true },
    description: { type: 'string', defaultsTo: '' },
    status:      { type: 'string', isIn: ['todo','in_progress','done'], defaultsTo: 'todo' },
    priority:    { type: 'string', isIn: ['low','medium','high'], defaultsTo: 'medium' },
    dueDate:     { type: 'ref', columnType: 'date' },
    order:       { type: 'number', defaultsTo: 0 },
    tags:        { type: 'json', defaultsTo: [] },
    project:     { model: 'project', required: true },
    owner:       { model: 'user',    required: true },
    assignee:    { model: 'user' },
  },
};
