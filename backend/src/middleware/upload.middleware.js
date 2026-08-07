const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine config with filename sanitization
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename: replace unsafe chars with underscores
    const sanitizedOriginal = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = path.extname(sanitizedOriginal).toLowerCase();
    const nameWithoutExt = path.basename(sanitizedOriginal, ext);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  },
});

// File filter validator (Extension + MIME Type verification)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp4', '.mpeg', '.pdf'];
  const allowedMimeTypes = [
    'image/png', 'image/jpeg', 'image/pjpeg', 'image/webp', 'image/gif',
    'video/mp4', 'video/mpeg', 'application/pdf'
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype ? file.mimetype.toLowerCase() : '';
  
  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(mime)) {
    cb(null, true);
  } else {
    cb(new Error(`Security Error: Invalid file type or MIME spoofing detected. Allowed formats: ${allowedExtensions.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max limit to support video uploads
  },
  fileFilter,
});

// Post-upload Magic Byte header validation middleware
const verifyFileMagicBytes = (req, res, next) => {
  const file = req.file;
  if (!file) return next();

  try {
    const buffer = Buffer.alloc(12);
    const fd = fs.openSync(file.path, 'r');
    fs.readSync(fd, buffer, 0, 12, 0);
    fs.closeSync(fd);

    let isValidMagic = false;

    // PNG: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) isValidMagic = true;
    // JPEG: FF D8 FF
    else if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) isValidMagic = true;
    // GIF: 47 49 46 38
    else if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) isValidMagic = true;
    // WEBP / RIFF: 52 49 46 46
    else if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) isValidMagic = true;
    // PDF: 25 50 44 46 (%PDF)
    else if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) isValidMagic = true;
    // MP4: ftyp at offset 4 (66 74 79 70)
    else if (buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) isValidMagic = true;

    if (!isValidMagic) {
      // Unlink spoofed/corrupted file
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({
        message: 'Security Error: File header magic byte inspection failed. Executable or corrupted files are prohibited.',
        code: 'FILE_MAGIC_BYTES_INVALID',
      });
    }

    next();
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({ message: 'Error processing uploaded file header verification.' });
  }
};


// MIME types eligible for WebP optimization
const OPTIMIZABLE_MIMES = new Set(['image/jpeg', 'image/pjpeg', 'image/png']);

/**
 * Post-upload image optimizer middleware.
 * Runs AFTER multer + verifyFileMagicBytes.
 *
 * For JPEG / PNG uploads:
 *   • Generates an `_opt.webp` companion file at max 1920px width, quality 92.
 *   • Never upscales images smaller than 1920px.
 *   • Preserves the original file intact — existing DB URLs are unaffected.
 *   • Attaches `req.file.webpFilename` so the controller can store the optimized URL.
 *
 * For all other file types (video, PDF, WebP, GIF):
 *   • Skips processing and passes through immediately.
 *
 * Sharp failures are caught and logged; the request is never blocked.
 */
const optimizeImage = async (req, res, next) => {
  const file = req.file;

  // Skip non-image uploads and already-webp files
  if (!file || !OPTIMIZABLE_MIMES.has(file.mimetype)) {
    return next();
  }

  try {
    // Build companion filename: replace extension with _opt.webp
    const nameWithoutExt = path.basename(file.filename, path.extname(file.filename));
    const webpFilename = `${nameWithoutExt}_opt.webp`;
    const webpPath = path.join(uploadDir, webpFilename);

    await sharp(file.path)
      .resize(1920, null, {
        withoutEnlargement: true, // Never upscale small images
        fit: 'inside',
      })
      .webp({ quality: 92 })
      .toFile(webpPath);

    // Attach optimized filename so the controller can choose it
    req.file.webpFilename = webpFilename;
  } catch (err) {
    // Non-fatal: log and continue with the original file
    console.error('[UPLOAD OPTIMIZER] Sharp processing failed, falling back to original:', err.message);
  }

  next();
};

module.exports = {
  upload,
  verifyFileMagicBytes,
  optimizeImage,
};
