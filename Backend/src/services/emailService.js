// backend/src/services/emailService.js
import nodemailer from 'nodemailer';

/**
 * Resolves email configuration from environment variables with
 * graceful fallback for Brevo, Gmail, and standard SMTP hosts.
 */
export const getEmailConfig = () => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || (process.env.EMAIL_SERVICE === 'gmail' ? 'smtp.gmail.com' : undefined);
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
  const service = process.env.EMAIL_SERVICE && process.env.EMAIL_SERVICE !== 'smtp' ? process.env.EMAIL_SERVICE : undefined;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const from = process.env.EMAIL_FROM || user || 'abhaypatel2556444@gmail.com';
  const collegeName = process.env.COLLEGE_NAME || 'E-Study Corner';

  const isTest = process.env.NODE_ENV === 'test' || Boolean(process.env.NODE_TEST_CONTEXT);

  const isConfigured = !isTest && Boolean(
    (host || service) &&
    user &&
    pass &&
    user !== 'your-email@gmail.com' &&
    pass !== 'your-app-specific-password'
  );

  return {
    host,
    port,
    user,
    pass,
    service,
    secure,
    from,
    collegeName,
    isConfigured
  };
};

/**
 * Creates a Nodemailer Transporter based on configuration or returns a mock logger.
 */
