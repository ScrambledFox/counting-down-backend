import app from "./app";
import config from "./config/config";
import { connectToDatabase, setupGracefulShutdown } from "./config/database";

async function startServer() {
  try {
    // Connect to MongoDB before starting the server
    await connectToDatabase();

    // Setup graceful shutdown handlers
    setupGracefulShutdown();

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
