import api from "./axios.js";

export const getMyInvestments = async () => {
  const response = await api.get("/investments");
  return response.data.investment;
};

export const requestTradingActivation = async () => {
  const response = await api.post("/investments/activate");
  return response.data;
};

export const getAdminInvestors = async () => {
  const response = await api.get("/admin/investments");
  return response.data.investors;
};

export const adjustInvestorEarnings = async (id, payload) => {
  const response = await api.post(
    `/admin/investments/${id}/earnings-adjustments`,
    payload,
  );
  return response.data;
};
