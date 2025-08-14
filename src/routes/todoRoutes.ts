import { Router } from "express";

import {
  getAllTodosController,
  getTodoByIdController,
  createTodoController,
  updateTodoController,
  deleteTodoController,
  toggleTodoController,
} from "../controllers/todoController";

const router = Router();

router.get("/", getAllTodosController);
router.get("/:id", getTodoByIdController);
router.post("/", createTodoController);
router.put("/:id", updateTodoController);
router.delete("/:id", deleteTodoController);
router.post("/:id/toggle-completion", toggleTodoController);

export default router;
