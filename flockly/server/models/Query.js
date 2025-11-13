// server/models/Query.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  sender: { type: String, enum: ["user", "manager"], required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Query / Conversation schema
const QuerySchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  eventName: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: "User" }, // optional if anonymous
  userName: { type: String },
  status: { type: String, enum: ["open", "closed"], default: "open" },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

QuerySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Query", QuerySchema);
