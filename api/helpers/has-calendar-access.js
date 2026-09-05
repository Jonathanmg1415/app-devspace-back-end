module.exports = {
  friendlyName: 'Has calendar access',
  description:  'True si el usuario es dueño o miembro del calendario — usado por events/day-tasks para el permiso colaborativo.',

  inputs: {
    calendarId: { type: 'number', required: true },
    userId:     { type: 'number', required: true },
  },

  exits: {
    success: { outputType: 'boolean' },
  },

  fn: async function ({ calendarId, userId }, exits) {
    const isOwner = await Calendar.findOne({ id: calendarId, owner: userId });
    if (isOwner) return exits.success(true);
    const isMember = await CalendarMember.findOne({ calendar: calendarId, user: userId });
    return exits.success(!!isMember);
  },
};
