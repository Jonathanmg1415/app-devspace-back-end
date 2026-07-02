module.exports = {
  friendlyName: 'Get events',
  inputs: {
    year:  { type: 'number', required: true },
    month: { type: 'number', required: true }, // 1-12
  },
  exits: { success: { responseType: 'ok' } },

  fn: async function ({ year, month }, exits) {
    const userId = this.req.user.id;

    // Rango del mes
    const from = new Date(year, month - 1, 1);
    const to   = new Date(year, month, 1);

    // IDs de owners cuyos calendarios comparten con el usuario actual
    const sharedWith = await CalendarMember.find({ user: userId });
    const ownerIds   = [userId, ...sharedWith.map(m => m.owner)];

    const events = await Event.find({
      owner:     ownerIds,
      startDate: { '>=': from, '<': to },
    }).populate('project').populate('owner');

    return exits.success({ events });
  },
};
