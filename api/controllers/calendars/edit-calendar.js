module.exports = {
  friendlyName: 'Edit calendar',
  description:  'Renombrar/recolorear un calendario — solo el dueño.',
  inputs: {
    id:    { type: 'number', required: true },
    name:  { type: 'string' },
    color: { type: 'string' },
  },
  exits: {
    success:  { responseType: 'ok' },
    notFound: { statusCode: 404 },
  },

  fn: async function ({ id, name, color }, exits) {
    const exists = await Calendar.findOne({ id, owner: this.req.user.id });
    if (!exists) return exits.notFound();

    const data = {};
    if (name !== undefined) data.name = name;
    if (color !== undefined) data.color = color;

    const updated = await Calendar.updateOne({ id }).set(data);
    return exits.success({ calendar: { ...updated, isOwner: true } });
  },
};
