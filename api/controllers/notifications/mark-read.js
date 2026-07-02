module.exports = {
  friendlyName: 'Mark notification read',
  inputs: { id: { type: 'number', required: true } },
  exits: { success: { responseType: 'ok' } },
  fn: async function ({ id }, exits) {
    await Notification.updateOne({ id, recipient: this.req.user.id }).set({ read: true });
    return exits.success({ ok: true });
  },
};
