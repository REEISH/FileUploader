// routes/index.js
const express = require("express");
const router = express.Router();
const {
  forwardAuthenticated,
  ensureAuthenticated,
} = require("../middleware/auth");
const homeController = require("../controllers/homeController");

router.get("/", forwardAuthenticated, homeController.getLandingPage);

router.get("/dashboard", ensureAuthenticated, homeController.getDashboard);

module.exports = router;
