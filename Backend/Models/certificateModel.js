import mongoose from "mongoose";

const CertificateSchema = new mongoose.Schema(
  {
    certId: {
      type: String,
      required: true,
      unique: true,
    },

    recipientName: {
      type: String,
      required: true,
    },

    recipientEmail: {
      type: String,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },

    companyName: {
      type: String,
      default: "",
    },

    courseName: {
      type: String,
      required: true,
    },

    courseDuration: {
      type: String,
      default: "",
    },

    remarks: {
      type: String,
      default: "Successfully Completed",
    },

    issuedDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["approved", "rejected", "pending"],
      default: "pending",
    },

    pdfUrl: {
      type: String,
      default: "",
    },

    qrCodeUrl: {
      type: String,
      default: "",
    },

    s3Url: String,
    hash: String,
    // Blockchain integration fields
    txHash: { type: String, default: "" },
    contractAddress: { type: String, default: "" },
    tokenId: { type: String, default: "" },
  },
  { timestamps: true }
);

const Certificate = mongoose.model("Certificate", CertificateSchema);
export default Certificate;
