const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = Number(process.env.PORT) || 3000;
const uploadDir = path.join(__dirname, 'uploads');
const publicBaseUrl = (process.env.PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL || '').trim();

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadDir, { fallthrough: false, maxAge: '1d' }));

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDir),
  filename: (_req, file, callback) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    callback(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
    callback(isPdf ? null : new Error('Only PDF uploads are supported.'), isPdf);
  },
});

function getPublicBaseUrl(req) {
  if (publicBaseUrl) {
    return publicBaseUrl.replace(/\/$/, '');
  }

  return `${req.protocol}://${req.get('host')}`;
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.get('/', (_req, res) => {
  res.json({
    name: 'Tablet-app upload server',
    endpoints: ['/health', '/upload'],
  });
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const baseUrl = getPublicBaseUrl(req);
  const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

  return res.status(201).json({
    message: 'PDF uploaded successfully',
    filename: req.file.filename,
    size: req.file.size,
    url: fileUrl,
  });
});

app.use((error, _req, res, _next) => {
  const status = error.message === 'Only PDF uploads are supported.' ? 415 : 500;
  res.status(status).json({ error: error.message || 'Upload server error' });
});

app.listen(port, '0.0.0.0', () => {
  const base = publicBaseUrl || `http://localhost:${port}`;
  console.log(`Upload API listening on http://0.0.0.0:${port}`);
  console.log(`Public URL base: ${base}`);
});