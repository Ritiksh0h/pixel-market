/**
 * Branded HTML email templates for PixelMarket.
 * Inline styles only (email clients strip <style> tags).
 */

const BRAND_COLOR = "#09090b";
const MUTED_COLOR = "#71717a";
const BG_COLOR = "#fafafa";
const CARD_BG = "#ffffff";

function layout(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:0;background:${BG_COLOR};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG_COLOR};padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:${CARD_BG};border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
        <!-- Header -->
        <tr>
          <td style="padding:32px 32px 0;text-align:center;">
            <span style="font-size:20px;font-weight:800;font-family:'Courier New',monospace;color:${BRAND_COLOR};letter-spacing:-0.5px;">PixelMarket</span>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding:24px 32px 32px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #e4e4e7;text-align:center;">
            <p style="margin:0;font-size:12px;color:${MUTED_COLOR};">
              You received this email because of your PixelMarket account.<br />
              If you didn't expect this, you can safely ignore it.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(text: string, href: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td align="center">
        <a href="${href}" 
           style="display:inline-block;padding:14px 32px;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
          ${text}
        </a>
      </td></tr>
    </table>`;
}

// ── Password Reset Email ──
export function passwordResetEmail(resetUrl: string): string {
  return layout(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${BRAND_COLOR};">Reset your password</h1>
    <p style="margin:0 0 4px;font-size:15px;color:#3f3f46;line-height:1.6;">
      We received a request to reset your password. Click the button below to choose a new one.
    </p>
    ${button("Reset Password", resetUrl)}
    <p style="margin:0;font-size:13px;color:${MUTED_COLOR};line-height:1.5;">
      This link expires in 1 hour. If you didn't request a password reset, no action is needed.
    </p>
    <p style="margin:16px 0 0;font-size:12px;color:${MUTED_COLOR};word-break:break-all;">
      Or copy this link: ${resetUrl}
    </p>
  `);
}

// ── Magic Link Email ──
export function magicLinkEmail(signInUrl: string): string {
  return layout(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${BRAND_COLOR};">Sign in to PixelMarket</h1>
    <p style="margin:0 0 4px;font-size:15px;color:#3f3f46;line-height:1.6;">
      Click the button below to sign in. No password needed.
    </p>
    ${button("Sign In", signInUrl)}
    <p style="margin:0;font-size:13px;color:${MUTED_COLOR};line-height:1.5;">
      This link expires in 24 hours and can only be used once.
    </p>
    <p style="margin:16px 0 0;font-size:12px;color:${MUTED_COLOR};word-break:break-all;">
      Or copy this link: ${signInUrl}
    </p>
  `);
}

// ── Welcome Email (optional, for future use) ──
export function welcomeEmail(name: string): string {
  return layout(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${BRAND_COLOR};">Welcome to PixelMarket!</h1>
    <p style="margin:0 0 4px;font-size:15px;color:#3f3f46;line-height:1.6;">
      Hi ${name}, your account is ready. Start uploading your photos and reach buyers worldwide.
    </p>
    ${button("Go to Dashboard", process.env.NEXT_PUBLIC_APP_URL + "/dashboard")}
    <p style="margin:0;font-size:13px;color:${MUTED_COLOR};line-height:1.5;">
      Need help getting started? Upload your first photo and set your price — it only takes a minute.
    </p>
  `);
}
