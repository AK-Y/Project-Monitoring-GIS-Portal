const express = require("express");
const router = express.Router();
const filesController = require("../controllers/filesController");
const { authenticateToken } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authenticateToken);

// File management
router.post("/", filesController.createFile);
router.get("/", filesController.getFiles);
router.get("/:id", filesController.getFileById);

// Workflow
router.post("/:id/forward", filesController.forwardFile);
router.post("/:id/return", filesController.returnFile);
router.post("/:id/approve", filesController.approveFile);

// Estimate & Assets
router.put("/:id/estimate", filesController.updateEstimate);
router.put("/:id/assets", filesController.updateProposedAssets);
router.put("/:id", filesController.updateFile);
router.delete("/:id", filesController.deleteFile);

module.exports = router;
