import api from "./axios.js";

export const getPendingRemittanceRequests = async () => {
  const response = await api.get("/admin/remittances/pending");
  return response.data;
};

export const reviewRemittanceRequest = async (id, payload) => {
  const response = await api.patch(`/admin/remittances/${id}/review`, payload);

  return response.data;
};
 