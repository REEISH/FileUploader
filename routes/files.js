const express = require("express");
const router = express.Router();
const fileController = require("../controllers/uploadController"); // Adjust to your actual controller name
const upload = require("../config/multer");
const { ensureAuthenticated } = require("../middleware/auth");

router.post(
  "/upload",
  ensureAuthenticated,
  upload.single("file"),
  fileController.uploadFile,
);

router.get("/:id/download", ensureAuthenticated, fileController.downloadFile);

module.exports = router;
