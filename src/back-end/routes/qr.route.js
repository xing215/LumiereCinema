const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');

// GET /api/qr?code={{code}}&size={{size}}
router.get('/', async (req, res) => {
    const { code, size } = req.query;
    
    if (!code) {
        return res.status(400).json({ error: 'Missing code parameter' });
    }
    
    const qrSize = Math.min(Math.max(Number(size) || 256, 64), 1024); // Limit size between 64 and 1024
    
    try {
        // Set cache headers for better performance
        res.set({
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            'ETag': `"qr-${Buffer.from(code).toString('base64')}-${qrSize}"`
        });
        
        // Generate QR code as PNG buffer with custom size
        const qrBuffer = await QRCode.toBuffer(code, { 
            type: 'png', 
            width: qrSize,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M'
        });
        
        res.send(qrBuffer);
    } catch (err) {
        console.error('Error generating QR code:', err);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

module.exports = router;
