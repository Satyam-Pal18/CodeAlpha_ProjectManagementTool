module.exports = function errorHandler(err, req, res, next) {
  console.error('💥 Unhandled Server Error:', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};
