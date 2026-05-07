import * as Print from 'expo-print';

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const buildSignatureMarkup = (signatureData) => {
  if (!signatureData) {
    return '<p style="color:#999">No signature captured</p>';
  }

  const trimmedSignature = signatureData.trim();

  if (trimmedSignature.startsWith('data:image/')) {
    return `<img src="${escapeHtml(trimmedSignature)}" alt="Signature" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;" />`;
  }

  if (trimmedSignature.startsWith('<svg')) {
    return `<div style="border: 1px solid #ddd; border-radius: 4px; overflow: hidden;">${trimmedSignature}</div>`;
  }

  return '<p style="color:#c00">Signature data invalid</p>';
};

export async function exportPdf({ inputValue, signatureData }) {
  const safeText = escapeHtml((inputValue || '').trim() || 'No input');
  const signatureMarkup = buildSignatureMarkup(signatureData);

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:Arial,sans-serif;margin:20px;color:#111;line-height:1.5}h1{font-size:20px;margin:0 0 12px}p{margin:0 0 8px;font-size:14px}strong{font-weight:600}</style></head><body><h1>Tablet App Export</h1><p><strong>Permanent text:</strong> Permanent text</p><p><strong>Input:</strong> ${safeText}</p><h2 style="font-size:16px;margin:16px 0 8px">Signature</h2>${signatureMarkup}</body></html>`;

  const { uri } = await Print.printToFileAsync({ html, width: 612, height: 792 });
  return uri;
}
