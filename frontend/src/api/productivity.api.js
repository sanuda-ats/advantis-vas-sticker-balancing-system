import { apiClient } from "./axiosClient";

const buildParams = (date, location, stickerId) => {
  const params = {};
  if (date) params.date = date;
  if (location) params.location = location;
  if (stickerId) params.stickerId = stickerId;
  return params;
};

export const getProductivity = (date, location, stickerId) =>
  apiClient
    .get("/productivity", { params: buildParams(date, location, stickerId) })
    .then((res) => res.data);

// Returns a raw Blob — the response is a streamed .xlsx file, not JSON.
// A manual fetch header (Authorization) is required since this can't be
// a plain <a href> download; the endpoint is protected.
export const exportProductivity = async (date, location, stickerId) => {
  const response = await apiClient.get("/productivity/export", {
    params: buildParams(date, location, stickerId),
    responseType: "blob",
  });
  return response.data;
};