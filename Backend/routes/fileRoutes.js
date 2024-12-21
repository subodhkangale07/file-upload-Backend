const express = require("express");
const multer = require("multer");
const File = require("../models/file");
const path = require("path");
const fs = require("fs");
const { default: mongoose } = require("mongoose");
const router = express.Router();

// Storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");  // Yahan files upload folder me save hongi
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);  // Timestamp + file ka original naam
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB ka file size limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);  // Agar file type allowed hai, toh allow karenge
    } else {
      cb(new Error("Unsupported file type"), false);  // Agar file type supported nahi hai, toh error denge
    }
  },
});

// File Upload Route
router.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    console.log("File received:", req.file);

    const { originalname, mimetype, size, filename } = req.file;
    const file = new File({
      filename,           
      originalname,      
      fileType: mimetype, 
      size,               
      fileUrl: `/uploads/${filename}`,
    });

    console.log("Saving file to DB...");

    // File ko database me save kar rahe hain
    const savedFile = await file.save();
    console.log("File saved:", savedFile);

    if (!savedFile) {
      throw new Error("File not saved to database.");  // Agar file save nahi ho pati, toh error throw karenge
    }
   
    res.status(201).json({
      fileId: savedFile._id,
      fileName: savedFile.filename,  
      message: "File uploaded successfully",  // Success message bhej rahe hain
    });

  } catch (error) {
    console.error("Error during file upload:", error);
    next(error);  // Agar koi error ho toh, next error handling middleware ko bhejenge
  }
});

// File Download
router.get("/:id", async (req, res, next) => {
  try {
    const fileId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: "Invalid file ID" });  // Agar file ID invalid hai, toh error message bhejenge
    }

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ error: "File not found in the database" });  // Agar file DB mein nahi milti, toh 404 bhejenge
    }

    const filePath = path.join(__dirname, "../uploads", file.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on the server" });  // Agar file server pe nahi milti, toh error bhejenge
    }

    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err.message);
        return res.status(500).json({ error: "Internal Server Error" });  // Agar file send karte waqt error aaye, toh 500 error bhejenge
      }
    });
  } catch (error) {
    console.error("Error retrieving file:", error);
    next(error);  // Agar koi aur error ho, toh next middleware ko pass karenge
  }
});

// Get all uploaded files route
router.get("/", async (req, res) => {
  try {
    const files = await File.find();  // Sabhi uploaded files ko database se retrieve kar rahe hain
    res.status(200).json(files);  // Files ko response me bhej rahe hain
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve files" });  // Agar file fetch karte waqt error aaye, toh 500 error bhejenge
  }
});

module.exports = router;  
