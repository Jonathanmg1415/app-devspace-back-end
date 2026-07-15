module.exports = {
  friendlyName: "Upload file",
  description: "Subir un archivo a Supabase Storage y registrarlo en BD.",

  inputs: {},

  exits: {
    success: {
      description: "Archivo subido correctamente.",
      responseType: "ok",
    },
    notFound: {
      statusCode: 404,
      description: "Proyecto no encontrado.",
      responseType: "notFound",
    },
    noFile: {
      statusCode: 400,
      description: "No se recibió ningún archivo.",
      responseType: "badRequest",
    },
    invalidType: {
      statusCode: 400,
      description: "Tipo de archivo no permitido.",
      responseType: "badRequest",
    },
    errorGeneral: {
      statusCode: 500,
      description: "Error interno.",
      responseType: "serverError",
    },
  },

  fn: async function (_inputs, exits) {
    sails.log.debug("-----> files/upload-file");

    const projectId = parseInt(this.req.query.projectId, 10);
    sails.log.debug("projectId:", projectId);
    sails.log.debug("req.user:", this.req.user);

    const ALLOWED_MIMETYPES = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
    ];

    try {
      if (!projectId) return exits.notFound();

      const project = await Project.findOne({ id: projectId });
      if (!project) return exits.notFound();
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: projectId, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();

      const upload = await new Promise((resolve, reject) => {
        this.req
          .file("file")
          .upload({ maxBytes: 10 * 1024 * 1024 }, (err, files) => {
            if (err) return reject(err);
            resolve(files);
          });
      });

      if (!upload.length) return exits.noFile();

      const received = upload[0];
      sails.log.verbose(
        "Archivo recibido",
        received.filename,
        received.type,
        received.size,
      );

      if (!ALLOWED_MIMETYPES.includes(received.type)) {
        return exits.invalidType({
          mensaje: `Tipo "${received.type}" no permitido.`,
        });
      }

      const fs = require("fs");
      const path = require("path");
      const buffer = fs.readFileSync(received.fd);
      const ext = path.extname(received.filename);
      const unique = `${projectId}/${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
      const bucket = sails.config.custom.supabaseBucket;
      sails.log.debug("bucket:", bucket);
      sails.log.debug(
        "supabaseKey (primeros 20 chars):",
        sails.config.custom.supabaseKey?.slice(0, 20),
      );
      const supabase = sails.helpers.supabase();
      sails.log.debug("supabaseUrl:", sails.config.custom.supabaseUrl);
      sails.log.debug("bucket:", bucket);
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(unique, buffer, { contentType: received.type, upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(unique);

      const file = await File.create({
        name: unique,
        originalname: received.filename,
        mimetype: received.type,
        size: received.size,
        url: urlData.publicUrl,
        bucket,
        project: projectId,
        owner: this.req.user.id,
      }).fetch();

      fs.unlinkSync(received.fd);
      return exits.success({ file });
    } catch (error) {
      sails.log.error("Error en files/upload-file", error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
