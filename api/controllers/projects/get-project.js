module.exports = {
  friendlyName: "Get project",
  description: "Obtener un proyecto por ID.",

  inputs: {
    id: {
      type: "number",
      required: true,
    },
  },

  exits: {
    success: {
      description: "Proyecto encontrado.",
      responseType: "ok",
    },
    notFound: {
      statusCode: 404,
      description: "Proyecto no encontrado.",
      responseType: "notFound",
    },
    errorGeneral: {
      statusCode: 500,
      description: "Error interno.",
      responseType: "serverError",
    },
  },

  fn: async function ({ id }, exits) {
    sails.log.debug("-----> projects/get-project");
    try {
      // Es owner
      let project = await Project.findOne({ id, owner: this.req.user.id });

      // O es miembro
      if (!project) {
        const membership = await ProjectMember.findOne({
          project: id,
          user: this.req.user.id,
        });
        if (membership) {
          project = await Project.findOne({ id });
        }
      }

      if (!project) return exits.notFound();
      return exits.success({ project });
    } catch (error) {
      sails.log.error("Error en projects/get-project", error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
