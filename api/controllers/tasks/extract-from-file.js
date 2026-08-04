const mammoth = require('mammoth');

const VISION_MODEL = 'qwen/qwen3.6-27b';
const TEXT_MODEL    = 'qwen/qwen3.6-27b';

const IMAGE_MIMETYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const DOCX_MIMETYPE   = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const SYSTEM_PROMPT = `Eres un asistente que extrae tareas accionables de un documento o imagen (puede ser una lista escrita a mano, una captura de pantalla, notas, o un documento de texto).
Devuelve SOLO un JSON con esta forma exacta, sin texto adicional:
{"tasks":[{"title":"string corto y accionable","description":"string, puede ser vacío","priority":"low"|"medium"|"high"}]}
Si no encontrás nada que parezca una tarea, devolvé {"tasks":[]}. No inventes tareas que no estén sugeridas por el contenido.`;

function parseTasksJson(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('La IA no devolvió un JSON válido.');
  }
  const tasks = Array.isArray(parsed?.tasks) ? parsed.tasks : [];
  return tasks
    .filter((t) => t && typeof t.title === 'string' && t.title.trim())
    .map((t) => ({
      title:       t.title.trim().slice(0, 200),
      description: typeof t.description === 'string' ? t.description.slice(0, 1000) : '',
      priority:    ['low', 'medium', 'high'].includes(t.priority) ? t.priority : 'medium',
    }));
}

module.exports = {
  friendlyName: 'Extract tasks from file',
  description:  'Extrae tareas candidatas de una imagen o .docx usando Groq. No crea nada en la base — solo devuelve la propuesta.',

  inputs: {},

  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    noFile:       { statusCode: 400, responseType: 'badRequest' },
    invalidType:  { statusCode: 400, responseType: 'badRequest' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },

  fn: async function (_inputs, exits) {
    sails.log.debug('-----> tasks/extract-from-file');

    const projectId = parseInt(this.req.query.projectId, 10);

    try {
      if (!projectId) return exits.notFound();
      const project  = await Project.findOne({ id: projectId });
      if (!project) return exits.notFound();
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: projectId, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();

      const upload = await new Promise((resolve, reject) => {
        this.req.file('file').upload({ maxBytes: 15 * 1024 * 1024 }, (err, files) => {
          if (err) return reject(err);
          resolve(files);
        });
      });
      if (!upload.length) return exits.noFile();

      const received = upload[0];
      const fs = require('fs');
      const buffer = fs.readFileSync(received.fd);
      fs.unlinkSync(received.fd);

      let tasksRaw;

      if (IMAGE_MIMETYPES.includes(received.type)) {
        const base64 = buffer.toString('base64');
        tasksRaw = await sails.helpers.groq.with({
          model:           VISION_MODEL,
          jsonMode:        true,
          reasoningEffort: 'none',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Extraé las tareas de esta imagen.' },
                { type: 'image_url', image_url: { url: `data:${received.type};base64,${base64}` } },
              ],
            },
          ],
        });
      } else if (received.type === DOCX_MIMETYPE || received.filename?.endsWith('.docx')) {
        const { value: text } = await mammoth.extractRawText({ buffer });
        if (!text.trim()) return exits.invalidType({ mensaje: 'El documento no tiene texto para analizar.' });
        tasksRaw = await sails.helpers.groq.with({
          model:           TEXT_MODEL,
          jsonMode:        true,
          reasoningEffort: 'none',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Extraé las tareas de este documento:\n\n${text.slice(0, 12000)}` },
          ],
        });
      } else {
        return exits.invalidType({ mensaje: `Tipo "${received.type}" no soportado. Solo imágenes o .docx.` });
      }

      const tasks = parseTasksJson(tasksRaw);
      return exits.success({ tasks });
    } catch (error) {
      sails.log.error('Error en tasks/extract-from-file', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
