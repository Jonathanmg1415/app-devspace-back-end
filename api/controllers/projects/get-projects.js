module.exports = {
  friendlyName: "Get projects",
  description: "Listar todos los proyectos del usuario autenticado.",

  inputs: {},

  exits: {
    success: {
      description: "Lista de proyectos.",
      responseType: "ok",
    },
    errorGeneral: {
      statusCode: 500,
      description: "Error interno.",
      responseType: "serverError",
    },
  },

  fn: async function (_inputs, exits) {
    sails.log.debug("-----> projects/get-projects");

    try {
      // Proyectos donde es owner
      const ownedProjects = await Project.find({
        owner: this.req.user.id,
      }).sort("createdAt DESC");

      // Proyectos donde es miembro
      const memberships = await ProjectMember.find({ user: this.req.user.id });
      const memberProjectIds = memberships.map((m) => m.project);

      let memberProjects = [];
      if (memberProjectIds.length) {
        memberProjects = await Project.find({ id: memberProjectIds }).sort(
          "createdAt DESC",
        );
      }

      // Unir y deduplicar
      const projects = [
        ...ownedProjects.map((p) => ({ ...p, _role: "owner" })),
        ...memberProjects
          .filter((p) => !ownedProjects.find((o) => o.id === p.id))
          .map((p) => ({ ...p, _role: "member" })),
      ];

      return exits.success({ projects });
    } catch (error) {
      sails.log.error("Error en projects/get-projects", error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
