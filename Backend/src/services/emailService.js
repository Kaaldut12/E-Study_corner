// backend/src/services/emailService.js
import nodemailer from 'nodemailer';

// Configure Transporter from Environment Variables
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASSWORD;

  if (emailUser && emailPass && emailUser !== 'your-email@gmail.com') {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
  }

  // Fallback simulator for local development if real SMTP credentials not set
  return {
    sendMail: async (mailOptions) => {
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║  [EMAIL SENT LOG]
║  Recipient: ${mailOptions.to}
║  Subject:   ${mailOptions.subject}
╠══════════════════════════════════════════════════════════════╣
║ ${mailOptions.text || mailOptions.html.replace(/<[^>]*>?/gm, ' ').substring(0, 150)}...
╚══════════════════════════════════════════════════════════════╝
      `);
      return { messageId: `mock-msg-${Date.now()}` };
    }
  };
};

const transporter = createTransporter();

// 1. Password Reset Email Sender
export const sendPasswordResetEmail = async (toEmail, userName, resetCode) => {
  const fromEmail = process.env.EMAIL_USER || 'no-reply@estudy.com';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #818cf8; margin: 0;">E-Study Corner</h2>
        <p style="color: #94a3b8; font-size: 12px;">${process.env.COLLEGE_NAME || 'National Institute of Technology & Advanced Studies'}</p>
      </div>
      <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155;">
        <h3 style="color: #ffffff; margin-top: 0;">Password Reset Request</h3>
        <p style="color: #cbd5e1;">Hello <strong>${userName}</strong>,</p>
        <p style="color: #cbd5e1;">We received a request to reset your password for your E-Study Corner student/teacher account.</p>
        
        <div style="margin: 20px 0; text-align: center;">
          <span style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 24px; font-weight: bold; letter-spacing: 4px; padding: 12px 24px; border-radius: 8px;">
            ${resetCode}
          </span>
        </div>

        <p style="color: #cbd5e1; font-size: 13px;">Use the 6-digit OTP code above on the Reset Password page to create a new password. This code is valid for 15 minutes.</p>
        <p style="color: #94a3b8; font-size: 11px; margin-top: 20px;">If you did not request a password reset, please ignore this email.</p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 11px;">
        Copyright &copy; E-Study Corner · Department of Computer Science & Engineering
      </div>
    </div>
  `;

  return await transporter.sendMail({
    from: `"E-Study Corner Portal" <${fromEmail}>`,
    to: toEmail,
    subject: `🔒 E-Study Corner Password Reset Code: ${resetCode}`,
    text: `Hello ${userName}, your E-Study Corner password reset OTP code is: ${resetCode}`,
    html: htmlContent
  });
};

// 2. Broadcast / Notice Email Sender
export const sendBroadcastEmail = async (toEmail, subject, messageText) => {
  const fromEmail = process.env.EMAIL_USER || 'admin@estudy.com';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #818cf8; margin: 0;">E-Study Corner Announcement</h2>
        <p style="color: #94a3b8; font-size: 12px;">${process.env.COLLEGE_NAME || 'National Institute of Technology & Advanced Studies'}</p>
      </div>
      <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155;">
        <h3 style="color: #ffffff; margin-top: 0;">${subject}</h3>
        <div style="color: #cbd5e1; line-height: 1.6; white-space: pre-wrap;">${messageText}</div>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 11px;">
        This is an official automated notification from E-Study Corner Admin.
      </div>
    </div>
  `;

  return await transporter.sendMail({
    from: `"E-Study Corner Admin" <${fromEmail}>`,
    to: toEmail,
    subject: `📢 ${subject}`,
    text: messageText,
    html: htmlContent
  });
};

// 3. Support / Ticket Reply Email Sender
export const sendSupportReplyEmail = async (toEmail, userName, ticketSubject, adminReply) => {
  const fromEmail = process.env.EMAIL_USER || 'admin@estudy.com';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #818cf8; margin: 0;">Support Ticket Resolved</h2>
      </div>
      <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155;">
        <p style="color: #cbd5e1;">Hello <strong>${userName}</strong>,</p>
        <p style="color: #cbd5e1;">Your support inquiry regarding "<strong>${ticketSubject}</strong>" has been reviewed by the administrator.</p>
        <div style="background-color: #0f172a; padding: 14px; border-radius: 8px; border-left: 4px solid #818cf8; margin: 16px 0; color: #e2e8f0;">
          <strong>Admin Resolution:</strong><br/>
          ${adminReply}
        </div>
      </div>
    </div>
  `;

  return await transporter.sendMail({
    from: `"E-Study Support" <${fromEmail}>`,
    to: toEmail,
    subject: `✓ Resolved: ${ticketSubject}`,
    text: `Hello ${userName}, Admin Response: ${adminReply}`,
    html: htmlContent
  });
};
