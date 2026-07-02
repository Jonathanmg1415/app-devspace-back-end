module.exports = {
  friendlyName: 'Create event',
  inputs: {
    title:       { type: 'string', required: true },
    description: { type: 'string', defaultsTo: '' },
    startDate:   { type: 'ref',    required: true },
    endDate:     { type: 'ref' },
    allDay:      { type: 'boolean', defaultsTo: false },
    color:       { type: 'string',  defaultsTo: '#F97316' },
    project:     { type: 'number' },
  },
  exits: { success: { responseType: 'ok' } },

  fn: async function (inputs, exits) {
    const { project, ...data } = inputs;
    const payload = { ...data, owner: this.req.user.id };
    if (project) payload.project = project;

    const created  = await Event.create(payload).fetch();
    const populated = await Event.findOne({ id: created.id }).populate('project').populate('owner');
    return exits.success({ event: populated });
  },
};
