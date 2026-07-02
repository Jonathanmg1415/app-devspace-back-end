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
      const resend    = new Resend(sails.config.custom.resendApiKey);
      const fromEmail = sails.config.custom.fromEmail;

      // Resend free tier con onboarding@resend.dev solo entrega al email verificado
      // del dueño de la cuenta. En ese modo redirigimos a nuestro email de cuenta
      // pero marcamos el destinatario real en el subject para poder revisarlo.
      const isTestDomain = fromEmail.endsWith('@resend.dev');
      const actualTo     = isTestDomain ? (sails.config.custom.resendOwnerEmail || to) : to;
      const actualSubject = isTestDomain && actualTo !== to
        ? `[→ ${to}] ${subject}`
        : subject;

      const result = await resend.emails.send({
        from:    fromEmail,
        to:      actualTo,
        subject: actualSubject,
        html,
      });

      sails.log.verbose('Email enviado a', actualTo, result);
      return exits.success(result);
    } catch (error) {
      sails.log.error('Error al enviar email', error);
      return exits.errorGeneral(error);
    }
  },
};
