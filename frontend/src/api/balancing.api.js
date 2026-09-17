import { apiClient } from "./axiosClient";

// Stateless — safe to call on every keystroke (debounced by the caller)
export const previewBalancing = (payload) =>
  apiClient.put("/balancing/preview", payload).then((res) => res.data);

// Persists the record and flips the linked issuance to 'balanced'
export const createBalancing = (payload) =>
  apiClient.post("/balancing", payload).then((res) => res.data);