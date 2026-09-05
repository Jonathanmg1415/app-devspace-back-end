module.exports = {
  friendlyName: 'Get calendars',
  description:  'Lista los calendarios propios y los compartidos conmigo.',
  exits: { success: { responseType: 'ok' } },

  fn: async function (_inputs, exits) {
    const userId = this.req.user.id;

    const owned    = await Calendar.find({ owner: userId });
    const memberOf = await CalendarMember.find({ user: userId }).populate('calendar');

    const ownedIds = new Set(owned.map((c) => c.id));
    const shared = memberOf
      .map((m) => m.calendar)
      .filter((c) => c && !ownedIds.has(c.id));

    const calendars = [
      ...owned.map((c) => ({ ...c, isOwner: true })),
      ...shared.map((c) => ({ ...c, isOwner: false })),
    ];

    return exits.success({ calendars });
  },
};
