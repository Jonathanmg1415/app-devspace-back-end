module.exports = {
  attributes: {
    title:   { type: 'string', required: true },
    url:     { type: 'string', required: true, isURL: true },
    label:   { type: 'string', defaultsTo: '' },
    tags:    { type: 'json',   defaultsTo: [] },
    project: { model: 'project', required: true },
    owner:   { model: 'user',    required: true },
  },
};
