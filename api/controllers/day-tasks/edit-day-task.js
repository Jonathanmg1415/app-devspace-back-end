module.exports = {
  friendlyName: 'Edit day task',
  inputs: {
    id:    { type: 'number', required: true },
    title: { type: 'string' },
    date:  { type: 'ref' },
  },
  exits: {
    success:  { responseType: 'ok' },
    notFound: { statusCode: 404 },
  },

  fn: async function ({ id, title, date }, exits) {
    const exists = await DayTask.findOne({ id });
    if (!exists) return exits.notFound();

    const hasAccess = await sails.helpers.hasCalendarAccess.with({ calendarId: exists.calendar, userId: this.req.user.id });
    if (!hasAccess) return exits.notFound();

    const data = {};
    if (title !== undefined) data.title = title;
    if (date !== undefined) data.date = date;

    const updated   = await DayTask.updateOne({ id }).set(data);
    const populated = await DayTask.findOne({ id: updated.id }).populate('owner').populate('calendar');
    return exits.success({ dayTask: populated });
  },
};
