
const express = require("express");
const router = express.Router();
const folderController = require("../controllers/folderController"); 
const { ensureAuthenticated } = require("../middleware/auth");
const { folderValidator } = require('../middleware/validators'); 

router.post('/create', ensureAuthenticated, folderValidator, folderController.createFolder);

module.exports = router;
