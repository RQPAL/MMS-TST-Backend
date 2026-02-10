export const errorHandler = (err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);

  // default
  let status = 500;
  let message = "Internal server error";

  // custom known error
  if (err.status && err.message) {
    status = err.status;
    message = err.message;
  }

  res.status(status).json({
    success: false,
    message
  });
};
