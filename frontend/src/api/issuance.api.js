import { apiClient } from "./axiosClient";

export const createIssuance = (payload) =>
  apiClient.post("/issuance", payload).then((res) => res.data);

export const getPendingIssuance = (location) =>
  apiClient.get("/issuance/pending", { params: { location } }).then((res) => res.data);

export const getIssuanceById = (id) =>
  apiClient.get(`/issuance/${id}`).then((res) => res.data);