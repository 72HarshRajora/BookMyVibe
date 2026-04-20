const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: `Role (${req.user ? req.user.role : 'None'}) is not authorized to access this route` });
    }
  };
};

module.exports = { roleCheck };
