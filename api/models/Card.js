module.exports = {
  attributes: {
    title:   { type: 'string', required: true },
    content: { type: 'string', defaultsTo: '' },
    color:   { type: 'string', defaultsTo: '#ffffff' },
    order:   { type: 'number', defaultsTo: 0 },
    tags:    { type: 'json',   defaultsTo: [] },
    project: { model: 'project', required: true },
    owner:   { model: 'user',    required: true },
  },
};
