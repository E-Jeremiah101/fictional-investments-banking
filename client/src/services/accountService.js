import api from "./axios";

export const getMyAccount = async () => {
  const response = await api.get("/account/user");
  return response.data.account;
};

export const getMyTransactions = async () => {
  const response = await api.get("/transactions");
  return response.data.transactions;
};

export const getTransactionById = async (id) => {
  const response = await api.get(`/transactions/${id}`);
  return response.data.transaction;
};