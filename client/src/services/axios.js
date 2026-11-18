
import axios from 'axios'
import { beginLoading, endLoading } from "./loadingTracker.js";

// const api = axios.create({
//   baseURL: 'http://localhost:5000/api',
//   withCredentials: true,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// })

// export default api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const trackedRequests = new WeakSet();

api.interceptors.request.use((config) => {
  trackedRequests.add(config);
  beginLoading();
  return config;
});

const finishLoading = (config) => {
  if (config && trackedRequests.delete(config)) {
    endLoading();
  }
};

api.interceptors.response.use(
  (response) => {
    finishLoading(response.config);
    return response;
  },
  (error) => {
    finishLoading(error.config);
    return Promise.reject(error);
  },
);

export default api;
