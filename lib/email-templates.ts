const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tracker.drcarlosrebollon.com";

/** Wraps content in the standard branded email shell */
export function emailTemplate(body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Protocolo Activo de Hombro</title>
</head>
<body style="margin:0;padding:0;background:#F5F7FA;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="background:#F5F7FA;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#0a1628;padding:28px 32px;
                       border-radius:12px 12px 0 0;">
              <p style="color:#ffffff;margin:0;font-size:18px;
                        font-weight:bold;letter-spacing:-0.2px;">
                Dr. Carlos Rebollón
              </p>
              <p style="color:rgba(255,255,255,0.55);margin:4px 0 0;
                        font-size:12px;letter-spacing:0.5px;">
                PROTOCOLO ACTIVO DE HOMBRO
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:36px 32px;
                       border-left:1px solid #E5E7EB;
                       border-right:1px solid #E5E7EB;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F5F7FA;padding:20px 32px;
                       border-radius:0 0 12px 12px;
                       border:1px solid #E5E7EB;border-top:none;
                       text-align:center;">
              <p style="color:#9CA3AF;font-size:12px;margin:0;line-height:1.7;">
                Dr. Carlos Rebollón · Cirujano Ortopeda y Traumatólogo<br/>
                <a href="https://drcarlosrebollon.com"
                   style="color:#9CA3AF;text-decoration:none;">
                  drcarlosrebollon.com
                </a>
              </p>
              <p style="margin:10px 0 0;">
                <a href="${APP_URL}/unsubscribe"
                   style="color:#C4C9D4;font-size:11px;text-decoration:underline;">
                  Cancelar suscripción
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Blue CTA button centered in a table cell */
export function ctaButton(label: string, url: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation"
          style="margin:28px 0;">
  <tr>
    <td align="center">
      <a href="${url}"
         style="background:#0170B9;color:#ffffff;padding:14px 28px;
                border-radius:8px;text-decoration:none;font-weight:bold;
                font-size:15px;display:inline-block;
                mso-padding-alt:14px 28px;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

/** Stat block for weekly summaries */
export function statRow(label: string, value: string): string {
  return `<tr>
  <td style="padding:10px 0;border-bottom:1px solid #F3F4F6;">
    <span style="color:#6B7280;font-size:14px;">${label}</span>
    <span style="float:right;font-weight:bold;color:#0a1628;font-size:14px;">
      ${value}
    </span>
  </td>
</tr>`;
}

/** Extract and capitalise first name from full_name */
export function firstName(fullName: string | null): string {
  const raw = (fullName ?? "").split(" ")[0].trim();
  if (!raw) return "Paciente";
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}
