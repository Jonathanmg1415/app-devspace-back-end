module.exports = {
  friendlyName: 'Create day task',
  inputs: {
    title:    { type: 'string', required: true },
    date:     { type: 'ref',    required: true },
    calendar: { type: 'number', required: true },
  },
  exits: {
    success:   { responseType: 'ok' },
    forbidden: { statusCode: 403 },
  },

  fn: async function ({ title, date, calendar }, exits) {
    const hasAccess = await sails.helpers.hasCalendarAccess.with({ calendarId: calendar, userId: this.req.user.id });
    if (!hasAccess) return exits.forbidden({ mensaje: 'No tiene acceso a ese calendario.' });

    const created   = await DayTask.create({ title, date, calendar, owner: this.req.user.id }).fetch();
    const populated = await DayTask.findOne({ id: created.id }).populate('owner').populate('calendar');
    return exits.success({ dayTask: populated });
  },
};
