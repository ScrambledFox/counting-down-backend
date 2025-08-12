import { mongoose } from "../config/database";
import { InferSchemaType } from "mongoose";

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 200, trim: true },
  category: { type: String, required: true, maxlength: 25, trim: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export type ITodo = InferSchemaType<typeof todoSchema>;

export const TodoModel = mongoose.model("Todo", todoSchema);
