const BRAND_BLUE = "#005DE0";
const TEXT = "#1F2937";
const SUBTEXT = "#4B5563";
const BORDER = "#E5E7EB";
const BG = "#F9FAFB";

function escapeHtml(s = "") {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function renderBrandEmail(params: {
    previewText?: string;
    headline: string;
    intro?: string;
    bodyHTML?: string;
    ctaText?: string;
    ctaUrl?: string;
    ctaNote?: string;
    footerNote?: string;
}) {
    const {
        previewText = "",
        headline,
        intro,
        bodyHTML = "",
        ctaText,
        ctaUrl,
        ctaNote,
        footerNote,
    } = params;

    const CTA =
        ctaText && ctaUrl
            ? `
    <tr>
      <td align="left" style="padding:12px 24px 0 24px;">
        <a href="${escapeHtml(ctaUrl)}"
           style="display:inline-block;background:${BRAND_BLUE};color:#fff;text-decoration:none;
                  font-weight:600;font-size:14px;line-height:20px;padding:10px 16px;border-radius:8px;">
          ${escapeHtml(ctaText)}
        </a>
        ${
            ctaNote
                ? `<div style="font-size:12px;color:${SUBTEXT};margin-top:10px;">${escapeHtml(
                      ctaNote
                  )}</div>`
                : ""
        }
      </td>
    </tr>`
            : "";

    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${escapeHtml(headline)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BG};">
    <!-- Preheader (hidden) -->
    <div style="display:none;visibility:hidden;overflow:hidden;opacity:0;color:transparent;height:0;width:0;max-height:0;max-width:0;">
      ${escapeHtml(previewText)}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${BG};padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;background:#ffffff;border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:24px 24px 8px 24px;">
                <div style="font-size:22px;line-height:1.2;color:${TEXT};font-weight:700;margin:0 0 6px 0;">
                  ${escapeHtml(headline)}
                </div>
                ${
                    intro
                        ? `<div style="font-size:15px;line-height:1.6;color:${SUBTEXT};">${escapeHtml(
                              intro
                          )}</div>`
                        : ""
                }
              </td>
            </tr>

            ${
                bodyHTML
                    ? `<tr><td style="padding:8px 24px 8px 24px;">${bodyHTML}</td></tr>`
                    : ""
            }

            ${CTA}

            ${
                footerNote
                    ? `
            <tr>
              <td style="padding:16px 24px 0 24px;color:${SUBTEXT};font-size:12px;line-height:1.5;">
                ${escapeHtml(footerNote)}
              </td>
            </tr>`
                    : ""
            }

            <tr>
              <td style="padding:20px 24px 28px 24px;border-top:1px solid ${BORDER};">
                <div style="font-size:14px;color:${TEXT};margin:0 0 10px 0;">Thanks,</div>
                <div style="font-size:20px;font-weight:400;display:inline-block;color:${TEXT};">
                  DESIGN<span style="color:${BRAND_BLUE};">MY</span>CASE
                </div>
                <strong style="margin-left:6px;color:${TEXT};">Team</strong>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

export function renderOtpEmail(otp: string) {
    const body = `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding:4px 0 12px 0;color:${SUBTEXT};font-size:14px;">
          Enter this code to verify your email:
        </td>
      </tr>
      <tr>
        <td>
          <div style="display:inline-block;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
                      font-size:24px;letter-spacing:4px;font-weight:700;color:${TEXT};
                      border:1px solid ${BORDER};border-radius:10px;padding:12px 16px;background:#FDFDFD;">
            ${escapeHtml(otp)}
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding-top:12px;color:${SUBTEXT};font-size:12px;">
          This code expires in 10 minutes. If you didn’t request it, you can safely ignore this email.
        </td>
      </tr>
    </table>
  `;

    return renderBrandEmail({
        previewText: "Your verification code for DESIGNMYCASE",
        headline: "Verify your email",
        intro: "Use the code below to continue:",
        bodyHTML: body,
        footerNote: "For your security, never share this code with anyone.",
    });
}

export function renderChangeEmailEmail(approvalUrl: string) {
    const body = `
    <div style="color:${SUBTEXT};font-size:14px;margin-top:4px;">
      We received a request to change the email on your account. Click the button below to approve.
    </div>
  `;

    return renderBrandEmail({
        previewText: "Approve your email change request",
        headline: "Approve email change",
        intro: "Confirm this change to keep your account secure.",
        bodyHTML: body,
        ctaText: "Approve email change",
        ctaUrl: approvalUrl,
        ctaNote: "If you didn’t request this, you can ignore this message.",
    });
}

export function renderOtpText(otp: string) {
    return `Verify your email\n\nYour code: ${otp}\n\nThis code expires in 10 minutes. If you didn’t request it, ignore this email.\n\nThanks,\nDESIGNMYCASE Team`;
}

export function renderChangeEmailText(url: string) {
    return `Approve email change\n\nClick the link to approve the change:\n${url}\n\nIf you didn’t request this, ignore this email.\n\nThanks,\nDESIGNMYCASE Team`;
}
