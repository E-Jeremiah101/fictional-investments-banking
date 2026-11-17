import multer from "multer";

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      const error = new Error("Upload a JPG, PNG, WEBP, or PDF receipt.");
      error.statusCode = 400;
      callback(error);
      return;
    }

    callback(null, true);
  },
});

export const uploadPaymentReceipt = (req, res, next) => {
  upload.single("receipt")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    const statusCode =
      error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE"
        ? 413
        : error.statusCode || 400;

    return res.status(statusCode).json({
      success: false,
      message:
        statusCode === 413
          ? "Receipt file must be 5 MB or smaller."
          : error.message || "Unable to process the uploaded receipt.",
    });
  });
};

export const getPaymentReceiptMimeType = (buffer) => {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    )
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  if (buffer.toString("ascii", 0, 5) === "%PDF-") {
    return "application/pdf";
  }

  return "";
};

export const sanitizeReceiptFileName = (fileName) =>
  fileName
    .replace(/[^\w.-]/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 150) || "payment-receipt";
