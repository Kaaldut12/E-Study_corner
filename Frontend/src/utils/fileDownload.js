// frontend/src/utils/fileDownload.js
import api from '../services/api';

/**
 * Universal cross-browser file downloader.
 * Handles data URLs (base64), blob URLs, remote server URLs, and the backend /api/files/download streaming endpoint.
 *
 * @param {string} fileUrl - Data URL, Object URL, or remote file link.
 * @param {string} fileName - Desired downloaded file name.
 */
export const downloadFile = async (fileUrl, fileName = 'document.pdf') => {
  if (!fileUrl) {
    console.warn('Cannot download file: fileUrl is empty');
    return;
  }

  const cleanFileName = fileName || 'downloaded_file.pdf';

  try {
    // 1. If it's a base64 Data URL, convert to Blob for reliable native download across modern browsers
    if (fileUrl.startsWith('data:')) {
      const parts = fileUrl.split(';base64,');
      const contentType = parts[0].replace('data:', '') || 'application/octet-stream';
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }

      const blob = new Blob([uInt8Array], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = cleanFileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 2000);
      return;
    }

    // 2. If it's a blob URL
    if (fileUrl.startsWith('blob:')) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = cleanFileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 1000);
      return;
    }

    // 3. If it's a backend or remote URL, use the backend download proxy or fetch blob
    try {
      const response = await api.post(
        '/files/download',
        { fileUrl, fileName: cleanFileName },
        { responseType: 'blob' }
      );
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = cleanFileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 2000);
    } catch {
      // Direct anchor fallback
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = cleanFileName;
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 1000);
    }
  } catch (err) {
    console.error('Download execution error:', err);
    // Ultimate fallback
    window.open(fileUrl, '_blank');
  }
};

export default downloadFile;
