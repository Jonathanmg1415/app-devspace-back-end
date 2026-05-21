module.exports = {
  friendlyName: 'Delete file',
  description:  'Eliminar un archivo de Supabase Storage y de la BD.',

  inputs: {
    id: {
      type:     'number',
      required: true,
    },
  },

  exits: {
    success: {
      description:  'Archivo eliminado.',
      responseType: 'ok',
    },
    notFound: {
      statusCode:   404,
      description:  'Archivo no encontrado.',
      responseType: 'notFound',
    },
    errorGeneral: {
      statusCode:   500,
      description:  'Error interno.',
      responseType: 'serverError',
    },
  },

  fn: async function ({ id }, exits) {
    sails.log.debug('-----> files/delete-file');

    try {
      const file = await File.findOne({ id, owner: this.req.user.id });
      if (!file) return exits.notFound();

      // Eliminar de Supabase Storage
      const supabase = sails.helpers.supabase();
      const { error: storageError } = await supabase.storage
        .from(file.bucket)
        .remove([file.name]);

      if (storageError) sails.log.warn('Error al eliminar de storage', storageError.message);

      // Eliminar de BD
      await File.destroyOne({ id });

      return exits.success({ mensaje: 'Archivo eliminado correctamente.' });
    } catch (error) {
      sails.log.error('Error en files/delete-file', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
