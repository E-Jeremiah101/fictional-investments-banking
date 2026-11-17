import api from "./axios.js";

// Create an ATM card request
export const createATMCardRequest = async (payload) => {
  const response = await api.post("/atm-cards", payload);
  return response.data;
};

// Submit an ATM card payment receipt.
export const submitATMCardPayment = async (id, receipt) => {
  const formData = new FormData();
  formData.append("receipt", receipt);
  const response = await api.post(`/atm-cards/${id}/payment`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Get the customer's ATM card requests
export const getMyATMCardRequests = async () => {
  const response = await api.get("/atm-cards/my-requests");
  return response.data;
};
