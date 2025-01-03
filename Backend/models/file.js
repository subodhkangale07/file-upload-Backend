const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  fileType: { type: String, required: true },
  size: { type: Number, required: true },
});

const File = mongoose.model("File", fileSchema);

module.exports = File;
