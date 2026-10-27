module.exports = {
  friendlyName: 'Invite calendar member',
  description:  'Compartir un calendario con otro usuario — solo el dueño del calendario.',
  inputs: {
    calendarId: { type: 'number', required: true },
    email:      { type: 'string', required: true, isEmail: true },
  },
  exits: {
    success:    { responseType: 'ok' },
    notFound:   { statusCode: 404 },
    badRequest: { statusCode: 400 },
    conflict:   { statusCode: 409 },
  },

  fn: async function ({ calendarId, email }, exits) {
    const calendar = await Calendar.findOne({ id: calendarId, owner: this.req.user.id });
    if (!calendar) return exits.notFound();

    if (email === this.req.user.email) return exits.badRequest({ mensaje: 'No puede compartir el calendario con usted mismo' });

    const target = await User.findOne({ email });
    if (!target) return exits.notFound({ mensaje: 'No existe un usuario con ese email' });

    const already = await CalendarMember.findOne({ calendar: calendarId, user: target.id });
    if (already) return exits.conflict({ mensaje: 'Ya compartió este calendario con este usuario' });

    await CalendarMember.create({ calendar: calendarId, user: target.id });

    Notification.create({
      recipient:  target.id,
      type:       'calendar_shared',
      title:      `${this.req.user.name} compartió "${calendar.name}" con usted`,
      body:       'Ya puede ver y editar los eventos y tareas de este calendario',
      entityType: 'calendar',
      entityId:   calendarId,
    }).catch(() => {});

    const member = await CalendarMember.findOne({ calendar: calendarId, user: target.id }).populate('user');
    return exits.success({ member });
  },
};
