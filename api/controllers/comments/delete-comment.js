module.exports = {
  friendlyName: 'Delete comment',
  description:  'Eliminar un comentario (solo el autor).',

  inputs: {
    id: { type: 'number', required: true },
  },

  exits: {
    success:      { responseType: 'ok' },
    notFound:     { statusCode: 404, responseType: 'notFound' },
    forbidden:    { statusCode: 403, responseType: 'forbidden' },
    errorGeneral: { statusCode: 500, responseType: 'serverError' },
  },

  fn: async function ({ id }, exits) {
    sails.log.debug('-----> comments/delete-comment');
    try {
      const comment = await TaskComment.findOne({ id });
      if (!comment) return exits.notFound();
      if (comment.author !== this.req.user.id) return exits.forbidden();
      await TaskComment.destroyOne({ id });
      return exits.success({ ok: true });
    } catch (error) {
      sails.log.error('Error en comments/delete-comment', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
