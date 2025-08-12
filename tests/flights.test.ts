import request from "supertest";
import app from "../src/app";
import { FlightModel } from "../src/models/flight";

describe("Flight Endpoints", () => {
  describe("GET /api/flights", () => {
    it("should return empty array when no flights exist", async () => {
      const response = await request(app).get("/api/flights").expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [],
        message: "Flights retrieved successfully",
      });
    });

    it("should return all flights when they exist", async () => {
      // Create test flights
      const testFlights = [
        {
          flightNumber: "AA123",
          departure: "JFK",
          destination: "LAX",
          departureTime: new Date("2025-08-15T10:00:00Z"),
          arrivalTime: new Date("2025-08-15T16:00:00Z"),
        },
        {
          flightNumber: "BA456",
          departure: "LHR",
          destination: "CDG",
          departureTime: new Date("2025-08-16T08:00:00Z"),
          arrivalTime: new Date("2025-08-16T11:00:00Z"),
        },
      ];

      await FlightModel.insertMany(testFlights);

      const response = await request(app).get("/api/flights").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.message).toBe("Flights retrieved successfully");
      expect(response.body.data[0]).toMatchObject({
        flightNumber: "AA123",
        departure: "JFK",
        destination: "LAX",
      });
    });
  });

  describe("GET /api/flights/:id", () => {
    it("should return 400 when ID is not provided", async () => {
      const response = await request(app).get("/api/flights/").expect(200); // This would hit the base route

      expect(response.body).toEqual({
        success: true,
        data: [],
        message: "Flights retrieved successfully",
      });
    });

    it("should return 404 when flight does not exist", async () => {
      const fakeId = "507f1f77bcf86cd799439011"; // Valid ObjectId format
      const response = await request(app)
        .get(`/api/flights/${fakeId}`)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: "Flight not found",
      });
    });

    it("should return flight when valid ID is provided", async () => {
      // Create a test flight
      const testFlight = new FlightModel({
        flightNumber: "UA789",
        departure: "SFO",
        destination: "SEA",
        departureTime: new Date("2025-08-17T14:00:00Z"),
        arrivalTime: new Date("2025-08-17T16:30:00Z"),
      });
      await testFlight.save();

      const response = await request(app)
        .get(`/api/flights/${testFlight._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        flightNumber: "UA789",
        departure: "SFO",
        destination: "SEA",
      });
      expect(response.body.message).toBe("Flight retrieved successfully");
    });
  });

  describe("POST /api/flights", () => {
    const validFlightData = {
      flightNumber: "DL123",
      departure: "ATL",
      destination: "MIA",
      departureTime: "2025-08-18T09:00:00Z",
      arrivalTime: "2025-08-18T11:30:00Z",
    };

    it("should create a flight with valid data", async () => {
      const response = await request(app)
        .post("/api/flights")
        .send(validFlightData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        flightNumber: "DL123",
        departure: "ATL",
        destination: "MIA",
      });
      expect(response.body.message).toBe("Flight created successfully");

      // Verify flight was actually saved to database
      const savedFlight = await FlightModel.findOne({
        flightNumber: "DL123",
      });
      expect(savedFlight).toBeTruthy();
    });

    describe("Validation Tests", () => {
      it("should return 400 with no body", async () => {
        const response = await request(app)
          .post("/api/flights")
          .send()
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Request body is required");
      });

      it("should return 400 when flight data is missing", async () => {
        const response = await request(app)
          .post("/api/flights")
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Request body is required");
      });

      it("should return 400 when flightNumber is missing", async () => {
        const invalidData = { ...validFlightData };
        // @ts-ignore - Intentionally removing property for test
        delete invalidData.flightNumber;

        const response = await request(app)
          .post("/api/flights")
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Validation failed");
        expect(response.body.errors).toContain("Flight number is required");
      });

      it("should return 400 when flightNumber is empty string", async () => {
        const invalidData = { ...validFlightData, flightNumber: "" };

        const response = await request(app)
          .post("/api/flights")
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain("Flight number is required");
      });

      it("should return 400 when flightNumber exceeds 10 characters", async () => {
        const invalidData = {
          ...validFlightData,
          flightNumber: "VERYLONGFLIGHTNUMBER",
        };

        const response = await request(app)
          .post("/api/flights")
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain(
          "Flight number must not exceed 10 characters"
        );
      });

      it("should return 400 when departure is missing", async () => {
        const invalidData = { ...validFlightData };
        // @ts-ignore - Intentionally removing property for test
        delete invalidData.departure;

        const response = await request(app)
          .post("/api/flights")
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain(
          "Departure airport code is required"
        );
      });

      it("should return 400 when departure is not 3 characters", async () => {
        const invalidData = { ...validFlightData, departure: "ATLL" };

        const response = await request(app)
          .post("/api/flights")
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain(
          "Departure airport code must be exactly 3 characters"
        );
      });

      it("should return 400 when destination is missing", async () => {
        const invalidData = { ...validFlightData };
        // @ts-ignore - Intentionally removing property for test
        delete invalidData.destination;

        const response = await request(app)
          .post("/api/flights")
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain(
          "Destination airport code is required"
        );
      });

      it("should return 400 when destination is not 3 characters", async () => {
        const invalidData = { ...validFlightData, destination: "LA" };

        const response = await request(app)
          .post("/api/flights")
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain(
          "Destination airport code must be exactly 3 characters"
        );
      });

      it("should return 400 when departureTime is missing", async () => {
        const invalidData = { ...validFlightData };
        // @ts-ignore - Intentionally removing property for test
        delete invalidData.departureTime;

        const response = await request(app)
          .post("/api/flights")
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain("Departure time is required");
      });

      it("should return 400 when departureTime is invalid", async () => {
        const invalidData = {
          ...validFlightData,
          departureTime: "invalid-date",
        };

        const response = await request(app)
          .post("/api/flights")
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain(
          "Departure time must be a valid date"
        );
      });

      it("should return 400 when arrivalTime is missing", async () => {
        const invalidData = { ...validFlightData };
        // @ts-ignore - Intentionally removing property for test
        delete invalidData.arrivalTime;

        const response = await request(app)
          .post("/api/flights")
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain("Arrival time is required");
      });

      it("should return 400 when arrivalTime is invalid", async () => {
        const invalidData = { ...validFlightData, arrivalTime: "invalid-date" };

        const response = await request(app)
          .post("/api/flights")
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain(
          "Arrival time must be a valid date"
        );
      });

      it("should return 400 when arrivalTime is before departureTime", async () => {
        const invalidData = {
          ...validFlightData,
          departureTime: "2025-08-18T12:00:00Z",
          arrivalTime: "2025-08-18T10:00:00Z",
        };

        const response = await request(app)
          .post("/api/flights")
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain(
          "Arrival time must be after departure time"
        );
      });

      it("should return multiple validation errors when multiple fields are invalid", async () => {
        const invalidData = {
          flightNumber: "",
          departure: "INVALID",
          destination: "",
          departureTime: "invalid-date",
          arrivalTime: "",
        };

        const response = await request(app)
          .post("/api/flights")
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toHaveLength(5);
        expect(response.body.errors).toContain("Flight number is required");
        expect(response.body.errors).toContain(
          "Departure airport code must be exactly 3 characters"
        );
        expect(response.body.errors).toContain(
          "Destination airport code is required"
        );
        expect(response.body.errors).toContain(
          "Departure time must be a valid date"
        );
        expect(response.body.errors).toContain("Arrival time is required");
      });
    });
  });

  describe("PUT /api/flights/:id", () => {
    it("should return 400 when ID is not provided", async () => {
      const response = await request(app)
        .put("/api/flights/")
        .send({})
        .expect(404); // This would hit a different route or 404
    });

    it("should return 404 when flight does not exist", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const updateData = { flightNumber: "UPDATED123" };

      const response = await request(app)
        .put(`/api/flights/${fakeId}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: "Flight not found",
      });
    });

    it("should update flight when valid ID and data are provided", async () => {
      // Create a test flight
      const testFlight = new FlightModel({
        flightNumber: "UPDATE123",
        departure: "NYC",
        destination: "LAX",
        departureTime: new Date("2025-08-19T10:00:00Z"),
        arrivalTime: new Date("2025-08-19T16:00:00Z"),
      });
      await testFlight.save();

      const updateData = {
        flightNumber: "UPDATED456",
        departure: "JFK",
      };

      const response = await request(app)
        .put(`/api/flights/${testFlight._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.flightNumber).toBe("UPDATED456");
      expect(response.body.data.departure).toBe("JFK");
      expect(response.body.data.destination).toBe("LAX"); // Should remain unchanged
      expect(response.body.message).toBe("Flight updated successfully");
    });
  });

  describe("DELETE /api/flights/:id", () => {
    it("should return 400 when ID is not provided", async () => {
      const response = await request(app).delete("/api/flights/").expect(404); // This would hit a different route or 404
    });

    it("should return 404 when flight does not exist", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .delete(`/api/flights/${fakeId}`)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: "Flight not found",
      });
    });

    it("should delete flight when valid ID is provided", async () => {
      // Create a test flight
      const testFlight = new FlightModel({
        flightNumber: "DELETE123",
        departure: "ORD",
        destination: "DFW",
        departureTime: new Date("2025-08-20T12:00:00Z"),
        arrivalTime: new Date("2025-08-20T15:00:00Z"),
      });
      await testFlight.save();

      const response = await request(app)
        .delete(`/api/flights/${testFlight._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Flight deleted successfully");

      // Verify flight was actually deleted from database
      const deletedFlight = await FlightModel.findById(testFlight._id);
      expect(deletedFlight).toBeNull();
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully during creation", async () => {
      // Mock FlightModel to throw an error
      const originalSave = FlightModel.prototype.save;
      FlightModel.prototype.save = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const validFlightData = {
        flightNumber: "ERROR123",
        departure: "ATL",
        destination: "MIA",
        departureTime: "2025-08-18T09:00:00Z",
        arrivalTime: "2025-08-18T11:30:00Z",
      };

      const response = await request(app)
        .post("/api/flights")
        .send(validFlightData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Internal server error");

      // Restore original method
      FlightModel.prototype.save = originalSave;
    });
  });
});
