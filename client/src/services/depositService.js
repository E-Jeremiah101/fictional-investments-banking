import api from "./axios.js";

export const createDepositRequest = async (depositData) => {
  const formData = new FormData();

  Object.entries(depositData).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });

  const response = await api.post("/deposits", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getMyDepositRequests = async () => {
  const response = await api.get("/deposits/my-requests");
  return response.data;
};
