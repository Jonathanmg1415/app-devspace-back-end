const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = {
  friendlyName: "Login",
  description: "Autenticar usuario con email y contraseña.",

  inputs: {
    email: {
      type: "string",
      required: true,
      isEmail: true,
    },
    password: {
      type: "string",
      required: true,
    },
  },

  exits: {
    success: {
      description: "Autenticación exitosa.",
      responseType: "ok",
    },
    invalidCredentials: {
      statusCode: 401,
      description: "Email o contraseña incorrectos.",
      responseType: "badRequest",
    },
    errorGeneral: {
      statusCode: 500,
      description: "Error interno.",
      responseType: "serverError",
    },
  },

  fn: async function ({ email, password }, exits) {
    sails.log.debug("-----> auth/login");

    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return exits.invalidCredentials();

      const match = await bcrypt.compare(password, user.password);
      if (!match) return exits.invalidCredentials();

      const token = jwt.sign({ id: user.id }, sails.config.custom.jwtSecret, {
        expiresIn: "7d",
      });

      const { password: _pwd, reset_token: _rt, reset_token_expiry: _rte, ...safeUser } = user;

      return exits.success({ token, user: safeUser });
    } catch (error) {
      sails.log.error("Error en auth/login", error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
