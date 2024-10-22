const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const hotSchema = new Schema(
  {
    title: { type: String, required: true },
    titleVietnamese: { type: String },
    quantity: { type: Number, required: true },
    location: { type: String, required: true },
    deadline: { type: Date, required: true },
    summary: { type: [String] },
    responsibilities: { type: [String] },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Hot = model("Hot", hotSchema);

module.exports = Hot;