import { apiClient } from "./axiosClient";

// by: 'name' | 'id'
export const searchStickers = (q, by = "name") =>
  apiClient.get("/stickers/search", { params: { q, by } }).then((res) => res.data);

export const listStickers = (page = 1, limit = 20) =>
  apiClient.get("/stickers", { params: { page, limit } }).then((res) => res.data);

export const getStickerById = (id) =>
  apiClient.get(`/stickers/${id}`).then((res) => res.data);

export const getNextStickerId = () =>
  apiClient.get("/stickers/next-id").then((res) => res.data);

export const createSticker = (payload) =>
  apiClient.post("/stickers", payload).then((res) => res.data);

export const uploadStickerImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return apiClient
    .post("/uploads/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};