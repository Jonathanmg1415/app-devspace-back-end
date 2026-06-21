const crypto = require('crypto');

module.exports = {
  friendlyName: 'Forgot password',
  description:  'Solicitar recuperación de contraseña.',
  inputs: {
    email: { type: 'string', required: true, isEmail: true },
  },
  exits: {
    success:      { responseType: 'ok' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({ email }, exits) {
    sails.log.debug('-----> auth/forgot-password');
    try {
      // Always return success to avoid email enumeration
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return exits.success({ mensaje: 'Si existe una cuenta con ese email, recibirás un enlace.' });

      const token  = crypto.randomBytes(32).toString('hex');
      const expiry = Date.now() + 3600 * 1000; // 1 hour

      await User.updateOne({ id: user.id }).set({
        reset_token:        token,
        reset_token_expiry: expiry,
      });

      const appUrl  = sails.config.custom.appUrl || 'http://localhost:9000';
      const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

      const html = await sails.helpers.templates.resetPasswprdEmail.with({ resetUrl });
      await sails.helpers.mailer.with({
        to:      user.email,
        subject: 'Recupera tu contraseña en DevSpace',
        html,
      });

      return exits.success({ mensaje: 'Si existe una cuenta con ese email, recibirás un enlace.' });
    } catch (err) {
      sails.log.error('Error en auth/forgot-password', err);
      return exits.errorGeneral({ mensaje: err.message });
    }
  },
};
