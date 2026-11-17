import api from "./axios.js";

// Get simulated ATM card requests awaiting administrator review.
export const getPendingATMCardRequests = async () => {
  const response = await api.get("/admin/atm-cards/pending");
  return response.data;
};

// Approve or reject a simulated ATM card request.
export const reviewATMCardRequest = async (id, action, reviewNote) => {
  const response = await api.patch(`/admin/atm-cards/${id}/review`, {
    action,
    reviewNote,
  });

  return response.data;
};
