import mongoose from "mongoose";
import WithdrawalRequest from "../models/WithdrawalRequest.js";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import ATMCardRequest from "../models/ATMCardRequest.js";
import TaxPin from "../models/TaxPin.js";

const SUPPORTED_ASSETS = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  USDC: "usd-coin",
  SOL: "solana",
};

const IBAN_COUNTRY_CODES = new Set(
  "AD AE AL AT AZ BA BE BG BH BI BR BY CH CR CY CZ DE DJ DK DO EE EG ES FI FK FO FR GB GE GI GL GR GT HR HU IE IL IQ IS IT JO KW KZ LB LC LI LT LU LV LY MC MD ME MK MN MR MT MU NL NO OM PK PL PS PT QA RO RS SA SC SD SE SI SK SM SO ST SV TL TN TR UA VA VG XK".split(
    " ",
  ),
);
const countryDisplayNames = new Intl.DisplayNames(["en"], { type: "region" });

const isValidUsRoutingNumber = (routingNumber) =>
  /^\d{9}$/.test(routingNumber) &&
  [...routingNumber].reduce(
    (sum, digit, index) => sum + Number(digit) * [3, 7, 1][index % 3],
    0,
  ) %
    10 ===
    0;

const isValidIban = (iban, countryCode) => {
  if (
    !new RegExp(`^${countryCode}[0-9]{2}[A-Z0-9]{11,30}$`).test(iban) ||
    iban.length < 15 ||
    iban.length > 34
  ) {
    return false;
  }

  const rearranged = `${iban.slice(4)}${iban.slice(0, 4)}`;
  let remainder = 0;

  for (const character of rearranged) {
    const digits =
      character >= "A" && character <= "Z"
        ? String(character.charCodeAt(0) - 55)
        : character;

    for (const digit of digits) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }

  return remainder === 1;
};

