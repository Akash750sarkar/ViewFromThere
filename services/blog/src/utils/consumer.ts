import amqp from "amqplib";
import { redisClient } from "../server";

interface CacheInvalidationMessage {
  action: string;
  keys: string[];
}

export const startCacheConsumer = async () => {
  try {
    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: process.env.RABBITMQ_HOST || "localhost",
      port: 5672,
      username: "admin",
      password: "admin123",
    });

    const channel = await connection.createChannel();
    const queueName = "cache-invalidation";

    await channel.assertQueue(queueName, { durable: true });

    console.log("✅ Blog Service Cache Consumer Started");

    channel.consume(queueName, async (msg) => {
      if (!msg) return;

      try {
        const content = JSON.parse(
          msg.content.toString(),
        ) as CacheInvalidationMessage;

        console.log(
          "📥 Blog service received cache invalidation message",
          content,
        );

        if (content.action === "invalidateCache") {
          for (const pattern of content.keys) {
            const keys = await redisClient.keys(pattern);

            if (keys.length > 0) {
              await redisClient.del(keys);

              console.log(
                `🗑️ Blog service invalidated ${keys.length} cache keys matching: ${pattern}`,
              );
            } else {
              console.log(`No cache keys found matching: ${pattern}`);
            }
          }
        }

        channel.ack(msg);
      } catch (error) {
        console.error(
          "❌ Error processing cache invalidation in blog service:",
          error,
        );

        channel.nack(msg, false, true);
      }
    });
  } catch (error) {
    console.error("❌ Failed to start rabbitmq consumer:", error);
  }
};