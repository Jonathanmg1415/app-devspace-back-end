module.exports = {
  friendlyName: 'Edit event',
  inputs: {
    id:          { type: 'number', required: true },
    title:       { type: 'string' },
    description: { type: 'string' },
    startDate:   { type: 'ref' },
    endDate:     { type: 'ref' },
    allDay:      { type: 'boolean' },
    color:       { type: 'string' },
    project:     { type: 'number' },
    clearProject:{ type: 'boolean' },
  },
  exits: {
    success:  { responseType: 'ok' },
    notFound: { statusCode: 404 },
  },

  fn: async function ({ id, clearProject, ...fields }, exits) {
    const exists = await Event.findOne({ id, owner: this.req.user.id });
    if (!exists) return exits.notFound();

    const data = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
    if (clearProject) data.project = null;

    const updated   = await Event.updateOne({ id }).set(data);
    const populated  = await Event.findOne({ id: updated.id }).populate('project').populate('owner');
    return exits.success({ event: populated });
  },
};
