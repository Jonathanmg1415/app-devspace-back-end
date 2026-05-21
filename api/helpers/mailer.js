const { Resend } = require('resend');

module.exports = {
  friendlyName: 'Mailer',
  description:  'Enviar emails con Resend.',

  inputs: {
    to: {
      type:     'string',
      required: true,
    },
    subject: {
      type:     'string',
      required: true,
    },
    html: {
      type:     'string',
      required: true,
    },
  },

  exits: {
    success:      { outputType: 'ref' },
    errorGeneral: { description: 'Error al enviar el email.' },
  },

  fn: async function ({ to, subject, html }, exits) {
    try {
      const resend = new Resend(sails.config.custom.resendApiKey);

      const result = await resend.emails.send({
        from:    sails.config.custom.fromEmail,
        to,
        subject,
        html,
      });

      sails.log.verbose('Email enviado a', to, result);
      return exits.success(result);
    } catch (error) {
      sails.log.error('Error al enviar email', error);
      return exits.errorGeneral(error);
    }
  },
};
