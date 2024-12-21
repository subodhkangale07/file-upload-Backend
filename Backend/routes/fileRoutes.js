const express = require("express");
const multer = require("multer");
const File = require("../models/file");
const path = require("path");
const fs = require("fs");
const { default: mongoose } = require("mongoose");
const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");  // Save files to the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);  // Use timestamp for unique filenames
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);  // Allow the file
    } else {
      cb(new Error("Unsupported file type"), false);  // Reject unsupported file types
    }
  },
});

// File Upload Route
router.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    console.log("File received:", req.file);

    const { originalname, mimetype, size, filename } = req.file;
    const file = new File({
      filename,           // Storing the saved filename (with timestamp)
      originalname,       // Storing the original file name
      fileType: mimetype, // Storing the file's MIME type
      size,               // Storing file size
      fileUrl: `/uploads/${filename}`,  // URL for the file (relative path)
    });

    console.log("Saving file to DB...");
    const savedFile = await file.save();
    console.log("File saved:", savedFile);

    if (!savedFile) {
      throw new Error("File not saved to database.");
    }

    // Sending response with file details including fileName and fileUrl
    // In your backend (e.g., file upload route)
res.status(201).json({
  fileId: savedFile._id,
  fileName: savedFile.filename,  // Ensure filename is being sent in the response
  message: "File uploaded successfully",
});

    
  } catch (error) {
    console.error("Error during file upload:", error);
    next(error);  // Passing error to error handling middleware
  }
});

// File Download
router.get("/:id", async (req, res, next) => {
  try {
    const fileId = req.params.id;

    // Check for valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: "Invalid file ID" });
    }

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ error: "File not found in the database" });
    }

    const filePath = path.join(__dirname, "../uploads", file.filename);

    // Check if the file exists on the server
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on the server" });
    }

    // Send the file as response
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err.message);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    });
  } catch (error) {
    console.error("Error retrieving file:", error);
    next(error);
  }
});


// Get all uploaded files route
router.get("/", async (req, res) => {
  try {
    const files = await File.find();
    res.status(200).json(files); // Return the list of uploaded files with their metadata
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve files" });
  }
});

module.exports = router;
