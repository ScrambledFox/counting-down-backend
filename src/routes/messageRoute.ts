import { Router } from "express";

import {
  getAllMessages,
  createMessage,
  deleteMessage,
} from "../controllers/messageController";

const router = Router();

router.get("/", getAllMessages);
router.post("/", createMessage);
router.delete("/:id", deleteMessage);

export default router;
