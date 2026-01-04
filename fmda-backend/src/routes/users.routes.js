const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

// /api/users
router.get("/", authenticateToken, isAdmin, usersController.getAllUsers);
router.post("/", authenticateToken, isAdmin, usersController.createUser);
router.put("/:id/role", authenticateToken, isAdmin, usersController.updateUserRole);
router.delete("/:id", authenticateToken, isAdmin, usersController.deleteUser);

module.exports = router;
