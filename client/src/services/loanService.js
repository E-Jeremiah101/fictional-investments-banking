import api from "./axios.js";

export const createLoanApplication = async (payload) => {
  const response = await api.post("/loans", payload);
  return response.data;
};

export const getMyLoanApplications = async () => {
  const response = await api.get("/loans/my-applications");
  return response.data;
};