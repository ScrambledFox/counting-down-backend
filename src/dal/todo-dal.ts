import { TodoModel, ITodo } from "../models/todo-item";

/**
 * Data Access Layer for Todo Items
 * Contains all database operations related to todos
 */

/**
 * Get all todo items
 * @returns Promise<TodoItem[]>
 */
export async function getAllTodos(): Promise<ITodo[]> {
  return await TodoModel.find().exec();
}

/**
 * Get a todo item by ID
 * @param id - The todo item ID
 * @returns Promise<TodoItem | null>
 */
export async function getTodoById(id: string): Promise<ITodo | null> {
  return await TodoModel.findById(id).exec();
}

/**
 * Create a new todo item
 * @param todoData - The todo item data to create
 * @returns Promise<TodoItem>
 */
export async function createTodo(
  todoData: Omit<ITodo, "createdAt" | "updatedAt">
): Promise<ITodo> {
  const todo = new TodoModel({
    ...todoData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return await todo.save();
}

/**
 * Update a todo item
 * @param id - The todo item ID
 * @param updateData - The data to update
 * @returns Promise<TodoItem | null>
 */
export async function updateTodo(
  id: string,
  updateData: Partial<Omit<ITodo, "id" | "createdAt">>
): Promise<ITodo | null> {
  const todo = await TodoModel.findByIdAndUpdate(
    id,
    { ...updateData, updatedAt: new Date() },
    { new: true }
  ).exec();
  return todo;
}

/**
 * Delete a todo item
 * @param id - The todo item ID
 * @returns Promise<boolean> - Returns true if deleted successfully
 */
export async function deleteTodo(id: string): Promise<boolean> {
  const result = await TodoModel.findByIdAndDelete(id).exec();
  return result !== null;
}

/**
 * Toggle todo completion status
 * @param id - The todo item ID
 * @returns Promise<TodoItem | null>
 */
export async function toggleTodoCompletion(id: string): Promise<ITodo | null> {
  const todo = await TodoModel.findById(id).exec();
  if (!todo) return null;

  todo.completed = !todo.completed;
  todo.updatedAt = new Date();
  return await todo.save();
}
