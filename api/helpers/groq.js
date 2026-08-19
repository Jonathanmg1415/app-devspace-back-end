const https = require('https');

function request(apiKey, body) {
  return new Promise((resolve, reject) => {
    const payload = Buffer.from(JSON.stringify(body));

    const req = https.request(
      {
        hostname: 'api.groq.com',
        port: 443,
        path: '/openai/v1/chat/completions',
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
            return reject(new Error(`Respuesta no-JSON de Groq (${res.statusCode}): ${raw.slice(0, 200)}`));
          }
          if (res.statusCode >= 300) {
            sails.log.warn('Groq devolvió error:', JSON.stringify(json.error || json));
            return reject(new Error(json.error?.message || `Groq devolvió ${res.statusCode}`));
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
  friendlyName: 'Groq chat completion',
  description:  'Llama a la API de Groq usando https nativo (sin SDK, sin undici) — mismo patrón que supabase.js, evita el crash de undici con groq-sdk.',

  inputs: {
    messages:        { type: 'ref',     required: true, description: 'Array de mensajes estilo OpenAI (role/content). content puede ser string o array de partes para visión.' },
    model:           { type: 'string',  description: 'Si se omite, usa sails.config.custom.groqModel (env var GROQ_MODEL) — así un modelo deprecado se cambia sin tocar código.' },
    maxTokens:       { type: 'number',  defaultsTo: 1500 },
    jsonMode:        { type: 'boolean', defaultsTo: false },
    reasoningEffort: { type: 'string',  description: 'Para modelos "thinking" (ej. Qwen): "none" evita el preámbulo de razonamiento que puede comerse el max_tokens antes de llegar a la respuesta. Por defecto "none" — pasar otro valor (low/medium/high) si el modelo configurado lo requiere.' },
  },

  exits: {
    success:       { outputType: 'ref' },
    notConfigured: { description: 'GROQ_API_KEY no configurada.' },
    errorGeneral:  { description: 'Error al llamar a Groq.' },
  },

  fn: async function ({ messages, model, maxTokens, jsonMode, reasoningEffort }, exits) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return exits.notConfigured();

    try {
      const body = {
        model: model || sails.config.custom.groqModel,
        messages,
        max_tokens: maxTokens,
      };
      if (jsonMode) body.response_format = { type: 'json_object' };
      body.reasoning_effort = reasoningEffort || 'none';

      const json = await request(apiKey, body);
      const content = json.choices?.[0]?.message?.content || '';
      return exits.success(content);
    } catch (error) {
      sails.log.error('Error en helper groq', error);
      return exits.errorGeneral(error);
    }
  },
};
