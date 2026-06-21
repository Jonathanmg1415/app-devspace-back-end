const Groq = require('groq-sdk');

module.exports = {
  friendlyName: 'Generate document',
  description:  'Generar contenido con IA (Groq) basado en un prompt.',
  inputs: {
    prompt:  { type: 'string', required: true },
    docType: { type: 'string', defaultsTo: 'general' },
    context: { type: 'string', defaultsTo: '' },
  },
  exits: {
    success:       { responseType: 'ok' },
    notConfigured: { statusCode: 503, responseType: 'serverError' },
    errorGeneral:  { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({ prompt, docType, context }, exits) {
    sails.log.debug('-----> ai/generate-document');
    try {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) return exits.notConfigured({ mensaje: 'GROQ_API_KEY no configurada.' });

      const groq = new Groq({ apiKey });

      const systemPrompt = buildSystemPrompt(docType);
      const userPrompt   = context
        ? `Contexto adicional:\n${context}\n\nSolicitud: ${prompt}`
        : prompt;

      const completion = await groq.chat.completions.create({
        model:      'llama-3.1-8b-instant',
        max_tokens: 1500,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt },
        ],
      });

      const content = completion.choices[0]?.message?.content || '';
      return exits.success({ content });
    } catch (err) {
      sails.log.error('Error en ai/generate-document', err);
      return exits.errorGeneral({ mensaje: err.message });
    }
  },
};

function buildSystemPrompt(docType) {
  const base = 'Eres un asistente tecnico para desarrolladores. Responde en espanol. Se conciso y preciso. Usa markdown cuando corresponda.';
  const types = {
    readme:       `${base} Genera contenido para archivos README tecnicos: estructura clara, secciones bien definidas.`,
    api:          `${base} Genera documentacion de API: endpoints, parametros, ejemplos de request/response en formato claro.`,
    architecture: `${base} Genera documentacion de arquitectura: componentes, decisiones tecnicas, flujos.`,
    tutorial:     `${base} Genera tutoriales paso a paso: claros, con ejemplos de codigo cuando sea relevante.`,
    general:      base,
  };
  return types[docType] || base;
}
