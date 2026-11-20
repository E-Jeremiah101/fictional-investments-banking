import LoanApplication, {
  LOAN_CREDIT_FACILITIES,
  LOAN_DURATION_MONTHS,
  LOAN_INCOME_RANGES,
} from "../models/LoanApplication.js";

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
});

export const createLoanApplication = async (req, res) => {
  try {
    const {
      loanAmount,
      durationMonths,
      creditFacility,
      purpose,
      monthlyNetIncome,
      acceptedTerms,
    } = req.body || {};

    const amountText = String(loanAmount ?? "").trim();
    if (!/^\d+(\.\d{1,2})?$/.test(amountText)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid loan amount with no more than two decimals.",
      });
    }

    const numericAmount = Number(amountText);
    const loanAmountCents = Math.round(numericAmount * 100);
    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      !Number.isSafeInteger(loanAmountCents)
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid loan amount in USD.",
      });
    }

    const numericDuration = Number(durationMonths);
    if (
      !Number.isInteger(numericDuration) ||
      !LOAN_DURATION_MONTHS.includes(numericDuration)
    ) {
      return res.status(400).json({
        success: false,
        message: "Select a valid loan duration.",
      });
    }

    if (!LOAN_CREDIT_FACILITIES.includes(creditFacility)) {
      return res.status(400).json({
        success: false,
        message: "Select a valid credit facility.",
      });
    }

    if (
      typeof purpose !== "string" ||
      !purpose.trim() ||
      purpose.trim().length > 2000
    ) {
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

    if (acceptedTerms !== true) {
      return res.status(400).json({
        success: false,
        message: "Accept the application terms before continuing.",
      });
    }

    const application = await LoanApplication.create({
      user: req.user._id,
      loanAmountCents,
      durationMonths: numericDuration,
      creditFacility,
      purpose: purpose.trim(),
      monthlyNetIncome,
      termsAcceptedAt: new Date(),
      isTest: true,
    });

    return res.status(201).json({
      success: true,
      message: "Your loan application has been submitted for review.",
      application: toLoanApplicationResponse(application),
    });
  } catch (error) {
    console.error("Create loan application error:", error);

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
