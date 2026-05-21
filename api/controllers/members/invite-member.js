module.exports = {
  friendlyName: "Invite member",
  description: "Invitar a un usuario al proyecto por email.",

  inputs: {
    projectId: { type: "number", required: true },
    email: { type: "string", required: true, isEmail: true },
  },

  exits: {
    success: { responseType: "ok" },
    notFound: { statusCode: 404, responseType: "notFound" },
    userNotFound: {
      statusCode: 404,
      description: "El email no tiene cuenta en DevSpace.",
      responseType: "notFound",
    },
    alreadyMember: {
      statusCode: 409,
      description: "El usuario ya es miembro.",
      responseType: "conflict",
    },
    cantInviteSelf: {
      statusCode: 400,
      description: "No puedes invitarte a ti mismo.",
      responseType: "badRequest",
    },
    errorGeneral: { statusCode: 500, responseType: "serverError" },
  },

  fn: async function ({ projectId, email }, exits) {
    sails.log.debug("-----> members/invite-member");
    try {
      // Verificar que el proyecto existe y pertenece al owner
      const project = await Project.findOne({
        id: projectId,
        owner: this.req.user.id,
      });
      if (!project) return exits.notFound();

      // Buscar al usuario por email
      const target = await User.findOne({ email: email.toLowerCase() });
      if (!target) return exits.userNotFound();

      // No puede invitarse a sí mismo
      if (target.id === this.req.user.id) return exits.cantInviteSelf();

      // Verificar que no sea ya miembro
      const existing = await ProjectMember.findOne({
        project: projectId,
        user: target.id,
      });
      if (existing) return exits.alreadyMember();

      const member = await ProjectMember.create({
        project: projectId,
        user: target.id,
        role: "member",
      }).fetch();

      const { password: _p, ...safeUser } = target;
      // Enviar email de notificación
      const html = sails.helpers.templates.invitationEmail({
        inviterName: this.req.user.name,
        projectName: project.name,
        appUrl: sails.config.custom.appUrl,
      });

      await sails.helpers.mailer({
        to: target.email,
        subject: `Te invitaron al proyecto ${project.name} en DevSpace`,
        html,
      });

      return exits.success({ member: { ...member, user: safeUser } });
    } catch (error) {
      sails.log.error("Error en members/invite-member", error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
