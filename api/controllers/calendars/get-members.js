module.exports = {
  friendlyName: 'Get calendar members',
  inputs: {
    calendarId: { type: 'number', required: true },
  },
  exits: {
    success:  { responseType: 'ok' },
    notFound: { statusCode: 404 },
  },

  fn: async function ({ calendarId }, exits) {
    const hasAccess = await sails.helpers.hasCalendarAccess.with({ calendarId, userId: this.req.user.id });
    if (!hasAccess) return exits.notFound();

    const members = await CalendarMember.find({ calendar: calendarId }).populate('user');
    return exits.success({ members });
  },
};
