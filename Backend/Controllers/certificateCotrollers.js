// 📂 controllers/certificateController.js
import path from "path";
import fs from "fs";
import Certificate from "../Models/certificateModel.js";
import IssuanceQueue from "../Models/issuanceQueueModel.js";
import archiver from "archiver";
import axios from 'axios';
import crypto from 'crypto';
import s3 from '../lib/s3.js';
import jsQR from 'jsqr';
import { createCanvas, loadImage } from 'canvas';
import sharp from 'sharp';
import { verifyCertificateHash } from '../lib/blockchain.js';





const downloadSingleCertificate = async (req, res) => {
  try {
    const { certId } = req.params;

    const cert = await Certificate.findOne({ certId });
    if (!cert || !cert.pdfUrl) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found.",
      });
    }

    // Prevent directory traversal
    const safeFileName = path.basename(cert.pdfUrl); // Prevents "../../etc/passwd"
    const filePath = path.resolve("certificates", safeFileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "PDF file not found.",
      });
    }

    res.download(filePath, `certificate-${certId}.pdf`);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({
      success: false,
      message: "Download failed.",
      error: error.message,
    });
  }
};

const downloadBulkCertificates = async (req, res) => {
  try {
    const { certIds } = req.body; // array of certId
    if (!Array.isArray(certIds) || certIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Certificate IDs required." });
    }

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=certificates.zip"
    );
    res.setHeader("Content-Type", "application/zip");

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    for (const certId of certIds) {
      const cert = await Certificate.findOne({ certId });
      if (cert && cert.pdfUrl) {
        const filePath = path.resolve(`.${cert.pdfUrl}`);
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: `certificate-${certId}.pdf` });
    }
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error("ZIP download error:", error);
    res.status(500).json({
      success: false,
      message: "Bulk download failed",
      error: error.message,
    });
  }
};

const certificateIssuanceDraft = async (req, res) => {
  try {
    const { userId, companyId, courseName } = req.body;

    if (!userId || !companyId || !courseName) {
      return res.status(400).json({
        success: false,
        message: "userId, companyId, and courseName are required.",
      });
    }

    const newCertificate = new Certificate({
      certId: `CERT-${Date.now()}`,
      userId,
      companyId,
      courseName,
      issuedDate: new Date(),
      status: "pending",
    });

    await newCertificate.save();

    res.status(201).json({
      success: true,
      message: "Certificate draft created.",
      certificate: newCertificate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating draft.",
      error: error.message,
    });
  }
};

const rejectCertificateIssuance = async (req, res) => {
  try {
    const { draftId } = req.params;

    const certificate = await Certificate.findByIdAndUpdate(
      draftId,
      { status: "rejected" },
      { new: true }
    );

    if (!certificate) {
      return res
        .status(404)
        .json({ success: false, message: "Draft not found." });
    }

    res.status(200).json({
      success: true,
      message: "Certificate rejected.",
      certificate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error rejecting certificate.",
      error: error.message,
    });
  }
};

const getUserCertificates = async (req, res) => {
  try {
    console.log('req.user:', req.user);
    const userId = req.user.id;
    console.log('userId:', userId);

    const certificates = await Certificate.find({ userId }).populate(
      "companyId",
      "name"
    );

    if (!certificates || certificates.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No certificates found for this user.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Certificates retrieved successfully.",
      certificates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user certificates.",
      error: error.message,
    });
  }
};

// Get all certificates (Admin)
const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({})
      .populate("userId", "name email") // recipient
      .populate("companyId", "name") // issuer
      .sort({ issueDate: -1 });
      const userId = req.user._id;
      console.log("Fetching certificates for user:", userId);
      const certificate = await Certificate.find({ userId }).populate("companyId", "name");
      console.log("Found certificates:", certificate);

      
    res.status(200).json({
      success: true,
      certificates: certificates.map((cert) => ({
        _id: cert._id,
        title: cert.title || cert.courseName,
        recipientName: cert.userId?.name || "N/A",
        recipientEmail: cert.userId?.email || "N/A",
        issuerName: cert.companyId?.name || "N/A",
        issueDate: cert.issueDate || cert.issuedDate,
        status: cert.status,
        certId: cert.certId,
      })),
    });
  } catch (error) {
    console.error("Error fetching all certificates:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching certificates",
      error: error.message,
    });
  }
};

