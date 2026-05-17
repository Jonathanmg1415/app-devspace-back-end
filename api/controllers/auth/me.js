module.exports = {
  friendlyName: 'Me',
  description:  'Obtener datos del usuario autenticado.',

  inputs: {},

  exits: {
    success: {
      description:  'Usuario retornado.',
      responseType: 'ok',
    },
    errorGeneral: {
      statusCode:   500,
      description:  'Error interno.',
      responseType: 'serverError',
    },
  },

  fn: async function (_inputs, exits) {
    sails.log.debug('-----> auth/me');

    try {
      const { password: _pwd, ...safeUser } = this.req.user;
      return exits.success({ user: safeUser });
    } catch (error) {
      sails.log.error('Error en auth/me', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
