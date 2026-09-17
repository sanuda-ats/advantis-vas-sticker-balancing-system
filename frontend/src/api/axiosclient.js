import axios from "axios";

// Set in frontend/.env as VITE_API_BASE_URL=http://localhost:5000/api
const baseURL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({ baseURL });

// Attach the JWT to every request automatically, so individual api/*.js
// files never have to think about auth headers.
apiClient.interceptors.request.use((config) => {
  const raw = localStorage.getItem("vas_auth");
  if (raw) {
    const { token } = JSON.parse(raw);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 anywhere means the token is gone/expired/invalid — clear local
// auth state and bounce to /login rather than showing a broken page.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("vas_auth");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);