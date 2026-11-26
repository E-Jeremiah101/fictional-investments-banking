import LoanApplication, {
  LOAN_CREDIT_FACILITIES,
  LOAN_DURATION_MONTHS,
  LOAN_INCOME_RANGES,
} from "../models/LoanApplication.js";
import {
  deleteCloudinaryAsset,
  uploadBufferToCloudinary,
} from "../utils/cloudinaryUpload.js";

const fileResponse = (f) =>
  f
    ? {
        originalName: f.originalName,
        mimeType: f.mimeType,
        sizeBytes: f.sizeBytes,
      }
    : null;

const toLoanApplicationResponse = (application) => ({
  id: application._id,
  loanAmountCents: application.loanAmountCents,
  loanAmount: application.loanAmountCents / 100,
  durationMonths: application.durationMonths,
  creditFacility: application.creditFacility,
  purpose: application.purpose,
  monthlyNetIncome: application.monthlyNetIncome,
  status: application.status,
  reviewNote: application.reviewNote || "",
  reviewedAt: application.reviewedAt,
  createdAt: application.createdAt,
  governmentId: fileResponse(application.governmentId),
  atmCardFront: fileResponse(application.atmCardFront),
  atmCardBack: fileResponse(application.atmCardBack),
});

const VALID_MIME = ["image/jpeg", "image/png", "application/pdf"];
const MAX_BYTES = 5 * 1024 * 1024;

const validateUpload = (file, label) => {
  if (!file) return `Upload the ${label} to continue.`;
  if (!VALID_MIME.includes(file.mimetype))
    return `${label} must be a JPG, PNG or PDF file.`;
  if (file.size > MAX_BYTES) return `${label} must be 5MB or smaller.`;
  return null;
};

export const createLoanApplication = async (req, res) => {
  const governmentIdFile = req.files?.governmentId?.[0];
  const atmFrontFile = req.files?.atmCardFront?.[0];
  const atmBackFile = req.files?.atmCardBack?.[0];

  const fileError =
    validateUpload(governmentIdFile, "government-issued ID") ||
    validateUpload(atmFrontFile, "front of your ATM card") ||
    validateUpload(atmBackFile, "back of your ATM card");

  if (fileError) {
    return res.status(400).json({ success: false, message: fileError });
  }

  const { loanAmount, durationMonths, creditFacility, purpose, monthlyNetIncome, acceptedTerms } =
    req.body || {};

  // ----- field validation (unchanged from before) -----
  const amountText = String(loanAmount ?? "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(amountText)) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid loan amount with no more than two decimals.",
    });
  }
  const numericAmount = Number(amountText);
  const loanAmountCents = Math.round(numericAmount * 100);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0 || !Number.isSafeInteger(loanAmountCents)) {
    return res.status(400).json({ success: false, message: "Enter a valid loan amount in USD." });
  }
  const numericDuration = Number(durationMonths);
  if (!Number.isInteger(numericDuration) || !LOAN_DURATION_MONTHS.includes(numericDuration)) {
    return res.status(400).json({ success: false, message: "Select a valid loan duration." });
  }
  if (!LOAN_CREDIT_FACILITIES.includes(creditFacility)) {
    return res.status(400).json({ success: false, message: "Select a valid credit facility." });
  }
  if (typeof purpose !== "string" || !purpose.trim() || purpose.trim().length > 2000) {
    return res.status(400).json({
      success: false,
      message: "Enter a loan purpose of 2,000 characters or fewer.",
    });
  }
  if (!LOAN_INCOME_RANGES.includes(monthlyNetIncome)) {
    return res.status(400).json({
      success: false,
      message: "Select a valid monthly net income range.",
    });
  }
  const acceptedTermsBool = acceptedTerms === true || acceptedTerms === "true";
  if (!acceptedTermsBool) {
    return res.status(400).json({
      success: false,
      message: "Accept the application terms before continuing.",
    });
  }

  // ----- upload all three files to Cloudinary -----
  const uploaded = {};
  try {
    const stamp = Date.now();
    const userId = req.user._id;

    uploaded.governmentId = await uploadBufferToCloudinary(governmentIdFile.buffer, {
      folder: "loan-government-ids",
      public_id: `loan-id-${userId}-${stamp}`,
    });
    uploaded.atmCardFront = await uploadBufferToCloudinary(atmFrontFile.buffer, {
      folder: "loan-atm-cards",
      public_id: `loan-atm-front-${userId}-${stamp}`,
    });
    uploaded.atmCardBack = await uploadBufferToCloudinary(atmBackFile.buffer, {
      folder: "loan-atm-cards",
      public_id: `loan-atm-back-${userId}-${stamp}`,
    });

    const toMeta = (file, result) => ({
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      publicId: result.public_id,
      secureUrl: result.secure_url,
    });

    const application = await LoanApplication.create({
      user: userId,
      loanAmountCents,
      durationMonths: numericDuration,
      creditFacility,
      purpose: purpose.trim(),
      monthlyNetIncome,
      termsAcceptedAt: new Date(),
      governmentId: toMeta(governmentIdFile, uploaded.governmentId),
      atmCardFront: toMeta(atmFrontFile, uploaded.atmCardFront),
      atmCardBack: toMeta(atmBackFile, uploaded.atmCardBack),
      isTest: true,
    });

    return res.status(201).json({
      success: true,
      message: "Your loan application has been submitted for review.",
      application: toLoanApplicationResponse(application),
    });
  } catch (error) {
    console.error("Create loan application error:", error);
    // Roll back whichever uploads made it to Cloudinary.
    await Promise.all([
      deleteCloudinaryAsset(uploaded.governmentId?.public_id),
      deleteCloudinaryAsset(uploaded.atmCardFront?.public_id),
      deleteCloudinaryAsset(uploaded.atmCardBack?.public_id),
    ]);
    return res.status(500).json({
      success: false,
      message: "Unable to submit your loan application.",
    });
  }
};

export const getMyLoanApplications = async (req, res) => {
  try {
    const applications = await LoanApplication.find({
      user: req.user._id,
      isTest: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      applications: applications.map(toLoanApplicationResponse),
    });
  } catch (error) {
    console.error("Get loan applications error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your loan applications.",
    });
  }
};