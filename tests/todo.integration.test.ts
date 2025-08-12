import request from "supertest";
import app from "../src/app";
import { TodoModel } from "../src/models/todo-item";
import { createMultipleTestTodos, sampleTodos } from "./helpers/test-helpers";

describe("Todo Integration Tests", () => {
  describe("Todo Workflow Integration", () => {
    it("should handle complete CRUD workflow", async () => {
      // 1. Create a new todo
      const newTodo = {
        title: "Integration Test Todo",
        description: "This is for integration testing",
        completed: false,
      };

      const createResponse = await request(app)
        .post("/api/todos")
        .send(newTodo)
        .expect(201);

      const todoId = createResponse.body.data._id;
      expect(todoId).toBeDefined();

      // 2. Get the created todo by ID
      const getResponse = await request(app)
        .get(`/api/todos/${todoId}`)
        .expect(200);

      expect(getResponse.body.data).toMatchObject({
        title: "Integration Test Todo",
        description: "This is for integration testing",
        completed: false,
      });

      // 3. Update the todo
      const updateData = {
        title: "Updated Integration Test Todo",
        description: "Updated for integration testing",
      };

      const updateResponse = await request(app)
        .put(`/api/todos/${todoId}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.data).toMatchObject({
        title: "Updated Integration Test Todo",
        description: "Updated for integration testing",
        completed: false,
      });

      // 4. Toggle completion status
      const toggleResponse = await request(app)
        .patch(`/api/todos/${todoId}/toggle-completion`)
        .expect(200);

      expect(toggleResponse.body.data.completed).toBe(true);
      expect(toggleResponse.body.message).toBe("Todo marked as completed");

      // 5. Verify in get all todos
      const getAllResponse = await request(app).get("/api/todos").expect(200);

      const foundTodo = getAllResponse.body.data.find(
        (todo: any) => todo._id === todoId
      );
      expect(foundTodo).toMatchObject({
        title: "Updated Integration Test Todo",
        description: "Updated for integration testing",
        completed: true,
      });

      // 6. Delete the todo
      await request(app).delete(`/api/todos/${todoId}`).expect(200);

      // 7. Verify deletion
      await request(app).get(`/api/todos/${todoId}`).expect(404);

      // 8. Verify not in get all todos
      const finalGetAllResponse = await request(app)
        .get("/api/todos")
        .expect(200);

      const deletedTodo = finalGetAllResponse.body.data.find(
        (todo: any) => todo._id === todoId
      );
      expect(deletedTodo).toBeUndefined();
    });

    it("should handle multiple todos operations", async () => {
      // Create multiple todos
      await createMultipleTestTodos(sampleTodos);

      // Get all todos
      const getAllResponse = await request(app).get("/api/todos").expect(200);

      expect(getAllResponse.body.data).toHaveLength(3);

      // Filter and verify specific todos
      const buyGroceriesTodo = getAllResponse.body.data.find(
        (todo: any) => todo.title === "Buy groceries"
      );
      expect(buyGroceriesTodo).toBeDefined();
      expect(buyGroceriesTodo.completed).toBe(false);

      const finishProjectTodo = getAllResponse.body.data.find(
        (todo: any) => todo.title === "Finish project"
      );
      expect(finishProjectTodo).toBeDefined();
      expect(finishProjectTodo.completed).toBe(true);
    });

    it("should maintain data consistency across operations", async () => {
      const todo = {
        title: "Consistency Test",
        description: "Testing data consistency",
        completed: false,
      };

      // Create todo
      const createResponse = await request(app)
        .post("/api/todos")
        .send(todo)
        .expect(201);

      const todoId = createResponse.body.data._id;

      // Update multiple times
      await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ title: "Updated Title 1" })
        .expect(200);

      await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ description: "Updated Description" })
        .expect(200);

      // Toggle completion multiple times
      await request(app)
        .patch(`/api/todos/${todoId}/toggle-completion`)
        .expect(200);

      const toggleResponse = await request(app)
        .patch(`/api/todos/${todoId}/toggle-completion`)
        .expect(200);

      // Verify final state
      expect(toggleResponse.body.data).toMatchObject({
        title: "Updated Title 1",
        description: "Updated Description",
        completed: false,
      });

      // Verify in database
      const dbTodo = await TodoModel.findById(todoId);
      expect(dbTodo).toMatchObject({
        title: "Updated Title 1",
        description: "Updated Description",
        completed: false,
      });
    });
  });

  describe("Error Scenarios Integration", () => {
    it("should handle cascading error scenarios", async () => {
      const invalidId = "507f1f77bcf86cd799439011";

      // Try to get non-existent todo
      await request(app).get(`/api/todos/${invalidId}`).expect(404);

      // Try to update non-existent todo
      await request(app)
        .put(`/api/todos/${invalidId}`)
        .send({ title: "Updated Title" })
        .expect(404);

      // Try to toggle non-existent todo
      await request(app)
        .patch(`/api/todos/${invalidId}/toggle-completion`)
        .expect(404);

      // Try to delete non-existent todo
      await request(app).delete(`/api/todos/${invalidId}`).expect(404);
    });

    it("should handle malformed requests consistently", async () => {
      // Try to create todo with missing data
      await request(app).post("/api/todos").send({}).expect(400);

      await request(app)
        .post("/api/todos")
        .send({ title: "Only Title" })
        .expect(400);

      await request(app)
        .post("/api/todos")
        .send({ description: "Only Description" })
        .expect(400);

      // Create a valid todo first
      const createResponse = await request(app)
        .post("/api/todos")
        .send({
          title: "Valid Todo",
          description: "Valid Description",
        })
        .expect(201);

      const todoId = createResponse.body.data._id;

      // Try to update with no valid fields
      await request(app).put(`/api/todos/${todoId}`).send({}).expect(400);
    });
  });

  describe("Data Validation Integration", () => {
    it("should properly validate and sanitize input data", async () => {
      // Test whitespace trimming
      const todoWithSpaces = {
        title: "  Spaced Title  ",
        description: "  Spaced Description  ",
        completed: false,
      };

      const createResponse = await request(app)
        .post("/api/todos")
        .send(todoWithSpaces)
        .expect(201);

      expect(createResponse.body.data.title).toBe("Spaced Title");
      expect(createResponse.body.data.description).toBe("Spaced Description");

      const todoId = createResponse.body.data._id;

      // Test update whitespace trimming
      const updateResponse = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({
          title: "  Updated Spaced Title  ",
          description: "  Updated Spaced Description  ",
        })
        .expect(200);

      expect(updateResponse.body.data.title).toBe("Updated Spaced Title");
      expect(updateResponse.body.data.description).toBe(
        "Updated Spaced Description"
      );
    });

    it("should handle edge case values", async () => {
      // Test with very long strings
      const longTitle = "A".repeat(1000);
      const longDescription = "B".repeat(2000);

      const createResponse = await request(app)
        .post("/api/todos")
        .send({
          title: longTitle,
          description: longDescription,
          completed: true,
        })
        .expect(201);

      expect(createResponse.body.data.title).toBe(longTitle);
      expect(createResponse.body.data.description).toBe(longDescription);
      expect(createResponse.body.data.completed).toBe(true);
    });
  });

  describe("Performance and Load Integration", () => {
    it("should handle multiple rapid operations", async () => {
      const promises = [];

      // Create 10 todos rapidly
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post("/api/todos")
            .send({
              title: `Rapid Todo ${i}`,
              description: `Description ${i}`,
              completed: i % 2 === 0,
            })
        );
      }

      const responses = await Promise.all(promises);

      // All should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      // Verify all todos were created
      const getAllResponse = await request(app).get("/api/todos").expect(200);

      expect(getAllResponse.body.data.length).toBeGreaterThanOrEqual(10);
    });
  });
});
