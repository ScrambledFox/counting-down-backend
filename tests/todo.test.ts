import request from "supertest";
import app from "../src/app";
import { TodoModel } from "../src/models/todo-item";
import {
  createTestTodo,
  createMultipleTestTodos,
  sampleTodos,
  generateInvalidObjectId,
  generateInvalidId,
} from "./helpers/test-helpers";

describe("Todo Endpoints", () => {
  describe("GET /api/todos", () => {
    it("should return empty array when no todos exist", async () => {
      const response = await request(app).get("/api/todos").expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [],
        message: "Todos retrieved successfully",
      });
    });

    it("should return all todos when they exist", async () => {
      // Create test todos
      const testTodos = [
        {
          title: "Test Todo 1",
          description: "Description 1",
          completed: false,
        },
        {
          title: "Test Todo 2",
          description: "Description 2",
          completed: true,
        },
      ];

      await TodoModel.insertMany(testTodos);

      const response = await request(app).get("/api/todos").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.message).toBe("Todos retrieved successfully");
      expect(response.body.data[0]).toMatchObject({
        title: "Test Todo 1",
        description: "Description 1",
        completed: false,
      });
    });
  });

  describe("GET /api/todos/:id", () => {
    it("should return all todos when accessing base endpoint", async () => {
      const response = await request(app).get("/api/todos/").expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should return 404 when todo does not exist", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .get(`/api/todos/${nonExistentId}`)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: "Todo not found",
      });
    });

    it("should return todo when it exists", async () => {
      const testTodo = new TodoModel({
        title: "Test Todo",
        description: "Test Description",
        completed: false,
      });
      const savedTodo = await testTodo.save();

      const response = await request(app)
        .get(`/api/todos/${savedTodo._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        title: "Test Todo",
        description: "Test Description",
        completed: false,
      });
      expect(response.body.message).toBe("Todo retrieved successfully");
    });
  });

  describe("POST /api/todos", () => {
    it("should create a new todo with valid data", async () => {
      const newTodo = {
        title: "New Todo",
        description: "New Description",
        completed: false,
      };

      const response = await request(app)
        .post("/api/todos")
        .send(newTodo)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        title: "New Todo",
        description: "New Description",
        completed: false,
      });
      expect(response.body.data._id).toBeDefined();
      expect(response.body.message).toBe("Todo created successfully");

      // Verify todo was saved to database
      const savedTodo = await TodoModel.findOne({ title: "New Todo" });
      expect(savedTodo).toBeTruthy();
    });

    it("should create todo with default completed status when not provided", async () => {
      const newTodo = {
        title: "New Todo",
        description: "New Description",
      };

      const response = await request(app)
        .post("/api/todos")
        .send(newTodo)
        .expect(201);

      expect(response.body.data.completed).toBe(false);
    });

    it("should return 400 when title is missing", async () => {
      const invalidTodo = {
        description: "Description without title",
      };

      const response = await request(app)
        .post("/api/todos")
        .send(invalidTodo)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: "Title and description are required",
      });
    });

    it("should return 400 when description is missing", async () => {
      const invalidTodo = {
        title: "Title without description",
      };

      const response = await request(app)
        .post("/api/todos")
        .send(invalidTodo)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: "Title and description are required",
      });
    });

    it("should trim whitespace from title and description", async () => {
      const newTodo = {
        title: "  Trimmed Title  ",
        description: "  Trimmed Description  ",
        completed: false,
      };

      const response = await request(app)
        .post("/api/todos")
        .send(newTodo)
        .expect(201);

      expect(response.body.data.title).toBe("Trimmed Title");
      expect(response.body.data.description).toBe("Trimmed Description");
    });
  });

  describe("PUT /api/todos/:id", () => {
    let testTodo: any;

    beforeEach(async () => {
      testTodo = new TodoModel({
        title: "Original Title",
        description: "Original Description",
        completed: false,
      });
      await testTodo.save();
    });

    it("should update todo with valid data", async () => {
      const updateData = {
        title: "Updated Title",
        description: "Updated Description",
        completed: true,
      };

      const response = await request(app)
        .put(`/api/todos/${testTodo._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        title: "Updated Title",
        description: "Updated Description",
        completed: true,
      });
      expect(response.body.message).toBe("Todo updated successfully");
    });

    it("should update only provided fields", async () => {
      const updateData = {
        title: "Updated Title Only",
      };

      const response = await request(app)
        .put(`/api/todos/${testTodo._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.title).toBe("Updated Title Only");
      expect(response.body.data.description).toBe("Original Description");
      expect(response.body.data.completed).toBe(false);
    });

    it("should return 404 when todo does not exist", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";
      const updateData = { title: "Updated Title" };

      const response = await request(app)
        .put(`/api/todos/${nonExistentId}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: "Todo not found",
      });
    });

    it("should return 400 when no valid fields to update", async () => {
      const response = await request(app)
        .put(`/api/todos/${testTodo._id}`)
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: "No valid fields to update",
      });
    });

    it("should ignore empty strings and undefined values", async () => {
      const updateData = {
        title: "",
        description: undefined,
        completed: true,
      };

      const response = await request(app)
        .put(`/api/todos/${testTodo._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.title).toBe("Original Title");
      expect(response.body.data.description).toBe("Original Description");
      expect(response.body.data.completed).toBe(true);
    });

    it("should trim whitespace from title and description", async () => {
      const updateData = {
        title: "  Trimmed Updated Title  ",
        description: "  Trimmed Updated Description  ",
      };

      const response = await request(app)
        .put(`/api/todos/${testTodo._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.title).toBe("Trimmed Updated Title");
      expect(response.body.data.description).toBe(
        "Trimmed Updated Description"
      );
    });
  });

  describe("DELETE /api/todos/:id", () => {
    let testTodo: any;

    beforeEach(async () => {
      testTodo = new TodoModel({
        title: "Todo to Delete",
        description: "This will be deleted",
        completed: false,
      });
      await testTodo.save();
    });

    it("should delete existing todo", async () => {
      const response = await request(app)
        .delete(`/api/todos/${testTodo._id}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: "Todo deleted successfully",
      });

      // Verify todo was deleted from database
      const deletedTodo = await TodoModel.findById(testTodo._id);
      expect(deletedTodo).toBeNull();
    });

    it("should return 404 when todo does not exist", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .delete(`/api/todos/${nonExistentId}`)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: "Todo not found",
      });
    });

    it("should return 404 when accessing delete endpoint without ID", async () => {
      const response = await request(app).delete("/api/todos/").expect(404); // This will hit a route not found
    });
  });

  describe("PATCH /api/todos/:id/toggle-completion", () => {
    let testTodo: any;

    beforeEach(async () => {
      testTodo = new TodoModel({
        title: "Todo to Toggle",
        description: "This will be toggled",
        completed: false,
      });
      await testTodo.save();
    });

    it("should toggle completion status from false to true", async () => {
      const response = await request(app)
        .patch(`/api/todos/${testTodo._id}/toggle-completion`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.completed).toBe(true);
      expect(response.body.message).toBe("Todo marked as completed");
    });

    it("should toggle completion status from true to false", async () => {
      // First set to completed
      testTodo.completed = true;
      await testTodo.save();

      const response = await request(app)
        .patch(`/api/todos/${testTodo._id}/toggle-completion`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.completed).toBe(false);
      expect(response.body.message).toBe("Todo marked as incomplete");
    });

    it("should return 404 when todo does not exist", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .patch(`/api/todos/${nonExistentId}/toggle-completion`)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: "Todo not found",
      });
    });

    it("should return 404 when accessing toggle endpoint without proper ID", async () => {
      const response = await request(app)
        .patch("/api/todos//toggle-completion")
        .expect(404); // This will hit a route not found
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid MongoDB ObjectId", async () => {
      const invalidId = "invalid-id";
      const response = await request(app)
        .get(`/api/todos/${invalidId}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Internal server error");
    });
  });
});
