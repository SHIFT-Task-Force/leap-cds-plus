const express = require("express");
const router = express.Router();
const sensitivityController = require("../../controllers/rules/sensitivity");

router.get("/", sensitivityController.getAllRules);
router.post("/", sensitivityController.createRule);
router.get("/:id", sensitivityController.getRuleById);
router.put("/:id", sensitivityController.updateRule);
router.delete("/:id", sensitivityController.deleteRule);

module.exports = router;
