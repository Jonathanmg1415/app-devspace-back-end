module.exports = {
  friendlyName: "Create project",
  description: "Crear un nuevo proyecto.",

  inputs: {
    name: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
      defaultsTo: "",
    },
    color: {
      type: "string",
      defaultsTo: "#467886",
    },
    icon: {
      type: "string",
      defaultsTo: "folder",
    },
  },

  exits: {
    success: {
      description: "Proyecto creado.",
      responseType: "ok",
    },
    errorGeneral: {
      statusCode: 500,
      description: "Error interno.",
      responseType: "serverError",
    },
    nameAlreadyInUse: {
      statusCode: 409,
      description: "Ya existe un proyecto con ese nombre.",
      responseType: "conflict",
    },
  },

  fn: async function ({ name, description, color, icon }, exits) {
    sails.log.debug("-----> projects/create-project");

    try {
      const exists = await Project.findOne({ name, owner: this.req.user.id });
      if (exists) return exits.nameAlreadyInUse();
      const project = await Project.create({
        name,
        description,
        color,
        icon,
        owner: this.req.user.id,
      }).fetch();

      return exits.success({ project });
    } catch (error) {
      sails.log.error("Error en projects/create-project", error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
