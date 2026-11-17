import Account from "../models/Account.js";

export const getMyAccount = async (req, res) => {
  try {
    const account = await Account.findOne({
      user: req.user._id,
      isTest: true,
    }).select(
      "accountNumber accountName accountType accountCategory currency balanceCents earningsCents tradingStatus accountStatus isTest createdAt",
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Your account could not be found.",
      });
    }

    return res.status(200).json({
      success: true,
      account: {
        id: account._id,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        accountType: account.accountType,
        accountCategory: account.accountCategory,
        currency: account.currency,
        balanceCents: account.balanceCents,
        balance: account.balanceCents / 100,
        earningsCents: account.earningsCents || 0,
        earnings: (account.earningsCents || 0) / 100,
        tradingStatus: account.tradingStatus || "inactive",
        accountStatus: account.accountStatus,
        isTest: account.isTest,
        createdAt: account.createdAt,
        profile: {
          phoneNumber: req.user.phoneNumber,
          houseAddress: req.user.houseAddress,
          city: req.user.city,
          state: req.user.state,
          zipCode: req.user.zipCode,
          country: req.user.country,
        },
      },
    });
  } catch (error) {
    console.error("Get account error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your account information.",
    });
  }
};
