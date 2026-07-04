import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createClient } from "redis";

import blogRoutes from "./routes/blog.js";
import { startCacheConsumer } from "./utils/consumer.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5002;

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// Redis Event Listeners
redisClient.on("connect", () => {
  console.log("🔄 Connecting to Redis...");
});

redisClient.on("ready", () => {
  console.log("✅ Redis is ready");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Error:", err);
});

redisClient.on("reconnecting", () => {
  console.log("♻️ Redis reconnecting...");
});

redisClient.on("end", () => {
  console.log("🔌 Redis connection closed");
});

app.use("/api/v1", blogRoutes);

async function startServer() {
  try {
    await redisClient.connect();
    console.log("✅ Connected to Redis");

    await startCacheConsumer();

    app.listen(port, () => {
      console.log(`🚀 Server is running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();