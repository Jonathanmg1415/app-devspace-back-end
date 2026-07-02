module.exports = {
  attributes: {
    name:        { type: 'string', required: true },
    description: { type: 'string', defaultsTo: '' },
    color:       { type: 'string', defaultsTo: '#467886' },
    icon:        { type: 'string', defaultsTo: 'folder' },
    status:      { type: 'string', isIn: ['active','paused','completed','archived'], defaultsTo: 'active' },
    owner:       { model: 'user', required: true },
    tasks:       { collection: 'task',    via: 'project' },
    links:       { collection: 'link',    via: 'project' },
    commands:    { collection: 'command', via: 'project' },
    notes:       { collection: 'note',    via: 'project' },
    cards:       { collection: 'card',    via: 'project' },
  },
};
