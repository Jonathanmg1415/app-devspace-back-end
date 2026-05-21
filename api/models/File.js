module.exports = {
  attributes: {
    name:         { type: 'string', required: true },
    originalname: { type: 'string', required: true },
    mimetype:     { type: 'string', required: true },
    size:         { type: 'number', required: true },
    url:          { type: 'string', required: true },
    bucket:       { type: 'string', defaultsTo: 'devspace-files' },
    project:      { model: 'project', required: true },
    owner:        { model: 'user',    required: true },
  },
};
