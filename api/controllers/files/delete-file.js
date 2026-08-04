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
      await sails.helpers.deleteFileStorage.with({ files: [{ bucket: file.bucket, name: file.name }] });
      await File.destroyOne({ id });
      return exits.success({ mensaje: 'Archivo eliminado correctamente.' });
    } catch (error) {
      sails.log.error('Error en files/delete-file', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
