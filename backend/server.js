import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import stickerRoutes from "./routes/stickers.routes.js";
import uploadRoutes from "./routes/uploads.routes.js";
import issuanceRoutes from "./routes/issuance.routes.js";
import balancingRoutes from "./routes/balancing.routes.js";
import productivityRoutes from "./routes/productivity.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Serves uploaded sticker photos, e.g. http://localhost:5000/uploads/xyz.jpg
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/", (req, res) => {
  res.send("Server is ready!");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stickers", stickerRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/issuance", issuanceRoutes);
app.use("/api/balancing", balancingRoutes);
app.use("/api/productivity", productivityRoutes);

// Must be registered LAST — after every real route
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  connectDB();
  console.log(`Server started at http://localhost:${PORT}`);
});