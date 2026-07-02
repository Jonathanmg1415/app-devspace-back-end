module.exports = {
  friendlyName: 'Ping',
  description: 'Health check endpoint.',
  exits: { success: { responseType: 'ok' } },
  fn: async function (_inputs, exits) {
    return exits.success({ ok: true, ts: Date.now() });
  },
};
