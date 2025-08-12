import { MongoMemoryServer } from "mongodb-memory-server";
import { mongoose } from "../src/config/database";

let mongoServer: MongoMemoryServer;

// Setup before all tests
beforeAll(async () => {
  // Create an in-memory MongoDB instance for testing
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
});

// Cleanup after each test
afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  // Close database connection
  await mongoose.connection.close();
  // Stop the in-memory MongoDB instance
  await mongoServer.stop();
});
