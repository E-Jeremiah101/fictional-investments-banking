import api from "./axios.js";

export const getPaymentInstructions = async () => {
  const response = await api.get("/payment-instructions");
  return response.data.instructions;
};

export const updatePaymentInstructions = async (payload) => {
  const response = await api.put("/payment-instructions", payload);
  return response.data;
};
