import { apiClient } from "./axiosClient";

export const login = (userId, password) =>
  apiClient.post("/auth/login", { userId: Number(userId), password }).then((res) => res.data);

export const logout = () => apiClient.post("/auth/logout").then((res) => res.data);