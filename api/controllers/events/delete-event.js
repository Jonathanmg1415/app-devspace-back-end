module.exports = {
  friendlyName: 'Delete event',
  inputs: { id: { type: 'number', required: true } },
  exits: { success: { responseType: 'ok' }, notFound: { statusCode: 404 } },

  fn: async function ({ id }, exits) {
    const exists = await Event.findOne({ id, owner: this.req.user.id });
    if (!exists) return exits.notFound();
    await Event.destroyOne({ id });
    return exits.success({ ok: true });
  },
};
