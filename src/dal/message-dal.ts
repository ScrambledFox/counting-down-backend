import { MessageModel, IMessage } from "../models/message";

/**
 * Data Access Layer for Message items.
 * Contains all database operations related to messages.
 */

/**
 * Get all message items
 * @returns Promise<IMessage[]>
 */
export async function getAllMessagesDAL(): Promise<IMessage[]> {
  return await MessageModel.find({
    deletedAt: null,
  })
    .sort({ createdAt: -1 })
    .exec();
}

/**
 * Create a new message item
 * @param messageData - The message item data to create
 * @returns Promise<IMessage>
 */
export async function createMessageDAL(
  messageData: Omit<IMessage, "createdAt" | "deletedAt">
): Promise<IMessage> {
  const message = new MessageModel({
    ...messageData,
    createdAt: new Date(),
    deletedAt: null,
  });
  return await message.save();
}

/**
 * Soft delete a message item
 * @param id - The message item ID
 * @returns Promise<IMessage | null>
 */
export async function softDeleteMessageDAL(
  id: string
): Promise<IMessage | null> {
  const message = await MessageModel.findByIdAndUpdate(
    id,
    { deletedAt: new Date() },
    { new: true }
  ).exec();
  return message;
}
