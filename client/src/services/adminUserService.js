import api from "./axios.js";

export const getAdminUsers = async (page = 1) => {
  const response = await api.get("/admin/users", { params: { page } });
  return response.data;
};

export const getAdminUserDetails = async (id) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

export const adjustAdminUserBalance = async (id, payload) => {
  const response = await api.post(
    `/admin/users/${id}/balance-adjustments`,
    payload,
  );
  return response.data;
};

export const deactivateAdminUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const getAdminTransactions = async (page = 1) => {
  const response = await api.get("/admin/users/transactions", {
    params: { page },
  });

  return response.data;
};
