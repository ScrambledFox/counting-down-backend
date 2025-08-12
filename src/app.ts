import express from "express";
import todoRoutes from "./routes/todoRoutes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(express.json());

// Routes
app.use("/api/todos", todoRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
