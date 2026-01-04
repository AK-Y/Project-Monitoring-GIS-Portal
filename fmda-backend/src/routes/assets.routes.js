const express = require("express");
const router = express.Router();
const assetsController = require("../controllers/assetsController");
const { authenticateToken, isOfficer } = require("../middleware/authMiddleware");

router.get("/", assetsController.getAssets);
router.post("/", authenticateToken, isOfficer, assetsController.createAsset);

module.exports = router;
