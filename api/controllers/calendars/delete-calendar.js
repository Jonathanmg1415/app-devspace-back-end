module.exports = {
  friendlyName: 'Delete calendar',
  description:  'Borra un calendario y su contenido — solo el dueño. No se puede borrar el calendario por defecto.',
  inputs: {
    id: { type: 'number', required: true },
  },
  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    conflict:     { statusCode: 409 },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },

  fn: async function ({ id }, exits) {
    sails.log.debug('-----> calendars/delete-calendar');
    try {
      const calendar = await Calendar.findOne({ id, owner: this.req.user.id });
      if (!calendar) return exits.notFound();
      if (calendar.isDefault) {
        return exits.conflict({ mensaje: 'No se puede borrar el calendario por defecto — podés renombrarlo en cambio.' });
      }

      await Calendar.getDatastore().transaction(async (db) => {
        await Event.destroy({ calendar: id }).usingConnection(db);
        await DayTask.destroy({ calendar: id }).usingConnection(db);
        await CalendarMember.destroy({ calendar: id }).usingConnection(db);
        await Calendar.destroyOne({ id }).usingConnection(db);
      });

      return exits.success({ mensaje: 'Calendario eliminado correctamente.' });
    } catch (error) {
      sails.log.error('Error en calendars/delete-calendar', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
