module.exports = {
  friendlyName: 'Get events',
  inputs: {
    year:  { type: 'number', required: true },
    month: { type: 'number', required: true }, // 1-12
  },
  exits: { success: { responseType: 'ok' } },

  fn: async function ({ year, month }, exits) {
    const userId = this.req.user.id;

    const from = new Date(year, month - 1, 1);
    const to   = new Date(year, month, 1);

    const owned    = await Calendar.find({ owner: userId });
    const memberOf = await CalendarMember.find({ user: userId });
    const calendarIds = [...new Set([...owned.map((c) => c.id), ...memberOf.map((m) => m.calendar)])];

    const events = await Event.find({
      calendar:  calendarIds,
      startDate: { '>=': from, '<': to },
    }).populate('project').populate('owner').populate('calendar');

    return exits.success({ events });
  },
};
