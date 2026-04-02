const express = require('express');
const path = require('path');
const upload = require('../middleware/upload');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Single file upload
router.post('/single', auth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadFolder = path.basename(req.file.destination).replace(/\\/g, '/');
    const fileUrl = `/uploads/${uploadFolder}/${req.file.filename}`;

    res.json({
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Multiple files upload
router.post('/multiple', auth, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const fileUrls = req.files.map(file => ({
      url: `/uploads/${path.basename(file.destination).replace(/\\/g, '/')}/${file.filename}`,
      filename: file.filename
    }));

    res.json({
      message: 'Files uploaded successfully',
      files: fileUrls
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

module.exports = router;
