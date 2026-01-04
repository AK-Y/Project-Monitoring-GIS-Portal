const express = require("express");
const router = express.Router();
const projectsController = require("../controllers/projectsController");
const { authenticateToken, isAdmin, isOfficer } = require("../middleware/authMiddleware");

// /api/projects
router.get("/dashboard/stats", projectsController.getDashboardStats);
router.get("/", projectsController.getAllProjects);
router.get("/:id", projectsController.getProjectById);
router.get("/asset/:assetId", projectsController.getProjectsByAsset);

// Creation - Officers and Admins
router.post("/:id/progress", authenticateToken, isOfficer, projectsController.addProgressLog);
router.post("/", authenticateToken, isOfficer, projectsController.createProject);
router.post("/:id/assets", authenticateToken, isOfficer, projectsController.addProjectAsset);
router.post("/:id/payments", authenticateToken, isOfficer, projectsController.addPayment);

// CRUD Overrides - Admin Only (Correction/Delete)
router.put("/:id", authenticateToken, isAdmin, projectsController.updateProject);
router.delete("/:id", authenticateToken, isAdmin, projectsController.deleteProject);

// Asset Operations - Admin Only
router.put("/assets/:assetId", authenticateToken, isAdmin, projectsController.updateProjectAsset);
router.delete("/assets/:assetId", authenticateToken, isAdmin, projectsController.deleteProjectAsset);

// Payment Operations - Admin Only
router.put("/payments/:paymentId", authenticateToken, isAdmin, projectsController.updatePayment);
router.delete("/payments/:paymentId", authenticateToken, isAdmin, projectsController.deletePayment);

// Progress Log Operations - Admin Only
router.put("/progress/:progressId", authenticateToken, isAdmin, projectsController.updateProgressLog);
router.delete("/progress/:progressId", authenticateToken, isAdmin, projectsController.deleteProgressLog);

module.exports = router;
