import api from "./axios.js";

// Create a new withdrawal request
export const createWithdrawalRequest = async (payload) => {
  const response = await api.post("/withdrawals", payload);
  return response.data;
};

// Get the customer's withdrawal request history
export const getMyWithdrawalRequests = async () => {
  const response = await api.get("/withdrawals/my-requests");
  return response.data;
};
