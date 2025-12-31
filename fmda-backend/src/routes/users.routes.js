const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

// /api/users
router.get("/", usersController.getAllUsers);
router.post("/", usersController.createUser);
router.put("/:id/role", usersController.updateUserRole);
router.delete("/:id", usersController.deleteUser);

module.exports = router;
