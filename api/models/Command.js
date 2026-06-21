module.exports = {
  attributes: {
    title:       { type: 'string', required: true },
    command:     { type: 'string', required: true },
    description: { type: 'string', defaultsTo: '' },
    area:        { type: 'string', defaultsTo: '' },
    tags:        { type: 'json',   defaultsTo: [] },
    project:     { model: 'project', required: true },
    owner:       { model: 'user',    required: true },
  },
};
