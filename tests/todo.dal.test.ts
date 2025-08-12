import { TodoModel } from "../src/models/todo-item";
import {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoCompletion,
} from "../src/dal/todo-dal";
import { createTestTodo, sampleTodos } from "./helpers/test-helpers";

describe("Todo DAL Unit Tests", () => {
  describe("getAllTodos", () => {
    it("should return empty array when no todos exist", async () => {
      const todos = await getAllTodos();
      expect(todos).toEqual([]);
    });

    it("should return all todos when they exist", async () => {
      // Create test data
      await TodoModel.insertMany(sampleTodos);

      const todos = await getAllTodos();
      expect(todos).toHaveLength(3);
      expect(todos[0]).toHaveProperty("title");
      expect(todos[0]).toHaveProperty("description");
      expect(todos[0]).toHaveProperty("completed");
    });
  });

  describe("getTodoById", () => {
    it("should return null when todo does not exist", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";
      const todo = await getTodoById(nonExistentId);
      expect(todo).toBeNull();
    });

    it("should return todo when it exists", async () => {
      const testTodo = await createTestTodo(sampleTodos[0]);
      const foundTodo = await getTodoById(testTodo._id.toString());

      expect(foundTodo).toBeTruthy();
      expect(foundTodo!.title).toBe(sampleTodos[0].title);
      expect(foundTodo!.description).toBe(sampleTodos[0].description);
      expect(foundTodo!.completed).toBe(sampleTodos[0].completed);
    });
  });

  describe("createTodo", () => {
    it("should create a new todo with provided data", async () => {
      const todoData = {
        title: "New Todo",
        description: "New Description",
        completed: false,
      };

      const createdTodo = await createTodo(todoData);

      expect(createdTodo).toBeTruthy();
      expect(createdTodo.title).toBe(todoData.title);
      expect(createdTodo.description).toBe(todoData.description);
      expect(createdTodo.completed).toBe(todoData.completed);
      expect(createdTodo.createdAt).toBeDefined();
      expect(createdTodo.updatedAt).toBeDefined();

      // Verify it's saved in database
      const savedTodo = await TodoModel.findById((createdTodo as any)._id);
      expect(savedTodo).toBeTruthy();
    });

    it("should set timestamps when creating todo", async () => {
      const todoData = {
        title: "Timestamped Todo",
        description: "Testing timestamps",
        completed: false,
      };

      const beforeCreate = new Date();
      const createdTodo = await createTodo(todoData);
      const afterCreate = new Date();

      expect(createdTodo.createdAt).toBeInstanceOf(Date);
      expect(createdTodo.updatedAt).toBeInstanceOf(Date);
      expect(createdTodo.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime()
      );
      expect(createdTodo.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime()
      );
    });
  });

  describe("updateTodo", () => {
    let testTodo: any;

    beforeEach(async () => {
      testTodo = await createTestTodo(sampleTodos[0]);
    });

    it("should update existing todo with new data", async () => {
      const updateData = {
        title: "Updated Title",
        description: "Updated Description",
        completed: true,
      };

      const updatedTodo = await updateTodo(testTodo._id.toString(), updateData);

      expect(updatedTodo).toBeTruthy();
      expect(updatedTodo!.title).toBe(updateData.title);
      expect(updatedTodo!.description).toBe(updateData.description);
      expect(updatedTodo!.completed).toBe(updateData.completed);
      expect(updatedTodo!.updatedAt).not.toEqual(testTodo.updatedAt);
    });

    it("should update only provided fields", async () => {
      const updateData = {
        title: "Only Title Updated",
      };

      const updatedTodo = await updateTodo(testTodo._id.toString(), updateData);

      expect(updatedTodo!.title).toBe(updateData.title);
      expect(updatedTodo!.description).toBe(testTodo.description);
      expect(updatedTodo!.completed).toBe(testTodo.completed);
    });

    it("should return null when todo does not exist", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";
      const updateData = { title: "Updated Title" };

      const result = await updateTodo(nonExistentId, updateData);
      expect(result).toBeNull();
    });

    it("should update updatedAt timestamp", async () => {
      const originalUpdatedAt = testTodo.updatedAt;

      // Wait a small amount to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updateData = { title: "Updated Title" };
      const updatedTodo = await updateTodo(testTodo._id.toString(), updateData);

      expect(updatedTodo!.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe("deleteTodo", () => {
    let testTodo: any;

    beforeEach(async () => {
      testTodo = await createTestTodo(sampleTodos[0]);
    });

    it("should delete existing todo and return true", async () => {
      const result = await deleteTodo(testTodo._id.toString());
      expect(result).toBe(true);

      // Verify todo is deleted from database
      const deletedTodo = await TodoModel.findById(testTodo._id);
      expect(deletedTodo).toBeNull();
    });

    it("should return false when todo does not exist", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";
      const result = await deleteTodo(nonExistentId);
      expect(result).toBe(false);
    });
  });

  describe("toggleTodoCompletion", () => {
    let testTodo: any;

    beforeEach(async () => {
      testTodo = await createTestTodo({
        title: "Toggle Test Todo",
        description: "For testing toggle functionality",
        completed: false,
      });
    });

    it("should toggle completion status from false to true", async () => {
      const toggledTodo = await toggleTodoCompletion(testTodo._id.toString());

      expect(toggledTodo).toBeTruthy();
      expect(toggledTodo!.completed).toBe(true);
      expect(toggledTodo!.updatedAt).not.toEqual(testTodo.updatedAt);

      // Verify in database
      const dbTodo = await TodoModel.findById(testTodo._id);
      expect(dbTodo!.completed).toBe(true);
    });

    it("should toggle completion status from true to false", async () => {
      // First set to completed
      testTodo.completed = true;
      await testTodo.save();

      const toggledTodo = await toggleTodoCompletion(testTodo._id.toString());

      expect(toggledTodo!.completed).toBe(false);
    });

    it("should return null when todo does not exist", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";
      const result = await toggleTodoCompletion(nonExistentId);
      expect(result).toBeNull();
    });

    it("should update updatedAt timestamp when toggling", async () => {
      const originalUpdatedAt = testTodo.updatedAt;

      // Wait a small amount to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const toggledTodo = await toggleTodoCompletion(testTodo._id.toString());

      expect(toggledTodo!.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe("Data Persistence", () => {
    it("should maintain data integrity across operations", async () => {
      // Create todo
      const todoData = {
        title: "Persistence Test",
        description: "Testing data persistence",
        completed: false,
      };

      const createdTodo = await createTodo(todoData);
      const todoId = (createdTodo as any)._id.toString();

      // Update todo
      await updateTodo(todoId, { title: "Updated Persistence Test" });

      // Toggle completion
      await toggleTodoCompletion(todoId);

      // Get final state
      const finalTodo = await getTodoById(todoId);

      expect(finalTodo).toBeTruthy();
      expect(finalTodo!.title).toBe("Updated Persistence Test");
      expect(finalTodo!.description).toBe(todoData.description);
      expect(finalTodo!.completed).toBe(true);
    });

    it("should handle concurrent operations safely", async () => {
      const todoData = {
        title: "Concurrent Test",
        description: "Testing concurrent operations",
        completed: false,
      };

      const createdTodo = await createTodo(todoData);
      const todoId = (createdTodo as any)._id.toString();

      // Perform multiple concurrent operations
      const operations = [
        updateTodo(todoId, { title: "Updated by Operation 1" }),
        updateTodo(todoId, { description: "Updated by Operation 2" }),
        toggleTodoCompletion(todoId),
      ];

      const results = await Promise.all(operations);

      // All operations should succeed (return non-null)
      results.forEach((result) => {
        expect(result).toBeTruthy();
      });

      // Final state should be consistent
      const finalTodo = await getTodoById(todoId);
      expect(finalTodo).toBeTruthy();
    });
  });
});
