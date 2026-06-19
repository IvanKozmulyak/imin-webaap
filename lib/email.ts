// Shared branded email sender (Resend REST API — no SDK).
// One dark IMIN-themed template, parameterized by kind/accent, used by both
// the access-request and growth-application routes.

export interface EmailField {
  label: string;
  value: string;
  href?: string; // if set, value renders as a link in the accent colour
}

export interface SendTeamEmailOptions {
  eyebrow: string; // small label, e.g. "New access request" / "Growth application"
  accent: string; // hex, colours the strip, eyebrow and links
  heading: string; // big display line, e.g. the applicant's name
  fields: EmailField[];
  subject: string;
  replyTo?: string;
  attachments?: { filename: string; content: string }[]; // base64 content
}

const SANS = "'DM Sans',-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";
const MONO = "'DM Mono','SFMono-Regular',ui-monospace,Menlo,monospace";
const DISP = "'Barlow Condensed','Arial Narrow',Helvetica,Arial,sans-serif";
const DASH = '<span style="color:#5f5b70;">—</span>';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function detailRow(f: EmailField, accent: string): string {
  const value = !f.value
    ? DASH
    : f.href
      ? `<a href="${esc(f.href)}" style="color:${accent};text-decoration:none;">${esc(f.value)}</a>`
      : esc(f.value);
  return `<tr>
    <td style="padding:15px 0;border-top:1px solid rgba(255,255,255,0.09);font-family:${MONO};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#5f5b70;width:96px;vertical-align:top;">${esc(f.label)}</td>
    <td style="padding:15px 0;border-top:1px solid rgba(255,255,255,0.09);font-family:${SANS};font-size:15px;line-height:1.5;color:#f4f2fb;vertical-align:top;word-break:break-word;white-space:pre-wrap;">${value}</td>
  </tr>`;
}

function renderEmail(o: SendTeamEmailOptions): string {
  const rows = o.fields.map((f) => detailRow(f, o.accent)).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<title>${esc(o.eyebrow)}</title>
</head>
<body style="margin:0;padding:0;background-color:#08070d;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(o.eyebrow)} — ${esc(o.heading)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#08070d;">
  <tr><td align="center" style="padding:36px 16px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">
      <tr><td style="height:4px;line-height:4px;font-size:0;background-color:${o.accent};border-radius:4px 4px 0 0;">&nbsp;</td></tr>
      <tr><td style="padding:30px 34px 8px;background-color:#100c1c;border-left:1px solid rgba(255,255,255,0.09);border-right:1px solid rgba(255,255,255,0.09);">
        <span style="font-family:${DISP};font-size:26px;font-weight:800;letter-spacing:0.06em;color:#f4f2fb;text-transform:uppercase;">IMIN</span>
        <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background-color:${o.accent};vertical-align:middle;margin-left:4px;"></span>
      </td></tr>
      <tr><td style="padding:18px 34px 30px;background-color:#100c1c;border-left:1px solid rgba(255,255,255,0.09);border-right:1px solid rgba(255,255,255,0.09);">
        <div style="font-family:${MONO};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${o.accent};margin-bottom:14px;">${esc(o.eyebrow)}</div>
        <div style="font-family:${DISP};font-size:42px;line-height:1;font-weight:800;letter-spacing:-0.01em;color:#f4f2fb;text-transform:uppercase;">${esc(o.heading)}</div>
      </td></tr>
      <tr><td style="padding:0 34px 34px;background-color:#100c1c;border-left:1px solid rgba(255,255,255,0.09);border-right:1px solid rgba(255,255,255,0.09);border-bottom:1px solid rgba(255,255,255,0.09);border-radius:0 0 16px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
      </td></tr>
      <tr><td style="padding:22px 34px 0;font-family:${SANS};font-size:12px;line-height:1.6;color:#5f5b70;">
        ${o.replyTo ? `Reply to this email to reach ${esc(o.heading)} directly.<br>` : ''}Sent by IMIN · <a href="https://imin.support" style="color:#5f5b70;text-decoration:underline;">imin.support</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// Sends via Resend. Throws if RESEND_API_KEY is unset or Resend rejects —
// callers surface a 500 so the form retries (email is the only record).
export async function sendTeamEmail(o: SendTeamEmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY unset — cannot deliver email.');
  }

  // EMAIL_TO is a comma-separated list — any number of recipients.
  const to = (process.env.EMAIL_TO || 'bohdan.shostak.ua@gmail.com,ivankozmulyak@gmail.com')
    .split(',')
    .map((addr) => addr.trim())
    .filter(Boolean);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // ponytail: From domain (imin.support) must be verified in Resend, else sends fail.
      from: process.env.EMAIL_FROM || 'IMIN <contact@imin.support>',
      to,
      reply_to: o.replyTo,
      subject: o.subject,
      html: renderEmail(o),
      attachments: o.attachments,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
}
