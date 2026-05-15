import { Resend } from "resend";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@drcarlosrebollon.com";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(key);
}
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://protocolo-activo-hombro.vercel.app";

export async function sendAccessRequestNotification(data: {
  full_name: string;
  email: string;
  phone?: string;
  how_found?: string;
}) {
  return getResend().emails.send({
    from: "Protocolo Activo de Hombro <info@drcarlosrebollon.com>",
    to: ADMIN_EMAIL,
    subject: "Nueva solicitud de acceso — Protocolo Activo de Hombro",
    html: `
      <h2>Nueva solicitud de acceso</h2>
      <p><strong>Nombre:</strong> ${data.full_name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Teléfono:</strong> ${data.phone || "No proporcionado"}</p>
      <p><strong>¿Cómo llegó?:</strong> ${data.how_found || "No proporcionado"}</p>
      <p><a href="${APP_URL}/admin" style="background:#0170B9;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;">
        Ver panel de administración
      </a></p>
    `,
  });
}

export async function sendInvitationEmail(data: {
  email: string;
  full_name: string;
  token: string;
  access_type: string;
  duration_days: number;
}) {
  const activationLink = `${APP_URL}/activate?token=${data.token}`;
  return getResend().emails.send({
    from: "Dr. Carlos Rebollón <info@drcarlosrebollon.com>",
    to: data.email,
    subject: "Tu acceso al Protocolo Activo de Hombro está listo",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#314C8B;padding:24px;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:20px;">Protocolo Activo de Hombro</h1>
          <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;">Dr. Carlos Rebollón</p>
        </div>
        <div style="background:white;padding:32px;border:1px solid #EBEEF3;">
          <h2 style="color:#314C8B;">Hola, ${data.full_name}</h2>
          <p>Tu acceso al <strong>Protocolo Activo de Hombro</strong> ha sido aprobado.</p>
          <p>Tipo de acceso: <strong>${data.access_type === "paid" ? "Acceso completo" : "Acceso gratuito"}</strong> · ${data.duration_days} días</p>
          <div style="margin:32px 0;text-align:center;">
            <a href="${activationLink}" style="background:#0170B9;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;">
              Activar mi acceso
            </a>
          </div>
          <p style="color:#808285;font-size:13px;">
            Este link es personal e intransferible. Solo puede ser usado por ${data.email}.<br>
            <strong>Expira en 48 horas.</strong>
          </p>
          <p style="color:#808285;font-size:12px;">
            Si tienes problemas, escríbenos a <a href="mailto:info@drcarlosrebollon.com">info@drcarlosrebollon.com</a>
          </p>
        </div>
        <div style="background:#EBEEF3;padding:16px;border-radius:0 0 12px 12px;text-align:center;">
          <p style="color:#808285;font-size:12px;margin:0;">
            © 2026 Hejek Enterprise LLC · <a href="https://drcarlosrebollon.com">drcarlosrebollon.com</a>
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendAdminInvitationConfirmation(data: {
  patient_name: string;
  patient_email: string;
}) {
  return getResend().emails.send({
    from: "Protocolo Activo de Hombro <info@drcarlosrebollon.com>",
    to: ADMIN_EMAIL,
    subject: `Invitación enviada a ${data.patient_name}`,
    html: `
      <p>Se envió un link de activación a <strong>${data.patient_name}</strong> (${data.patient_email}).</p>
      <p>El link expira en 48 horas.</p>
    `,
  });
}

export async function sendWebhookPatientNotification(data: {
  patient_name: string;
  patient_email: string;
  order_id: string;
}) {
  return getResend().emails.send({
    from: "Protocolo Activo de Hombro <info@drcarlosrebollon.com>",
    to: ADMIN_EMAIL,
    subject: `Nuevo paciente pagado: ${data.patient_name}`,
    html: `
      <h2>Nuevo paciente vía WooCommerce</h2>
      <p><strong>Nombre:</strong> ${data.patient_name}</p>
      <p><strong>Email:</strong> ${data.patient_email}</p>
      <p><strong>Order ID:</strong> ${data.order_id}</p>
      <p>Se envió el link de activación automáticamente.</p>
    `,
  });
}