// Retrieve the latest available cryptocurrency price in USD.
const getCryptoUsdPrice = async (asset) => {
  const coinId = SUPPORTED_ASSETS[asset];

  if (!coinId) {
    throw new Error("Unsupported cryptocurrency.");
  }

  const url = new URL("https://api.coingecko.com/api/v3/simple/price");

  url.searchParams.set("ids", coinId);
  url.searchParams.set("vs_currencies", "usd");
  url.searchParams.set("include_last_updated_at", "true");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Cryptocurrency price service returned status ${response.status}.`,
      );
    }

    const data = await response.json();
    const coinData = data[coinId];

    const price = Number(coinData?.usd);
    const updatedAt = Number(coinData?.last_updated_at);

    if (!Number.isFinite(price) || price <= 0) {
      throw new Error("Unable to retrieve a valid cryptocurrency price.");
    }

    if (!Number.isFinite(updatedAt) || updatedAt <= 0) {
      throw new Error("Cryptocurrency price timestamp is unavailable.");
    }

    // Do not accept a price older than two minutes.
    const priceAge = Date.now() / 1000 - updatedAt;

    if (priceAge > 120 || priceAge < -30) {
      throw new Error(
        "The cryptocurrency price is outdated. Please try again shortly.",
      );
    }

    return {
      price,
      updatedAt: new Date(updatedAt * 1000),
    };
  } finally {
    clearTimeout(timeout);
  }
};

export const createWithdrawalRequest = async (req, res) => {
  const {
    amount,
    method,
    bankName,
    bankAccountName,
    bankAccountNumber,
    recipientCountry,
    bankRoutingNumber,
    bankIban,
    bankSwiftBic,
    asset,
    network,
    walletAddress,
  } = req.body;

  try {
    // Validate the withdrawal amount in USD.
    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      !Number.isSafeInteger(Math.round(numericAmount * 100))
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid withdrawal amount in USD.",
      });
    }

    const amountCents = Math.round(numericAmount * 100);
    let bankTransferDetails = null;

    // Validate withdrawal method.
    if (!["bank_transfer", "crypto"].includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Choose a valid withdrawal method.",
      });
    }

    // Validate bank transfer details.
    if (method === "bank_transfer") {
      const countryCode = String(recipientCountry || "")
        .trim()
        .toUpperCase();
      const accountNumber = String(bankAccountNumber || "").trim();
      const routingNumber = String(bankRoutingNumber || "").trim();
      const iban = String(bankIban || "")
        .replace(/\s/g, "")
        .toUpperCase();
      const swiftBic = String(bankSwiftBic || "")
        .replace(/\s/g, "")
        .toUpperCase();

      if (
        !bankName?.trim() ||
        !bankAccountName?.trim() ||
        !/^[A-Z]{2}$/.test(countryCode) ||
        !countryDisplayNames.of(countryCode) ||
        countryDisplayNames.of(countryCode) === countryCode
      ) {
        return res.status(400).json({
          success: false,
          message: "Provide a valid destination country and bank details.",
        });
      }

      if (countryCode === "US") {
        if (
          !/^\d{4,17}$/.test(accountNumber) ||
          !isValidUsRoutingNumber(routingNumber)
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Provide a valid US account number and 9-digit ABA routing number.",
          });
        }
      } else if (IBAN_COUNTRY_CODES.has(countryCode)) {
        if (
          !isValidIban(iban, countryCode) ||
          !/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?$/.test(swiftBic)
        ) {
          return res.status(400).json({
            success: false,
            message: "Provide a valid destination IBAN and SWIFT/BIC.",
          });
        }
      } else if (
        !/^[A-Za-z0-9][A-Za-z0-9 .-]{2,33}$/.test(accountNumber) ||
        !/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?$/.test(swiftBic)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Provide a valid destination account number and SWIFT/BIC.",
        });
      }

      bankTransferDetails = {
        bankName: bankName.trim(),
        bankAccountName: bankAccountName.trim(),
        bankAccountNumber:
          countryCode === "US" || !IBAN_COUNTRY_CODES.has(countryCode)
            ? accountNumber
            : "",
        recipientCountry: countryCode,
        bankRoutingNumber: countryCode === "US" ? routingNumber : "",
        bankIban: IBAN_COUNTRY_CODES.has(countryCode) ? iban : "",
        bankSwiftBic: countryCode === "US" ? "" : swiftBic,
      };
    }

    // Validate cryptocurrency details.
    if (method === "crypto") {
      const selectedAsset = String(asset || "").toUpperCase();

      if (!SUPPORTED_ASSETS[selectedAsset]) {
        return res.status(400).json({
          success: false,
          message: "Select a supported cryptocurrency.",
        });
      }

      if (!network?.trim() || !walletAddress?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Provide the crypto network and wallet address.",
        });
      }
    }

    // Find the customer's active simulation account.
    const account = await Account.findOne({
      user: req.user._id,
      accountStatus: "active",
      isTest: true,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Your active simulation account could not be found.",
      });
    }

    // Check the available balance without deducting anything.
    if (amountCents > account.balanceCents) {
      return res.status(400).json({
        success: false,
        message: "Insufficient available balance.",
      });
    }

    let exchangeRateUsd = null;
    let cryptoAmount = null;
    let exchangeRateUpdatedAt = null;
    let selectedAsset = "";

    if (method === "crypto") {
      selectedAsset = String(asset).toUpperCase();

      // Get the latest available price from CoinGecko.
      const quote = await getCryptoUsdPrice(selectedAsset);

      exchangeRateUsd = quote.price;
      exchangeRateUpdatedAt = quote.updatedAt;

      // Convert the requested USD amount into cryptocurrency.
      const usdAmount = amountCents / 100;
      cryptoAmount = (usdAmount / exchangeRateUsd).toFixed(12);
    }

    const session = await mongoose.startSession();

    try {
      let createdWithdrawal;
      let createdTransaction;

      await session.withTransaction(async () => {
        // Recheck the account inside the transaction.
        const currentAccount = await Account.findOne({
          _id: account._id,
          user: req.user._id,
          accountStatus: "active",
          isTest: true,
        }).session(session);

        if (!currentAccount) {
          throw new Error("Your active simulation account could not be found.");
        }

        if (amountCents > currentAccount.balanceCents) {
          throw new Error("Insufficient available balance.");
        }

        const [withdrawal] = await WithdrawalRequest.create(
          [
            {
              user: req.user._id,
              account: currentAccount._id,
              amountCents,
              currency: "USD",
              method,

              ...(method === "bank_transfer"
                ? bankTransferDetails
                : {
                    bankName: "",
                    bankAccountName: "",
                    bankAccountNumber: "",
                    recipientCountry: "",
                    bankRoutingNumber: "",
                    bankIban: "",
                    bankSwiftBic: "",
                  }),

              asset: selectedAsset,
              network: method === "crypto" ? network.trim() : "",
              walletAddress: method === "crypto" ? walletAddress.trim() : "",

              exchangeRateUsd,
              cryptoAmount,
              exchangeRateUpdatedAt,

              status: "pending",
              isTest: true,
            },
          ],
          { session },
        );

        const [transaction] = await Transaction.create(
          [
            {
              account: currentAccount._id,
              user: req.user._id,
              type: "withdrawal",
              description: "Pending simulated withdrawal request",
              amountCents,
              currency: "USD",
              status: "pending",
              source: method,
              isTest: true,
            },
          ],
          { session },
        );

        //this place 
        withdrawal.transaction = transaction._id;

        await withdrawal.save({ session });

        createdWithdrawal = withdrawal;
        createdTransaction = transaction;
      });

      

      return res.status(201).json({
        success: true,
        message:
          "Your simulated withdrawal request has been submitted and is awaiting review.",
        withdrawal: {
          id: createdWithdrawal._id,
          amount: createdWithdrawal.amountCents / 100,
          amountCents: createdWithdrawal.amountCents,
          currency: createdWithdrawal.currency,
          method: createdWithdrawal.method,
          asset: createdWithdrawal.asset,
          network: createdWithdrawal.network,
          walletAddress: createdWithdrawal.walletAddress,
          exchangeRateUsd: createdWithdrawal.exchangeRateUsd,
          cryptoAmount: createdWithdrawal.cryptoAmount,
          exchangeRateUpdatedAt: createdWithdrawal.exchangeRateUpdatedAt,
          status: createdWithdrawal.status,
          transactionId: createdTransaction._id,
          createdAt: createdWithdrawal.createdAt,
        },
      });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error("Create withdrawal request error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to submit your withdrawal request.",
    });
  }
};

export const getMyWithdrawalRequests = async (req, res) => {
  try {
    const withdrawals = await WithdrawalRequest.find({
      user: req.user._id,
      isTest: true,
    })
      .populate("atmCardRequest")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      withdrawals: withdrawals.map((withdrawal) => ({
        id: withdrawal._id,
        amount: withdrawal.amountCents / 100,
        amountCents: withdrawal.amountCents,
        currency: withdrawal.currency,
        method: withdrawal.method,

        bankName: withdrawal.bankName,
        bankAccountName: withdrawal.bankAccountName,
        bankAccountNumber: withdrawal.bankAccountNumber,
        recipientCountry: withdrawal.recipientCountry,
        bankRoutingNumber: withdrawal.bankRoutingNumber,
        bankIban: withdrawal.bankIban,
        bankSwiftBic: withdrawal.bankSwiftBic,
        transactionId: withdrawal.transaction,

        asset: withdrawal.asset,
        network: withdrawal.network,
        walletAddress: withdrawal.walletAddress,
        exchangeRateUsd: withdrawal.exchangeRateUsd,
        cryptoAmount: withdrawal.cryptoAmount,
        exchangeRateUpdatedAt: withdrawal.exchangeRateUpdatedAt,

        status: withdrawal.status,
        reviewNote: withdrawal.reviewNote,
        atmCardRequest: withdrawal.atmCardRequest,
        createdAt: withdrawal.createdAt,
        reviewedAt: withdrawal.reviewedAt,
      })),
    });
  } catch (error) {
    console.error("Get withdrawal requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your withdrawal requests.",
    });
  }
};

export const getPendingWithdrawalRequests = async (req, res) => {
  try {
    const withdrawals = await WithdrawalRequest.find({
      status: "tax_pin_verified",
      isTest: true,
    })
      .populate("user", "firstName lastName email")
      .populate("account", "accountNumber accountName balanceCents currency")
      .populate("atmCardRequest")
      .populate("transaction")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: withdrawals.length,
      withdrawals,
    });
  } catch (error) {
    console.error("Get pending withdrawals error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve pending withdrawal requests.",
    });
  }
};


export const reviewWithdrawalRequest = async (req, res) => {
  const { id } = req.params;
  const { action, reviewNote = "" } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid withdrawal request ID.",
    });
  }

  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({
      success: false,
      message: "Action must be approve or reject.",
    });
  }

  if (typeof reviewNote !== "string" || reviewNote.trim().length > 300) {
    return res.status(400).json({
      success: false,
      message: "Review note must not exceed 300 characters.",
    });
  }

  const session = await mongoose.startSession();

  try {
    let reviewedWithdrawal;

    await session.withTransaction(async () => {
      const withdrawal = await WithdrawalRequest.findOne({
        _id: id,
        status: "tax_pin_verified",
        isTest: true,
      }).session(session);

      if (!withdrawal) {
        throw new Error("Withdrawal request not found or already reviewed.");
      }

      const account = await Account.findOne({
        _id: withdrawal.account,
        user: withdrawal.user,
        accountStatus: "active",
        isTest: true,
      }).session(session);

      if (!account) {
        throw new Error(
          "The customer's simulation account is unavailable or inactive.",
        );
      }

      const atmRequest = await ATMCardRequest.findOne({
        _id: withdrawal.atmCardRequest,
        user: withdrawal.user,
        withdrawalRequest: withdrawal._id,
        status: "approved",
        paymentStatus: "approved",
        isTest: true,
      }).session(session);

      if (!atmRequest) {
        throw new Error("The ATM card request has not been approved.");
      }

      const taxPin = await TaxPin.findOne({
        withdrawalRequest: withdrawal._id,
        user: withdrawal.user,
        status: "verified",
        isTest: true,
      }).session(session);

      if (!taxPin) {
        throw new Error("The tax PIN has not been verified.");
      }

      const transaction = await Transaction.findOne({
        _id: withdrawal.transaction,
        user: withdrawal.user,
        account: withdrawal.account,
        type: "withdrawal",
        status: "pending",
        isTest: true,
      }).session(session);

      if (!transaction) {
        throw new Error(
          "The linked pending withdrawal transaction was not found.",
        );
      }

      if (
        !Number.isSafeInteger(withdrawal.amountCents) ||
        withdrawal.amountCents <= 0 ||
        transaction.amountCents !== withdrawal.amountCents
      ) {
        throw new Error(
          "The withdrawal amount or transaction record is invalid.",
        );
      }

      if (action === "approve") {
        if (account.balanceCents < withdrawal.amountCents) {
          throw new Error("Insufficient simulation account balance.");
        }

        account.balanceCents -= withdrawal.amountCents;
        await account.save({ session });

        withdrawal.status = "approved";
        transaction.status = "completed";
      } else {
        withdrawal.status = "rejected";
        transaction.status = "rejected";
        transaction.rejectionReason =
          reviewNote.trim() || "Withdrawal rejected by administrator.";
      }

      withdrawal.reviewedBy = req.user._id;
      withdrawal.reviewedAt = new Date();
      withdrawal.reviewNote = reviewNote.trim();

      transaction.reviewedBy = req.user._id;
      transaction.reviewedAt = new Date();

      await withdrawal.save({ session });
      await transaction.save({ session });

      reviewedWithdrawal = withdrawal;
    });

    return res.status(200).json({
      success: true,
      message:
        action === "approve"
          ? "Simulated withdrawal approved successfully."
          : "Withdrawal request rejected successfully.",
      withdrawal: reviewedWithdrawal,
    });
  } catch (error) {
    console.error("Review withdrawal error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to review withdrawal request.",
    });
  } finally {
    await session.endSession();
  }
};
