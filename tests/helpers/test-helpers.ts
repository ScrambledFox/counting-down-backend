import { TodoModel } from "../../src/models/todo-item";

export interface TestTodoData {
  title: string;
  description: string;
  completed?: boolean;
}

export const createTestTodo = async (data: TestTodoData) => {
  const todo = new TodoModel({
    title: data.title,
    description: data.description,
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
    description: "Need to buy milk, eggs, and bread",
    completed: false,
  },
  {
    title: "Finish project",
    description: "Complete the todo app backend",
    completed: true,
  },
  {
    title: "Exercise",
    description: "Go for a 30-minute walk",
    completed: false,
  },
];

export const generateInvalidObjectId = (): string => {
  return "507f1f77bcf86cd799439011";
};

export const generateInvalidId = (): string => {
  return "invalid-id-format";
};
