import * as Print from 'expo-print';

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export async function exportPdf({ inputValue, signatureData }) {
  const safeText = escapeHtml((inputValue || '').trim() || 'No input provided');
  const signatureMarkup = signatureData
    ? `<img src="${signatureData}" alt="Signature" style="max-width: 420px; width: 100%; border: 1px solid #d0d7de; border-radius: 8px;" />`
    : '<p style="color:#666">No signature captured yet.</p>';

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 24px; color: #111;">
        <h1 style="margin: 0 0 16px;">Tablet App Export</h1>
        <p style="margin: 0 0 8px;"><strong>Permanent text:</strong> Permanent text</p>
        <p style="margin: 0 0 20px;"><strong>Input value:</strong> ${safeText}</p>
        <h2 style="margin: 0 0 10px; font-size: 18px;">Signature</h2>
        ${signatureMarkup}
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}
