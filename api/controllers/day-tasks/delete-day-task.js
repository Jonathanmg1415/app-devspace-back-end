module.exports = {
  friendlyName: 'Delete day task',
  inputs: { id: { type: 'number', required: true } },
  exits: { success: { responseType: 'ok' }, notFound: { statusCode: 404 } },

  fn: async function ({ id }, exits) {
    const exists = await DayTask.findOne({ id });
    if (!exists) return exits.notFound();

    const hasAccess = await sails.helpers.hasCalendarAccess.with({ calendarId: exists.calendar, userId: this.req.user.id });
    if (!hasAccess) return exits.notFound();

    await DayTask.destroyOne({ id });
    return exits.success({ ok: true });
  },
};
