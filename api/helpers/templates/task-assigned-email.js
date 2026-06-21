module.exports = {
  friendlyName: 'Task assigned email template',
  description:  'Genera el HTML del email de asignación de tarea.',
  sync: true,

  inputs: {
    assigneeName: { type: 'string', required: true },
    assignerName: { type: 'string', required: true },
    taskTitle:    { type: 'string', required: true },
    projectName:  { type: 'string', required: true },
    appUrl:       { type: 'string', required: true },
  },

  exits: {
    success: { outputType: 'string' },
  },

  fn: function ({ assigneeName, assignerName, taskTitle, projectName, appUrl }, exits) {
    return exits.success(`
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0B0B0D;font-family:'Inter',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px">
      <table width="480" cellpadding="0" cellspacing="0"
        style="background:#141418;border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden">

        <tr><td style="padding:32px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.06)">
          <span style="font-family:monospace;font-size:18px;font-weight:700;color:#fff">
            Dev<span style="color:#F97316">Space</span>
          </span>
        </td></tr>

        <tr><td style="padding:32px 40px">
          <p style="margin:0 0 8px;font-size:13px;color:#9CA3AF">Hola, ${assigneeName}</p>
          <p style="margin:0 0 16px;font-size:24px;font-weight:700;color:#F1F1F3;line-height:1.3">
            Te asignaron una tarea
          </p>
          <p style="margin:0 0 24px;font-size:15px;color:#A0A0B0;line-height:1.6">
            <strong style="color:#F1F1F3">${assignerName}</strong> te asignó la tarea
            <strong style="color:#F97316">${taskTitle}</strong>
            en el proyecto <strong style="color:#F1F1F3">${projectName}</strong>.
          </p>

          <a href="${appUrl}/projects"
            style="display:inline-block;background:#F97316;color:#fff;text-decoration:none;
                   padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600">
            Ver tarea en DevSpace →
          </a>
        </td></tr>

        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06)">
          <p style="margin:0;font-size:12px;color:#5A5A70">
            Si no esperabas esta notificación puedes ignorar este email.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
    `);
  },
};
