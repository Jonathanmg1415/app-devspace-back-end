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
    calendar:    { type: 'number' },
  },
  exits: {
    success:  { responseType: 'ok' },
    notFound: { statusCode: 404 },
  },

  fn: async function ({ id, clearProject, ...fields }, exits) {
    const exists = await Event.findOne({ id });
    if (!exists) return exits.notFound();

    // Colaborativo: dueño o miembro del calendario del evento puede editarlo,
    // no solo quien lo creó (decisión de producto explícita, no un bug).
    const hasAccess = await sails.helpers.hasCalendarAccess.with({ calendarId: exists.calendar, userId: this.req.user.id });
    if (!hasAccess) return exits.notFound();

    const data = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
    if (clearProject) data.project = null;

    // Si se mueve de calendario, confirmar acceso al calendario destino también.
    if (data.calendar && data.calendar !== exists.calendar) {
      const hasAccessToTarget = await sails.helpers.hasCalendarAccess.with({ calendarId: data.calendar, userId: this.req.user.id });
      if (!hasAccessToTarget) return exits.notFound();
    }

    const updated   = await Event.updateOne({ id }).set(data);
    const populated = await Event.findOne({ id: updated.id }).populate('project').populate('owner').populate('calendar');
    return exits.success({ event: populated });
  },
};
