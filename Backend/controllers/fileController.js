// backend/controllers/fileController.js

/**
 * Handle direct file downloads for student and teacher coursework attachments.
 * Supports binary base64 data URLs as well as server file links with custom filenames.
 */
export const downloadFileAttachment = async (req, res) => {
  try {
    const { fileUrl, fileName } = req.body;

    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'fileUrl is required for download.'
      });
    }

    const sanitizedFileName = (fileName || 'downloaded_document.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');

    // Handle base64 Data URL
    if (fileUrl.startsWith('data:')) {
      const matches = fileUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({
          success: false,
          message: 'Invalid base64 data format.'
        });
      }

      const mimeType = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFileName}"`);
      res.setHeader('Content-Length', buffer.length);
      return res.send(buffer);
    }

    // Direct redirection for hosted or CDN URLs
    return res.redirect(fileUrl);
  } catch (error) {
    console.error('downloadFileAttachment error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
