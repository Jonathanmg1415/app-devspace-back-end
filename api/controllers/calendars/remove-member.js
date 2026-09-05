module.exports = {
  friendlyName: 'Remove calendar member',
  description:  'Sacar a alguien de un calendario compartido — solo el dueño.',
  inputs: {
    calendarId: { type: 'number', required: true },
    memberId:   { type: 'number', required: true },
  },
  exits: {
    success:  { responseType: 'ok' },
    notFound: { statusCode: 404 },
  },

  fn: async function ({ calendarId, memberId }, exits) {
    const calendar = await Calendar.findOne({ id: calendarId, owner: this.req.user.id });
    if (!calendar) return exits.notFound();

    const member = await CalendarMember.findOne({ id: memberId, calendar: calendarId });
    if (!member) return exits.notFound();

    await CalendarMember.destroyOne({ id: memberId });
    return exits.success({ ok: true });
  },
};
