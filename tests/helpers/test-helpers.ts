import { TodoModel } from "../../src/models/todo-item";

export interface TestTodoData {
  title: string;
  category: string;
  completed?: boolean;
}

export const createTestTodo = async (data: TestTodoData) => {
  const todo = new TodoModel({
    title: data.title,
    category: data.category,
    completed: data.completed || false,
  });
  return await todo.save();
};

export const createMultipleTestTodos = async (todos: TestTodoData[]) => {
  return await TodoModel.insertMany(todos);
};

export const sampleTodos: TestTodoData[] = [
  {
    title: "Buy groceries",
    category: "Shopping",
    completed: false,
  },
  {
    title: "Finish project",
    category: "Work",
    completed: true,
  },
  {
    title: "Exercise",
    category: "Health",
    completed: false,
  },
];

export const generateInvalidObjectId = (): string => {
  return "507f1f77bcf86cd799439011";
};

export const generateInvalidId = (): string => {
  return "invalid-id-format";
};