export const createTransporter = () => {
  const config = getEmailConfig();

  if (config.isConfigured) {
    if (config.service) {
      return nodemailer.createTransport({
        service: config.service,
        auth: {
          user: config.user,
          pass: config.pass
        }
      });
    }

    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass
      },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      }
    });
  }

  // Fallback simulator for local development if real SMTP credentials are not set
  return {
    sendMail: async (mailOptions) => {
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║  [NODEMAILER SIMULATOR LOG]
║  Recipient: ${mailOptions.to}
║  Subject:   ${mailOptions.subject}
║  Sender:    ${mailOptions.from}
╠══════════════════════════════════════════════════════════════╣
║ ${mailOptions.text || (mailOptions.html ? mailOptions.html.replace(/<[^>]*>?/gm, ' ').substring(0, 150) : '')}...
╚══════════════════════════════════════════════════════════════╝
      `);
      return {
        messageId: `mock-msg-${Date.now()}@estudy.local`,
        response: '250 Mock Email Accepted by Simulator'
      };
    },
    verify: async () => true
  };
};

/**
 * Verifies the connection to the SMTP server.
 * Returns connection health and helpful diagnostics.
 */
export const verifyEmailConnection = async () => {
  const config = getEmailConfig();

  if (!config.isConfigured) {
    return {
      connected: false,
      mode: 'mock',
      message: 'SMTP credentials are not configured or are set to default placeholders. Operating in local simulator mode.',
      details: {
        host: config.host,
        port: config.port,
        user: config.user ? `${config.user.substring(0, 4)}***` : undefined
      }
    };
  }

  const transporter = createTransporter();

  try {
    await transporter.verify();
    return {
      connected: true,
      mode: 'live',
      host: config.host || config.service,
      port: config.port,
      user: config.user,
      message: `Successfully connected to SMTP server (${config.host || config.service}:${config.port}). Ready to send emails.`
    };
  } catch (error) {
    let hint = error.message;
    if (error.responseCode === 525 || error.message?.includes('Unauthorized IP address')) {
      hint = 'Brevo IP Restriction (Error 525): Your IP is not whitelisted in Brevo. Solution: In Brevo -> Settings -> Security -> Authorized IPs, either add your IP address or deactivate "Blocking unauthorized IP addresses" for SMTP keys.';
    } else if (error.code === 'EAUTH' || error.responseCode === 535) {
      hint = 'SMTP Authentication Failed (Error 535): Invalid username or password/API key. For Gmail, generate a 16-digit Google App Password.';
    } else if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
      hint = 'Connection timed out or firewall blocked SMTP port. Try switching between port 587 (STARTTLS) and 465 (SSL).';
    }

    return {
      connected: false,
      mode: 'error',
      host: config.host || config.service,
      port: config.port,
      error: error.message,
      code: error.code,
      responseCode: error.responseCode,
      hint
    };
  }
};

/**
 * Primary universal email sending function using Nodemailer.
 *
 * @param {Object} options
 * @param {string|string[]} options.to - Recipient email address or array of addresses
 * @param {string} options.subject - Email subject
 * @param {string} [options.text] - Plain text body
 * @param {string} [options.html] - HTML body
 * @param {string} [options.from] - Custom sender address (defaults to EMAIL_FROM)
 * @param {Array} [options.attachments] - Array of Nodemailer attachment objects
 * @param {string|string[]} [options.cc] - CC recipients
 * @param {string|string[]} [options.bcc] - BCC recipients
 * @param {string} [options.replyTo] - Reply-To address
 * @returns {Promise<{success: boolean, messageId: string, response: string, mode: string}>}
 */
export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  attachments = [],
  from,
  cc,
  bcc,
  replyTo
}) => {
  if (!to) {
    throw new Error('Email recipient "to" is required.');
  }
  if (!subject) {
    throw new Error('Email "subject" is required.');
  }
  if (!text && !html) {
    throw new Error('Email body is required (provide "text" or "html").');
  }

  const config = getEmailConfig();
  const transporter = createTransporter();

  // Normalize sender address with friendly display name
  const senderEmail = from || config.from;
  const formattedFrom = senderEmail.includes('<')
    ? senderEmail
    : `"${config.collegeName}" <${senderEmail}>`;

  const mailOptions = {
    from: formattedFrom,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    text: text || (html ? html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim() : ''),
    html: html || (text ? `<div style="font-family: Arial, sans-serif; white-space: pre-wrap; line-height: 1.6;">${text}</div>` : ''),
    attachments,
    ...(cc && { cc: Array.isArray(cc) ? cc.join(', ') : cc }),
    ...(bcc && { bcc: Array.isArray(bcc) ? bcc.join(', ') : bcc }),
    ...(replyTo && { replyTo })
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
      response: info.response || 'Accepted',
      mode: config.isConfigured ? 'live' : 'mock'
    };
  } catch (error) {
    console.error('[emailService.sendEmail Error]:', error.message);
    let userFriendlyMessage = error.message;

    if (error.responseCode === 525 || error.message?.includes('Unauthorized IP address')) {
      userFriendlyMessage = 'Brevo SMTP rejected sending: Unauthorized IP address (525). Please whitelist your IP in Brevo (Settings > Security > Authorized IPs) or deactivate IP blocking for SMTP keys.';
    } else if (error.code === 'EAUTH' || error.responseCode === 535) {
      userFriendlyMessage = 'SMTP Authentication failed: Invalid username or password/API key.';
    }

    const customError = new Error(userFriendlyMessage);
    customError.code = error.code;
    customError.responseCode = error.responseCode;
    customError.originalMessage = error.message;
    throw customError;
  }
};

/**
 * Password Reset Email Sender (Convenience Helper)
 */
export const sendPasswordResetEmail = async (toEmail, userName, resetCode) => {
  const config = getEmailConfig();

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #f8fafc; padding: 32px 16px; border-radius: 16px;">
      <div style="max-width: 520px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 28px;">
          <h1 style="color: #6366f1; font-size: 24px; font-weight: 700; margin: 0 0 6px 0; letter-spacing: -0.5px;">${config.collegeName}</h1>
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">Automated Academic Platform Notification</p>
        </div>

        <div style="background-color: #111827; padding: 28px; border-radius: 14px; border: 1px solid #1f2937; box-shadow: 0 10px 25px rgba(0,0,0,0.4);">
          <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 12px 0;">Password Reset Request</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong>${userName}</strong>,</p>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">We received a request to reset your password for your account. Please enter the verification OTP code below:</p>

          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #6366f1); color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 6px; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
              ${resetCode}
            </span>
          </div>

          <p style="color: #cbd5e1; font-size: 13px; line-height: 1.5; margin: 20px 0 0 0;">This OTP code expires in <strong>15 minutes</strong>. If you did not request this password reset, please ignore this email.</p>
        </div>

        <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 12px;">
          &copy; ${new Date().getFullYear()} ${config.collegeName}. All rights reserved.
        </div>
      </div>
    </div>
  `;

  return await sendEmail({
    to: toEmail,
    subject: `🔒 Your Password Reset OTP Code: ${resetCode}`,
    text: `Hello ${userName}, your password reset OTP code is: ${resetCode}. This code is valid for 15 minutes.`,
    html: htmlContent
  });
};

/**
 * Broadcast / Notice Email Sender (Convenience Helper)
 */
export const sendBroadcastEmail = async (toEmail, subject, messageText) => {
  const config = getEmailConfig();

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #f8fafc; padding: 32px 16px; border-radius: 16px;">
      <div style="max-width: 560px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #6366f1; font-size: 24px; font-weight: 700; margin: 0 0 6px 0;">${config.collegeName}</h1>
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">Official Administrative Announcement</p>
        </div>

        <div style="background-color: #111827; padding: 28px; border-radius: 14px; border: 1px solid #1f2937;">
          <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 16px 0; border-bottom: 1px solid #1f2937; padding-bottom: 12px;">${subject}</h2>
          <div style="color: #cbd5e1; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${messageText}</div>
        </div>

        <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 11px;">
          This is an official automated dispatch from ${config.collegeName} Administration.
        </div>
      </div>
    </div>
  `;

  return await sendEmail({
    to: toEmail,
    subject: `📢 ${subject}`,
    text: messageText,
    html: htmlContent
  });
};

/**
 * Support / Ticket Reply Email Sender (Convenience Helper)
 */
export const sendSupportReplyEmail = async (toEmail, userName, ticketSubject, adminReply) => {
  const config = getEmailConfig();

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #f8fafc; padding: 32px 16px; border-radius: 16px;">
      <div style="max-width: 560px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #6366f1; font-size: 22px; font-weight: 700; margin: 0 0 4px 0;">Support Ticket Resolution</h1>
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">${config.collegeName}</p>
        </div>

        <div style="background-color: #111827; padding: 24px; border-radius: 14px; border: 1px solid #1f2937;">
          <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 12px 0;">Hello <strong>${userName}</strong>,</p>
          <p style="color: #94a3b8; font-size: 14px; margin: 0 0 16px 0;">Your inquiry regarding "<strong>${ticketSubject}</strong>" has been addressed by the administrator.</p>

          <div style="background-color: #090d16; padding: 16px; border-radius: 10px; border-left: 4px solid #6366f1; color: #e2e8f0; font-size: 14px; line-height: 1.6;">
            <div style="font-size: 11px; text-transform: uppercase; color: #818cf8; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 6px;">Administrator Reply</div>
            ${adminReply}
          </div>
        </div>
      </div>
    </div>
  `;

  return await sendEmail({
    to: toEmail,
    subject: `✓ Resolved: ${ticketSubject}`,
    text: `Hello ${userName}, Admin Response to "${ticketSubject}":\n\n${adminReply}`,
    html: htmlContent
  });
};

export default {
  sendEmail,
  verifyEmailConnection,
  getEmailConfig,
  createTransporter,
  sendPasswordResetEmail,
  sendBroadcastEmail,
  sendSupportReplyEmail
};
