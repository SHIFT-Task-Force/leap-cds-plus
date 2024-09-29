const express = require("express");
const router = express.Router();
const confidentialityController = require("../../controllers/rules/confidentiality");

router.get("/", confidentialityController.getAllRules);
router.post("/", confidentialityController.createRule);
router.get("/:id", confidentialityController.getRuleById);
router.put("/:id", confidentialityController.updateRule);
router.delete("/:id", confidentialityController.deleteRule);

module.exports = router;
