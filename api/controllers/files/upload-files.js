module.exports = {
  friendlyName: 'Upload file',
  description:  'Subir un archivo a Supabase Storage y registrarlo en BD.',

  inputs: {
    projectId: {
      type:     'number',
      required: true,
    },
  },

  exits: {
    success: {
      description:  'Archivo subido correctamente.',
      responseType: 'ok',
    },
    notFound: {
      statusCode:   404,
      description:  'Proyecto no encontrado.',
      responseType: 'notFound',
    },
    noFile: {
      statusCode:   400,
      description:  'No se recibió ningún archivo.',
      responseType: 'badRequest',
    },
    invalidType: {
      statusCode:   400,
      description:  'Tipo de archivo no permitido.',
      responseType: 'badRequest',
    },
    errorGeneral: {
      statusCode:   500,
      description:  'Error interno.',
      responseType: 'serverError',
    },
  },

  fn: async function ({ projectId }, exits) {
    sails.log.debug('-----> files/upload-file');

    const ALLOWED_MIMETYPES = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
    ];

    try {
      const project = await Project.findOne({ id: projectId, owner: this.req.user.id });
      if (!project) return exits.notFound();

      // Recibir archivo con skipper
      const upload = await new Promise((resolve, reject) => {
        this.req.file('file').upload(
          { maxBytes: 10 * 1024 * 1024 }, // 10 MB máx
          (err, files) => {
            if (err) return reject(err);
            resolve(files);
          }
        );
      });

      if (!upload.length) return exits.noFile();

      const received = upload[0];
      sails.log.verbose('Archivo recibido', received.filename, received.type, received.size);

      // Validar tipo
      if (!ALLOWED_MIMETYPES.includes(received.type)) {
        return exits.invalidType({ mensaje: `Tipo "${received.type}" no permitido.` });
      }

      // Leer el archivo del disco temporal
      const fs   = require('fs');
      const path = require('path');
      const buffer = fs.readFileSync(received.fd);

      // Nombre único en el bucket
      const ext      = path.extname(received.filename);
      const unique   = `${projectId}/${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
      const bucket   = sails.config.custom.supabaseBucket;

      // Subir a Supabase Storage
      const supabase = sails.helpers.supabase();
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(unique, buffer, {
          contentType: received.type,
          upsert:      false,
        });

      if (uploadError) throw new Error(uploadError.message);

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(unique);

      // Guardar en BD
      const file = await File.create({
        name:         unique,
        originalname: received.filename,
        mimetype:     received.type,
        size:         received.size,
        url:          urlData.publicUrl,
        bucket,
        project:      projectId,
        owner:        this.req.user.id,
      }).fetch();

      // Limpiar archivo temporal
      fs.unlinkSync(received.fd);

      return exits.success({ file });
    } catch (error) {
      sails.log.error('Error en files/upload-file', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
