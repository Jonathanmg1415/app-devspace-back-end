const bcrypt = require('bcryptjs');

module.exports = {
  friendlyName: 'Reset password',
  description:  'Restablecer contraseña con token válido.',
  inputs: {
    token:    { type: 'string', required: true },
    password: { type: 'string', required: true, minLength: 6 },
  },
  exits: {
    success:      { responseType: 'ok' },
    invalid:      { statusCode: 400, responseType: 'badRequest' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({ token, password }, exits) {
    sails.log.debug('-----> auth/reset-password');
    try {
      const user = await User.findOne({ reset_token: token });

      if (!user || !user.reset_token_expiry || Date.now() > user.reset_token_expiry) {
        return exits.invalid({ mensaje: 'El enlace de recuperación no es válido o ha expirado.' });
      }

      const hashed = await bcrypt.hash(password, 10);
      await User.updateOne({ id: user.id }).set({
        password:           hashed,
        reset_token:        null,
        reset_token_expiry: null,
      });

      return exits.success({ mensaje: 'Contraseña actualizada correctamente.' });
    } catch (err) {
      sails.log.error('Error en auth/reset-password', err);
      return exits.errorGeneral({ mensaje: err.message });
    }
  },
};
