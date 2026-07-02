module.exports = {
  friendlyName: 'Invite calendar member',
  inputs: { email: { type: 'string', required: true, isEmail: true } },
  exits: {
    success:    { responseType: 'ok' },
    notFound:   { statusCode: 404 },
    badRequest: { statusCode: 400 },
    conflict:   { statusCode: 409 },
  },

  fn: async function ({ email }, exits) {
    const ownerId = this.req.user.id;
    if (email === this.req.user.email) return exits.badRequest({ message: 'No puedes compartir contigo mismo' });

    const target = await User.findOne({ email });
    if (!target) return exits.notFound({ message: 'No existe un usuario con ese email' });

    const already = await CalendarMember.findOne({ owner: ownerId, user: target.id });
    if (already) return exits.conflict({ message: 'Ya compartiste tu calendario con este usuario' });

    await CalendarMember.create({ owner: ownerId, user: target.id });

    // Notificación in-app
    Notification.create({
      recipient:  target.id,
      type:       'calendar_shared',
      title:      `${this.req.user.name} compartió su calendario contigo`,
      body:       'Ya puedes ver sus eventos en tu calendario',
    }).catch(() => {});

    const member = await CalendarMember.findOne({ owner: ownerId, user: target.id }).populate('user');
    return exits.success({ member });
  },
};
