export interface SubAdminInvitationData {
  email: string
  full_name: string
  inviter_name: string
  reset_link: string
}

export function generateSubAdminInvitationEmail(data: SubAdminInvitationData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Invitation - RealEST</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #07402F 0%, #0a5a43 100%); padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0; color: #ADF434; font-size: 28px; font-weight: 700;">RealEST</h1>
      <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px;">Admin Invitation</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="margin: 0 0 20px; color: #07402F; font-size: 24px; font-weight: 600;">Welcome to the Admin Team, ${data.full_name}!</h2>
      
      <p style="margin: 0 0 20px; color: #2E322E; font-size: 16px; line-height: 1.6;">
        ${data.inviter_name} has invited you to join the RealEST admin team. As an admin, you'll have access to:
      </p>

      <ul style="margin: 0 0 30px; padding-left: 20px; color: #2E322E; font-size: 16px; line-height: 1.8;">
        <li>Agent verification and approval workflows</li>
        <li>Property moderation and verification</li>
        <li>User management and support tools</li>
        <li>Platform analytics and reporting</li>
      </ul>

      <p style="margin: 0 0 30px; color: #2E322E; font-size: 16px; line-height: 1.6;">
        To get started, click the button below to set your password and activate your account:
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 0 0 30px;">
        <a href="${data.reset_link}" style="display: inline-block; background: #ADF434; color: #07402F; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Set Your Password
        </a>
      </div>

      <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; line-height: 1.6;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="margin: 0 0 30px; color: #6b7280; font-size: 14px; word-break: break-all;">
        ${data.reset_link}
      </p>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 30px;">
        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
          <strong>Important:</strong> This link will expire in 24 hours. If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
        RealEST - Nigeria's Verified Property Marketplace
      </p>
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        © ${new Date().getFullYear()} RealEST. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
