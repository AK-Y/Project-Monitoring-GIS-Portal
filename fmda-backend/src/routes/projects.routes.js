const express = require("express");
const router = express.Router();
const projectsController = require("../controllers/projectsController");

// /api/projects
router.get("/dashboard/stats", projectsController.getDashboardStats);
router.get("/", projectsController.getAllProjects);
router.get("/:id", projectsController.getProjectById);
router.get("/asset/:assetId", projectsController.getProjectsByAsset);
router.post("/:id/progress", projectsController.addProgressLog);
router.post("/", projectsController.createProject);
router.post("/:id/assets", projectsController.addProjectAsset);
router.post("/:id/payments", projectsController.addPayment);

// CRUD Overrides (Admin/Correction)
router.put("/:id", projectsController.updateProject);
router.delete("/:id", projectsController.deleteProject);

// Asset Operations
router.put("/assets/:assetId", projectsController.updateProjectAsset);
router.delete("/assets/:assetId", projectsController.deleteProjectAsset);

// Payment Operations
router.put("/payments/:paymentId", projectsController.updatePayment);
router.delete("/payments/:paymentId", projectsController.deletePayment);

// Progress Log Operations
router.put("/progress/:progressId", projectsController.updateProgressLog);
router.delete("/progress/:progressId", projectsController.deleteProgressLog);

module.exports = router;
