import { Router } from "express";

import {
  getAllFlightsController,
  getFlightByIdController,
  createFlightController,
  updateFlightController,
  deleteFlightController,
  getRecentFlightController,
} from "../controllers/flightController";

const router = Router();

router.get("/", getAllFlightsController);
router.get("/recent", getRecentFlightController);
router.get("/:id", getFlightByIdController);
router.post("/", createFlightController);
router.put("/:id", updateFlightController);
router.delete("/:id", deleteFlightController);

export default router;
