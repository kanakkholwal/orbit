/**
 * Generic Google Analytics event tracker
 * @param eventName - The name of the event (e.g., 'file_download', 'file_upload')
 * @param eventData - Object containing event parameters
 */
export function trackEvent(
  eventName: string,
  eventData: Record<string, string | number | boolean>
) {
  if (typeof window === 'undefined' || !window?.gtag) {
    return;
  }

  try {
    // @ts-ignore
    window.gtag('event', eventName, eventData);
  } catch (error) {
    console.error(`Failed to track event "${eventName}":`, error);
  }
}

/**
 * Track file download event
 * @param fileName - Name of the downloaded file
 * @param fileSize - Size of the file in bytes
 * @param source - Source of download (e.g., 'web', 'tauri', 'download-page')
 */
export function trackFileDownload(
  fileName: string,
  fileSize: number,
  source: string = 'web'
) {
  const fileExtension = fileName.split('.').pop() || 'unknown';

  trackEvent('file_download', {
    file_name: fileName,
    file_extension: fileExtension,
    file_size_bytes: fileSize,
    event_category: 'engagement',
    event_label: `${source}-download-${fileExtension}`,
  });
}

/**
 * Track file upload event
 * @param fileName - Name of the uploaded file
 * @param fileSize - Size of the file in bytes
 * @param fileType - MIME type of the file
 */
export function trackFileUpload(
  fileName: string,
  fileSize: number,
  fileType: string = 'unknown'
) {
  const fileExtension = fileName.split('.').pop() || 'unknown';

  trackEvent('file_upload', {
    file_name: fileName,
    file_extension: fileExtension,
    file_size_bytes: fileSize,
    file_type: fileType,
    event_category: 'engagement',
    event_label: `upload-${fileExtension}`,
  });
}

/**
 * Track native app download
 * @param platform - Platform name (e.g., 'Windows', 'Linux', 'macOS')
 * @param downloadType - Download format (e.g., 'msi', 'exe', 'deb')
 */
export function trackNativeAppDownload(platform: string, downloadType: string) {
  trackEvent('file_download', {
    file_name: `orbit-${platform.toLowerCase()}-${downloadType}`,
    file_extension: downloadType,
    event_category: 'download',
    event_label: `${platform} - ${downloadType}`,
  });
}
