module.exports = {
  friendlyName: 'Mark all notifications read',
  exits: { success: { responseType: 'ok' } },
  fn: async function (_inputs, exits) {
    await Notification.update({ recipient: this.req.user.id, read: false }).set({ read: true });
    return exits.success({ ok: true });
  },
};