// Approve a single certificate
export const approveCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const cert = await Certificate.findById(id);
    if (!cert) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found." });
    }
    cert.status = "approved";
    await cert.save();
    res.status(200).json({ success: true, message: "Certificate approved." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject a single certificate
export const rejectCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const cert = await Certificate.findById(id);
    if (!cert) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found." });
    }
    cert.status = "rejected";
    await cert.save();
    res.status(200).json({ success: true, message: "Certificate rejected." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCertificateDownloadUrl = async (req, res) => {
  try {
    const { certId } = req.params;
    const cert = await Certificate.findOne({ certId });
    
    if (!cert) {
      return res.status(404).json({ 
        success: false, 
        message: "Certificate not found." 
      });
    }

    // Generate a pre-signed S3 URL for the file
    const urlParts = cert.s3Url.split('/');
    const key = urlParts.slice(3).join('/');
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: 3600 // 1 hour
    });

    res.json({ 
      success: true, 
      url: signedUrl 
    });
  } catch (error) {
    console.error("Download URL error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to generate download URL.",
      error: error.message 
    });
  }
};

const verifyCertificate = async (req, res) => {
  try {
    const { certId } = req.params;
    console.log("Searching for certId:", certId); // Debug log
    // Find certificate by certId and populate company name
    const cert = await Certificate.findOne({ certId }).populate("companyId", "name");
    console.log("Certificate found:", cert); // Debug log
    if (!cert) return res.status(404).json({ valid: false, message: 'Certificate not found' });

    // Generate a pre-signed S3 URL for the file
    const urlParts = cert.s3Url.split('/');
    const key = urlParts.slice(3).join('/');
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: 60
    });

    // Download PDF from S3 using the signed URL
    const response = await axios.get(signedUrl, { responseType: 'arraybuffer' });
    const hash = crypto.createHash('sha256').update(response.data).digest('hex');

    // Compare with hash stored in MongoDB
    const isValidDB = hash === cert.hash;

    // Blockchain verification
    let blockchain = { valid: false, txHash: cert.txHash, contractAddress: cert.contractAddress };
    try {
      blockchain.valid = await verifyCertificateHash(hash);
    } catch (err) {
      console.error('Blockchain verification failed:', err);
    }

    res.json({
      valid: isValidDB && blockchain.valid,
      cert: {
        certId: cert.certId,
        recipientName: cert.recipientName,
        courseName: cert.courseName,
        issuedDate: cert.issuedDate,
        companyName: cert.companyId?.name || "N/A",
        s3Url: cert.s3Url,
        hash: cert.hash,
        txHash: cert.txHash,
        contractAddress: cert.contractAddress,
      },
      dbVerification: isValidDB,
      blockchainVerification: blockchain,
      message: isValidDB && blockchain.valid ? "Certificate is valid (DB & Blockchain)." : "Certificate is invalid or has been tampered with."
    });
  } catch (error) {
    res.status(500).json({ valid: false, message: "Verification failed", error: error.message });
  }
};

