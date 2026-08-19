module.exports = {
  friendlyName: 'Describe command',
  description:  'Genera una descripción corta de un comando de terminal con IA (Groq).',
  inputs: {
    command: { type: 'string', required: true },
  },
  exits: {
    success:       { responseType: 'ok' },
    notConfigured: { statusCode: 503, responseType: 'serverError' },
    errorGeneral:  { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({ command }, exits) {
    sails.log.debug('-----> ai/describe-command');
    try {
      const description = await sails.helpers.groq.with({
        maxTokens: 120,
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente técnico. Describe en español, en máximo 2 oraciones concisas, qué hace el siguiente comando de terminal. Sin formato markdown, solo texto plano.',
          },
          { role: 'user', content: command },
        ],
      });

      return exits.success({ description: description.trim() });
    } catch (err) {
      if (err.exit === 'notConfigured') return exits.notConfigured({ mensaje: 'GROQ_API_KEY no configurada.' });
      sails.log.error('Error en ai/describe-command', err);
      return exits.errorGeneral({ mensaje: err.message });
    }
  },
};
