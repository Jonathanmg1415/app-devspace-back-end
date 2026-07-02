module.exports = {
  friendlyName: 'Get calendar members',
  exits: { success: { responseType: 'ok' } },

  fn: async function (_inputs, exits) {
    const members = await CalendarMember.find({ owner: this.req.user.id }).populate('user');
    return exits.success({ members });
  },
};
