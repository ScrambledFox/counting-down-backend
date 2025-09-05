import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: false, maxlength: 32, trim: true },
  message: { type: String, required: true, maxlength: 1000, trim: true },
  createdAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
});

export type IMessage = mongoose.InferSchemaType<typeof messageSchema>;
export const MessageModel = mongoose.model("Message", messageSchema);
