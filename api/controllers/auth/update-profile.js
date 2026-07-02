const bcrypt = require('bcryptjs');

module.exports = {
  friendlyName: 'Update profile',
  description:  'Actualizar nombre y/o contraseña del usuario autenticado.',

  inputs: {
    name:            { type: 'string' },
    avatar:          { type: 'string', allowNull: true },
    newPassword:     { type: 'string', minLength: 6 },
    currentPassword: { type: 'string' },
  },

  exits: {
    success:         { responseType: 'ok' },
    wrongPassword:   { statusCode: 400, responseType: 'badRequest' },
    errorGeneral:    { statusCode: 500, responseType: 'serverError' },
  },

  fn: async function ({ name, avatar, newPassword, currentPassword }, exits) {
    sails.log.debug('-----> auth/update-profile');
    try {
      const user = await User.findOne({ id: this.req.user.id });
      const updates = {};

      if (name && name.trim()) updates.name = name.trim();
      if (avatar !== undefined) updates.avatar = avatar || null;

      if (newPassword) {
        if (!currentPassword) return exits.wrongPassword({ error: 'Se requiere la contraseña actual.' });
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return exits.wrongPassword({ error: 'La contraseña actual es incorrecta.' });
        updates.password = await bcrypt.hash(newPassword, 12);
      }

      if (!Object.keys(updates).length) {
        return exits.success({ user: this.req.user });
      }

      await User.updateOne({ id: user.id }).set(updates);
      const updated = await User.findOne({ id: user.id });
      const { password: _p, reset_token: _rt, reset_token_expiry: _rte, ...safeUser } = updated;
      return exits.success({ user: safeUser });
    } catch (error) {
      sails.log.error('Error en auth/update-profile', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
