module.exports = {
  friendlyName: 'Get notifications',
  exits: { success: { responseType: 'ok' } },
  fn: async function (_inputs, exits) {
    const items = await Notification.find({ recipient: this.req.user.id })
      .sort('createdAt DESC')
      .limit(40);
    const unread = items.filter(n => !n.read).length;
    return exits.success({ notifications: items, unread });
  },
};