export const scanQRFromImage = async (req, res) => {
  try {
    if (!req.file || !req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ success: false, message: "Invalid or missing image file." });
    }

    const filePath = req.file.path.replace(/\\/g, '/');
    console.log('[ScanQR] Processing image with sharp/canvas:', filePath);

    let code = null;
    let attempts = 0;
    const maxAttempts = 3;

    // Try different image processing approaches
    while (!code && attempts < maxAttempts) {
      attempts++;
      console.log(`[ScanQR] Attempt ${attempts}/${maxAttempts}`);

      try {
        let processedImagePath;
        
        if (attempts === 1) {
          // First attempt: Resize to 300x300 (good for standalone QR codes)
          processedImagePath = filePath.replace(/\.(png|jpg|jpeg)$/, '-resized.png');
          await sharp(filePath)
            .resize({ width: 300, height: 300, fit: 'inside' })
            .toFile(processedImagePath);
        } else if (attempts === 2) {
          // Second attempt: Resize to 800x800 (better for certificate images)
          processedImagePath = filePath.replace(/\.(png|jpg|jpeg)$/, '-large.png');
          await sharp(filePath)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFile(processedImagePath);
        } else {
          // Third attempt: Enhance contrast and brightness for difficult images
          processedImagePath = filePath.replace(/\.(png|jpg|jpeg)$/, '-enhanced.png');
          await sharp(filePath)
            .resize({ width: 600, height: 600, fit: 'inside' })
            .modulate({ brightness: 1.2, contrast: 1.3 })
            .sharpen()
            .toFile(processedImagePath);
        }

        const img = await loadImage(processedImagePath);
        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        code = jsQR(imageData.data, imageData.width, imageData.height);

        // Cleanup processed image
        fs.unlink(processedImagePath, () => {});

        if (code) {
          console.log(`[ScanQR] ✅ QR code found on attempt ${attempts}`);
          break;
        }
      } catch (attemptError) {
        console.log(`[ScanQR] Attempt ${attempts} failed:`, attemptError.message);
        // Continue to next attempt
      }
    }

    // Cleanup original file
    fs.unlink(filePath, () => {});

    if (!code) {
      return res.status(404).json({ 
        success: false, 
        message: 'No QR code found in the image. Please ensure the image contains a clear, readable QR code.',
        suggestions: [
          'Make sure the QR code is clearly visible in the image',
          'Try taking a photo in better lighting',
          'Ensure the QR code is not blurry or distorted',
          'For certificate images, make sure the QR code area is well-lit'
        ]
      });
    }

    console.log('[ScanQR] QR data extracted:', code.data);
    return res.json({ success: true, qrData: code.data });

  } catch (err) {
    console.error('[ScanQR] QR processing failed:', err);
    fs.unlink(req.file?.path || '', () => {});
    return res.status(500).json({
      success: false,
      message: "Failed to process image. Please try again with a different image.",
      error: err.message,
    });
  }
};

// Function: Verify Certificate using QR Data
export const verifyCertificateByQR = async (req, res) => {
  try {
    const { data } = req.query;

    if (!data) {
      console.warn('[VERIFY QR] ❌ Missing "data" query param');
      return res.status(400).json({ success: false, message: "Missing QR data." });
    }

    const certId = data.split('/').pop();
    console.info('[VERIFY QR] 🔍 Extracted certId from QR data:', certId);

    const cert = await Certificate.findOne({ certId })
      .populate('companyId', 'name')
      .populate('userId', 'name email');

    if (!cert) {
      console.warn(`[VERIFY QR] ❌ Certificate not found for certId: ${certId}`);
      return res.status(404).json({ success: false, message: "Certificate not found." });
    }

    console.log('[VERIFY QR] ✅ Certificate verified:', {
      courseName: cert.courseName,
      certId: cert.certId,
      user: cert.userId?.email,
      company: cert.companyId?.name,
    });

    res.json({ success: true, certificate: cert });

  } catch (err) {
    console.error('[VERIFY QR] 🔥 Verification failed:', err.message);
    res.status(500).json({
      success: false,
      message: "Verification failed.",
      error: err.message,
    });
  }
};

export {
  verifyCertificate,
  downloadSingleCertificate,
  downloadBulkCertificates,
  certificateIssuanceDraft,
  rejectCertificateIssuance,
  getUserCertificates,
  getAllCertificates,
};
