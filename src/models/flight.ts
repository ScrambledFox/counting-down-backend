import { mongoose } from "../config/database";

const flightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true, maxlength: 10, trim: true },
  departure: { type: String, required: true, maxlength: 3, trim: true },
  destination: { type: String, required: true, maxlength: 3, trim: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export type IFlight = mongoose.InferSchemaType<typeof flightSchema>;

export const FlightModel = mongoose.model("Flight", flightSchema);
