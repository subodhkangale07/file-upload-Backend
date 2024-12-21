const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);
  console.log("error from middleware");

  res.status(500).json({
    message: "error from middleware",
    error: err.message,
  });
};

module.exports = errorHandler;
