module.exports = {
  friendlyName: 'Remove calendar member',
  inputs: { id: { type: 'number', required: true } },
  exits: { success: { responseType: 'ok' }, notFound: { statusCode: 404 } },

  fn: async function ({ id }, exits) {
    const m = await CalendarMember.findOne({ id, owner: this.req.user.id });
    if (!m) return exits.notFound();
    await CalendarMember.destroyOne({ id });
    return exits.success({ ok: true });
  },
};
