// 📂 utils/generateCertificate.js

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import { convertCmToPdfCoords } from "./pdfCoordinates.js";
import uploadFileToS3 from './uploadToS3.js';
import crypto from 'crypto';
import QRCode from "qrcode";
import { storeCertificateHash } from '../lib/blockchain.js';

const generateCertificate = async (templatePath, recipient, saveDir) => {
  console.log('generateCertificate recipient:', recipient);
  const {
    certId,
    name,
    email,
    courseName,
    courseDuration,
    courseProvider,
    issuedDate,
    hash,
    companyName,
  } = recipient;

  const existingPdfBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const page = pages[0];

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(
    StandardFonts.HelveticaOblique
  );

  const { height: pageHeight } = page.getSize();

  // 🔹 Draw centered text inside a box
  const drawCenteredInBox = (
    text,
    cmStartX,
    boxWidthCm,
    cmY,
    size,
    font,
    color
  ) => {
    const { x: boxX, y } = convertCmToPdfCoords(cmStartX, cmY, pageHeight);
    const boxWidth = boxWidthCm * 28.35; // cm to pt
    const textWidth = font.widthOfTextAtSize(text, size);
    const x = boxX + (boxWidth - textWidth) / 2;

    page.drawText(text, { x, y, size, font, color });
  };

  // 🔹 Draw normal (left-aligned) text
  const drawNormalText = (text, cmX, cmY, size, font, color) => {
    const { x, y } = convertCmToPdfCoords(cmX, cmY, pageHeight);
    page.drawText(text, { x, y, size, font, color });
  };

  // 🖋 Draw certificate fields
  drawCenteredInBox(
    String(name ?? "N/A"),
    7.64,
    14.29,
    7.8,
    26,
    helveticaBold,
    rgb(0.1, 0.1, 0.1)
  );
  drawCenteredInBox(
    String(courseName ?? "N/A"),
    7.64,
    14.29,
    9.99,
    21,
    helvetica,
    rgb(0.15, 0.15, 0.15)
  );

  if (companyName) {
    drawCenteredInBox(
      String(companyName),
      18,
      12.5,
      19, // slightly below course name
      16,
      helveticaOblique,
      rgb(0.2, 0.2, 0.2)
    );
  }

  if (courseProvider) {
    drawCenteredInBox(
      String(courseProvider ?? ""),
      19.58,
      9.21,
      18.73,
      14,
      helveticaOblique,
      rgb(0.2, 0.2, 0.2)
    );
  }

  // if (courseDuration) {
  //   drawCenteredInBox(
  //     courseDuration,
  //     10,
  //     4.5,
  //     12.4,
  //     14,
  //     helvetica,
  //     rgb(0.25, 0.25, 0.25)
  //   );
  // }

  drawNormalText(String(issuedDate ?? "N/A"), 1.29, 18.42, 14, helvetica, rgb(0.5, 0.5, 0.5));
  drawNormalText(
    String(certId ?? "N/A").slice(0, 32),
    19.68,
    2.2,
    14,
    helvetica,
    rgb(0.6, 0.6, 0.6)
  );
  drawCenteredInBox(String(hash ?? ""), 5.97, 17.78, 19.8, 12, helvetica, rgb(0.6, 0.6, 0.6));

  // Generate QR code with certId for verification
  const qrText = `${process.env.FRONTEND_URL || "https://certiguard.com"}/verify/${certId}`;
  console.log('[QR] Generating QR code for:', qrText);
  const qrDataUrl = await QRCode.toDataURL(qrText);
  const qrImage = await pdfDoc.embedPng(qrDataUrl);
  // Place QR at bottom left (customize as needed)
  const { x: qrX, y: qrY } = convertCmToPdfCoords(1.81, 16.34, pageHeight);
  const qrSize = 100; // in pts (100 pts ≈ 3.5cm)
  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize,
  });
  console.log('[QR] QR code embedded in PDF at', qrX, qrY);

  // 💾 Save final certificate PDF
  const fileName = `CertGuard-${certId}.pdf`;
  const outputPath = path.join(saveDir, fileName);
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);

  return { certId, fileName, hash, qrDataUrl, qrText };
};

async function processCertificate(localPdfPath, certId) {
  // 1. Upload to S3
  const s3Key = `certificates/${certId}.pdf`;
  const s3Result = await uploadFileToS3(localPdfPath, s3Key);

  // 2. Hash the PDF
  const fileBuffer = fs.readFileSync(localPdfPath);
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

  // 3. Store hash on blockchain
  let txHash = "";
  let contractAddress = process.env.CONTRACT_ADDRESS || "";
  try {
    console.log('[ProcessCertificate] Storing hash on blockchain:', hash);
    txHash = await storeCertificateHash(hash);
    console.log('[ProcessCertificate] Received txHash:', txHash);
  } catch (err) {
    console.error('[ProcessCertificate] Blockchain anchoring failed:', err);
  }

  // 4. Return S3 URL, hash, and blockchain info
  return {
    s3Url: s3Result.Location,
    hash,
    txHash,
    contractAddress
  };
}

export default generateCertificate;
export { processCertificate };
