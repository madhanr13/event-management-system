/**
 * @fileoverview QR Code generation utility.
 * Uses the qrcode package to generate QR code images as data URLs.
 * @module utils/qrCode
 */

const QRCode = require('qrcode');

/**
 * Generates a QR code as a Base64-encoded PNG data URL.
 * The QR code encodes the provided data string, typically a unique token
 * used for attendance verification.
 *
 * @param {string} data - The data string to encode in the QR code
 * @returns {Promise<string>} Base64 data URL of the generated QR code PNG image
 * @throws {Error} If QR code generation fails
 *
 * @example
 * const qrDataUrl = await generateQRCode('evt_abc123_usr_def456_tok_xyz789');
 * // Returns: 'data:image/png;base64,iVBOR...'
 */
const generateQRCode = async (data) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#1a1a2e',  // Dark indigo QR modules
        light: '#ffffff', // White background
      },
      width: 300,
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR Code generation error:', error.message);
    throw new Error('Failed to generate QR code');
  }
};

module.exports = generateQRCode;
