import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoutes from "./src/routes/auth.routes.js";
import connectToDB from "./src/db/db.js";

dotenv.config();

const app = express();
connectToDB();

app.use(express.json());
app.use(cookieParser());

// 👉 User register route here
app.use("/api/auth", authRoutes);

app.listen(process.env.PORT || 3000, () =>
  console.log(`🚀 Server running on ${process.env.PORT}`),
);
