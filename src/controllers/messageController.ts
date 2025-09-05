/**
 * Message Controller
 * Handles HTTP requests for message operations
 */

import { Request, Response } from "express";
import { IMessage, MessageModel } from "../models/message";
import {
  createMessageDAL,
  getAllMessagesDAL,
  softDeleteMessageDAL,
} from "../dal/message-dal";

/**
 * Get all messages
 * GET /api/messages
 */
export async function getAllMessages(req: Request, res: Response) {
  try {
    const messages = await getAllMessagesDAL();
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Create a new message
 * POST /api/messages
 */
export async function createMessage(req: Request, res: Response) {
  try {
    const { sender, message }: Omit<IMessage, "createdAt" | "deletedAt"> =
      req.body;

    if (!message) {
      res.status(400).json({
        success: false,
        message: "Message is required",
      });
      return;
    }

    const savedMessage = await createMessageDAL({ sender, message });
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Delete a message (soft delete)
 * DELETE /api/messages/:id
 */
export async function deleteMessage(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const message = await MessageModel.findById(id);
    if (!message) {
      res.status(404).json({
        success: false,
        message: "Message not found",
      });
      return;
    }

    message.deletedAt = new Date();
    await softDeleteMessageDAL(id);

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
