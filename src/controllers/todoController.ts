import { Request, Response } from "express";
import {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoCompletion,
} from "../dal/todo-dal";
import { ITodo, ICreateTodo, IUpdateTodo } from "../models/todo-item";
import { v4 as uuidv4 } from "uuid";

/**
 * Todo Controller
 * Handles HTTP requests for todo operations
 */

/**
 * Get all todos
 * GET /api/todos
 */
export async function getAllTodosController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const todos = await getAllTodos();
    res.status(200).json({
      success: true,
      data: todos,
      message: "Todos retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting todos:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Get todo by ID
 * GET /api/todos/:id
 */
export async function getTodoByIdController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Todo ID is required",
      });
      return;
    }

    const todo = await getTodoById(id);

    if (!todo) {
      res.status(404).json({
        success: false,
        message: "Todo not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: todo,
      message: "Todo retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting todo by ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Create a new todo
 * POST /api/todos
 */
export async function createTodoController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { title, description, completed }: ICreateTodo = req.body;

    // Validation
    if (!title || !description) {
      res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
      return;
    }

    const todoData = {
      id: uuidv4(),
      title: title.trim(),
      description: description.trim(),
      completed: completed || false,
    };

    const newTodo = await createTodo(todoData);

    res.status(201).json({
      success: true,
      data: newTodo,
      message: "Todo created successfully",
    });
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Update a todo
 * PUT /api/todos/:id
 */
export async function updateTodoController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const updateData: Partial<IUpdateTodo> = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Todo ID is required",
      });
      return;
    }

    // Remove empty strings and undefined values
    const cleanUpdateData: Partial<IUpdateTodo> = Object.entries(
      updateData
    ).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== "" && key !== "id") {
        if (key === "title" || key === "description") {
          (acc as any)[key] = (value as string).trim();
        } else {
          (acc as any)[key] = value;
        }
      }
      return acc;
    }, {} as Partial<IUpdateTodo>);

    if (Object.keys(cleanUpdateData).length === 0) {
      res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
      return;
    }

    const updatedTodo = await updateTodo(id, cleanUpdateData);

    if (!updatedTodo) {
      res.status(404).json({
        success: false,
        message: "Todo not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedTodo,
      message: "Todo updated successfully",
    });
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Delete a todo
 * DELETE /api/todos/:id
 */
export async function deleteTodoController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Todo ID is required",
      });
      return;
    }

    const isDeleted = await deleteTodo(id);

    if (!isDeleted) {
      res.status(404).json({
        success: false,
        message: "Todo not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Todo deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Toggle todo completion status
 * PATCH /api/todos/:id/toggle
 */
export async function toggleTodoController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Todo ID is required",
      });
      return;
    }

    const updatedTodo = await toggleTodoCompletion(id);

    if (!updatedTodo) {
      res.status(404).json({
        success: false,
        message: "Todo not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedTodo,
      message: `Todo marked as ${updatedTodo.completed ? "completed" : "incomplete"}`,
    });
  } catch (error) {
    console.error("Error toggling todo:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
