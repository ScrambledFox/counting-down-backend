import { FlightModel, IFlight } from "../models/flight";

/**
 * Get all flights.
 * @returns Promise<IFlight[]>
 */
export async function getAllFlights(): Promise<IFlight[]> {
  return await FlightModel.find().exec();
}

/**
 * Get a flight by ID.
 * @param id - The flight ID.
 * @returns Promise<IFlight | null>
 */
export async function getFlightById(id: string): Promise<IFlight | null> {
  return await FlightModel.findById(id).exec();
}

/**
 * Create a new flight.
 * @param flightData - The flight data to create.
 * @returns Promise<IFlight>
 */
export async function createFlight(
  flightData: Omit<IFlight, "createdAt" | "updatedAt">
): Promise<IFlight> {
  const flight = new FlightModel({
    ...flightData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return await flight.save();
}

/**
 * Update a flight.
 * @param id - The flight ID.
 * @param updateData - The data to update.
 * @returns Promise<IFlight | null>
 */
export async function updateFlight(
  id: string,
  updateData: Partial<Omit<IFlight, "id" | "createdAt">>
): Promise<IFlight | null> {
  const flight = await FlightModel.findByIdAndUpdate(
    id,
    { ...updateData, updatedAt: new Date() },
    { new: true }
  ).exec();
  return flight;
}

/**
 * Delete a flight.
 * @param id - The flight ID.
 * @returns Promise<boolean> - Returns true if deleted successfully.
 */
export async function deleteFlight(id: string): Promise<boolean> {
  const result = await FlightModel.findByIdAndDelete(id).exec();
  return result !== null;
}
