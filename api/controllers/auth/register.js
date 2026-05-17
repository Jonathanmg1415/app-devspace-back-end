const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

module.exports = {
  friendlyName: 'Register',
  description:  'Registrar un nuevo usuario.',

  inputs: {
    name: {
      type:     'string',
      required: true,
    },
    email: {
      type:     'string',
      required: true,
      isEmail:  true,
    },
    password: {
      type:        'string',
      required:    true,
      minLength:   6,
    },
  },

  exits: {
    success: {
      description:  'Usuario creado exitosamente.',
      responseType: 'ok',
    },
    emailAlreadyInUse: {
      statusCode:   409,
      description:  'El email ya está registrado.',
      responseType: 'conflict',
    },
    errorGeneral: {
      statusCode:   500,
      description:  'Error interno.',
      responseType: 'serverError',
    },
  },

  fn: async function ({ name, email, password }, exits) {
    sails.log.debug('-----> auth/register');

    try {
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) return exits.emailAlreadyInUse();

      const hashed = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashed,
      }).fetch();

      const token = jwt.sign(
        { id: user.id },
        sails.config.custom.jwtSecret,
        { expiresIn: '7d' }
      );

      const { password: _pwd, ...safeUser } = user;

      return exits.success({ token, user: safeUser });
    } catch (error) {
      sails.log.error('Error en auth/register', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
