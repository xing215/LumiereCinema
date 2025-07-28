const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');

// GET /api/qr?code={{code}}
router.get('/', async (req, res) => {
    const { code, size } = req.query;
    if (!code) {
        return res.status(400).json({ error: 'Missing code parameter' });
    }
    const qrSize = Number(size) || 512;
    try {
        // Generate QR code as PNG buffer with custom size
        const qrBuffer = await QRCode.toBuffer(code, { type: 'png', width: qrSize });
        res.set('Content-Type', 'image/png');
        res.send(qrBuffer);
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

module.exports = router;
