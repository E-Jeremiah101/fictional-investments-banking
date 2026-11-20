import api from "./axios.js";

export const getPendingLoanApplications = async () => {
  const response = await api.get("/admin/loans/pending");
  return response.data;
};

export const reviewLoanApplication = async (id, payload) => {
  const response = await api.patch(`/admin/loans/${id}/review`, payload);
  return response.data;
};
