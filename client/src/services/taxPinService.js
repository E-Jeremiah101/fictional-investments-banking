import api from "./axios.js";

// Get the customer's Tax PIN payment and verification stages.
export const getMyTaxPinRequests = async () => {
  const response = await api.get("/tax-pins/my-requests");
  return response.data;
};

// Submit fictional demonstration evidence for the Tax PIN fee.
export const submitTaxPinPaymentEvidence = async (withdrawalId, receipt) => {
  const formData = new FormData();
  formData.append("withdrawalId", withdrawalId);
  formData.append("receipt", receipt);
  const response = await api.post("/tax-pins/payment-evidence", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Get withdrawals whose approved ATM card is ready for Tax PIN generation.
export const getWithdrawalsReadyForTaxPin = async () => {
  const response = await api.get("/admin/tax-pins/pending");
  return response.data;
};

// Approve or reject a Tax PIN payment evidence submission.
export const reviewTaxPinPayment = async (id, payload) => {
  const response = await api.patch(`/admin/tax-pins/${id}/review`, payload);
  return response.data;
};

// Generate a Tax PIN for an approved withdrawal.
export const generateTaxPin = async (withdrawalId) => {
  const response = await api.post("/admin/tax-pins/generate", {
    withdrawalId,
  });
  return response.data;
};

// Verify the customer's Tax PIN
export const verifyTaxPin = async (payload) => {
  const response = await api.post("/tax-pins/verify", payload);
  return response.data;
};
