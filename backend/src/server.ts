import app from "./app";
import { env } from "./config/env";
import logger from "./infrastructure/logger/logger";

import {
  connectDatabase,
  disconnectDatabase,
} from "./infrastructure/database/prisma";

const startServer = async () => {
  try {
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });

    const shutdown = async () => {
      logger.info("Shutting down...");

      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();