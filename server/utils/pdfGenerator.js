/**
 * @fileoverview PDF certificate generation utility.
 * Uses PDFKit to generate beautiful participation certificates.
 * @module utils/pdfGenerator
 */

const PDFDocument = require('pdfkit');

/**
 * Generates a participation certificate as a PDF buffer.
 * Creates a professionally styled certificate with decorative borders,
 * participant details, event information, and a signature area.
 *
 * @param {Object} options - Certificate details
 * @param {string} options.participantName - Full name of the participant
 * @param {string} options.eventName - Name of the event
 * @param {string} options.eventDate - Formatted date of the event
 * @param {string} options.organizerName - Name of the event organizer
 * @returns {Promise<Buffer>} PDF document as a Buffer
 *
 * @example
 * const pdfBuffer = await generateCertificate({
 *   participantName: 'John Doe',
 *   eventName: 'AI Workshop 2026',
 *   eventDate: 'June 15, 2026',
 *   organizerName: 'Dr. Smith'
 * });
 */
const generateCertificate = ({ participantName, eventName, eventDate, organizerName }) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a landscape PDF document
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      // Collect chunks into a buffer
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      // ─── Background ───────────────────────────────────────────
      doc.rect(0, 0, pageWidth, pageHeight).fill('#fafbff');

      // ─── Outer decorative border ──────────────────────────────
      const borderMargin = 25;
      doc
        .rect(borderMargin, borderMargin, pageWidth - 2 * borderMargin, pageHeight - 2 * borderMargin)
        .lineWidth(3)
        .stroke('#1e3a5f');

      // ─── Inner decorative border ──────────────────────────────
      const innerMargin = 35;
      doc
        .rect(innerMargin, innerMargin, pageWidth - 2 * innerMargin, pageHeight - 2 * innerMargin)
        .lineWidth(1)
        .stroke('#3b82f6');

      // ─── Top decorative line ──────────────────────────────────
      const topLineY = 75;
      doc
        .moveTo(100, topLineY)
        .lineTo(pageWidth - 100, topLineY)
        .lineWidth(2)
        .stroke('#3b82f6');

      // ─── Corner accents ───────────────────────────────────────
      const accentSize = 20;
      const cornerPositions = [
        { x: 45, y: 45 },
        { x: pageWidth - 45 - accentSize, y: 45 },
        { x: 45, y: pageHeight - 45 - accentSize },
        { x: pageWidth - 45 - accentSize, y: pageHeight - 45 - accentSize },
      ];
      cornerPositions.forEach(({ x, y }) => {
        doc.rect(x, y, accentSize, accentSize).fill('#1e3a5f');
      });

      // ─── Institution Name (optional top text) ─────────────────
      doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor('#6b7280')
        .text('CAMPUS EVENT MANAGEMENT SYSTEM', 0, 95, {
          align: 'center',
          width: pageWidth,
        });

      // ─── Main Title ───────────────────────────────────────────
      doc
        .font('Helvetica-Bold')
        .fontSize(36)
        .fillColor('#1e3a5f')
        .text('Certificate of Participation', 0, 125, {
          align: 'center',
          width: pageWidth,
        });

      // ─── Decorative line below title ──────────────────────────
      const titleLineY = 175;
      doc
        .moveTo(250, titleLineY)
        .lineTo(pageWidth - 250, titleLineY)
        .lineWidth(1.5)
        .stroke('#3b82f6');

      // ─── "This is to certify that" ────────────────────────────
      doc
        .font('Helvetica')
        .fontSize(14)
        .fillColor('#4b5563')
        .text('This is to certify that', 0, 200, {
          align: 'center',
          width: pageWidth,
        });

      // ─── Participant Name ─────────────────────────────────────
      doc
        .font('Helvetica-Bold')
        .fontSize(30)
        .fillColor('#1e3a5f')
        .text(participantName, 0, 230, {
          align: 'center',
          width: pageWidth,
        });

      // ─── Underline beneath name ───────────────────────────────
      const nameUnderlineY = 270;
      doc
        .moveTo(200, nameUnderlineY)
        .lineTo(pageWidth - 200, nameUnderlineY)
        .lineWidth(1)
        .stroke('#d1d5db');

      // ─── Participation text ───────────────────────────────────
      doc
        .font('Helvetica')
        .fontSize(14)
        .fillColor('#4b5563')
        .text('has successfully participated in', 0, 285, {
          align: 'center',
          width: pageWidth,
        });

      // ─── Event Name ───────────────────────────────────────────
      doc
        .font('Helvetica-Bold')
        .fontSize(22)
        .fillColor('#3b82f6')
        .text(`"${eventName}"`, 0, 315, {
          align: 'center',
          width: pageWidth,
        });

      // ─── Event Date ───────────────────────────────────────────
      doc
        .font('Helvetica')
        .fontSize(13)
        .fillColor('#6b7280')
        .text(`held on ${eventDate}`, 0, 350, {
          align: 'center',
          width: pageWidth,
        });

      // ─── Organized By ─────────────────────────────────────────
      doc
        .font('Helvetica')
        .fontSize(13)
        .fillColor('#6b7280')
        .text(`Organized by: ${organizerName}`, 0, 375, {
          align: 'center',
          width: pageWidth,
        });

      // ─── Bottom decorative line ───────────────────────────────
      const bottomLineY = 420;
      doc
        .moveTo(100, bottomLineY)
        .lineTo(pageWidth - 100, bottomLineY)
        .lineWidth(1)
        .stroke('#d1d5db');

      // ─── Signature Area ───────────────────────────────────────
      const sigY = 450;

      // Left signature — Organizer
      doc
        .moveTo(130, sigY + 40)
        .lineTo(320, sigY + 40)
        .lineWidth(1)
        .stroke('#9ca3af');

      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('#6b7280')
        .text('Event Organizer', 130, sigY + 48, {
          width: 190,
          align: 'center',
        });

      // Right signature — Authority
      doc
        .moveTo(pageWidth - 320, sigY + 40)
        .lineTo(pageWidth - 130, sigY + 40)
        .lineWidth(1)
        .stroke('#9ca3af');

      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('#6b7280')
        .text('Authorized Signatory', pageWidth - 320, sigY + 48, {
          width: 190,
          align: 'center',
        });

      // ─── Date of Issue ────────────────────────────────────────
      const issueDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#9ca3af')
        .text(`Date of Issue: ${issueDate}`, 0, pageHeight - 70, {
          align: 'center',
          width: pageWidth,
        });

      // ─── Bottom decorative line ───────────────────────────────
      const footerLineY = pageHeight - 50;
      doc
        .moveTo(100, footerLineY)
        .lineTo(pageWidth - 100, footerLineY)
        .lineWidth(2)
        .stroke('#3b82f6');

      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generateCertificate;
