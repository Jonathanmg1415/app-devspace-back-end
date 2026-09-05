module.exports = {
  friendlyName: 'Create calendar',
  inputs: {
    name:  { type: 'string', required: true },
    color: { type: 'string', defaultsTo: '#F97316' },
  },
  exits: { success: { responseType: 'ok' } },

  fn: async function ({ name, color }, exits) {
    const created = await Calendar.create({
      name,
      color,
      owner:     this.req.user.id,
      isDefault: false,
    }).fetch();

    return exits.success({ calendar: { ...created, isOwner: true } });
  },
};
