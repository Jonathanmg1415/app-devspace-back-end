module.exports = {
  friendlyName: 'Toggle day task',
  description:  'Marcar una tarea de día como hecha/no hecha.',
  inputs: {
    id:   { type: 'number',  required: true },
    done: { type: 'boolean', required: true },
  },
  exits: {
    success:  { responseType: 'ok' },
    notFound: { statusCode: 404 },
  },

  fn: async function ({ id, done }, exits) {
    const exists = await DayTask.findOne({ id });
    if (!exists) return exits.notFound();

    const hasAccess = await sails.helpers.hasCalendarAccess.with({ calendarId: exists.calendar, userId: this.req.user.id });
    if (!hasAccess) return exits.notFound();

    const updated   = await DayTask.updateOne({ id }).set({ done });
    const populated = await DayTask.findOne({ id: updated.id }).populate('owner').populate('calendar');
    return exits.success({ dayTask: populated });
  },
};
