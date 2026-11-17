import api from "./axios.js";

// Get the customer's remittance requests
export const getMyRemittanceRequests = async () => {
  const response = await api.get("/remittances/my-requests");
  return response.data;
};

// Submit a remittance payment receipt.
export const submitRemittanceEvidence = async (id, receipt) => {
  const formData = new FormData();
  formData.append("receipt", receipt);
  const response = await api.post(
    `/remittances/${id}/payment-evidence`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return response.data;
};
