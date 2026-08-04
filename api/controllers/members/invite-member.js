module.exports = {
  friendlyName: 'Invite member',
  description:  'Invitar a un usuario al proyecto por email.',
  inputs: {
    projectId: { type: 'string', required: true },
    email:     { type: 'string', required: true, isEmail: true },
  },
  exits: {
    success:        { responseType: 'ok' },
    notFound:       { statusCode: 404, responseType: 'notFound' },
    userNotFound:   { statusCode: 404, responseType: 'notFound' },
    alreadyMember:  { statusCode: 409, responseType: 'conflict' },
    cantInviteSelf: { statusCode: 400, responseType: 'badRequest' },
    errorGeneral:   { statusCode: 500, responseType: 'serverError' },
  },
  fn: async function ({ projectId, email }, exits) {
    sails.log.debug('-----> members/invite-member');
    try {
      const project = await Project.findOne({ id: projectId, owner: this.req.user.id });
      if (!project) return exits.notFound();

      const target = await User.findOne({ email: email.toLowerCase() });
      if (!target) return exits.userNotFound();

      if (target.id === this.req.user.id) return exits.cantInviteSelf();

      const existing = await ProjectMember.findOne({ project: projectId, user: target.id });
      if (existing) return exits.alreadyMember();

      const member = await ProjectMember.create({
        project: projectId,
        user:    target.id,
        role:    'member',
      }).fetch();

      const { password: _p, ...safeUser } = target;

      try {
        const html = await sails.helpers.templates.invitationEmail.with({
          inviterName: this.req.user.name,
          projectName: project.name,
          appUrl:      sails.config.custom.appUrl,
        });
        await sails.helpers.mailer.with({
          to:      target.email,
          subject: `Te invitaron al proyecto ${project.name} en DevSpace`,
          html,
        });
      } catch (mailErr) {
        sails.log.warn('Email de invitación no enviado', mailErr.message);
      }

      Notification.create({
        recipient:  target.id,
        type:       'project_invitation',
        title:      `${this.req.user.name} te agregó al proyecto ${project.name}`,
        body:       'Ya puedes ver y colaborar en este proyecto',
        entityType: 'project',
        entityId:   project.id,
        project:    project.id,
      }).catch(() => {});

      sails.helpers.logActivity.with({
        projectId: Number(projectId),
        actorId:   this.req.user.id,
        action:    'invited',
        entity:    'member',
        entityId:  target.id,
        meta:      { userName: target.name, userEmail: target.email },
      }).catch((err) => sails.log.warn('logActivity falló (ignorado):', err.message));

      return exits.success({ member: { ...member, user: safeUser } });
    } catch (error) {
      sails.log.error('Error en members/invite-member', error);
      return exits.errorGeneral({ mensaje: error.message });
    }
  },
};
