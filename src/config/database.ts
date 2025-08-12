import mongoose from "mongoose";
import config from "./config";

/**
 * Database connection configuration and utilities
 */

let isConnected = false;

/**
 * Connect to MongoDB database
 * @returns Promise<void>
 */
export async function connectToDatabase(): Promise<void> {
  if (isConnected) {
    console.log("Already connected to MongoDB");
    return;
  }

  try {
    const mongoUri = config.database.mongoUri;

    if (!mongoUri) {
      throw new Error("MongoDB URI is not defined in configuration");
    }

    // Configure mongoose options
    const options: mongoose.ConnectOptions = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      family: 4, // Use IPv4, skip trying IPv6
    };

    await mongoose.connect(mongoUri, options);

    isConnected = true;
    console.log("Successfully connected to MongoDB");

    // Handle connection events
    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected");
      isConnected = true;
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    isConnected = false;
    throw error;
  }
}

/**
 * Disconnect from MongoDB database
 * @returns Promise<void>
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (!isConnected) {
    console.log("Not connected to MongoDB");
    return;
  }

  try {
    await mongoose.connection.close();
    isConnected = false;
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
    throw error;
  }
}

/**
 * Get the current connection status
 * @returns boolean
 */
export function getDatabaseConnectionStatus(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

/**
 * Handle graceful shutdown
 */
export function setupGracefulShutdown(): void {
  process.on("SIGINT", async () => {
    console.log("Received SIGINT, closing MongoDB connection...");
    await disconnectFromDatabase();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("Received SIGTERM, closing MongoDB connection...");
    await disconnectFromDatabase();
    process.exit(0);
  });
}

// Export mongoose instance for direct access if needed
export { mongoose };
