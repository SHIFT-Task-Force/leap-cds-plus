const express = require("express");
const router = express.Router();

// Import individual rule controllers or routers
const sensitivityRouter = require("./sensitivity");
const confidentialityRouter = require("./confidentiality");

// Route for /rules/sensitivity
router.use("/sensitivity", sensitivityRouter);

// Route for /rules/confidentiality
router.use("/confidentiality", confidentialityRouter);

// Export the router to use in app.js
module.exports = router;
