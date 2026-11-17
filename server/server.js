import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import depositRoutes from "./routes/depositRoutes.js";
import adminDepositRoutes from "./routes/adminDepositRoutes.js";
import atmCardRoutes from "./routes/atmCardRoutes.js";
import adminATMCardRoutes from "./routes/adminATMCardRoutes.js";
import adminTaxPinRoutes from "./routes/adminTaxPinRoutes.js";
import taxPinRoutes from "./routes/taxPinRoutes.js";
import withdrawalRoutes from "./routes/withdrawalRoutes.js";
// import adminWithdrawalRoutes from "./routes/adminWithdrawalRoutes.js";
import remittanceRoutes from "./routes/remittanceRoutes.js";
import adminRemittanceRoutes from "./routes/adminRemittanceRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import investmentRoutes from "./routes/investmentRoutes.js";
import paymentInstructionsRoutes from "./routes/paymentInstructionsRoutes.js";
import adminInvestmentRoutes from "./routes/adminInvestmentRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/deposits", depositRoutes);
app.use("/api/atm-cards", atmCardRoutes);
app.use("/api/tax-pins", taxPinRoutes);
app.use("/api/admin/deposits", adminDepositRoutes);
app.use("/api/admin/atm-cards", adminATMCardRoutes);
app.use("/api/admin/tax-pins", adminTaxPinRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
// app.use("/api/admin/withdrawals", adminWithdrawalRoutes);
app.use("/api/remittances", remittanceRoutes);
app.use("/api/admin/remittances", adminRemittanceRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/payment-instructions", paymentInstructionsRoutes);
app.use("/api/admin/investments", adminInvestmentRoutes);


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Online Banking Simulator API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
  });
});

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer();
