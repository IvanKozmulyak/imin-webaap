import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface AccessRequestData {
  name: string;
  email: string;
  phone: string;
  city: string;
  link: string; // optional
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body: AccessRequestData = await request.json();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim() || ''; // optional
    const city = body.city?.trim();
    const link = body.link?.trim() || ''; // optional

    if (!name || !email || !city) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Email is the delivery channel — if it fails, surface a 500 so the user retries.
    await sendNotification({ name, email, phone, city, link });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing access request:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again later.' },
      { status: 500 }
    );
  }
}

// Sends the request via Resend's REST API. No SDK — one fetch.
// ponytail: the From domain (imin.support) must be verified in Resend, else
// sends fail — override with EMAIL_FROM if the domain changes.
async function sendNotification(d: AccessRequestData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY unset — cannot deliver access request.');
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
      from: process.env.EMAIL_FROM || 'IMIN <contact@imin.support>',
      to,
      reply_to: d.email,
      subject: `New IMIN access request — ${d.name} (${d.city})`,
      html: renderEmail(d),
      text: `Name: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone || '—'}\nCity: ${d.city}\nLink: ${d.link || '—'}`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
}

// --- Branded HTML email ----------------------------------------------------
// Dark IMIN nightlife theme, table layout + inline styles for client support.
// All user-supplied values are HTML-escaped (esc) before interpolation.

const ACCENT = '#16b877';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const DASH = '<span style="color:#5f5b70;">—</span>';
const SANS = "'DM Sans',-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";
const MONO = "'DM Mono','SFMono-Regular',ui-monospace,Menlo,monospace";
const DISP = "'Barlow Condensed','Arial Narrow',Helvetica,Arial,sans-serif";

function detailRow(label: string, valueHtml: string): string {
  return `<tr>
    <td style="padding:15px 0;border-top:1px solid rgba(255,255,255,0.09);font-family:${MONO};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#5f5b70;width:88px;vertical-align:top;">${label}</td>
    <td style="padding:15px 0;border-top:1px solid rgba(255,255,255,0.09);font-family:${SANS};font-size:15px;line-height:1.4;color:#f4f2fb;vertical-align:top;word-break:break-word;">${valueHtml}</td>
  </tr>`;
}

function renderEmail(d: AccessRequestData): string {
  const link = (s: string, label: string) =>
    `<a href="${s}" style="color:${ACCENT};text-decoration:none;">${label}</a>`;

  const emailVal = link(`mailto:${esc(d.email)}`, esc(d.email));
  const phoneVal = d.phone
    ? link(`tel:${esc(d.phone.replace(/[^\d+]/g, ''))}`, esc(d.phone))
    : DASH;
  const linkVal = d.link
    ? /^https?:\/\//i.test(d.link)
      ? link(esc(d.link), esc(d.link))
      : esc(d.link)
    : DASH;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<title>New IMIN access request</title>
</head>
<body style="margin:0;padding:0;background-color:#08070d;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">New access request from ${esc(d.name)} — ${esc(d.city)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#08070d;">
  <tr><td align="center" style="padding:36px 16px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">
      <!-- gradient accent strip -->
      <tr><td style="height:4px;line-height:4px;font-size:0;background-color:${ACCENT};background-image:linear-gradient(120deg,#0e8f86 0%,#24c98a 100%);border-radius:4px 4px 0 0;">&nbsp;</td></tr>
      <!-- header -->
      <tr><td style="padding:30px 34px 8px;background-color:#100c1c;border-left:1px solid rgba(255,255,255,0.09);border-right:1px solid rgba(255,255,255,0.09);">
        <span style="font-family:${DISP};font-size:26px;font-weight:800;letter-spacing:0.06em;color:#f4f2fb;text-transform:uppercase;">IMIN</span>
        <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background-color:${ACCENT};vertical-align:middle;margin-left:4px;"></span>
      </td></tr>
      <!-- hero -->
      <tr><td style="padding:18px 34px 30px;background-color:#100c1c;border-left:1px solid rgba(255,255,255,0.09);border-right:1px solid rgba(255,255,255,0.09);">
        <div style="font-family:${MONO};font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${ACCENT};margin-bottom:14px;">New access request</div>
        <div style="font-family:${DISP};font-size:42px;line-height:1;font-weight:800;letter-spacing:-0.01em;color:#f4f2fb;text-transform:uppercase;">${esc(d.name)}</div>
      </td></tr>
      <!-- details card -->
      <tr><td style="padding:0 34px 34px;background-color:#100c1c;border-left:1px solid rgba(255,255,255,0.09);border-right:1px solid rgba(255,255,255,0.09);border-bottom:1px solid rgba(255,255,255,0.09);border-radius:0 0 16px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${detailRow('Email', emailVal)}
          ${detailRow('Phone', phoneVal)}
          ${detailRow('City', esc(d.city))}
          ${detailRow('Link', linkVal)}
        </table>
      </td></tr>
      <!-- footer -->
      <tr><td style="padding:22px 34px 0;font-family:${SANS};font-size:12px;line-height:1.6;color:#5f5b70;">
        Reply to this email to reach ${esc(d.name)} directly — the applicant is set as the reply-to.<br>
        Sent by IMIN · <a href="https://imin.support" style="color:#5f5b70;text-decoration:underline;">imin.support</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
