module.exports = {
  attributes: {
    title:   { type: 'string', required: true },
    content: { type: 'string', defaultsTo: '' },
    section: { type: 'string', defaultsTo: 'General' },
    tags:    { type: 'json',   defaultsTo: [] },
    project: { model: 'project', required: true },
    owner:   { model: 'user',    required: true },
  },
};
