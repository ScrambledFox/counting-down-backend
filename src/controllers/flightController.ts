import { Request, Response } from "express";

import {
  getAllFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight,
} from "../dal/flight-dal";
import { IFlight } from "../models/flight";

/**
 * Flight Controller
 * Handles HTTP requests for flight operations
 */
export async function getAllFlightsController(
  req: Request,
  res: Response
): Promise<void> {
  const flights = await getAllFlights();

  res.status(200).json({
    success: true,
    data: flights,
    message: "Flights retrieved successfully",
  });
}

/**
 * Get flight by ID
 * GET /api/flights/:id
 */
export async function getFlightByIdController(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      success: false,
      message: "Flight ID is required",
    });
    return;
  }

  const flight = await getFlightById(id);

  if (!flight) {
    res.status(404).json({
      success: false,
      message: "Flight not found",
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: flight,
    message: "Flight retrieved successfully",
  });
}

/**
 * Create a new flight
 * POST /api/flights
 */
export async function createFlightController(
  req: Request,
  res: Response
): Promise<void> {
  const flightData: IFlight = req.body;

  // Check if body is present
  if (!flightData || Object.keys(flightData).length === 0) {
    res.status(400).json({
      success: false,
      message: "Request body is required",
    });
    return;
  }

  // Validation
  const validationErrors: string[] = [];

  // Required fields validation
  if (!flightData.flightNumber) {
    validationErrors.push("Flight number is required");
  } else if (
    typeof flightData.flightNumber !== "string" ||
    flightData.flightNumber.trim().length === 0
  ) {
    validationErrors.push("Flight number must be a non-empty string");
  } else if (flightData.flightNumber.trim().length > 10) {
    validationErrors.push("Flight number must not exceed 10 characters");
  }

  if (!flightData.departure) {
    validationErrors.push("Departure airport code is required");
  } else if (
    typeof flightData.departure !== "string" ||
    flightData.departure.trim().length !== 3
  ) {
    validationErrors.push(
      "Departure airport code must be exactly 3 characters"
    );
  }

  if (!flightData.destination) {
    validationErrors.push("Destination airport code is required");
  } else if (
    typeof flightData.destination !== "string" ||
    flightData.destination.trim().length !== 3
  ) {
    validationErrors.push(
      "Destination airport code must be exactly 3 characters"
    );
  }

  if (!flightData.departureTime) {
    validationErrors.push("Departure time is required");
  } else {
    const departureTime = new Date(flightData.departureTime);
    if (isNaN(departureTime.getTime())) {
      validationErrors.push("Departure time must be a valid date");
    }
  }

  if (!flightData.arrivalTime) {
    validationErrors.push("Arrival time is required");
  } else {
    const arrivalTime = new Date(flightData.arrivalTime);
    if (isNaN(arrivalTime.getTime())) {
      validationErrors.push("Arrival time must be a valid date");
    } else if (flightData.departureTime) {
      const departureTime = new Date(flightData.departureTime);
      if (!isNaN(departureTime.getTime()) && arrivalTime <= departureTime) {
        validationErrors.push("Arrival time must be after departure time");
      }
    }
  }

  // Return validation errors if any
  if (validationErrors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validationErrors,
    });
    return;
  }

  try {
    const flight = await createFlight(flightData);
    res.status(201).json({
      success: true,
      data: flight,
      message: "Flight created successfully",
    });
  } catch (error) {
    console.error("Error creating flight:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Update a flight
 * PUT /api/flights/:id
 */
export async function updateFlightController(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;
  const updateData = req.body;

  if (!id) {
    res.status(400).json({
      success: false,
      message: "Flight ID is required",
    });
    return;
  }

  try {
    const updatedFlight = await updateFlight(id, updateData);

    if (!updatedFlight) {
      res.status(404).json({
        success: false,
        message: "Flight not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedFlight,
      message: "Flight updated successfully",
    });
  } catch (error) {
    console.error("Error updating flight:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Delete a flight
 * DELETE /api/flights/:id
 */
export async function deleteFlightController(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      success: false,
      message: "Flight ID is required",
    });
    return;
  }

  try {
    const isDeleted = await deleteFlight(id);

    if (!isDeleted) {
      res.status(404).json({
        success: false,
        message: "Flight not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Flight deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting flight:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Get most recent flight
 * GET /api/flights/recent
 */
export async function getRecentFlightController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const flights = await getAllFlights();
    const recentFlight = flights.sort(
      (a, b) =>
        new Date(b.departureTime).getTime() -
        new Date(a.departureTime).getTime()
    )[0];

    if (!recentFlight) {
      res.status(404).json({
        success: false,
        message: "No recent flight found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: recentFlight,
      message: "Recent flight retrieved successfully",
    });
  } catch (error) {
    console.error("Error retrieving recent flight:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
