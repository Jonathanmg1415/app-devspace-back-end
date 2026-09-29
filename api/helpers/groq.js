const https = require('https');

const REQUEST_TIMEOUT_MS = 30000; // si Groq no responde en 30s, fallar en vez de colgar la request para siempre

// Catálogo de modelos de respaldo, en orden de preferencia. Cuando Groq deprecia/desactiva
// el modelo configurado en GROQ_MODEL, el helper reintenta automáticamente con el siguiente
// de esta lista antes de fallar. `vision:true` = acepta partes `image_url` en el content.
// reasoningEffort: valor que ESE modelo puntual espera en `reasoning_effort` (null = no mandar
// el campo — un modelo no-"thinking" puede rechazarlo).
const KNOWN_MODELS = [
  { id: 'qwen/qwen3.8-27b',    vision: true,  reasoningEffort: 'none' },
  { id: 'openai/gpt-oss-120b', vision: false, reasoningEffort: 'low'  },
  { id: 'openai/gpt-oss-20b',  vision: false, reasoningEffort: 'low'  },
];

function modelInfo(id) {
  return KNOWN_MODELS.find((m) => m.id === id) || { id, vision: true, reasoningEffort: null };
}

// Primer candidato = el pedido explícitamente o sails.config.custom.groqModel (sin filtrar,
// aunque no esté en el catálogo — así un override manual por env siempre se intenta primero).
// Candidatos de respaldo = el resto del catálogo conocido, filtrado a los que soportan visión
// si la llamada la necesita.
function buildCandidates({ model, requireVision }) {
  const preferred = model || sails.config.custom.groqModel;
  const rest = KNOWN_MODELS
    .filter((m) => m.id !== preferred && (!requireVision || m.vision))
    .map((m) => m.id);
  return [preferred, ...rest].map(modelInfo);
}

function isModelUnavailable(error) {
  if (error?.groqCode === 'model_not_found' || error?.groqCode === 'model_decommissioned') return true;
  const msg = (error?.message || '').toLowerCase();
  return msg.includes('does not exist') || msg.includes('decommission') || msg.includes('not found');
}

function request(apiKey, body) {
  return new Promise((resolve, reject) => {
    const payload = Buffer.from(JSON.stringify(body));
    let settled = false;

    const req = https.request(
      {
        hostname: 'api.groq.com',
        port: 443,
        path: '/openai/v1/chat/completions',
        method: 'POST',
        timeout: REQUEST_TIMEOUT_MS,
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
          if (settled) return;
          settled = true;
          const raw = Buffer.concat(chunks).toString();
          let json;
          try {
            json = JSON.parse(raw);
          } catch {
            return reject(new Error(`Respuesta no-JSON de Groq (${res.statusCode}): ${raw.slice(0, 200)}`));
          }
          if (res.statusCode >= 300) {
            sails.log.warn('Groq devolvió error:', JSON.stringify(json.error || json));
            const err = new Error(json.error?.message || `Groq devolvió ${res.statusCode}`);
            err.groqCode = json.error?.code;
            err.status = res.statusCode;
            return reject(err);
          }
          resolve(json);
        });
      }
    );

    // El evento 'timeout' solo avisa que el socket está inactivo — no aborta
    // la request por sí solo, hay que destruirla a mano o queda colgada igual.
    req.on('timeout', () => {
      if (settled) return;
      settled = true;
      req.destroy();
      reject(new Error(`Groq no respondió en ${REQUEST_TIMEOUT_MS / 1000}s (timeout)`));
    });

    req.on('error', (err) => {
      if (settled) return;
      settled = true;
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

module.exports = {
  friendlyName: 'Groq chat completion',
  description:  'Llama a la API de Groq usando https nativo (sin SDK, sin undici) — mismo patrón que supabase.js, evita el crash de undici con groq-sdk. Si el modelo configurado fue desactivado/deprecado por Groq, reintenta automáticamente con el siguiente modelo del catálogo conocido antes de fallar.',

  inputs: {
    messages:        { type: 'ref',     required: true, description: 'Array de mensajes estilo OpenAI (role/content). content puede ser string o array de partes para visión.' },
    model:           { type: 'string',  description: 'Si se omite, usa sails.config.custom.groqModel (env var GROQ_MODEL) como primer candidato — así un modelo deprecado se cambia sin tocar código.' },
    maxTokens:       { type: 'number',  defaultsTo: 1500 },
    jsonMode:        { type: 'boolean', defaultsTo: false },
    reasoningEffort: { type: 'string',  description: 'Fuerza el reasoning_effort en todos los candidatos. Si se omite, cada modelo del catálogo usa el que le corresponde (ej. Qwen "none", GPT-OSS "low").' },
    requireVision:   { type: 'boolean', defaultsTo: false, description: 'true si `messages` incluye partes image_url — limita los candidatos de respaldo a modelos con soporte de imágenes.' },
  },

  exits: {
    success:       { outputType: 'ref' },
    notConfigured: { description: 'GROQ_API_KEY no configurada.' },
    errorGeneral:  { description: 'Error al llamar a Groq (con todos los modelos candidatos agotados).' },
  },

  fn: async function ({ messages, model, maxTokens, jsonMode, reasoningEffort, requireVision }, exits) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return exits.notConfigured();

    const candidates = buildCandidates({ model, requireVision });
    let lastError;

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const body = {
        model: candidate.id,
        messages,
        max_tokens: maxTokens,
      };
      if (jsonMode) body.response_format = { type: 'json_object' };
      const effort = reasoningEffort || candidate.reasoningEffort;
      if (effort) body.reasoning_effort = effort;

      try {
        const json = await request(apiKey, body);
        const content = json.choices?.[0]?.message?.content || '';
        if (i > 0) {
          sails.log.warn(`Groq: modelo "${candidates[0].id}" no disponible, se usó "${candidate.id}" como respaldo (candidato #${i + 1}).`);
        }
        return exits.success(content);
      } catch (error) {
        lastError = error;
        const isLast = i === candidates.length - 1;
        if (isModelUnavailable(error) && !isLast) {
          sails.log.warn(`Groq: modelo "${candidate.id}" no disponible (${error.message}), probando siguiente candidato...`);
          continue;
        }
        sails.log.error('Error en helper groq', error);
        return exits.errorGeneral(error);
      }
    }

    sails.log.error('Error en helper groq (todos los modelos candidatos fallaron)', lastError);
    return exits.errorGeneral(lastError);
  },
};
