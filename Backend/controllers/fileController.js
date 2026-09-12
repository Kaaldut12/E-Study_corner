// backend/controllers/fileController.js
import { ALLOWED_ORIGINS } from '../src/config/env.js';

// Whitelist of trusted CDN and storage provider domains
const TRUSTED_STORAGE_DOMAINS = [
  'res.cloudinary.com',
  'cloudinary.com',
  's3.amazonaws.com',
  'amazonaws.com',
  'storage.googleapis.com',
  'vercel-storage.com',
  'public.blob.vercel-storage.com',
  'estudycorner.vercel.app',
  'e-study-corner.vercel.app'
];

/**
 * Handle secure file downloads for student and teacher coursework attachments.
 * Validates base64 data payloads (under 10MB) and whitelists trusted cloud storage providers
 * to prevent Server-Side Request Forgery (SSRF) and arbitrary open redirects.
 */
export const downloadFileAttachment = async (req, res) => {
  try {
    const { fileUrl, fileName } = req.body;

    if (!fileUrl || typeof fileUrl !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'A valid fileUrl string is required for download.'
      });
    }

    const sanitizedFileName = (fileName || 'document.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');

    // 1. Handle base64 Data URLs
    if (fileUrl.startsWith('data:')) {
      const matches = fileUrl.match(/^data:([A-Za-z0-9-+\/.]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({
          success: false,
          message: 'Invalid base64 data URL format.'
        });
      }

      const base64Data = matches[2];

      // Enforce 10MB raw limit (~14MB base64 string length) before memory allocation
      const MAX_BASE64_LENGTH = 14 * 1024 * 1024;
      if (base64Data.length > MAX_BASE64_LENGTH) {
        return res.status(413).json({
          success: false,
          message: 'Payload too large: Attachment exceeds maximum allowed file size of 10MB.'
        });
      }

      const mimeType = matches[1];
      const buffer = Buffer.from(base64Data, 'base64');

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFileName}"`);
      res.setHeader('Content-Length', buffer.length);
      return res.send(buffer);
    }

    // 2. Validate Hosted Remote URLs
    let parsedUrl;
    try {
      parsedUrl = new URL(fileUrl);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL format provided.'
      });
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.status(400).json({
        success: false,
        message: 'Invalid protocol. Only HTTP/HTTPS URLs are supported.'
      });
    }

    const hostname = parsedUrl.hostname.toLowerCase();

    // 3. SSRF Guard: Disallow loopback, link-local metadata, and private IP ranges
    const isPrivateOrLoopback =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname === '169.254.169.254' || // AWS/GCP metadata service
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal');

    if (isPrivateOrLoopback) {
      return res.status(403).json({
        success: false,
        message: 'Access to local or internal network addresses is forbidden.'
      });
    }

    // 4. Domain Whitelist Verification
    // Check configured allowed origins (e.g. your deployment domain)
    const configuredOrigins = (ALLOWED_ORIGINS || []).map(origin => {
      try { return new URL(origin).hostname.toLowerCase(); } catch { return null; }
    }).filter(Boolean);

    const allTrustedHosts = [...TRUSTED_STORAGE_DOMAINS, ...configuredOrigins];

    const isTrustedDomain = allTrustedHosts.some(domain => {
      return hostname === domain || hostname.endsWith(`.${domain}`);
    });

    if (!isTrustedDomain && !process.env.ALLOW_ALL_DOWNLOAD_DOMAINS) {
      return res.status(403).json({
        success: false,
        message: 'Download rejected: Destination domain is not on the trusted storage whitelist.'
      });
    }

    // Safe redirection to trusted CDN/Storage asset
    return res.redirect(fileUrl);
  } catch (error) {
    console.error('downloadFileAttachment error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

