
import mongoose from "mongoose";
import LoanApplication from "../models/LoanApplication.js";

const fileMeta = (f) =>
  f
    ? {
        originalName: f.originalName,
        mimeType: f.mimeType,
        sizeBytes: f.sizeBytes,
      }
    : null;

const toAdminLoanResponse = (application) => ({
  id: application._id,
  user: application.user
    ? {
        id: application.user._id,
        firstName: application.user.firstName,
        lastName: application.user.lastName,
        email: application.user.email,
      }
    : null,
  loanAmountCents: application.loanAmountCents,
  loanAmount: application.loanAmountCents / 100,
  durationMonths: application.durationMonths,
  creditFacility: application.creditFacility,
  purpose: application.purpose,
  monthlyNetIncome: application.monthlyNetIncome,
  status: application.status,
  reviewNote: application.reviewNote,
  createdAt: application.createdAt,
  governmentId: fileMeta(application.governmentId),
  atmCardFront: fileMeta(application.atmCardFront),
  atmCardBack: fileMeta(application.atmCardBack),
});

export const getPendingLoanApplications = async (req, res) => {
  try {
    const applications = await LoanApplication.find({
      status: "pending",
      isTest: true,
    })
      .populate("user", "firstName lastName email")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      applications: applications.map(toAdminLoanResponse),
    });
  } catch (error) {
    console.error("Get pending loan applications error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve pending loan applications.",
    });
  }
};

export const reviewLoanApplication = async (req, res) => {
  const { decision, reviewNote = "" } = req.body || {};

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid loan application ID." });
  }
  if (!["approve", "reject"].includes(decision)) {
    return res.status(400).json({ success: false, message: "Decision must be approve or reject." });
  }
  if (typeof reviewNote !== "string" || reviewNote.trim().length > 500) {
    return res.status(400).json({ success: false, message: "Review note must be 500 characters or fewer." });
  }

  try {
    const application = await LoanApplication.findOneAndUpdate(
      { _id: req.params.id, status: "pending", isTest: true },
      {
        $set: {
          status: decision === "approve" ? "approved" : "rejected",
          reviewNote: reviewNote.trim(),
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    ).populate("user", "firstName lastName email");

    if (!application) {
      return res.status(404).json({ success: false, message: "Pending loan application not found." });
    }

    return res.status(200).json({
      success: true,
      message:
        decision === "approve"
          ? "Simulated loan application approved for follow-up."
          : "Simulated loan application rejected.",
      application: toAdminLoanResponse(application),
    });
  } catch (error) {
    console.error("Review loan application error:", error);
    return res.status(500).json({ success: false, message: "Unable to review this loan application." });
  }
};

// Returns the stored public URL for one of: governmentId | atmCardFront | atmCardBack
export const downloadLoanApplicationImage = async (req, res) => {
  const { field } = req.params;
  const allowed = ["governmentId", "atmCardFront", "atmCardBack"];

  if (!allowed.includes(field)) {
    return res.status(400).json({
      success: false,
      message: "Field must be governmentId, atmCardFront or atmCardBack.",
    });
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid loan application ID." });
  }

  try {
    const application = await LoanApplication.findById(req.params.id, field);
    const file = application?.[field];

    if (!file?.secureUrl) {
      return res.status(404).json({
        success: false,
        message: `No ${field} on file for this application.`,
      });
    }

    return res.status(200).json({
      success: true,
      url: file.secureUrl,
      originalName: file.originalName,
      mimeType: file.mimeType,
    });
  } catch (error) {
    console.error("Download loan application image error:", error);
    return res.status(500).json({ success: false, message: "Unable to retrieve the uploaded image." });
  }
};