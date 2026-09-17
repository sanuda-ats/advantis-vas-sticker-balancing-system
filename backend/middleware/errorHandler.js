// Catches requests that hit no route at all.
export const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

// Express 5 auto-forwards errors thrown in async route handlers to this
// handler, so controllers don't need try/catch just to report errors —
// as long as they're declared as async functions.
export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Common Mongoose/Multer error shapes get a friendlier status code
  let status = err.statusCode || 500;
  if (err.name === "ValidationError") status = 400;
  if (err.name === "CastError") status = 400;
  if (err.code === "LIMIT_FILE_SIZE") status = 400;

  res.status(status).json({
    message: err.message || "Internal server error",
  });
};