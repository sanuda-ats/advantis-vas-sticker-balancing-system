// Usage: router.post('/', protect, restrictTo('Sticker Balancing Supervisor'), createSticker)
// Must run AFTER protect (it reads req.user set by protect).
export const restrictTo =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "You do not have permission to perform this action" });
    }
    next();
  };