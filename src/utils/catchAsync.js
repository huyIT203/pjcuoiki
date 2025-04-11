/**
 * Catch async errors from controller functions
 * Eliminates need for try/catch blocks in controllers
 * @param {Function} fn - The async controller function to wrap
 * @returns {Function} Express middleware function that catches any errors
 */
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}; 