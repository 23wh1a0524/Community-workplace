const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    category: String,
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved"],
      default: "open",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    votes: { type: Number, default: 0 },
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    resolvedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Issue", issueSchema);
