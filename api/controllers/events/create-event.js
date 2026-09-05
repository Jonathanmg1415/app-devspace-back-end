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
    calendar:    { type: 'number', required: true },
  },
  exits: {
    success:   { responseType: 'ok' },
    forbidden: { statusCode: 403 },
  },

  fn: async function (inputs, exits) {
    const { project, calendar, ...data } = inputs;

    const hasAccess = await sails.helpers.hasCalendarAccess.with({ calendarId: calendar, userId: this.req.user.id });
    if (!hasAccess) return exits.forbidden({ mensaje: 'No tenés acceso a ese calendario.' });

    const payload = { ...data, owner: this.req.user.id, calendar };
    if (project) payload.project = project;

    const created   = await Event.create(payload).fetch();
    const populated = await Event.findOne({ id: created.id }).populate('project').populate('owner').populate('calendar');
    return exits.success({ event: populated });
  },
};
