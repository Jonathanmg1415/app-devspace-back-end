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
      // comment.author viene como string porque task_comment.author es bigint en la
      // base (a diferencia del resto de las tablas, que usan integer) — comparar con Number().
      if (Number(comment.author) !== Number(this.req.user.id)) return exits.forbidden();
      await TaskComment.destroyOne({ id });
      return exits.success({ ok: true });
    } catch (error) {
      sails.log.error('Error en comments/delete-comment', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
