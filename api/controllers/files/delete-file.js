module.exports = {
  friendlyName: 'Delete file',
  description:  'Eliminar un archivo de Supabase Storage y de la BD.',
  inputs: {
    id: { type: 'number', required: true },
  },
  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({ id }, exits) {
    sails.log.debug('-----> files/delete-file');
    try {
      const file = await File.findOne({ id });
      if (!file) return exits.notFound();
      const project  = await Project.findOne({ id: file.project });
      if (!project) return exits.notFound();
      const isOwner  = project.owner === this.req.user.id;
      const isMember = await ProjectMember.findOne({ project: file.project, user: this.req.user.id });
      if (!isOwner && !isMember) return exits.notFound();
      const supabase = sails.helpers.supabase();
      const { error: storageError } = await supabase.storage.from(file.bucket).remove([file.name]);
      if (storageError) sails.log.warn('Error al eliminar de storage', storageError.message);
      await File.destroyOne({ id });
      return exits.success({ mensaje: 'Archivo eliminado correctamente.' });
    } catch (error) {
      sails.log.error('Error en files/delete-file', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
