import * as FileSystem from 'expo-file-system/legacy';
import { getServerUrl } from '../config/serverConfig';

export async function uploadPdf(uri) {
  if (!uri) {
    throw new Error('Missing PDF uri to upload.');
  }

  let serverUrl;
  try {
    serverUrl = await getServerUrl();
  } catch (error) {
    throw new Error('Failed to retrieve server configuration');
  }

  let response;

  try {
    response = await FileSystem.uploadAsync(`${serverUrl}/upload`, uri, {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'file',
      mimeType: 'application/pdf',
    });
  } catch (error) {
    // If the configured URL is the Android emulator alias, give a clearer hint for physical devices
    if (serverUrl.includes('10.0.2.2')) {
      throw new Error(
        `Unable to reach upload server at ${serverUrl}/upload: ${error.message}.\n` +
        'Note: 10.0.2.2 is the Android emulator alias for localhost and will not work from a physical device.\n' +
        'Change the server URL in Settings to your computer\'s LAN IP (e.g. http://192.168.x.x:3000) or use an ngrok/public URL.'
      );
    }

    throw new Error(`Unable to reach upload server at ${serverUrl}/upload: ${error.message}`);
  }

  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.body || `Upload failed with status ${response.status}`);
  }

  return JSON.parse(response.body);
}