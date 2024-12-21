const express = require("express");
const mongoose = require("mongoose");
const fileRoutes = require("./routes/fileRoutes");
const errorHandler = require("./middleware/errorHandler");
const { configDotenv } = require("dotenv");
const cors = require('cors');


const app = express();
configDotenv()

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Database Connection
mongoose
.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB Connection Error:", err));

app.use(cors({
  origin: 'http://localhost:3000', // Replace this with your frontend URL
  methods: ['GET', 'POST', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use("/api/files", fileRoutes);

// Error-handling middleware
app.use(errorHandler);

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
