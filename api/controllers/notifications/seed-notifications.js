module.exports = {
  friendlyName: 'Seed notifications (dev only)',
  exits: { success: { responseType: 'ok' } },
  fn: async function (_inputs, exits) {
    const userId = this.req.user.id;

    const samples = [
      { type: 'task_assigned', title: 'Le asignaron una tarea', body: 'Setup del repositorio — en el proyecto Web App Project', read: false },
      { type: 'comment',       title: 'Nuevo comentario en su tarea', body: '"Implementar autenticación" — Jonathan: ¿Cuándo estará lista?', read: false },
      { type: 'task_assigned', title: 'Le asignaron una tarea', body: 'Diseño de UI/UX — en el proyecto Mobile App', read: false },
      { type: 'mention',       title: 'Le mencionaron en una nota', body: 'Arquitectura del sistema — "revisar y confirmar"', read: true },
      { type: 'task_done',     title: 'Tarea completada', body: 'Configurar CI/CD fue marcada como completada', read: true },
    ];

    await Promise.all(
      samples.map(s => Notification.create({ ...s, recipient: userId }).catch(() => {}))
    );

    return exits.success({ seeded: samples.length });
  },
};
