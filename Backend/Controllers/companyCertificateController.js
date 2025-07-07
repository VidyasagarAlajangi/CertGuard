import Certificate from "../Models/certificateModel.js";
import User from "../Models/userModel.js";
import csvParser from "csv-parser";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import generateCertificate from "../utils/generateCertificate.js";
import { processCertificate } from "../utils/generateCertificate.js";
import { sendEmailSES } from '../utils/sendEmailSES.js';

// Issue a single certificate
export const issueSingleCertificate = async (req, res) => {
  try {
    const { recipientName, recipientEmail, courseName, courseDuration, remarks } = req.body;

    if (!recipientName || !recipientEmail || !courseName) {
      return res.status(400).json({
        success: false,
        message: "Recipient name, email, and course name are required.",
      });
    }

    // Check if recipient exists; do NOT create a new user if not found
    let recipient = await User.findOne({ email: recipientEmail });
    let userId = recipient ? recipient._id : null;

    const certId = uuidv4();
    const templatePath = "templates/CertGuard.pdf";
    const saveDir = "certificates/";

    // Fetch company name for template
    const companyName = req.user.name || (req.user.companyName) || "";
    const { fileName, qrDataUrl, qrText } = await generateCertificate(
      templatePath,
      {
        certId,
        name: recipientName,
        email: recipientEmail,
        courseName,
        issuedDate: new Date().toISOString().split("T")[0],
        companyName,
      },
      saveDir
    );

    const localPdfPath = path.join(saveDir, fileName);
    const { s3Url, hash, txHash, contractAddress } = await processCertificate(localPdfPath, certId);
    console.log('[Controller] processCertificate result:', { s3Url, hash, txHash, contractAddress });

    // Create certificate record
    const certificate = new Certificate({
      certId,
      recipientName,
      recipientEmail,
      userId, // <-- only set if user exists
      companyId: req.user.id,
      companyName,
      courseName,
      courseDuration: courseDuration || "",
      remarks: remarks || "Successfully Completed",
      issuedDate: new Date(),
      status: "approved",
      s3Url,
      hash,
      qrCodeUrl: qrText,
      txHash,
      contractAddress
    });

    await certificate.save();

    // Send email notification to recipient with PDF attachment
    try {
      await sendEmailSES(
        recipientEmail,
        'Your Certificate is Ready',
        `<p>Signup or <p>login</p> to view your certificate.</p>`,
        { path: localPdfPath, filename: fileName }
      );
    } catch (emailErr) {
      console.error('Failed to send certificate email:', emailErr);
    }

    res.status(201).json({
      success: true,
      message: "Certificate issued successfully.",
      certificate,
    });
  } catch (error) {
    console.error("Certificate issuance error:", error);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    res.status(500).json({
      success: false,
      message: "Failed to issue certificate.",
      error: error.message,
      stack: error.stack,
      fullError: error
    });
  }
};

// Issue certificates in bulk via CSV
export const issueBulkCertificates = async (req, res) => {
  try {
    const { courseName, courseDuration, remarks } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No CSV file uploaded.",
      });
    }

    if (!courseName) {
      return res.status(400).json({
        success: false,
        message: "Course name is required.",
      });
    }

    const recipients = [];
    const templatePath = "templates/CertGuard.pdf";
    const saveDir = "certificates/";
    const certificates = [];

    // Read CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on("data", (row) => {
          recipients.push(row);
        })
        .on("end", resolve)
        .on("error", reject);
    });

    // Process each recipient
    for (const recipient of recipients) {
      try {
        // Check if recipient exists; do NOT create a new user if not found
        let user = await User.findOne({ email: recipient.email });
        let userId = user ? user._id : null;

        const certId = uuidv4();
        // Fetch company name for template
        const companyName = req.user.name || (req.user.companyName) || "";
        // Generate certificate PDF
        const { fileName, qrDataUrl, qrText } = await generateCertificate(
          templatePath,
          {
            certId,
            name: recipient.name,
            email: recipient.email,
            courseName,
            issuedDate: new Date().toISOString().split("T")[0],
            companyName,
          },
          saveDir
        );
        const localPdfPath = path.join(saveDir, fileName);
        const { s3Url, hash, txHash, contractAddress } = await processCertificate(localPdfPath, certId);
        console.log('[Controller] processCertificate result:', { s3Url, hash, txHash, contractAddress });

        // Create certificate record
        const certificate = new Certificate({
          certId,
          recipientName: recipient.name,
          recipientEmail: recipient.email,
          userId, // <-- only set if user exists
          companyId: req.user.id,
          companyName,
          courseName,
          courseDuration: courseDuration || "",
          remarks: remarks || "Successfully Completed",
          issuedDate: new Date(),
          status: "approved",
          s3Url,
          hash,
          qrCodeUrl: qrText,
          txHash,
          contractAddress
        });

        await certificate.save();

        // Send email notification to recipient with PDF attachment
        try {
          await sendEmailSES(
            recipient.email,
            'Your Certificate is Ready',
            `<p>Signup or <a href=\"http://localhost:5173/login\">login</a> to view your certificate.</p>`,
            { path: localPdfPath, filename: fileName }
          );
        } catch (emailErr) {
          console.error('Failed to send certificate email:', emailErr);
        }

        certificates.push(certificate);
      } catch (err) {
        console.error(`Error processing recipient ${recipient.email}:`, err);
      }
    }

    // Clean up the uploaded CSV file
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: `Successfully issued ${certificates.length} certificates.`,
      failedCount: recipients.length - certificates.length,
      certificates,
    });
  } catch (error) {
    console.error("Bulk certificate issuance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to issue certificates in bulk.",
      error: error.message,
    });
  }
};

// Get all certificates issued by the company
export const getCompanyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ companyId: req.user.id })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Certificates retrieved successfully.",
      certificates,
    });
  } catch (error) {
    console.error("Error fetching company certificates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch certificates.",
      error: error.message,
    });
  }
}; 