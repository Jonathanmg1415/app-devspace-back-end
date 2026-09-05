module.exports = {
  friendlyName: 'Get day tasks',
  inputs: {
    year:  { type: 'number', required: true },
    month: { type: 'number', required: true },
  },
  exits: { success: { responseType: 'ok' } },

  fn: async function ({ year, month }, exits) {
    const userId = this.req.user.id;

    const from = new Date(year, month - 1, 1);
    const to   = new Date(year, month, 1);
    const pad  = (n) => String(n).padStart(2, '0');
    const fromStr = `${from.getFullYear()}-${pad(from.getMonth() + 1)}-${pad(from.getDate())}`;
    const toStr   = `${to.getFullYear()}-${pad(to.getMonth() + 1)}-${pad(to.getDate())}`;

    const owned    = await Calendar.find({ owner: userId });
    const memberOf = await CalendarMember.find({ user: userId });
    const calendarIds = [...new Set([...owned.map((c) => c.id), ...memberOf.map((m) => m.calendar)])];

    const dayTasks = await DayTask.find({
      calendar: calendarIds,
      date: { '>=': fromStr, '<': toStr },
    }).populate('owner').populate('calendar');

    return exits.success({ dayTasks });
  },
};
