import express from "express";
import cors from "cors";
import todoRoutes from "./routes/todoRoutes";
import flightRoutes from "./routes/flightRoutes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(
  cors({
    origin:
      process.env.NODE_ENV !== "development"
        ? process.env.FRONTEND_URL
        : "http://localhost:3000",
  })
);
app.use(express.json());

// Routes
app.use("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/todos", todoRoutes);
app.use("/api/flights", flightRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
