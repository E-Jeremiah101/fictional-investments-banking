
import axios from 'axios'

// const api = axios.create({
//   baseURL: 'http://localhost:5000/api',
//   withCredentials: true,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// })

// export default api
const api = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "/api" : "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
