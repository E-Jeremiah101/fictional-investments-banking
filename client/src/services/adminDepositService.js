import api from "./axios";

export const getPendingDeposits = async () => {
  const response = await api.get("/admin/deposits/pending");
  return response.data;
};

export const reviewDeposit = async (id, action, reviewNote = "") => {
  const response = await api.patch(`/admin/deposits/${id}/review`, {
    action,
    reviewNote,
  });

  return response.data;
};
