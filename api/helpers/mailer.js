const https = require('https');

function sendViaResend(apiKey, body) {
  return new Promise((resolve, reject) => {
    const payload = Buffer.from(JSON.stringify(body));

    const req = https.request(
      {
        hostname: 'api.resend.com',
        port: 443,
        path: '/emails',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': payload.length,
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString();
          let json;
          try {
            json = JSON.parse(raw);
          } catch {
            return reject(new Error(`Respuesta no-JSON de Resend (${res.statusCode}): ${raw.slice(0, 200)}`));
          }
          if (res.statusCode >= 300) {
            return reject(new Error(json.message || `Resend devolvió ${res.statusCode}`));
          }
          resolve(json);
        });
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

module.exports = {
  friendlyName: 'Mailer',
  description:  'Enviar emails con Resend usando https nativo (sin SDK, sin undici) — mismo patrón que supabase.js.',

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
      const apiKey    = sails.config.custom.resendApiKey;
      const fromEmail = sails.config.custom.fromEmail;

      // Resend free tier con onboarding@resend.dev solo entrega al email verificado
      // del dueño de la cuenta. En ese modo redirigimos a nuestro email de cuenta
      // pero marcamos el destinatario real en el subject para poder revisarlo.
      const isTestDomain = fromEmail.endsWith('@resend.dev');
      const actualTo     = isTestDomain ? (sails.config.custom.resendOwnerEmail || to) : to;
      const actualSubject = isTestDomain && actualTo !== to
        ? `[→ ${to}] ${subject}`
        : subject;

      const result = await sendViaResend(apiKey, {
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
