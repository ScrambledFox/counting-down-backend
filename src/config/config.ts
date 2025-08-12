import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  database: {
    mongoUri: string;
    dbName: string;
  };
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "dev",
  database: {
    mongoUri:
      process.env.MONGO_URI || "mongodb://localhost:27017/counting-down",
    dbName: process.env.DB_NAME || "counting-down",
  },
};

export default config;
