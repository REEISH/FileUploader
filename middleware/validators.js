const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
  
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const authValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required.")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters.")
    .escape(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),

  handleValidationErrors,
];

const folderValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Folder name is required.")
    .isLength({ max: 255 })
    .withMessage("Folder name must be under 255 characters.")
    .escape(),
  body("parentId")
    .optional({ checkFalsy: true })
    .trim()
    .escape(),

  handleValidationErrors,
];

module.exports = {
  authValidator,
  folderValidator,
};
