const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const recruitmentSchema = new Schema(
  {
    title: { type: String, required: true },
    titleVietnamese: { type: String },
    quantity: { type: Number, required: true },
    location: { type: String, required: true },
    deadline: { type: Date, required: true },
    summary: { type: [String]},
    responsibilities: { type: [String]},
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Recruitment = model("Recruitment", recruitmentSchema);

module.exports = Recruitment;
