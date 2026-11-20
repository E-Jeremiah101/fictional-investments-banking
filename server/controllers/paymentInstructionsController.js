import PaymentInstructions from "../models/PaymentInstructions.js";

const INSTRUCTION_FIELD_LIMITS = {
  walletName: 80,
  walletAddress: 200,
  bankName: 100,
  bankAccountName: 100,
  bankAccountNumber: 50,
  bankRoutingNumber: 50,
  bankSwiftCode: 30,
};
const INSTRUCTION_FIELDS = Object.keys(INSTRUCTION_FIELD_LIMITS);

export const getPaymentInstructions = async (req, res) => {
  try {
    const instructions = await PaymentInstructions.findOne({
      key: "default",
    })
      .select(INSTRUCTION_FIELDS.join(" "))
      .lean();
    return res.status(200).json({ success: true, instructions });
  } catch (error) {
    console.error("Get payment instructions error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve payment instructions.",
    });
  }
};

export const updatePaymentInstructions = async (req, res) => {
  const updates = {};
  const body = req.body || {};

  for (const field of INSTRUCTION_FIELDS) {
    if (body[field] === undefined) continue;
    if (
      typeof body[field] !== "string" ||
      body[field].length > INSTRUCTION_FIELD_LIMITS[field]
    ) {
      return res.status(400).json({
        success: false,
        message: `${field} must be a text value no longer than ${INSTRUCTION_FIELD_LIMITS[field]} characters.`,
      });
    }
    updates[field] = body[field].trim();
  }

  try {
    const instructions = await PaymentInstructions.findOneAndUpdate(
      { key: "default" },
      { $set: updates, $setOnInsert: { key: "default" } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).select(INSTRUCTION_FIELDS.join(" "));

    return res.status(200).json({
      success: true,
      message: "Payment instructions updated.",
      instructions,
    });
  } catch (error) {
    console.error("Update payment instructions error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update payment instructions.",
    });
  }
};
